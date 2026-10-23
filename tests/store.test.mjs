import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../server/index.mjs';
import { passwordHash, openStore } from '../server/store.mjs';
import { isPrivateAddress, downloadImage } from '../server/images.mjs';
import http from 'node:http';
import { mkdtempSync, rmSync, realpathSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';

const JPEG=Buffer.concat([Buffer.from([0xff,0xd8,0xff,0xe0]),Buffer.alloc(64,1)]);
const sowetoCustomer={name:'Alice Test',email:'alice@example.com',phone:'082 123 4567',method:'soweto',address:'12 Vilakazi Street',area:'Orlando West'};
const paxiCustomer={name:'Alice Test',email:'alice@example.com',phone:'0821234567',method:'paxi',paxiPoint:'PEP Mall of the North',city:'Polokwane',province:'Limpopo',paxiSpeed:'fast'};

async function setup(t,options={}){
 const parent=realpathSync(tmpdir()),imagesDir=mkdtempSync(join(parent,'kat-images-test-'));
 const {server,store}=createApp({dbPath:':memory:',imagesDir,...options});server.listen(0,'127.0.0.1');await once(server,'listening');
 t.after(()=>{server.closeAllConnections();server.close();store.db.close();const target=resolve(imagesDir);assert.ok(target.startsWith(resolve(parent)+sep));rmSync(target,{recursive:true,force:true});});
 const base='http://127.0.0.1:'+server.address().port;
 function client(){let cookie='';return async(path,data,options={})=>{const response=await fetch(base+path,{method:data===undefined?'GET':'POST',headers:{...(data===undefined?{}:{'Content-Type':'application/json'}),...(cookie?{Cookie:cookie}:{}),...options.headers},body:data===undefined?undefined:JSON.stringify(data)});if(response.headers.get('set-cookie'))cookie=response.headers.get('set-cookie').split(';')[0];const content=response.headers.get('content-type')||'';return {status:response.status,headers:response.headers,data:content.includes('application/json')?await response.json():Buffer.from(await response.arrayBuffer())};};}
 store.db.prepare('INSERT INTO users VALUES(?,?,?,?,?)').run('admin','owner@example.com','Owner',await passwordHash('Admin-test-pass-123'),'admin');
 const admin=client();assert.equal((await admin('/api/login',{email:'owner@example.com',password:'Admin-test-pass-123'})).status,200);
 return {store,client,admin,imagesDir};
}

test('accounts, Soweto delivery, payment review and fulfilment work through HTTP',async t=>{
 const {store,client,admin}=await setup(t);const alice=client(),bob=client(),guest=client();
 const credentials={email:'alice@example.com',name:'Alice Test',password:'Test-password-123'};
 assert.equal((await alice('/api/signup',credentials)).status,200);
 assert.equal((await alice('/api/me')).data.user.role,'customer');
 assert.notEqual(store.db.prepare('SELECT password FROM users WHERE email=?').get(credentials.email).password,credentials.password);
 assert.equal((await bob('/api/signup',{...credentials,name:'Bob',email:'bob@example.com',role:'admin'})).data.user.role,'customer');
 assert.equal((await guest('/api/orders')).status,401);
 assert.equal((await guest('/api/login',{...credentials,password:'incorrect'})).status,401);
 assert.match((await alice('/api/login',credentials)).headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
 assert.equal((await alice('/api/orders',{}, {headers:{Origin:'https://evil.example'}})).status,403);
 assert.equal((await alice('/api/orders',{customer:{...sowetoCustomer,area:'Sandton'},items:[{id:1,size:'3',qty:1}]})).status,400,'Soweto delivery needs a Soweto area');
 assert.equal((await alice('/api/orders',{customer:{...sowetoCustomer,phone:'12'},items:[{id:1,size:'3',qty:1}]})).status,400,'A real mobile number is needed');
 const payload={customer:sowetoCustomer,items:[{id:1,size:3,qty:2,price:1}],total:1,requestId:'checkout-retry-test'};
 const created=await alice('/api/orders',payload);assert.equal(created.status,201);const order=created.data.order,id=order.id;
 assert.equal(order.subtotal,299800,'Prices come from the server, not the client');assert.equal(order.delivery,5000);assert.equal(order.total,304800);assert.match(order.deliveryLabel,/Soweto/);
 assert.equal((await alice('/api/orders',payload)).data.order.id,id,'A repeated checkout request must return the same order');
 assert.equal(store.db.prepare('SELECT reserved FROM stock WHERE product=1 AND size=?').get('3').reserved,2);
 assert.equal((await bob('/api/orders/'+id)).status,404);assert.equal((await bob('/api/orders')).data.orders.length,0);
 assert.equal((await alice('/api/orders/'+id+'/transition',{next:'paid',details:{amount:order.total,bankConfirmed:true}})).status,403);
 const proof={name:'sample.pdf',type:'application/pdf',base64:Buffer.from('%PDF-1.4\nlocal test payment proof\n%%EOF').toString('base64')};
 assert.equal((await alice('/api/orders/'+id+'/proof',{...proof,base64:Buffer.from('not a pdf').toString('base64')})).status,400);
 const uploaded=await alice('/api/orders/'+id+'/proof',proof);assert.equal(uploaded.status,201);const proofId=uploaded.data.order.proofs[0].id;
 assert.equal((await bob('/api/proofs/'+proofId)).status,404);assert.equal((await alice('/api/proofs/'+proofId)).status,200);
 assert.equal((await guest('/data/kat.sqlite')).status,404);assert.equal((await guest('/server/store.mjs')).status,404);
 for(const blocked of ['/server/index.mjs','/package.json','/tests/store.test.mjs','/..%2Fpackage.json','/.github/workflows/pages.yml','/site/index.html'])assert.equal((await guest(blocked)).status,404,blocked+' must not be served');
 for(const page of ['/','/men.html','/css/styles.css','/js/app.js','/favicon.svg','/images/sneakers/vans-yellow-low.jpg'])assert.equal((await guest(page)).status,200,page+' must be served');
 const change=(next,details={})=>admin('/api/orders/'+id+'/transition',{next,details});
 assert.equal((await change('shipped')).status,409);
 assert.equal((await change('paid',{amount:order.total})).status,400);
 assert.equal((await change('proof_rejected',{reason:'Unreadable proof'})).status,200);
 assert.equal((await alice('/api/orders/'+id+'/proof',proof)).status,201);
 assert.equal((await change('paid',{amount:1,bankConfirmed:true})).status,400);
 assert.equal((await change('paid',{amount:order.total,bankConfirmed:true})).status,200);
 assert.equal((await change('paid',{amount:order.total,bankConfirmed:true})).status,409);
 assert.deepEqual({...store.db.prepare('SELECT physical,reserved FROM stock WHERE product=1 AND size=?').get('3')},{physical:8,reserved:0});
 assert.equal((await change('packed')).status,400);assert.equal((await change('packed',{checked:true})).status,200);
 assert.equal((await change('shipped',{note:'Arriving this afternoon'})).status,200,'Soweto orders go out with the store, no courier tracking needed');
 const shipped=(await alice('/api/orders/'+id)).data.order;assert.equal(shipped.courier,'Kat Sneakers delivery');assert.match(shipped.messages.at(-1).text,/out for delivery to 12 Vilakazi Street, Orlando West/);
 assert.equal((await change('delivered')).status,200);
 const before={...store.db.prepare('SELECT physical,reserved FROM stock WHERE product=1 AND size=?').get('4')};
 assert.equal((await alice('/api/orders',{customer:sowetoCustomer,items:[{id:1,size:4,qty:2},{id:2,size:4,qty:99}]})).status,409);
 assert.deepEqual({...store.db.prepare('SELECT physical,reserved FROM stock WHERE product=1 AND size=?').get('4')},before,'Failed orders must roll back reservations');
 const expiring=(await alice('/api/orders',{customer:sowetoCustomer,items:[{id:1,size:4,qty:1}]})).data.order;
 expiring.expires=new Date(0).toISOString();store.db.prepare('UPDATE orders SET data=? WHERE id=?').run(JSON.stringify(expiring),expiring.id);
 assert.equal((await alice('/api/orders/'+expiring.id)).data.order.status,'cancelled');assert.equal(store.db.prepare('SELECT reserved FROM stock WHERE product=1 AND size=?').get('4').reserved,0);
 const manual=(await admin('/api/orders',{customer:sowetoCustomer,items:[{id:3,size:3,qty:1}],source:'Phone'})).data.order;
 assert.equal((await alice('/api/orders/'+manual.id)).status,200,'Manual sales attach to an existing customer account');
});

test('customers outside Soweto use PAXI, with fees from settings and a PAXI tracking number',async t=>{
 const {client,admin}=await setup(t);const alice=client();
 await alice('/api/signup',{email:'alice@example.com',name:'Alice Test',password:'Test-password-123'});
 assert.equal((await alice('/api/orders',{customer:{...paxiCustomer,paxiPoint:''},items:[{id:1,size:'3',qty:1}]})).status,400,'A PAXI Point is required');
 assert.equal((await alice('/api/admin/settings',{paxiFastFee:'120'})).status,403);
 const info=(await alice('/api/store')).data;assert.equal(info.bank,null);assert.deepEqual(info.delivery.paxi.map(o=>o.fee),[5995,10995]);
 assert.equal((await admin('/api/admin/settings',{bankName:'Test Bank',accountHolder:'Kat Sneakers',accountNumber:'123456789',paxiFastFee:'120',sowetoFee:'0'})).status,200);
 assert.equal((await alice('/api/store')).data.bank.accountNumber,'123456789');
 const order=(await alice('/api/orders',{customer:paxiCustomer,items:[{id:1,size:'3',qty:1}]})).data.order;
 assert.equal(order.delivery,12000);assert.match(order.deliveryLabel,/PAXI/);assert.equal(order.customer.phone,'0821234567');
 const standard=(await alice('/api/orders',{customer:{...paxiCustomer,paxiSpeed:'standard'},items:[{id:1,size:'3',qty:1}]})).data.order;assert.equal(standard.delivery,5995);
 const free=(await alice('/api/orders',{customer:sowetoCustomer,items:[{id:1,size:'3',qty:1}]})).data.order;assert.equal(free.delivery,0);
 await alice('/api/orders/'+order.id+'/proof',{name:'p.pdf',type:'application/pdf',base64:Buffer.from('%PDF-1.4 x').toString('base64')});
 const change=(next,details={})=>admin('/api/orders/'+order.id+'/transition',{next,details});
 await change('paid',{amount:order.total,bankConfirmed:true});await change('packed',{checked:true});
 assert.equal((await change('shipped',{})).status,400,'PAXI orders need the PAXI tracking number');
 const shipped=(await change('shipped',{tracking:'PX123456'})).data.order;
 assert.equal(shipped.courier,'PAXI');assert.match(shipped.messages.at(-1).text,/PAXI tracking number: PX123456.*collection PIN.*ID/);
});

test('admins manage products, prices and stock; out-of-stock shoes cannot be bought',async t=>{
 const {client,admin}=await setup(t);const alice=client();
 await alice('/api/signup',{email:'alice@example.com',name:'Alice Test',password:'Test-password-123'});
 assert.equal((await alice('/api/admin/products')).status,403);
 const shoe={brand:'Nike',name:'Air Force 1 ’07',colour:'White / White',price:'1599.99',was:'',image:'images/sneakers/nike-air-force-1-white.jpg',categories:['Men','Women'],sizes:['7','6','8'],stock:{'6':2,'7':1,'8':0},status:'active'};
 assert.equal((await admin('/api/admin/products',{...shoe,image:'https://example.com/x.jpg'})).status,400,'Images must be stored locally first');
 assert.equal((await admin('/api/admin/products',{...shoe,was:'1000'})).status,400,'A sale price must be lower than the original');
 assert.equal((await admin('/api/admin/products',{...shoe,categories:[]})).status,400);
 const created=await admin('/api/admin/products',shoe);assert.equal(created.status,201);const p=created.data.product;
 assert.deepEqual(p.sizes,['6','7','8']);assert.equal(p.price,1599.99);assert.deepEqual(p.stock,{'6':2,'7':1,'8':0});assert.equal(p.soldOut,false);
 let listed=(await alice('/api/products')).data.products.find(x=>x.id===p.id);assert.equal(listed.stock['8'],0);assert.equal(listed.physical,undefined,'Shelf counts and image sources stay admin-only');
 assert.equal((await alice('/api/orders',{customer:sowetoCustomer,items:[{id:p.id,size:'8',qty:1}]})).status,409,'A size with no stock cannot be ordered');
 assert.equal((await alice('/api/orders',{customer:sowetoCustomer,items:[{id:p.id,size:'7',qty:2}]})).status,409);
 const order=(await alice('/api/orders',{customer:sowetoCustomer,items:[{id:p.id,size:'7',qty:1}]})).data.order;assert.equal(order.items[0].price,159999);
 // The last pair is reserved, so the shoe now shows as out of stock for the remaining sizes only.
 listed=(await alice('/api/products')).data.products.find(x=>x.id===p.id);assert.equal(listed.stock['7'],0);assert.equal(listed.soldOut,false);
 const update=(await admin('/api/admin/products/'+p.id)).data.product;
 assert.equal((await admin('/api/admin/products/'+p.id,{...shoe,stock:{'6':2,'7':0,'8':0},updated:update.updated})).status,409,'Stock cannot drop below pairs reserved by open orders');
 assert.equal((await admin('/api/admin/products/'+p.id,{...shoe,sizes:['6','8'],updated:update.updated})).status,409,'A size with reservations cannot be removed');
 const repriced=await admin('/api/admin/products/'+p.id,{...shoe,price:'1299',was:'1599.99',stock:{'6':0,'7':1,'8':0},updated:update.updated});assert.equal(repriced.status,200);
 assert.equal(repriced.data.product.was,1599.99);
 assert.equal((await admin('/api/admin/products/'+p.id,{...shoe,updated:update.updated})).status,409,'Stale edits are refused');
 listed=(await alice('/api/products')).data.products.find(x=>x.id===p.id);assert.equal(listed.price,1299);assert.equal(listed.soldOut,true,'No pairs left in any size means out of stock');
 const marked=(await admin('/api/admin/products/2/availability',{status:'sold_out'})).data.product;assert.equal(marked.soldOut,true);
 assert.equal((await alice('/api/products')).data.products.find(x=>x.id===2).soldOut,true);
 assert.equal((await alice('/api/orders',{customer:sowetoCustomer,items:[{id:2,size:'4',qty:1}]})).status,409,'Shoes marked out of stock cannot be ordered');
 await admin('/api/admin/products/2/availability',{status:'hidden'});
 assert.equal((await alice('/api/products')).data.products.some(x=>x.id===2),false,'Hidden shoes leave the store');
 assert.equal((await alice('/api/products/2')).status,404);
 assert.equal((await admin('/api/admin/products/'+p.id+'/delete',{})).status,409,'Shoes held by open orders cannot be deleted');
 assert.equal((await admin('/api/admin/products/2/delete',{})).status,200);
 assert.equal((await alice('/api/products')).data.products.length,27,'27 starter shoes, plus one added, minus one deleted');
});

test('image search merges providers and chosen photos are copied safely into the store',async t=>{
 const calls=[];
 const fetchImpl=async(url,options={})=>{const href=String(url);calls.push(href);
  if(href.startsWith('https://commons.wikimedia.org/'))return Response.json({query:{pages:{1:{index:1,title:'File:Nike Air Force 1 low.jpg',imageinfo:[{mime:'image/jpeg',thumburl:'https://upload.example.org/af1/960px-af1.jpg',descriptionurl:'https://commons.example.org/af1',extmetadata:{Artist:{value:'<a>Someone</a>'},LicenseShortName:{value:'CC BY 4.0'}}}]},3:{index:3,title:'File:Air Force 1 bus depot.jpg',imageinfo:[{mime:'image/jpeg',thumburl:'https://upload.example.org/bus/960px-bus.jpg'}]},2:{index:2,title:'File:Logo.svg',imageinfo:[{mime:'image/svg+xml',url:'https://upload.example.org/logo.svg'}]}}}});
  if(href.startsWith('https://api.openverse.org/'))throw Error('offline');
  if(href.startsWith('https://google.serper.dev/')){assert.equal(options.headers['X-API-KEY'],'test-key');return Response.json({images:[{title:'AF1 product shot',imageUrl:'https://shop.example.com/af1.jpg',thumbnailUrl:'https://thumbs.example.com/af1.jpg',link:'https://shop.example.com/af1',domain:'shop.example.com'}]});}
  if(href==='https://shop.example.com/af1.jpg')return new Response(null,{status:302,headers:{location:'https://cdn.example.com/af1.jpg'}});
  if(href==='https://cdn.example.com/af1.jpg')return new Response(JPEG,{headers:{'content-type':'image/jpeg'}});
  if(href==='https://cdn.example.com/page.html')return new Response('<html>not an image</html>',{headers:{'content-type':'text/html'}});
  if(href==='https://shop.example.com/to-private')return new Response(null,{status:301,headers:{location:'http://internal.example.com/secret.jpg'}});
  throw Error('Unexpected fetch '+href);
 };
 const resolveHost=async host=>[{address:host==='internal.example.com'?'10.0.0.5':'93.184.216.34'}];
 const {client,admin,imagesDir}=await setup(t,{fetchImpl,resolveHost,env:{SERPER_API_KEY:'test-key'}});const guest=client();
 assert.equal((await guest('/api/admin/images/search?q=af1')).status,401);
 assert.equal((await admin('/api/admin/images/search?q=a')).status,400);
 const found=(await admin('/api/admin/images/search?q=Nike%20Air%20Force%201')).data;
 assert.deepEqual(found.providers,['Google Images (Serper)','Wikimedia Commons','Openverse']);
 assert.deepEqual(found.results.map(r=>r.provider),['Google Images','Wikimedia Commons'],'Unrelated photos, unsupported formats and failed providers are skipped');
 assert.equal(found.results[1].credit,'Someone / CC BY 4.0');assert.match(found.results[1].thumb,/330px-/);
 const imported=await admin('/api/admin/images/import',{url:found.results[0].url});assert.equal(imported.status,201);
 assert.match(imported.data.image,/^images\/products\/[0-9a-f-]+\.jpg$/);assert.ok(existsSync(join(imagesDir,imported.data.image.split('/').pop())));
 const served=await guest('/'+imported.data.image);assert.equal(served.status,200);assert.equal(served.headers.get('content-type'),'image/jpeg');assert.ok(served.data.equals(JPEG));
 assert.equal((await admin('/api/admin/images/import',{url:'http://127.0.0.1:3000/data/kat.sqlite'})).status,400,'Loopback addresses are refused');
 assert.equal((await admin('/api/admin/images/import',{url:'https://shop.example.com/to-private'})).status,400,'Redirects into private networks are refused');
 assert.equal((await admin('/api/admin/images/import',{url:'file:///etc/passwd'})).status,400);
 assert.equal((await admin('/api/admin/images/import',{url:'https://cdn.example.com/page.html'})).status,415);
 assert.equal((await admin('/api/admin/images/upload',{name:'x.gif',type:'image/gif',base64:Buffer.from('GIF89a').toString('base64')})).status,415);
 const uploaded=await admin('/api/admin/images/upload',{name:'shoe.jpg',type:'image/jpeg',base64:JPEG.toString('base64')});assert.equal(uploaded.status,201);
 const shoe=await admin('/api/admin/products',{brand:'Nike',name:'Air Force 1',price:1499,image:imported.data.image,imageCredit:'shop.example.com',imageSource:'https://shop.example.com/af1',categories:['Men'],sizes:['8'],stock:{'8':3}});
 assert.equal(shoe.status,201);assert.equal(shoe.data.product.imageCredit,'shop.example.com');
 assert.equal((await guest('/images/products/../../server/index.mjs')).status,404);
 for(const address of ['10.1.2.3','127.0.0.1','169.254.169.254','192.168.0.1','172.20.0.1','::1','fd00::1','::ffff:127.0.0.1','100.64.0.1'])assert.ok(isPrivateAddress(address),address);
 assert.ok(!isPrivateAddress('93.184.216.34'));
});

test('SQLite orders, products and accounts survive reopening the store',async()=>{
 const parent=realpathSync(tmpdir()),dir=mkdtempSync(join(parent,'kat-store-test-')),path=join(dir,'test.sqlite');
 try{
  let store=openStore(path);store.db.prepare('INSERT INTO users VALUES(?,?,?,?,?)').run('persist','saved@example.com','Saved Customer',await passwordHash('Persist-pass-123'),'customer');
  const order=store.createOrder({id:'persist',role:'customer'},{customer:{...sowetoCustomer,email:'saved@example.com'},items:[{id:1,size:'3',qty:1}]});
  store.setAvailability(5,'sold_out');store.db.prepare("UPDATE products SET image='public/images/sneakers/puma-suede-black.jpg' WHERE id=5").run();store.db.close();
  store=openStore(path);assert.equal(store.getOrder(order.id).total,154900);assert.equal(store.product(5).soldOut,true);assert.equal(store.product(5).image,'images/sneakers/puma-suede-black.jpg','Old photo paths are upgraded');assert.equal(store.products().length,27,'The starter catalogue is only seeded once');assert.equal(store.db.prepare('SELECT role FROM users WHERE id=?').get('persist').role,'customer');store.db.close();
 }finally{const target=resolve(dir);assert.ok(target.startsWith(resolve(parent)+sep)&&target.includes('kat-store-test-'));rmSync(target,{recursive:true,force:true});}
});

test('image downloads cannot be steered into private networks',async t=>{
 for(const address of ['::ffff:7f00:1','::ffff:a9fe:a9fe','64:ff9b::7f00:1','2002:7f00:1::','::7f00:1','fe80::1','2001:db8::1'])assert.ok(isPrivateAddress(address),address);
 assert.ok(!isPrivateAddress('2606:4700::6810:84e5'));
 // A local web server stands in for an internal service.
 const internal=http.createServer((req,res)=>res.end(JSON.stringify({secret:true})));internal.listen(0,'127.0.0.1');await once(internal,'listening');t.after(()=>internal.close());
 const port=internal.address().port;
 await assert.rejects(downloadImage(`http://[::ffff:127.0.0.1]:${port}/`),{status:400});
 // DNS rebinding: the pre-check sees a public address, but the connection itself resolves to localhost.
 await assert.rejects(downloadImage(`http://localhost/`,{resolveHost:async()=>[{address:'93.184.216.34'}]}),{status:400,message:/private network/});
});

test('rate limits, bad addresses, cancellations and photo clean-up behave',async t=>{
 const {store,client,admin,imagesDir}=await setup(t,{fetchImpl:async()=>Response.json({query:{pages:{}}})});const alice=client(),guest=client();
 for(let i=0;i<35;i++)await admin('/api/admin/images/search?q=Nike%20Dunk');
 assert.equal((await guest('/api/login',{email:'owner@example.com',password:'Admin-test-pass-123'})).status,200,'Photo searches do not use up sign-in attempts');
 assert.equal((await guest('/%E0%A4%A')).status,400);assert.equal((await guest('/api/%ZZ')).status,400);
 await alice('/api/signup',{email:'alice@example.com',name:'Alice Test',password:'Test-password-123'});
 const image=(await admin('/api/admin/images/upload',{name:'shoe.jpg',type:'image/jpeg',base64:JPEG.toString('base64')})).data.image;
 const shoe=(await admin('/api/admin/products',{brand:'Puma',name:'Palermo',price:1299,image,categories:['Men'],sizes:['8'],stock:{'8':2}})).data.product;
 const order=(await alice('/api/orders',{customer:sowetoCustomer,items:[{id:shoe.id,size:'8',qty:1}]})).data.order;
 assert.equal((await admin('/api/orders/'+order.id+'/transition',{next:'cancelled'})).data.order.cancelReason,'store');
 assert.equal((await admin('/api/admin/products/'+shoe.id+'/delete',{})).status,200);
 assert.ok(existsSync(join(imagesDir,image.split('/').pop())),'A photo shown on a past order is kept');
 assert.equal((await alice('/api/orders/'+order.id)).data.order.items[0].image,image);
 assert.equal(store.db.prepare('SELECT COUNT(*) AS n FROM orders').get().n,1);
});
