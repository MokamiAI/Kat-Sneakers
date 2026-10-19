/* Presentation mock data. No API calls, authentication, payments or messages. */
const Store=(()=>{
 const labels={awaiting_payment:'Awaiting payment',proof_uploaded:'Proof to check',proof_rejected:'Proof rejected',paid:'Paid, to pack',packed:'Packed',shipped:'Shipped',delivered:'Delivered',cancelled:'Cancelled'};
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=cents=>'R'+(cents/100).toLocaleString('en-ZA',{minimumFractionDigits:2,maximumFractionDigits:2});
 const memory={};
 function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')??memory[key]??fallback;}catch{return memory[key]??fallback;}}
 function write(key,value){memory[key]=value;try{localStorage.setItem(key,JSON.stringify(value));}catch{}}
 const defaultUser={id:'pitch-customer',name:'Ayanda Mokoena',email:'ayanda@example.com',role:'customer'};
 const uid=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
 const now=()=>new Date().toISOString();
 const event=(o,text)=>o.events.push({at:now(),text});
 function seed(){
  const statuses=['proof_uploaded','paid','packed','shipped','awaiting_payment','delivered'];
  const names=['Ayanda Mokoena','Lerato Molefe','Thabo Dlamini','Naledi Nkosi','Sipho Ndlovu','Zanele Khumalo'];
  return statuses.map((status,i)=>{
   const p=inventory[[1,4,2,0,7,3][i]],created=new Date(Date.now()-(i+1)*86400000).toISOString();
   const item={id:p.id,name:p.brand+' '+p.name,size:p.sizes[0],qty:1,price:p.price*100,image:p.image};
   const o={id:'KAT-DEMO'+String(i+1).padStart(3,'0'),customer:{name:names[i],email:i===0?defaultUser.email:'customer'+i+'@example.com',phone:'082 000 0000',address:'12 Example Street',city:'Johannesburg',province:'Gauteng',postcode:'2001'},items:[item],delivery:7900,total:item.price+7900,status,created,source:'Online store',proofs:[],messages:[],events:[{at:created,text:'Order placed. Awaiting EFT payment.'}]};
   if(status!=='awaiting_payment'){o.proofs.push({id:'sample-'+i,name:'sample-payment-proof.pdf',at:created});o.events.push({at:created,text:'Payment proof received.'});}
   if(['paid','packed','shipped','delivered'].includes(status))o.amountPaid=o.total;
   if(['shipped','delivered'].includes(status)){o.courier='The Courier Guy (sample)';o.tracking='DEMO-'+(82001+i);o.messages.push({at:created,text:`Hi ${o.customer.name}, order ${o.id} is on the way! Courier: ${o.courier}. Tracking: ${o.tracking}.`,status:'Sent (simulated)'});}
   if(status!=='awaiting_payment')o.events.push({at:created,text:labels[status]});return o;
  });
 }
 function rows(){let orders=read('kat-pitch-orders',null);if(!Array.isArray(orders)){orders=seed();write('kat-pitch-orders',orders);}return orders;}
 function update(id,fn){const orders=rows(),o=orders.find(o=>o.id===id);if(!o)throw Error('Choose one of the sample orders.');fn(o);write('kat-pitch-orders',orders);return o;}
 async function request(path,data={}){
  if(path==='/login'||path==='/signup'){const user={...defaultUser,name:data.name||defaultUser.name,email:data.email||defaultUser.email,role:data.role||'customer'};write('kat-pitch-user',user);return {user};}
  if(path==='/me')return {user:read('kat-pitch-user',defaultUser)};
  if(path==='/logout'){write('kat-pitch-user',defaultUser);return {ok:true};}
  return {ok:true};
 }
 function sampleProof(){
  const content='BT /F1 16 Tf 40 150 Td (Kat Sneakers - SAMPLE EFT PROOF) Tj 0 -30 Td (Presentation only. No payment was made.) Tj ET';
  const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 440 220] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${content.length} >>\nstream\n${content}\nendstream`];
  let pdf='%PDF-1.4\n',offsets=[0];objects.forEach((o,i)=>{offsets.push(pdf.length);pdf+=`${i+1} 0 obj\n${o}\nendobj\n`;});const xref=pdf.length;pdf+='xref\n0 6\n0000000000 65535 f \n'+offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;return new File([pdf],'sample-payment-proof.pdf',{type:'application/pdf'});
 }
 return {labels,escape,money,request,me:()=>request('/me'),logout:()=>request('/logout'),orders:async()=>rows(),
  create:async(customer,lines,delivery=7900,source='Online store')=>{
   if(!lines?.length)lines=[{id:2,size:4,qty:1}];
   const items=lines.map(line=>{const p=inventory.find(p=>p.id===Number(line.id))||inventory[1];return {id:p.id,name:p.brand+' '+p.name,size:line.size||p.sizes[0],qty:Number(line.qty)||1,price:p.price*100,image:p.image};});
   const o={id:'KAT-'+uid().toUpperCase(),customer:{name:defaultUser.name,email:defaultUser.email,phone:'082 000 0000',address:'12 Example Street',city:'Johannesburg',province:'Gauteng',postcode:'2001',...Object.fromEntries(Object.entries(customer||{}).filter(([,v])=>v))},items,delivery,total:items.reduce((sum,p)=>sum+p.price*p.qty,0)+delivery,status:'awaiting_payment',created:now(),source,proofs:[],events:[],messages:[]};event(o,'Order placed. Awaiting EFT payment.');const orders=rows();orders.unshift(o);write('kat-pitch-orders',orders);write('kat-pitch-latest',o.id);return o;
  },
  transition:async(id,next,details={})=>update(id,o=>{
   o.status=next;if(next==='paid')o.amountPaid=o.total;if(next==='proof_rejected')o.rejection=details.reason||'Please upload a clearer payment proof.';
   if(next==='shipped'){o.courier=details.courier||'The Courier Guy (sample)';o.tracking=details.tracking||'DEMO-82001';}
   event(o,labels[next]||next);const message=details.message||(next==='shipped'?`Hi ${o.customer.name}, your order ${o.id} is on the way. ${o.courier}. Tracking: ${o.tracking}.`:`Hi ${o.customer.name}, order ${o.id}: ${labels[next]}.`);o.messages.push({at:now(),text:message,status:'Sent (simulated)'});
  }),
  proof:async(id,file)=>update(id,o=>{o.proofs.push({id:'sample-'+uid(),name:file?.name||'sample-payment-proof.pdf',at:now()});o.status='proof_uploaded';event(o,'Payment proof uploaded. Awaiting review.');}),
  file:async()=>sampleProof(),
  reset:()=>{write('kat-pitch-orders',seed());write('kat-pitch-user',defaultUser);write('kat-pitch-latest',null);try{localStorage.removeItem('crease-bag');}catch{}}
 };
})();
