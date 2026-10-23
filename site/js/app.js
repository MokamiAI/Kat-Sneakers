const $ = selector => document.querySelector(selector);
const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => { const [whole,part]=Number(value).toFixed(2).split('.'); return 'R'+whole.replace(/\B(?=(\d{3})+(?!\d))/g,' ')+(part==='00'?'':'.'+part); };
const photo = product => /^(images\/|https?:)/.test(product.image)?product.image:`images/sneakers/${product.image}`;
const available = (p,size) => p.soldOut?0:(p.stock?.[size]??0);
let category=document.body.dataset.initialCategory || 'All', brand='', selectedSize=null, activeProduct=null, toastTimer;
let bag=[];

// The live catalogue comes from the store server. Without it (static preview), the built-in
// catalogue is shown as in stock.
const catalogueReady=(async()=>{
  let products=null;
  try{const response=await fetch('/api/products',{credentials:'same-origin'});if(response.ok)products=(await response.json()).products;}catch{}
  if(!Array.isArray(products))products=inventory.map(p=>({...p,image:photo(p),sizes:p.sizes.map(String),stock:Object.fromEntries(p.sizes.map(s=>[String(s),10])),soldOut:false,description:''}));
  inventory.splice(0,inventory.length,...products);
})();

function loadBag(){
  try { const saved=JSON.parse(localStorage.getItem('crease-bag')||'[]'); if(Array.isArray(saved)) bag=saved.map(line=>({...line,size:String(line.size)})).filter(line=>inventory.some(p=>p.id===line.id&&p.sizes.includes(line.size))&&Number.isInteger(line.qty)&&line.qty>0); } catch {}
}
function render(){
  const query=$('#search').value.trim().toLowerCase();
  let products=inventory.filter(p=>(category==='All'||(category==='Sale'?p.was:p.categories.includes(category)))&&(!brand||p.brand===brand)&&p.price<Number($('#budget').value)&&`${p.brand} ${p.name} ${p.colour}`.toLowerCase().includes(query));
  if($('#sort').value!=='featured') products.sort((a,b)=>$('#sort').value==='low'?a.price-b.price:b.price-a.price);
  products.sort((a,b)=>a.soldOut-b.soldOut);
  $('#products').innerHTML=products.map(p=>`<article class="${p.soldOut?'is-sold-out':''}"><button class="product-photo" data-product="${p.id}" aria-label="View ${esc(p.brand+' '+p.name)}${p.soldOut?', out of stock':''}"><img src="${esc(photo(p))}" alt="${esc(`${p.brand} ${p.name}${p.colour?' in '+p.colour:''}`)}" loading="lazy">${p.soldOut?'<span class="product-tag sold-out">OUT OF STOCK</span>':p.was?`<span class="product-tag discount">SAVE ${money(p.was-p.price)}</span>`:p.tag?`<span class="product-tag">${esc(p.tag)}</span>`:''}</button><p class="product-brand">${esc(p.brand.toUpperCase())}</p><button class="product-name" data-product="${p.id}">${esc(p.name)}</button><p class="product-meta">${esc(p.colour)}${p.colour?' · ':''}${p.categories[0]==='Kids'?'Kids':'Adults'}</p><span class="price">${money(p.price)}</span>${p.was?`<span class="was">${money(p.was)}</span>`:''}${p.soldOut?'<p class="stock-note">Out of stock</p>':''}</article>`).join('');
  $('#result-count').textContent=`${products.length} pair${products.length===1?'':'s'}${brand?' · '+brand:''}`;
  $('#empty').hidden=products.length>0;
  document.querySelectorAll('.tabs button').forEach(b=>{const active=b.dataset.category===category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
}
function filterCategory(value){category=value;brand='';render();}
document.querySelectorAll('button[data-category]').forEach(el=>el.addEventListener('click',()=>filterCategory(el.dataset.category)));
['search','budget','sort'].forEach(id=>$('#'+id).addEventListener(id==='search'?'input':'change',render));
$('#brand-list').addEventListener('click',e=>{const button=e.target.closest('[data-brand]');if(!button)return;brand=button.dataset.brand;category='All';$('#search').value='';$('#budget').value='99999';render();$('#shop').scrollIntoView();});
$('#under-1000').addEventListener('click',()=>{category='All';brand='';$('#search').value='';$('#budget').value='1000';render();$('#shop').scrollIntoView();});
$('#all-brands').addEventListener('click',()=>{category='All';brand='';$('#search').value='';$('#budget').value='99999';render();$('#shop').scrollIntoView();});
function openProduct(id){
  activeProduct=inventory.find(p=>p.id===Number(id));if(!activeProduct)return;selectedSize=null;const p=activeProduct;
  $('#product-detail').innerHTML=`<div class="detail-grid"><img src="${esc(photo(p))}" alt="${esc(p.brand+' '+p.name)}" class="${p.soldOut?'is-sold-out':''}"><div><p class="product-brand">${esc(p.brand.toUpperCase())}</p><h2 id="product-title">${esc(p.name)}</h2><span class="price">${money(p.price)}</span>${p.was?` <span class="was">${money(p.was)}</span>${p.soldOut?'':`<p class="sale">On sale / Save ${money(p.was-p.price)}</p>`}`:''}<p>${esc(p.colour)}${p.description?'<br>'+esc(p.description):''}</p>${p.soldOut?`<p class="sold-out-banner" role="status"><strong>Out of stock.</strong> This pair is sold out for now. Check back soon or explore similar pairs.</p><button class="button" disabled>Out of stock</button>`:`<strong>Select your UK size</strong><div class="sizes" role="group" aria-label="UK size">${p.sizes.map(size=>{const left=available(p,size);return `<button data-size="${esc(size)}" aria-pressed="false" ${left?'':'disabled title="Out of stock" aria-label="UK '+esc(size)+', out of stock"'}>${esc(size)}</button>`;}).join('')}</div><p class="stock-note" id="size-stock" aria-live="polite"></p><button class="button" id="add-to-bag" disabled>Choose a size</button>`}<p>Pay by EFT. We deliver to your door in Soweto, or send your order with PAXI to a PAXI Point near you anywhere in South Africa.</p></div></div>`;
  if(!$('#product-dialog').open)$('#product-dialog').showModal();
}
$('#products').addEventListener('click',e=>{const button=e.target.closest('[data-product]');if(button)openProduct(button.dataset.product);});
$('#product-detail').addEventListener('click',e=>{
  const sizeButton=e.target.closest('[data-size]');
  if(sizeButton&&!sizeButton.disabled){selectedSize=sizeButton.dataset.size;document.querySelectorAll('[data-size]').forEach(b=>{b.classList.toggle('selected',b===sizeButton);b.setAttribute('aria-pressed',String(b===sizeButton));});const left=available(activeProduct,selectedSize);$('#size-stock').textContent=left<=3?`Only ${left} left in UK ${selectedSize}.`:'';$('#add-to-bag').disabled=false;$('#add-to-bag').textContent='Add to bag ↗';}
  if(e.target.closest('#add-to-bag')&&selectedSize!==null){
    const existing=bag.find(line=>line.id===activeProduct.id&&line.size===selectedSize),left=available(activeProduct,selectedSize);
    if((existing?.qty||0)>=left){toast(`Sorry, there are no more pairs in UK ${selectedSize}.`);return;}
    if(existing)existing.qty++;else bag.push({id:activeProduct.id,size:selectedSize,qty:1});saveBag();$('#product-dialog').close();toast('Added to your bag');
  }
});
function saveBag(){try{localStorage.setItem('crease-bag',JSON.stringify(bag));}catch{}$('#bag-count').textContent=bag.reduce((sum,line)=>sum+line.qty,0);}
function renderBag(){
  const problems=bag.filter(line=>{const p=inventory.find(p=>p.id===line.id);return available(p,line.size)<line.qty;}).length;
  $('#bag-items').innerHTML=bag.length?bag.map((line,index)=>{const p=inventory.find(p=>p.id===line.id),left=available(p,line.size);return `<article class="bag-line"><img src="${esc(photo(p))}" alt="${esc(p.name)}"><div><h3>${esc(p.brand+' '+p.name)}</h3><p>UK ${esc(line.size)} · Quantity ${line.qty}</p><p>${money(p.price*line.qty)}</p>${left<line.qty?`<p class="stock-note">${left?`Only ${left} left in this size. Remove it and add again.`:'Out of stock. Remove it to check out.'}</p>`:''}<button class="remove" data-remove="${index}">Remove</button></div></article>`;}).join(''):'<p>Your next favourite pair is waiting.</p><button class="button" id="continue-shopping">Explore the collection ↗</button>';
  const total=bag.reduce((sum,line)=>sum+inventory.find(p=>p.id===line.id).price*line.qty,0);
  $('#bag-summary').innerHTML=bag.length?`<div class="bag-total"><span>Subtotal</span><span>${money(total)}</span></div>${problems?'<p class="stock-note">Some pairs in your bag are out of stock. Remove them to continue.</p><button class="button" disabled>Continue to checkout</button>':'<a class="button" href="checkout.html">Continue to checkout &#8599;</a>'}<p class="fine-print">Delivery is added at checkout: Soweto door delivery or PAXI.</p>`:'';
}
$('#open-bag').addEventListener('click',()=>{renderBag();$('#bag-dialog').showModal();});
$('#bag-items').addEventListener('click',e=>{const remove=e.target.closest('[data-remove]');if(remove){bag.splice(Number(remove.dataset.remove),1);saveBag();renderBag();}if(e.target.closest('#continue-shopping')){$('#bag-dialog').close();$('#shop').scrollIntoView();}});
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();}}));
function info(content){$('#info-content').innerHTML=content;$('#info-dialog').showModal();}
function sizeGuide(){info('<p class="eyebrow">FIND YOUR FIT</p><h2 id="info-title">UK size guide</h2><p>Indicative adult conversions. Sizing varies by brand; check the manufacturer’s chart before purchasing. Kids sizes use a separate scale.</p><table><thead><tr><th>UK</th><th>EU (approx.)</th><th>Foot length</th></tr></thead><tbody>'+[[3,36,'22 cm'],[4,37,'23 cm'],[5,38,'24 cm'],[6,39.5,'25 cm'],[7,41,'26 cm'],[8,42,'27 cm'],[9,43,'28 cm'],[10,44.5,'29 cm']].map(row=>'<tr>'+row.map(value=>`<td>${value}</td>`).join('')+'</tr>').join('')+'</tbody></table><p class="fine-print">Measure both feet while standing and use the longer measurement. These conversions are examples, not a brand-specific fit guarantee.</p>');}
$('#size-guide').addEventListener('click',sizeGuide);$('#footer-size-guide').addEventListener('click',sizeGuide);
$('#delivery-info').addEventListener('click',()=>info('<p class="eyebrow">GOOD TO KNOW</p><h2 id="info-title">Delivery & payment</h2><h3>Living in Soweto?</h3><p>We deliver your order to your door ourselves. Choose <strong>Soweto delivery</strong> at checkout and enter your street address and area.</p><h3>Everywhere else in South Africa</h3><p>We send your order with <strong>PAXI</strong>, PEP’s parcel service. At checkout, enter the PAXI Point where you want to collect (the code, store name or suburb). PAXI sends you an SMS with a collection PIN when your parcel arrives. Bring your ID and the PIN to collect.</p><h3>Payment</h3><p>Pay by EFT. After you place your order you will see our bank details and your order reference. Upload your proof of payment, and we send your pair once the money reflects in our account.</p>'));
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2600);}
$('#year').textContent=new Date().getFullYear();

const brandDescriptions = {
  Nike: 'Court-inspired low-tops, bold high-tops and running-inspired silhouettes.',
  adidas: 'Three-stripe classics, clean low-tops and retro court style.',
  Puma: 'Suede favourites and sporty everyday court silhouettes.',
  Converse: 'Familiar canvas high-tops and colour-filled everyday classics.',
  'New Balance': 'Retro running shapes and understated everyday colourways.',
  Vans: 'Skate-inspired high-tops and the unmistakable checkerboard pattern.'
};
document.querySelectorAll('[data-editorial-brand]').forEach(button=>button.addEventListener('click',()=>{
  brand=button.dataset.editorialBrand;$('#search').value='';$('#budget').value='99999';render();$('#shop').scrollIntoView();
}));

catalogueReady.then(()=>{
  loadBag();saveBag();
  const brands=[...new Set([...Object.keys(brandDescriptions),...inventory.map(p=>p.brand)])].filter(name=>inventory.some(p=>p.brand===name));
  $('#brand-list').innerHTML=brands.map(name=>`<button data-brand="${esc(name)}">${esc(name)}</button>`).join('');
  $('#brand-stories').innerHTML=brands.map(name=>`<article><h3>${esc(name)}</h3><p>${esc(brandDescriptions[name]||'Everyday favourites at fair prices.')}</p><p class="fine-print">${inventory.filter(p=>p.brand===name).length} styles</p></article>`).join('');
  render();
  // Brand tiles navigate into the catalogue when opened in a new tab or shared.
  const initialBrand=new URLSearchParams(location.search).get('brand');
  if(initialBrand && inventory.some(p=>p.brand===initialBrand)){brand=initialBrand;render();}
  // A sale spotlight links to a shareable product inside the sale collection.
  const spotlightId=Number(new URLSearchParams(location.search).get('product'));
  if(spotlightId && inventory.some(p=>p.id===spotlightId)){
    if(inventory.some(p=>p.id===spotlightId&&p.was>p.price)){category='Sale';brand='';$('#budget').value='99999';render();}
    openProduct(spotlightId);
  }
});
