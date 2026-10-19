const $ = selector => document.querySelector(selector);
const money = value => 'R' + value.toLocaleString('en-ZA').replace(/[,\u00a0\u202f]/g,' ');
const photo = product => `public/images/sneakers/${product.image}`;
let category=document.body.dataset.initialCategory || 'All', brand='', selectedSize=null, activeProduct=null, toastTimer;
let bag=[];
try { const saved=JSON.parse(localStorage.getItem('crease-bag')||'[]'); if(Array.isArray(saved)) bag=saved.filter(line=>inventory.some(p=>p.id===line.id&&p.sizes.includes(line.size))&&Number.isInteger(line.qty)&&line.qty>0); } catch {}
function render(){
  const query=$('#search').value.trim().toLowerCase();
  let products=inventory.filter(p=>(category==='All'||(category==='Sale'?p.was:p.categories.includes(category)))&&(!brand||p.brand===brand)&&p.price<Number($('#budget').value)&&`${p.brand} ${p.name} ${p.colour}`.toLowerCase().includes(query));
  if($('#sort').value!=='featured') products.sort((a,b)=>$('#sort').value==='low'?a.price-b.price:b.price-a.price);
  $('#products').innerHTML=products.map(p=>`<article><button class="product-photo" data-product="${p.id}" aria-label="View ${p.brand} ${p.name}"><img src="${photo(p)}" alt="${p.brand} ${p.name} in ${p.colour}" loading="lazy">${p.was?`<span class="product-tag discount">SAVE ${money(p.was-p.price)}</span>`:p.tag?`<span class="product-tag">${p.tag}</span>`:''}</button><p class="product-brand">${p.brand.toUpperCase()}</p><button class="product-name" data-product="${p.id}">${p.name}</button><p class="product-meta">${p.colour} · ${p.categories[0]==='Kids'?'Kids':'Adults'}</p><span class="price">${money(p.price)}</span>${p.was?`<span class="was">${money(p.was)}</span>`:''}</article>`).join('');
  $('#result-count').textContent=`${products.length} pairs${brand?' · '+brand:''}`;
  $('#empty').hidden=products.length>0;
  document.querySelectorAll('.tabs button').forEach(b=>{const active=b.dataset.category===category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
}
function filterCategory(value){category=value;brand='';render();}
document.querySelectorAll('button[data-category]').forEach(el=>el.addEventListener('click',()=>filterCategory(el.dataset.category)));
['search','budget','sort'].forEach(id=>$('#'+id).addEventListener(id==='search'?'input':'change',render));
$('#brand-list').innerHTML=['Nike','adidas','Puma','Converse','New Balance','Vans'].map(name=>`<button data-brand="${name}">${name}</button>`).join('');
$('#brand-list').addEventListener('click',e=>{const button=e.target.closest('[data-brand]');if(!button)return;brand=button.dataset.brand;category='All';$('#search').value='';$('#budget').value='99999';render();$('#shop').scrollIntoView();});
$('#under-1000').addEventListener('click',()=>{category='All';brand='';$('#search').value='';$('#budget').value='1000';render();$('#shop').scrollIntoView();});
$('#all-brands').addEventListener('click',()=>{category='All';brand='';$('#search').value='';$('#budget').value='99999';render();$('#shop').scrollIntoView();});
async function openProduct(id){
  activeProduct=inventory.find(p=>p.id===Number(id));if(!activeProduct)return;selectedSize=null;const p=activeProduct;
  const stock=null;
  if(activeProduct!==p)return;
  const soldOut=size=>stock&&stock.find(v=>v.product===p.id&&v.size===String(size))?.available===0;
  $('#product-detail').innerHTML=`<div class="detail-grid"><img src="${photo(p)}" alt="${p.brand} ${p.name}"><div><p class="product-brand">${p.brand.toUpperCase()}</p><h2 id="product-title">${p.name}</h2><span class="price">${money(p.price)}</span>${p.was?` <span class="was">${money(p.was)}</span><p class="sale">On sale / Save ${money(p.was-p.price)}</p>`:''}<p>${p.colour}<br>Sample catalogue / choose any available UK size.</p><strong>Select your UK size</strong><div class="sizes" role="group" aria-label="UK size">${p.sizes.map(size=>`<button data-size="${size}" aria-pressed="false" ${soldOut(size)?'disabled title="Out of stock"':''}>${size}</button>`).join('')}</div><button class="button" id="add-to-bag" disabled>Choose a size</button><p>Pay by manual EFT when the store launches. Delivery options and totals will be confirmed at checkout.</p></div></div>`;
  if(!$('#product-dialog').open)$('#product-dialog').showModal();
}
$('#products').addEventListener('click',e=>{const button=e.target.closest('[data-product]');if(button)openProduct(button.dataset.product);});
$('#product-detail').addEventListener('click',e=>{const sizeButton=e.target.closest('[data-size]');if(sizeButton){selectedSize=activeProduct.sizes.find(size=>String(size)===sizeButton.dataset.size);document.querySelectorAll('[data-size]').forEach(b=>{b.classList.toggle('selected',b===sizeButton);b.setAttribute('aria-pressed',String(b===sizeButton));});$('#add-to-bag').disabled=false;$('#add-to-bag').textContent='Add to bag ↗';}
  if(e.target.closest('#add-to-bag')&&selectedSize!==null){const existing=bag.find(line=>line.id===activeProduct.id&&line.size===selectedSize);if(existing)existing.qty++;else bag.push({id:activeProduct.id,size:selectedSize,qty:1});saveBag();$('#product-dialog').close();toast('Added to your bag');}
});
function saveBag(){try{localStorage.setItem('crease-bag',JSON.stringify(bag));}catch{}$('#bag-count').textContent=bag.reduce((sum,line)=>sum+line.qty,0);}
function renderBag(){
  $('#bag-items').innerHTML=bag.length?bag.map((line,index)=>{const p=inventory.find(p=>p.id===line.id);return `<article class="bag-line"><img src="${photo(p)}" alt="${p.name}"><div><h3>${p.brand} ${p.name}</h3><p>UK ${line.size} · Quantity ${line.qty}</p><p>${money(p.price*line.qty)}</p><button class="remove" data-remove="${index}">Remove</button></div></article>`;}).join(''):'<p>Your next favourite pair is waiting.</p><button class="button" id="continue-shopping">Explore the collection ↗</button>';
  const total=bag.reduce((sum,line)=>sum+inventory.find(p=>p.id===line.id).price*line.qty,0);
  $('#bag-summary').innerHTML=bag.length?`<div class="bag-total"><span>Subtotal</span><span>${money(total)}</span></div><a class="button" href="checkout.html">Continue to checkout &#8599;</a><p class="fine-print">Try the sample checkout and EFT payment journey.</p>`:'';
}
$('#open-bag').addEventListener('click',()=>{renderBag();$('#bag-dialog').showModal();});
$('#bag-items').addEventListener('click',e=>{const remove=e.target.closest('[data-remove]');if(remove){bag.splice(Number(remove.dataset.remove),1);saveBag();renderBag();}if(e.target.closest('#continue-shopping')){$('#bag-dialog').close();$('#shop').scrollIntoView();}});
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();}}));
function info(content){$('#info-content').innerHTML=content;$('#info-dialog').showModal();}
function sizeGuide(){info('<p class="eyebrow">FIND YOUR FIT</p><h2 id="info-title">UK size guide</h2><p>Indicative adult conversions. Sizing varies by brand; check the manufacturer’s chart before purchasing. Kids sizes use a separate scale.</p><table><thead><tr><th>UK</th><th>EU (approx.)</th><th>Foot length</th></tr></thead><tbody>'+[[3,36,'22 cm'],[4,37,'23 cm'],[5,38,'24 cm'],[6,39.5,'25 cm'],[7,41,'26 cm'],[8,42,'27 cm'],[9,43,'28 cm'],[10,44.5,'29 cm']].map(row=>'<tr>'+row.map(value=>`<td>${value}</td>`).join('')+'</tr>').join('')+'</tbody></table><p class="fine-print">Measure both feet while standing and use the longer measurement. These conversions are examples, not a brand-specific fit guarantee.</p>');}
$('#size-guide').addEventListener('click',sizeGuide);$('#footer-size-guide').addEventListener('click',sizeGuide);
$('#delivery-info').addEventListener('click',()=>info('<p class="eyebrow">GOOD TO KNOW</p><h2 id="info-title">Delivery & payment</h2><p>The planned store will deliver across South Africa. Courier rates, timelines and exchange terms still need to be confirmed.</p><p>Version 1 uses manual EFT. After placing an order, customers will receive bank details and upload proof of payment. Staff will confirm cleared funds before fulfilment.</p><p>This HTML prototype does not place orders, collect payments or accept payment documents.</p>'));
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2600);}
$('#year').textContent=new Date().getFullYear();saveBag();render();

const brandDescriptions = {
  Nike: 'Court-inspired low-tops, bold high-tops and running-inspired silhouettes.',
  adidas: 'Three-stripe classics, clean low-tops and retro court style.',
  Puma: 'Suede favourites and sporty everyday court silhouettes.',
  Converse: 'Familiar canvas high-tops and colour-filled everyday classics.',
  'New Balance': 'Retro running shapes and understated everyday colourways.',
  Vans: 'Skate-inspired high-tops and the unmistakable checkerboard pattern.'
};
$('#brand-stories').innerHTML=Object.entries(brandDescriptions).map(([name,description])=>`<article><h3>${name}</h3><p>${description}</p><p class="fine-print">${inventory.filter(p=>p.brand===name).length} sample styles</p></article>`).join('');
document.querySelectorAll('[data-editorial-brand]').forEach(button=>button.addEventListener('click',()=>{
  brand=button.dataset.editorialBrand;$('#search').value='';$('#budget').value='99999';render();$('#shop').scrollIntoView();
}));
// Brand tiles navigate into the catalogue when opened in a new tab or shared.
const initialBrand=new URLSearchParams(location.search).get('brand');
if(initialBrand && inventory.some(p=>p.brand===initialBrand)){brand=initialBrand;render();}

// A sale spotlight links to a shareable product inside the sale collection.
const spotlightId=Number(new URLSearchParams(location.search).get('product'));
if(spotlightId && inventory.some(p=>p.id===spotlightId&&p.was>p.price)){
  category='Sale';brand='';$('#budget').value='99999';render();openProduct(spotlightId);
}
