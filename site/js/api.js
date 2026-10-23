/* Browser client for the Kat Sneakers server (server.mjs). */
const Store=(()=>{
 const labels={awaiting_payment:'Awaiting payment',proof_uploaded:'Proof to check',proof_rejected:'Proof rejected',paid:'Paid, to pack',packed:'Packed',shipped:'Shipped',delivered:'Delivered',cancelled:'Cancelled'};
 // Soweto orders are delivered by the store; everyone else collects from PAXI.
 const label=o=>o.status==='shipped'?(o.customer?.method==='soweto'?'Out for delivery':'On its way with PAXI'):o.status==='delivered'&&o.customer?.method==='paxi'?'Collected from PAXI':labels[o.status];
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=cents=>{const whole=Math.floor(Math.abs(cents)/100),rest=Math.abs(cents)%100;return (cents<0?'-':'')+'R'+String(whole).replace(/\B(?=(\d{3})+(?!\d))/g,' ')+'.'+String(rest).padStart(2,'0');};
 const image=path=>/^(images\/|https?:)/.test(path||'')?path:'images/sneakers/'+path;
 async function request(path,data){let response;try{response=await fetch('/api'+path,{method:data===undefined?'GET':'POST',credentials:'same-origin',headers:data===undefined?{}:{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data)});}catch{throw Error('Cannot reach the store server. Check your connection and try again.');}let result;try{result=await response.json();}catch{throw Error('The store server is not running. Start it with npm start and open http://localhost:3000.');}if(!response.ok){const error=Error(result.error||'Request failed.');error.status=response.status;throw error;}return result;}
 const readFile=file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=()=>reject(Error('Could not read the file.'));reader.readAsDataURL(file);});
 return {labels,label,escape,money,image,request,me:()=>request('/me'),logout:()=>request('/logout',{}),orders:async()=>(await request('/orders')).orders,
  info:()=>request('/store'),
  products:async()=>(await request('/products')).products,
  create:async(customer,items,source)=>{
   const signature=JSON.stringify({customer,items,source});let pending;try{pending=JSON.parse(sessionStorage.getItem('kat-checkout-request'));}catch{}
   if(!pending||pending.signature!==signature){pending={signature,id:crypto.randomUUID()};try{sessionStorage.setItem('kat-checkout-request',JSON.stringify(pending));}catch{}}
   const result=await request('/orders',{customer,items,source,requestId:pending.id});try{sessionStorage.removeItem('kat-checkout-request');}catch{}return result.order;
  },
  transition:async(id,next,details)=>(await request('/orders/'+encodeURIComponent(id)+'/transition',{next,details})).order,
  proof:async(id,file)=>{if(!file||!['application/pdf','image/png','image/jpeg'].includes(file.type)||file.size>2097152)throw Error('Choose a JPG, PNG or PDF of 2 MB or less.');return (await request('/orders/'+encodeURIComponent(id)+'/proof',{name:file.name,type:file.type,base64:await readFile(file)})).order;},
  file:async id=>{const response=await fetch('/api/proofs/'+encodeURIComponent(id),{credentials:'same-origin'});if(!response.ok)throw Error('You cannot access this payment proof.');const blob=await response.blob();return new File([blob],blob.type==='application/pdf'?'payment-proof.pdf':'payment-proof.jpg',{type:blob.type});},
  admin:{
   products:async()=>(await request('/admin/products')).products,
   save:async product=>(await request('/admin/products'+(product.id?'/'+product.id:''),product)).product,
   availability:async(id,status)=>(await request('/admin/products/'+id+'/availability',{status})).product,
   remove:id=>request('/admin/products/'+id+'/delete',{}),
   searchImages:q=>request('/admin/images/search?q='+encodeURIComponent(q)),
   importImage:async url=>(await request('/admin/images/import',{url})).image,
   uploadImage:async file=>{if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024)throw Error('Choose a JPG, PNG or WebP photo of 8 MB or less.');return (await request('/admin/images/upload',{name:file.name,type:file.type,base64:await readFile(file)})).image;},
   settings:()=>request('/admin/settings'),
   saveSettings:async settings=>(await request('/admin/settings',settings)).settings
  }
 };
})();
