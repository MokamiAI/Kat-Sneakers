import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scrypt, timingSafeEqual, createHash, randomUUID } from 'node:crypto';
import { promisify } from 'node:util';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import vm from 'node:vm';
import { PROVINCES, SOWETO_AREAS, DEFAULT_DELIVERY, quote } from './delivery.mjs';

const derive=promisify(scrypt);
export const labels={awaiting_payment:'Awaiting payment',proof_uploaded:'Proof to check',proof_rejected:'Proof rejected',paid:'Paid, to pack',packed:'Packed',shipped:'Shipped',delivered:'Delivered',cancelled:'Cancelled'};
export const CATEGORIES=['Men','Women','Kids','Comfort'];
export const seedCatalogue=vm.runInNewContext(readFileSync(new URL('../site/js/catalogue.js',import.meta.url),'utf8')+'; JSON.parse(JSON.stringify(inventory))');
export function problem(status,message){const error=new Error(message);error.status=status;throw error;}
export function text(value,label,max=250){if(typeof value!=='string'||!value.trim()||value.trim().length>max)problem(400,`Enter a valid ${label}.`);return value.trim();}
const optional=(value,label,max)=>value==null||String(value).trim()===''?'':text(String(value),label,max);
export function email(value){const result=text(value,'email',254).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result))problem(400,'Enter a valid email address.');return result;}
export function phone(value){const digits=text(value,'mobile number',30).replace(/[\s()-]/g,'');if(!/^(0\d{9}|\+27\d{9})$/.test(digits))problem(400,'Enter a South African mobile number, e.g. 082 123 4567.');return digits;}
export async function passwordHash(value){if(typeof value!=='string'||value.length<10||value.length>128)problem(400,'Use a password between 10 and 128 characters.');const salt=randomBytes(16).toString('hex');return salt+':'+Buffer.from(await derive(value,salt,64)).toString('hex');}
export async function verifyPassword(value,stored){const [salt,hash]=stored.split(':');const actual=Buffer.from(await derive(value,salt,64));return timingSafeEqual(actual,Buffer.from(hash,'hex'));}
export const hash=value=>createHash('sha256').update(value).digest('hex');
// Rand amounts from forms become integer cents.
export function cents(value,label,{allowEmpty=false}={}){
 if(allowEmpty&&(value===null||value===undefined||value===''))return null;
 const number=Number(value);if(!Number.isFinite(number)||number<=0||number>1000000)problem(400,`Enter a valid ${label}.`);
 return Math.round(number*100);
}
const sizeOrder=size=>{const kids=/^(\d+(?:\.5)?)K$/i.exec(size);return kids?Number(kids[1])-100:Number(size);};
export function sizesFrom(list){
 if(!Array.isArray(list)||!list.length||list.length>30)problem(400,'Add between 1 and 30 sizes.');
 const sizes=[...new Set(list.map(s=>String(s).trim().toUpperCase()))];
 if(sizes.some(s=>!/^(\d{1,2}(\.5)?K?)$/.test(s)))problem(400,'Use UK sizes such as 6, 7.5 or 12K.');
 return sizes.sort((a,b)=>sizeOrder(a)-sizeOrder(b));
}

export function openStore(path){
  if(path!==':memory:')mkdirSync(dirname(path),{recursive:true});
  const db=new DatabaseSync(path);db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE,name TEXT NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('customer','admin')));
    CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS order_requests(user_id TEXT NOT NULL REFERENCES users(id),request_id TEXT NOT NULL,order_id TEXT NOT NULL REFERENCES orders(id),fingerprint TEXT NOT NULL,PRIMARY KEY(user_id,request_id));
    CREATE TABLE IF NOT EXISTS proofs(id TEXT PRIMARY KEY,order_id TEXT NOT NULL REFERENCES orders(id),name TEXT NOT NULL,type TEXT NOT NULL,content BLOB NOT NULL,hash TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS stock(product INTEGER NOT NULL,size TEXT NOT NULL,physical INTEGER NOT NULL CHECK(physical>=0),reserved INTEGER NOT NULL DEFAULT 0 CHECK(reserved>=0 AND reserved<=physical),PRIMARY KEY(product,size));
    CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY AUTOINCREMENT,brand TEXT NOT NULL,name TEXT NOT NULL,colour TEXT NOT NULL DEFAULT '',price INTEGER NOT NULL CHECK(price>0),was INTEGER,image TEXT NOT NULL,image_credit TEXT NOT NULL DEFAULT '',image_source TEXT NOT NULL DEFAULT '',categories TEXT NOT NULL,sizes TEXT NOT NULL,tag TEXT NOT NULL DEFAULT '',description TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','sold_out','hidden')),created TEXT NOT NULL,updated TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);`);
  const transact=fn=>{db.exec('BEGIN IMMEDIATE');try{const result=fn();db.exec('COMMIT');return result;}catch(error){db.exec('ROLLBACK');throw error;}};

  // First run: the starter catalogue becomes editable products with 10 pairs per size.
  if(!db.prepare('SELECT COUNT(*) AS n FROM products').get().n)transact(()=>{
   const insert=db.prepare('INSERT INTO products(id,brand,name,colour,price,was,image,categories,sizes,tag,created,updated) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)');
   const stock=db.prepare('INSERT OR IGNORE INTO stock(product,size,physical) VALUES(?,?,10)');const at=new Date().toISOString();
   for(const p of seedCatalogue){const sizes=sizesFrom(p.sizes);insert.run(p.id,p.brand,p.name,p.colour,p.price*100,p.was?p.was*100:null,'images/sneakers/'+p.image,JSON.stringify(p.categories),JSON.stringify(sizes),p.tag==='Mock sale'?'':(p.tag||''),at,at);sizes.forEach(s=>stock.run(p.id,s));}
  });

  // Photo paths moved from public/images/ to images/ when the site files moved into site/.
  db.exec(`UPDATE products SET image=substr(image,8) WHERE image LIKE 'public/images/%';
    UPDATE orders SET data=replace(data,'"public/images/','"images/') WHERE instr(data,'"public/images/');`);

  // ---- Settings ----
  const BANK_KEYS=['bankName','accountHolder','accountNumber','branchCode','accountType'];
  function settings(){const values=Object.fromEntries(db.prepare('SELECT key,value FROM settings').all().map(r=>[r.key,JSON.parse(r.value)]));return {...DEFAULT_DELIVERY,...Object.fromEntries(BANK_KEYS.map(k=>[k,''])),...values};}
  function saveSettings(input){
   const current=settings(),next={};
   for(const key of BANK_KEYS)next[key]=optional(input[key]??current[key],key.replace(/[A-Z]/g,c=>' '+c.toLowerCase()),100);
   for(const key of ['sowetoFee','paxiStandardFee','paxiFastFee']){const value=Number(input[key]??current[key]/100);if(!Number.isFinite(value)||value<0||value>10000)problem(400,'Enter delivery fees between R0 and R10 000.');next[key]=Math.round(value*100);}
   for(const key of ['sowetoEta','paxiStandardEta','paxiFastEta'])next[key]=text(String(input[key]??current[key]),'delivery time',60);
   const put=db.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
   transact(()=>Object.entries(next).forEach(([k,v])=>put.run(k,JSON.stringify(v))));return settings();
  }
  const bankReady=s=>!!(s.bankName&&s.accountHolder&&s.accountNumber);

  // ---- Products ----
  function productRow(row,admin=false){
   if(!row)return null;
   const sizes=JSON.parse(row.sizes),levels=Object.fromEntries(db.prepare('SELECT size,physical,reserved FROM stock WHERE product=?').all(row.id).map(s=>[s.size,s]));
   const stock=Object.fromEntries(sizes.map(s=>[s,Math.max(0,(levels[s]?.physical||0)-(levels[s]?.reserved||0))]));
   const inStock=row.status==='active'&&Object.values(stock).some(n=>n>0);
   const product={id:row.id,brand:row.brand,name:row.name,colour:row.colour,price:row.price/100,was:row.was?row.was/100:null,image:row.image,categories:JSON.parse(row.categories),sizes,stock,tag:row.tag,description:row.description,status:row.status,soldOut:!inStock};
   if(admin)Object.assign(product,{physical:Object.fromEntries(sizes.map(s=>[s,levels[s]?.physical||0])),reserved:Object.fromEntries(sizes.map(s=>[s,levels[s]?.reserved||0])),imageCredit:row.image_credit,imageSource:row.image_source,created:row.created,updated:row.updated});
   return product;
  }
  const getProductRow=id=>db.prepare('SELECT * FROM products WHERE id=?').get(Number(id));
  function products({admin=false}={}){return db.prepare(`SELECT * FROM products ${admin?'':"WHERE status!='hidden'"} ORDER BY id DESC`).all().map(r=>productRow(r,admin));}
  function product(id,{admin=false}={}){const row=getProductRow(id);if(!row||(!admin&&row.status==='hidden'))problem(404,'Product not found.');return productRow(row,admin);}
  function productInput(input,existing){
   const brand=text(input.brand,'brand',60),name=text(input.name,'shoe name',120),colour=optional(input.colour,'colourway',80);
   const price=cents(input.price,'price'),was=cents(input.was,'original price',{allowEmpty:true});
   if(was!==null&&was<=price)problem(400,'The original price must be higher than the selling price. Leave it empty if the shoe is not on sale.');
   const image=text(input.image,'product image',300);
   if(!/^images\/(sneakers|products)\/[\w.-]+\.(jpg|jpeg|png|webp)$/i.test(image))problem(400,'Choose a product image from the image search or upload one.');
   const categories=Array.isArray(input.categories)?[...new Set(input.categories)].filter(c=>CATEGORIES.includes(c)):[];
   if(!categories.length)problem(400,'Choose at least one category: Men, Women, Kids or Comfort.');
   const status=input.status??existing?.status??'active';if(!['active','sold_out','hidden'].includes(status))problem(400,'Choose a valid availability.');
   const sizes=sizesFrom(input.sizes);
   const quantities=input.stock&&typeof input.stock==='object'?input.stock:{};
   for(const s of sizes){const q=quantities[s]??0;if(!Number.isInteger(Number(q))||Number(q)<0||Number(q)>9999)problem(400,`Enter a stock quantity of 0 or more for UK ${s}.`);}
   return {brand,name,colour,price,was,image,imageCredit:optional(input.imageCredit,'image credit',200),imageSource:optional(input.imageSource,'image source',500),categories,status,sizes,quantities,tag:optional(input.tag,'tag',30),description:optional(input.description,'description',1000)};
  }
  // `stock` holds pairs on the shelf (physical, including pairs reserved by unpaid orders).
  function writeStock(id,p){
   const levels=Object.fromEntries(db.prepare('SELECT size,physical,reserved FROM stock WHERE product=?').all(id).map(s=>[s.size,s]));
   for(const [size,row] of Object.entries(levels))if(!p.sizes.includes(size)){if(row.reserved)problem(409,`UK ${size} has pairs reserved by open orders, so it cannot be removed yet.`);db.prepare('DELETE FROM stock WHERE product=? AND size=?').run(id,size);}
   for(const size of p.sizes){const physical=Number(p.quantities[size]??0),reserved=levels[size]?.reserved||0;
    if(physical<reserved)problem(409,`UK ${size} has ${reserved} pair${reserved===1?'':'s'} reserved by open orders. Stock cannot go below ${reserved}.`);
    db.prepare('INSERT INTO stock(product,size,physical) VALUES(?,?,?) ON CONFLICT(product,size) DO UPDATE SET physical=excluded.physical').run(id,size,physical);}
  }
  function createProduct(input){return transact(()=>{const p=productInput(input),at=new Date().toISOString();
   const {lastInsertRowid}=db.prepare('INSERT INTO products(brand,name,colour,price,was,image,image_credit,image_source,categories,sizes,tag,description,status,created,updated) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(p.brand,p.name,p.colour,p.price,p.was,p.image,p.imageCredit,p.imageSource,JSON.stringify(p.categories),JSON.stringify(p.sizes),p.tag,p.description,p.status,at,at);
   writeStock(Number(lastInsertRowid),p);return product(lastInsertRowid,{admin:true});});}
  function updateProduct(id,input){return transact(()=>{const existing=getProductRow(id);if(!existing)problem(404,'Product not found.');const p=productInput(input,existing);
   if(input.updated&&input.updated!==existing.updated)problem(409,'Someone else changed this shoe while you were editing. Reload it and try again.');
   db.prepare('UPDATE products SET brand=?,name=?,colour=?,price=?,was=?,image=?,image_credit=?,image_source=?,categories=?,sizes=?,tag=?,description=?,status=?,updated=? WHERE id=?').run(p.brand,p.name,p.colour,p.price,p.was,p.image,p.imageCredit,p.imageSource,JSON.stringify(p.categories),JSON.stringify(p.sizes),p.tag,p.description,p.status,new Date().toISOString(),existing.id);
   writeStock(existing.id,p);return product(existing.id,{admin:true});});}
  function setAvailability(id,status){if(!['active','sold_out','hidden'].includes(status))problem(400,'Choose a valid availability.');const row=getProductRow(id);if(!row)problem(404,'Product not found.');db.prepare('UPDATE products SET status=?,updated=? WHERE id=?').run(status,new Date().toISOString(),row.id);return product(row.id,{admin:true});}
  function deleteProduct(id){return transact(()=>{const row=getProductRow(id);if(!row)problem(404,'Product not found.');
   if(db.prepare('SELECT SUM(reserved) AS n FROM stock WHERE product=?').get(row.id).n)problem(409,'Open orders still hold pairs of this shoe. Hide it from the store instead.');
   db.prepare('DELETE FROM stock WHERE product=?').run(row.id);db.prepare('DELETE FROM products WHERE id=?').run(row.id);return {ok:true,image:row.image};});}

  // ---- Orders ----
  const getOrder=id=>{const row=db.prepare('SELECT * FROM orders WHERE id=?').get(id);if(!row)problem(404,'Order not found.');return {...JSON.parse(row.data),userId:row.user_id};};
  const save=order=>{const data={...order};delete data.userId;db.prepare('UPDATE orders SET data=? WHERE id=?').run(JSON.stringify(data),order.id);};
  const event=(order,message,actor)=>order.events.push({at:new Date().toISOString(),text:message,actor});
  const accessible=(user,id)=>{const order=getOrder(id);if(user.role!=='admin'&&order.userId!==user.id)problem(404,'Order not found.');return order;};
  function release(order){for(const item of order.items)db.prepare('UPDATE stock SET reserved=MAX(0,reserved-?) WHERE product=? AND size=?').run(item.qty,item.id,String(item.size));}
  // Only unpaid orders past their deadline are read, and the write lock is taken only when one exists.
  const overdue=db.prepare("SELECT data FROM orders WHERE json_extract(data,'$.status') IN ('awaiting_payment','proof_rejected') AND json_extract(data,'$.expires')<?");
  function expire(){const now=new Date().toISOString();if(!overdue.get(now))return;transact(()=>{for(const row of overdue.all(now)){const o=JSON.parse(row.data);release(o);o.status='cancelled';o.cancelReason='expired';event(o,'Unpaid reservation expired.','system');save(o);}});}
  function allOrders(user){expire();const rows=user.role==='admin'?db.prepare('SELECT id FROM orders ORDER BY rowid DESC').all():db.prepare('SELECT id FROM orders WHERE user_id=? ORDER BY rowid DESC').all(user.id);return rows.map(r=>getOrder(r.id));}
  function customerFrom(c={}){
   const customer={name:text(c.name,'name',100),email:email(c.email),phone:phone(c.phone),method:c.method==='soweto'?'soweto':c.method==='paxi'?'paxi':problem(400,'Choose Soweto delivery or PAXI.')};
   if(customer.method==='soweto'){
    customer.address=text(c.address,'street address',200);customer.area=SOWETO_AREAS.includes(c.area)?c.area:problem(400,'Choose your Soweto area.');
    customer.notes=optional(c.notes,'delivery note',300);customer.city='Soweto';customer.province='Gauteng';
   }else{
    customer.paxiPoint=text(c.paxiPoint,'PAXI Point (code, store name or suburb)',150);customer.city=text(c.city,'city or town',100);
    customer.province=PROVINCES.includes(c.province)?c.province:problem(400,'Select a South African province.');customer.paxiSpeed=c.paxiSpeed==='fast'?'fast':'standard';
   }
   return customer;
  }
  function createOrder(user,body){return transact(()=>{
    const requestId=body.requestId?text(body.requestId,'checkout request',100):null;
    const fingerprint=hash(JSON.stringify({customer:body.customer,items:body.items,source:body.source}));
    if(requestId){const previous=db.prepare('SELECT * FROM order_requests WHERE user_id=? AND request_id=?').get(user.id,requestId);if(previous){if(previous.fingerprint!==fingerprint)problem(409,'Checkout details changed. Start a new checkout.');return getOrder(previous.order_id);}}
    const customer=customerFrom(body.customer);
    if(!Array.isArray(body.items)||!body.items.length||body.items.length>50)problem(400,'Add between 1 and 50 order lines.');
    const merged=new Map();
    for(const line of body.items){
     const row=getProductRow(line?.id),size=String(line?.size??'');
     if(!row||row.status==='hidden')problem(400,'One of the shoes in your bag is no longer available. Remove it and try again.');
     if(row.status==='sold_out')problem(409,`${row.brand} ${row.name} is out of stock. Remove it from your bag to continue.`);
     if(!JSON.parse(row.sizes).includes(size)||!Number.isInteger(line.qty)||line.qty<1||line.qty>99)problem(400,'Invalid product, size or quantity.');
     const key=row.id+':'+size,previous=merged.get(key);
     if(previous){previous.qty+=line.qty;if(previous.qty>99)problem(400,'Too many pairs in one size.');}
     else merged.set(key,{id:row.id,name:row.brand+' '+row.name,size,qty:line.qty,price:row.price,image:row.image});
    }
    const items=[...merged.values()];
    for(const p of items){const result=db.prepare('UPDATE stock SET reserved=reserved+? WHERE product=? AND size=? AND physical-reserved>=?').run(p.qty,p.id,p.size,p.qty);if(!result.changes)problem(409,`${p.name}, UK ${p.size} is out of stock or has fewer pairs left than you asked for.`);}
    const delivery=quote(settings(),customer),subtotal=items.reduce((sum,p)=>sum+p.price*p.qty,0);
    const order={id:'KAT-'+randomUUID().slice(0,8).toUpperCase(),customer,items,subtotal,delivery:delivery.fee,deliveryLabel:delivery.label,total:subtotal+delivery.fee,status:'awaiting_payment',created:new Date().toISOString(),expires:new Date(Date.now()+48*3600000).toISOString(),source:user.role==='admin'?(optional(body.source,'sale source',40)||'Admin sale'):'Online checkout',proofs:[],events:[],messages:[]};
    const owner=user.role==='admin'?(db.prepare("SELECT id FROM users WHERE email=? AND role='customer'").get(customer.email)?.id||user.id):user.id;
    event(order,'Order placed. Awaiting EFT payment.',user.id);db.prepare('INSERT INTO orders(id,user_id,data) VALUES(?,?,?)').run(order.id,owner,JSON.stringify(order));if(requestId)db.prepare('INSERT INTO order_requests VALUES(?,?,?,?)').run(user.id,requestId,order.id,fingerprint);return order;
  });}
  function addProof(user,id,body){return transact(()=>{
    const order=accessible(user,id);if(!['awaiting_payment','proof_rejected'].includes(order.status))problem(409,'This order is not awaiting proof.');
    const name=text(body.name,'file name',180);if(typeof body.base64!=='string'||body.base64.length>2800000||!/^[A-Za-z0-9+/]*={0,2}$/.test(body.base64))problem(400,'Invalid proof file.');
    const buffer=Buffer.from(body.base64,'base64');if(!buffer.length||buffer.length>2097152)problem(400,'Proof must be at most 2 MB.');
    const type=buffer.subarray(0,5).toString()==='%PDF-'?'application/pdf':buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'image/png':buffer[0]===255&&buffer[1]===216&&buffer[2]===255?'image/jpeg':null;
    if(!type||type!==body.type)problem(400,'Choose a valid JPG, PNG or PDF file.');
    const digest=hash(buffer),fileId=randomUUID();const duplicate=!!db.prepare('SELECT id FROM proofs WHERE hash=? AND order_id!=?').get(digest,id);
    db.prepare('INSERT INTO proofs VALUES(?,?,?,?,?,?)').run(fileId,id,name,type,buffer,digest);order.proofs.push({id:fileId,name,at:new Date().toISOString(),duplicate});order.status='proof_uploaded';event(order,'Payment proof uploaded for review.',user.id);save(order);return order;
  });}
  function message(o,next){
   const name=o.customer.name,c=o.customer,soweto=c.method==='soweto';
   if(next==='paid')return `Hi ${name}, payment for ${o.id} is confirmed. We are getting your pair ready. - Kat Sneakers`;
   if(next==='packed')return soweto?`Hi ${name}, order ${o.id} is packed. We will bring it to ${c.address}, ${c.area} soon. - Kat Sneakers`:`Hi ${name}, order ${o.id} is packed and will be dropped off at PAXI for ${c.paxiPoint}. - Kat Sneakers`;
   if(next==='shipped')return soweto?`Hi ${name}, your Kat Sneakers order ${o.id} is out for delivery to ${c.address}, ${c.area}.${o.deliveryNote?' '+o.deliveryNote:''} Please keep your phone on.`:`Hi ${name}, your Kat Sneakers order ${o.id} is on its way with PAXI to ${c.paxiPoint}. PAXI tracking number: ${o.tracking}. PAXI will SMS you a collection PIN when it arrives. Bring your ID to collect.`;
   if(next==='delivered')return soweto?`Hi ${name}, order ${o.id} has been delivered. Enjoy your new pair! - Kat Sneakers`:`Hi ${name}, order ${o.id} has been collected from PAXI. Enjoy your new pair! - Kat Sneakers`;
   if(next==='proof_rejected')return `Hi ${name}, please upload a new payment proof for ${o.id}. ${o.rejection}`;
   return `Order ${o.id} has been cancelled.`;
  }
  function transition(user,id,next,details={}){if(user.role!=='admin')problem(403,'Administrator access is required.');return transact(()=>{
    const o=getOrder(id),allowed={proof_uploaded:['paid','proof_rejected'],paid:['packed'],packed:['shipped'],shipped:['delivered'],awaiting_payment:['cancelled'],proof_rejected:['cancelled']};
    if(!allowed[o.status]?.includes(next))problem(409,'Invalid or stale order action. Reload this order.');
    if(next==='paid'){
      if(!details.bankConfirmed||details.amount!==o.total)problem(400,'Confirm the full order amount in the bank.');
      for(const p of o.items)db.prepare('UPDATE stock SET physical=MAX(0,physical-?),reserved=MAX(0,reserved-?) WHERE product=? AND size=?').run(p.qty,p.qty,p.id,String(p.size));o.amountPaid=o.total;
    }
    if(next==='proof_rejected')o.rejection=text(details.reason,'rejection reason',500);
    if(next==='packed'&&!details.checked)problem(400,'Complete the packing checklist.');
    if(next==='shipped'){
     if(o.customer.method==='soweto'){o.courier='Kat Sneakers delivery';o.deliveryNote=optional(details.note,'delivery note',200);}
     else{o.courier='PAXI';o.tracking=text(details.tracking,'PAXI tracking number',100);}
    }
    if(next==='cancelled'){release(o);o.cancelReason='store';}
    o.status=next;event(o,labels[next]+(next==='proof_rejected'?': '+o.rejection:''),user.id);
    o.messages.push({at:new Date().toISOString(),text:message(o,next),status:'Draft - not sent'});save(o);return o;
  });}
  return {db,transact,getOrder,accessible,allOrders,createOrder,addProof,transition,expire,products,product,createProduct,updateProduct,setAvailability,deleteProduct,settings,saveSettings,bankReady};
}
