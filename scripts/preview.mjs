// Optional static preview only. No application server or API.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve,extname } from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.md':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const asset=path==='/'?'index.html':path.slice(1);
  if(!/^[\w-]+\.(html|css|js)$/.test(asset)&&!/^public\/images\/sneakers\/[\w.-]+\.(jpg|jpeg|png|webp|html|md)$/i.test(asset))throw Error('Not found');
  const content=await readFile(resolve(root,asset));res.writeHead(200,{'Content-Type':types[extname(asset)]||'application/octet-stream','Cache-Control':'no-store'});res.end(content);
 }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Page not found');}
}).listen(Number(process.env.PORT||3000),'127.0.0.1',()=>console.log(`Kat Sneakers wireframes: http://localhost:${process.env.PORT||3000}/demo.html`));
