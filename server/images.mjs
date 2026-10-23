import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import http from 'node:http';
import https from 'node:https';
import { problem } from './store.mjs';

// Image search for the product editor. Keyless sources (Wikimedia Commons, Openverse) always run;
// a Serper (Google Images) or Brave Search key adds retail product shots, which is what most
// shoe listings need. Results are only suggestions: the owner picks one and it is copied locally.
const AGENT='KatSneakersAdmin/1.0 (product image search)';
const MAX_IMAGE=8*1024*1024;

export function imageProviders(env=process.env){
 return [env.SERPER_API_KEY&&'Google Images (Serper)',env.BRAVE_SEARCH_API_KEY&&'Brave Images','Wikimedia Commons','Openverse'].filter(Boolean);
}

const strip=value=>String(value||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim().slice(0,200);

async function serper(q,{fetchImpl,env}){
 const response=await fetchImpl('https://google.serper.dev/images',{method:'POST',headers:{'X-API-KEY':env.SERPER_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({q,gl:'za',num:30}),signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Error('Serper '+response.status);
 return ((await response.json()).images||[]).map(i=>({url:i.imageUrl,thumb:i.thumbnailUrl||i.imageUrl,title:strip(i.title),source:i.link||'',credit:i.domain||i.source||'',width:i.imageWidth,height:i.imageHeight,provider:'Google Images'}));
}
async function brave(q,{fetchImpl,env}){
 const response=await fetchImpl('https://api.search.brave.com/res/v1/images/search?'+new URLSearchParams({q,count:'30',country:'za',safesearch:'strict'}),{headers:{Accept:'application/json','X-Subscription-Token':env.BRAVE_SEARCH_API_KEY},signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Error('Brave '+response.status);
 return ((await response.json()).results||[]).map(i=>({url:i.properties?.url,thumb:i.thumbnail?.src||i.properties?.url,title:strip(i.title),source:i.url||'',credit:i.source||'',width:i.properties?.width,height:i.properties?.height,provider:'Brave'}));
}
async function wikimedia(q,{fetchImpl}){
 const params=new URLSearchParams({action:'query',generator:'search',gsrsearch:q+' filetype:bitmap',gsrnamespace:'6',gsrlimit:'24',prop:'imageinfo',iiprop:'url|mime|extmetadata',iiurlwidth:'800',format:'json',origin:'*'});
 const response=await fetchImpl('https://commons.wikimedia.org/w/api.php?'+params,{headers:{'User-Agent':AGENT},signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Error('Wikimedia '+response.status);
 const pages=Object.values((await response.json()).query?.pages||{}).sort((a,b)=>a.index-b.index);
 return pages.map(p=>{const info=p.imageinfo?.[0]||{},meta=info.extmetadata||{};
  if(!/^image\/(jpeg|png|webp)$/.test(info.mime))return null;
  return {url:info.thumburl||info.url,thumb:(info.thumburl||info.url).replace(/\/960px-/,'/330px-'),title:strip(p.title.replace(/^File:/,'').replace(/\.\w+$/,'')),source:info.descriptionurl||'',credit:strip([meta.Artist?.value,meta.LicenseShortName?.value].filter(Boolean).join(' / '))||'Wikimedia Commons',width:info.thumbwidth,height:info.thumbheight,provider:'Wikimedia Commons'};
 }).filter(Boolean);
}
async function openverse(q,{fetchImpl}){
 const response=await fetchImpl('https://api.openverse.org/v1/images/?'+new URLSearchParams({q,page_size:'20',mature:'false'}),{headers:{'User-Agent':AGENT},signal:AbortSignal.timeout(7000)});
 if(!response.ok)throw Error('Openverse '+response.status);
 return ((await response.json()).results||[]).map(i=>({url:i.url,thumb:i.thumbnail||i.url,title:strip(i.title),source:i.foreign_landing_url||'',credit:strip([i.creator,i.license&&('CC '+String(i.license).toUpperCase()+' '+(i.license_version||''))].filter(Boolean).join(' / ')),width:i.width,height:i.height,provider:'Openverse'}));
}

// Free sources match loosely (a search for "Vans Old Skool" can return a bus depot), so their
// results must name every search word. The brand may be missing only when the title says it is a shoe.
const words=value=>String(value).toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>=2);
const SHOE_WORDS=['shoe','shoes','sneaker','sneakers','trainer','trainers','footwear','kicks'];
function relevant(q,title){const want=[...new Set(words(q))],have=new Set(words(title)),missing=want.filter(w=>!have.has(w));
 return !missing.length||(missing.length===1&&missing[0]===want[0]&&SHOE_WORDS.some(w=>have.has(w)));}

export async function searchImages(query,{fetchImpl=fetch,env=process.env}={}){
 const q=String(query||'').replace(/\s+/g,' ').trim();
 if(q.length<2||q.length>120)problem(400,'Type the shoe name to search for photos, e.g. Nike Air Force 1 White.');
 const sources=[env.SERPER_API_KEY&&serper,env.BRAVE_SEARCH_API_KEY&&brave,wikimedia,openverse].filter(Boolean);
 const settled=await Promise.allSettled(sources.map(search=>search(q,{fetchImpl,env})));
 const seen=new Set(),results=[];
 collect: for(const outcome of settled)if(outcome.status==='fulfilled')for(const r of outcome.value){
  if(!r?.url||!/^https?:\/\//i.test(r.url)||seen.has(r.url))continue;
  if(['Wikimedia Commons','Openverse'].includes(r.provider)&&!relevant(q,r.title))continue;seen.add(r.url);results.push(r);if(results.length>=36)break collect;
 }
 const failed=settled.filter(s=>s.status==='rejected').length;
 if(!results.length&&failed===settled.length)problem(502,'Image search is unavailable right now. Check the internet connection, or upload a photo instead.');
 return {query:q,results,providers:imageProviders(env)};
}

// ---- Copying a chosen image into the store ----
export function sniff(buffer){
 if(buffer.length>3&&buffer[0]===0xff&&buffer[1]===0xd8&&buffer[2]===0xff)return {type:'image/jpeg',ext:'jpg'};
 if(buffer.length>8&&buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {type:'image/png',ext:'png'};
 if(buffer.length>12&&buffer.subarray(0,4).toString()==='RIFF'&&buffer.subarray(8,12).toString()==='WEBP')return {type:'image/webp',ext:'webp'};
 return null;
}
function privateV4(address){const [a,b]=address.split('.').map(Number);
 return a===0||a===10||a===127||a>=224||(a===100&&b>=64&&b<=127)||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&b===168)||(a===192&&b===0)||(a===198&&(b===18||b===19));}
// Expands an IPv6 address (including a trailing dotted IPv4 part) to eight 16-bit groups.
function groups6(address){
 let text=address.toLowerCase().split('%')[0];const dotted=text.match(/(\d+\.\d+\.\d+\.\d+)$/);
 if(dotted){const [a,b,c,d]=dotted[1].split('.').map(Number);text=text.slice(0,-dotted[1].length)+((a<<8)|b).toString(16)+':'+((c<<8)|d).toString(16);}
 const [head,tail]=text.split('::'),left=head?head.split(':'):[],right=tail?tail.split(':'):[];
 const middle=tail===undefined?[]:Array(8-left.length-right.length).fill('0');
 return [...left,...middle,...right].map(g=>parseInt(g||'0',16));
}
// Anything that is not a public unicast address is refused. IPv6 is an allow-list (2000::/3) so
// IPv4-mapped, NAT64, 6to4 and other embedded forms cannot smuggle a private IPv4 through.
export function isPrivateAddress(address){
 if(isIP(address)===4)return privateV4(address);
 if(isIP(address)!==6)return true;
 const g=groups6(address);
 if(g.slice(0,5).every(x=>x===0)&&(g[5]===0xffff||g[5]===0))return g[5]===0&&g[6]===0&&g[7]<=1?true:privateV4([g[6]>>8,g[6]&255,g[7]>>8,g[7]&255].join('.'));
 if((g[0]&0xe000)!==0x2000)return true;
 return g[0]===0x2002||(g[0]===0x2001&&(g[1]===0x0db8||g[1]<0x0200));
}
// Default downloader: the address is checked inside the socket's own DNS lookup, so the vetted
// address is the one actually connected to (no DNS-rebinding gap between check and connect).
function guardedLookup(host,options,callback){
 lookup(host,{all:true}).then(found=>{
  if(!found.length||found.some(a=>isPrivateAddress(a.address))){const error=Error('That image link points to a private network and cannot be used.');error.status=400;return callback(error);}
  if(options?.all)callback(null,found);else callback(null,found[0].address,found[0].family);
 },()=>{const error=Error('That image website could not be found.');error.status=400;callback(error);});
}
export function guardedFetch(url,{headers={},signal}={}){
 return new Promise((resolve,reject)=>{
  const target=new URL(url),client=target.protocol==='https:'?https:http;
  const request=client.get(target,{headers,signal,lookup:guardedLookup,agent:false},response=>resolve({status:response.statusCode,ok:response.statusCode>=200&&response.statusCode<300,headers:{get:name=>{const v=response.headers[name.toLowerCase()];return Array.isArray(v)?v[0]:v??null;}},body:response}));
  request.on('error',reject);
 });
}
async function assertPublicUrl(raw,resolveHost){
 let url;try{url=new URL(raw);}catch{problem(400,'That is not a valid image link.');}
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password||(url.port&&!['80','443'].includes(url.port)))problem(400,'Use a normal http(s) image link.');
 const host=url.hostname.replace(/^\[|\]$/g,'');
 const addresses=isIP(host)?[{address:host}]:await resolveHost(host,{all:true}).catch(()=>problem(400,'That image website could not be found.'));
 if(!addresses.length||addresses.some(a=>isPrivateAddress(a.address)))problem(400,'That image link points to a private network and cannot be used.');
 return url;
}
export async function downloadImage(raw,{fetchImpl=guardedFetch,resolveHost=lookup}={}){
 let url=await assertPublicUrl(raw,resolveHost),response;
 for(let hop=0;;hop++){
  try{response=await fetchImpl(url,{redirect:'manual',headers:{'User-Agent':AGENT,Accept:'image/avif,image/webp,image/png,image/jpeg,*/*;q=0.5'},signal:AbortSignal.timeout(15000)});}
  catch(error){if(error.status)throw error;problem(502,'Could not download that image. Try another photo or upload one.');}
  if(response.status<300||response.status>=400)break;
  if(hop>=4||!response.headers.get('location'))problem(502,'That image link redirects too many times.');
  url=await assertPublicUrl(new URL(response.headers.get('location'),url).href,resolveHost);
 }
 if(!response.ok)problem(502,`The image website refused the download (${response.status}). Try another photo or upload one.`);
 if(Number(response.headers.get('content-length'))>MAX_IMAGE)problem(413,'That image is larger than 8 MB.');
 const chunks=[];let size=0;
 for await(const chunk of response.body){size+=chunk.length;if(size>MAX_IMAGE)problem(413,'That image is larger than 8 MB.');chunks.push(chunk);}
 const buffer=Buffer.concat(chunks),kind=sniff(buffer);
 if(!kind)problem(415,'That link is not a JPG, PNG or WebP photo. Try another result or upload one.');
 return {buffer,...kind};
}
export function decodeUpload(body){
 if(typeof body.base64!=='string'||body.base64.length>11500000||!/^[A-Za-z0-9+/]*={0,2}$/.test(body.base64))problem(400,'Invalid image file.');
 const buffer=Buffer.from(body.base64,'base64');if(!buffer.length||buffer.length>MAX_IMAGE)problem(413,'Photos must be 8 MB or smaller.');
 const kind=sniff(buffer);if(!kind)problem(415,'Choose a JPG, PNG or WebP photo.');
 return {buffer,...kind};
}
