(() => {
  const showcase=document.querySelector('#sale-showcase');
  if(!showcase)return;
  const pairs=inventory.filter(product=>product.was>product.price).sort((a,b)=>(b.id===27)-(a.id===27));
  if(!pairs.length){showcase.hidden=true;return;}
  const slides=document.querySelector('#sale-slides');
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let position=0,paused=false,timer;
  slides.innerHTML=pairs.map((product,index)=>`<a class="sale-slide ${index===0?'is-active':''}" href="${product.id?`sale.html?product=${product.id}#shop`:'sale.html'}" tabindex="${index===0?'0':'-1'}" aria-hidden="${index!==0}" aria-label="${product.id?`${product.brand} ${product.name}, sale price ${money(product.price)}. View sale product.`:'Everyday favourites from R499. Browse the sale collection.'}"><img src="${photo(product)}" alt="${product.brand} ${product.name} in ${product.colour}" ${index===0?'fetchpriority="high"':'loading="lazy"'}></a>`).join('');
  const links=[...slides.querySelectorAll('.sale-slide')];
  const pauseButton=document.querySelector('#sale-pause');
  function show(index){
    position=(index+pairs.length)%pairs.length;
    links.forEach((link,i)=>{const active=i===position;link.classList.toggle('is-active',active);link.tabIndex=active?0:-1;link.setAttribute('aria-hidden',String(!active));});
    const product=pairs[position];
    const sticker=showcase.querySelector('.hero-sticker');
    sticker.innerHTML=`<span>MOCK SALE / SAVE ${money(product.was-product.price)}</span><strong>${money(product.price)}</strong><del>${money(product.was)}</del>`;
    showcase.querySelector('.photo-caption').textContent=`${product.brand.toUpperCase()} / ${product.name.toUpperCase()} / VIEW SALE PAIR`;
    document.querySelector('#sale-position').textContent=`${position+1} / ${pairs.length}`;
  }
  function stop(){clearInterval(timer);showcase.classList.add('rotation-stopped');}
  function schedule(force=false){
    stop();pauseButton.textContent=paused?'Play':'Pause';pauseButton.setAttribute('aria-label',paused?'Play shoe rotation':'Pause shoe rotation');
    if(paused||document.hidden||(!force&&showcase.contains(document.activeElement)))return;
    showcase.classList.remove('rotation-stopped');
    timer=setInterval(()=>show(position+1),4000);
  }
  pauseButton.addEventListener('click',()=>{paused=!paused;schedule(true);});
  document.querySelector('#sale-prev').addEventListener('click',()=>{show(position-1);schedule();});
  document.querySelector('#sale-next').addEventListener('click',()=>{show(position+1);schedule();});
  showcase.addEventListener('focusin',stop);
  showcase.addEventListener('focusout',()=>setTimeout(schedule,0));
  document.addEventListener('visibilitychange',()=>schedule());
  reducedMotion.addEventListener('change',()=>schedule());
  document.querySelector('#sale-controls').hidden=pairs.length<2;
  show(0);schedule();
})();
