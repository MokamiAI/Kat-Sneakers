import http from 'node:http';
import { readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, join, sep } from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import { openStore, email, text, passwordHash, verifyPassword, hash, problem, CATEGORIES } from './store.mjs';
import { deliveryOptions, PROVINCES } from './delivery.mjs';
import { searchImages, downloadImage, decodeUpload, imageProviders } from './images.mjs';

// Project layout: site/ is the web root, data/ holds the database and uploaded shoe photos.
const root=fileURLToPath(new URL('..',import.meta.url)),siteDir=resolve(root,'site');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.md':'text/plain; charset=utf-8'};

export function createApp({dbPath=resolve(root,'data/kat.sqlite'),imagesDir=resolve(root,'data/uploads'),secureCookies=false,allowedHosts=[],trustProxy=false,fetchImpl,resolveHost,env=process.env}={}){
 const store=openStore(dbPath),db=store.db,buckets=new Map();
 const hostPattern=new RegExp('^(localhost|127\\.0\\.0\\.1|\\[::1\\]'+allowedHosts.map(h=>'|'+h.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('')+')(:\\d+)?$','i');
 const publicUser=user=>({id:user.id,name:user.name,email:user.email,role:user.role});
 function reply(res,status,data,headers={}){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store',...headers});res.end(JSON.stringify(data));}
 // Separate budgets per action, so photo searches never use up sign-in attempts.
 const clientAddress=req=>trustProxy&&req.headers['x-forwarded-for']?String(req.headers['x-forwarded-for']).split(',')[0].trim():req.socket.remoteAddress;
 function throttle(req,limit=30,action='account'){const now=Date.now(),key=action+':'+clientAddress(req);let b=buckets.get(key);if(!b||b.until<now){b={count:0,until:now+15*60000};buckets.set(key,b);}if(++b.count>limit)problem(429,action==='account'?'Too many account attempts. Try again in 15 minutes.':'Too many requests. Try again in a few minutes.');}
 // Unknown emails still pay for one password check, so response time does not reveal accounts.
 const dummyHash=passwordHash('timing-equaliser-not-a-password');
 async function body(req,limit=3*1024*1024){if(!req.headers['content-type']?.startsWith('application/json'))problem(415,'Send JSON data.');let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>limit)problem(413,'Request is too large.');chunks.push(chunk);}let parsed;try{parsed=JSON.parse(Buffer.concat(chunks).toString());}catch{problem(400,'Invalid JSON.');}if(!parsed||Array.isArray(parsed)||typeof parsed!=='object')problem(400,'Send a JSON object.');return parsed;}
 const sessionToken=req=>String(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('kat_session='))?.slice(12);
 function authenticate(req){const raw=sessionToken(req);if(!raw)return null;return db.prepare('SELECT users.* FROM users JOIN sessions ON users.id=sessions.user_id WHERE sessions.token=? AND sessions.expires>?').get(hash(raw),Date.now())||null;}
 function session(res,user){const token=randomBytes(32).toString('hex');db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(token),user.id,Date.now()+12*3600000);reply(res,200,{user:publicUser(user)},{'Set-Cookie':`kat_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${secureCookies?'; Secure':''}`});}
 async function saveImage({buffer,ext}){await mkdir(imagesDir,{recursive:true});const name=randomUUID()+'.'+ext;await writeFile(join(imagesDir,name),buffer);return 'images/products/'+name;}
 function storeInfo(){const s=store.settings();return {delivery:deliveryOptions(s),provinces:PROVINCES,categories:CATEGORIES,bank:store.bankReady(s)?{bankName:s.bankName,accountHolder:s.accountHolder,accountNumber:s.accountNumber,branchCode:s.branchCode,accountType:s.accountType}:null};}

 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');
  try{
   if(!hostPattern.test(req.headers.host||''))problem(403,'Invalid host.');
   const url=new URL(req.url,'http://localhost'),path=(()=>{try{return decodeURIComponent(url.pathname);}catch{problem(400,'Invalid address.');}})();
   if(path.startsWith('/api/')){
    if(!['GET','POST'].includes(req.method))problem(405,'Method not allowed.');
    if(req.method==='POST'){
     const origin=req.headers.origin;if(origin&&origin!==`${secureCookies?'https':'http'}://${req.headers.host}`)problem(403,'Cross-origin request refused.');
     if(req.headers['sec-fetch-site']==='cross-site')problem(403,'Cross-site request refused.');
    }
    const user=authenticate(req);
    if(path==='/api/me'&&req.method==='GET')return reply(res,200,{user:user?publicUser(user):null});
    if(path==='/api/store'&&req.method==='GET')return reply(res,200,storeInfo());
    if(path==='/api/products'&&req.method==='GET')return reply(res,200,{products:store.products()});
    const productPage=path.match(/^\/api\/products\/(\d+)$/);
    if(productPage&&req.method==='GET')return reply(res,200,{product:store.product(productPage[1])});
    if(path==='/api/signup'&&req.method==='POST'){
     throttle(req);const input=await body(req),address=email(input.email),name=text(input.name,'name',100),password=await passwordHash(input.password);
     if(db.prepare('SELECT id FROM users WHERE email=?').get(address))problem(409,'An account already exists for this email. Sign in instead.');
     const id=randomUUID();db.prepare('INSERT INTO users VALUES(?,?,?,?,?)').run(id,address,name,password,'customer');return session(res,db.prepare('SELECT * FROM users WHERE id=?').get(id));
    }
    if(path==='/api/login'&&req.method==='POST'){
     throttle(req);const input=await body(req),address=email(input.email);if(typeof input.password!=='string'||input.password.length>128)problem(400,'Invalid email or password.');
     const account=db.prepare('SELECT * FROM users WHERE email=?').get(address);
     if(!account){await verifyPassword(input.password,await dummyHash);problem(401,'Invalid email or password.');}
     if(!await verifyPassword(input.password,account.password))problem(401,'Invalid email or password.');return session(res,account);
    }
    if(!user)problem(401,'Please sign in to continue.');
    if(path==='/api/logout'&&req.method==='POST'){await body(req);const raw=sessionToken(req);if(raw)db.prepare('DELETE FROM sessions WHERE token=?').run(hash(raw));return reply(res,200,{ok:true},{'Set-Cookie':'kat_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});}
    if(path==='/api/orders'&&req.method==='GET')return reply(res,200,{orders:store.allOrders(user)});
    if(path==='/api/orders'&&req.method==='POST'){store.expire();return reply(res,201,{order:store.createOrder(user,await body(req))});}
    const orderRoute=path.match(/^\/api\/orders\/(KAT-[A-F0-9]{8})(?:\/(proof|transition))?$/);
    if(orderRoute){const [,id,action]=orderRoute;store.expire();const order=store.accessible(user,id);
     if(!action&&req.method==='GET')return reply(res,200,{order});
     if(action==='proof'&&req.method==='POST')return reply(res,201,{order:store.addProof(user,id,await body(req))});
     if(action==='transition'&&req.method==='POST'){const data=await body(req);return reply(res,200,{order:store.transition(user,id,data.next,data.details)});}
    }
    const proofRoute=path.match(/^\/api\/proofs\/([a-f0-9-]{36})$/);
    if(proofRoute&&req.method==='GET'){
     const proof=db.prepare('SELECT * FROM proofs WHERE id=?').get(proofRoute[1]);if(!proof)problem(404,'Proof not found.');store.accessible(user,proof.order_id);
     res.writeHead(200,{'Content-Type':proof.type,'Content-Disposition':`attachment; filename="proof-${proof.id}.${proof.type==='application/pdf'?'pdf':proof.type==='image/png'?'png':'jpg'}"`,'Cache-Control':'no-store'});return res.end(proof.content);
    }

    // ---- Store management (administrators only) ----
    if(path.startsWith('/api/admin/')){
     if(user.role!=='admin')problem(403,'Administrator access is required.');
     if(path==='/api/admin/products'&&req.method==='GET')return reply(res,200,{products:store.products({admin:true})});
     if(path==='/api/admin/products'&&req.method==='POST')return reply(res,201,{product:store.createProduct(await body(req))});
     const productRoute=path.match(/^\/api\/admin\/products\/(\d+)(?:\/(availability|delete))?$/);
     if(productRoute&&req.method==='GET'&&!productRoute[2])return reply(res,200,{product:store.product(productRoute[1],{admin:true})});
     if(productRoute&&req.method==='POST'){
      const [,id,action]=productRoute,input=await body(req);
      if(action==='availability')return reply(res,200,{product:store.setAvailability(id,input.status)});
      if(action==='delete'){const {image}=store.deleteProduct(id);// Past orders show their photo, so it is only removed when nothing refers to it any more.
      if(image.startsWith('images/products/')&&!db.prepare('SELECT 1 FROM products WHERE image=?').get(image)&&!db.prepare("SELECT 1 FROM orders WHERE instr(data,?)").get(JSON.stringify(image)))await unlink(join(imagesDir,image.split('/').pop())).catch(()=>{});return reply(res,200,{ok:true});}
      return reply(res,200,{product:store.updateProduct(id,input)});
     }
     if(path==='/api/admin/images/search'&&req.method==='GET'){throttle(req,300,'image-search');return reply(res,200,await searchImages(url.searchParams.get('q'),{fetchImpl:fetchImpl||fetch,env}));}
     if(path==='/api/admin/images/import'&&req.method==='POST'){const input=await body(req);const image=await saveImage(await downloadImage(text(input.url,'image link',2000),{...(fetchImpl?{fetchImpl}:{}),...(resolveHost?{resolveHost}:{})}));return reply(res,201,{image});}
     if(path==='/api/admin/images/upload'&&req.method==='POST'){const image=await saveImage(decodeUpload(await body(req,12*1024*1024)));return reply(res,201,{image});}
     if(path==='/api/admin/settings'&&req.method==='GET')return reply(res,200,{settings:store.settings(),imageProviders:imageProviders(env)});
     if(path==='/api/admin/settings'&&req.method==='POST')return reply(res,200,{settings:store.saveSettings(await body(req))});
    }
    problem(404,'API route not found.');
   }
   if(req.method!=='GET'&&req.method!=='HEAD')problem(405,'Method not allowed.');
   const asset=path==='/'?'index.html':path.slice(1);
   let file;
   // Uploaded shoe photos come from data/uploads; everything else from site/, never above it.
   if(/^images\/products\/[\w-]+\.(jpg|png|webp)$/.test(asset))file=join(imagesDir,asset.split('/').pop());
   else if(/^([\w-]+\/)*[\w.-]+\.(html|css|js|svg|jpg|jpeg|png|webp|md)$/i.test(asset)&&!asset.split('/').some(part=>part.startsWith('.'))){file=resolve(siteDir,asset);if(!file.startsWith(siteDir+sep))problem(404,'Page not found.');}
   else problem(404,'Page not found.');
   let data;try{data=await readFile(file);}catch{problem(404,'Page not found.');}
   res.writeHead(200,{'Content-Type':types[extname(asset)]||'application/octet-stream','Cache-Control':asset.startsWith('images/')?'public, max-age=86400':'no-cache'});res.end(req.method==='HEAD'?undefined:data);
  }catch(error){if(!error.status)console.error(error);if(!res.headersSent)reply(res,error.status||500,{error:error.status?error.message:'An unexpected server error occurred.'});else res.end();}
 });
 server.requestTimeout=60000;server.headersTimeout=10000;
 return {server,store};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||3000),host=process.env.HOST||'127.0.0.1';
 const {server}=createApp({dbPath:process.env.KAT_DB||resolve(root,'data/kat.sqlite'),secureCookies:process.env.COOKIE_SECURE==='true',allowedHosts:(process.env.ALLOWED_HOSTS||'').split(',').map(h=>h.trim()).filter(Boolean),trustProxy:process.env.TRUST_PROXY==='true'});
 server.listen(port,host,()=>console.log(`Kat Sneakers is running at http://localhost:${port}\nCreate an administrator with: npm run create-admin`));
}
