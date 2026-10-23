// End-to-end test in Google Chrome. Runs every check twice, on a desktop window and on a phone
// screen, each against its own throwaway store. Every check gets a screenshot on both, and
// docs/testing/TEST-REPORT.md shows them side by side with tick boxes for your verdict.
//   npm run test:chrome          (Chrome runs hidden)
//   npm run test:chrome:watch    (you watch Chrome do it)
// Needs Google Chrome and playwright-core (local or global).
import { once } from 'node:events';
import { execSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import http from 'node:http';
import { createApp } from '../../server/index.mjs';
import { passwordHash } from '../../server/store.mjs';

const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const RUN=resolve(ROOT,'tests/e2e/.run'),OUT=resolve(ROOT,'docs/testing'),SHOTS=join(OUT,'screenshots');
const HEADED=process.argv.includes('--headed');
const ADMIN={email:'owner@example.com',password:'Admin-test-pass-123'};
const CUSTOMER={first:'Lerato',last:'Molefe',email:'lerato@example.com',password:'Customer-pass-123',phone:'072 555 0101'};
const DEVICES=[
 {key:'desktop',label:'Desktop',size:'1366 × 900',context:{viewport:{width:1366,height:900}}},
 {key:'mobile',label:'Mobile',size:'390 × 844 phone, touch',context:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}}
];

async function loadPlaywright(){
 try{return await import('playwright-core');}catch{}
 const global=execSync('npm root -g',{encoding:'utf8'}).trim();
 for(const candidate of ['playwright-core','@playwright/cli/node_modules/playwright-core','playwright/node_modules/playwright-core']){
  const entry=join(global,candidate,'index.mjs');if(existsSync(entry))return import(pathToFileURL(entry).href);
 }
 throw Error('playwright-core was not found. Install it with: npm install -g playwright-core');
}

rmSync(RUN,{recursive:true,force:true});mkdirSync(RUN,{recursive:true});
mkdirSync(SHOTS,{recursive:true});for(const f of readdirSync(SHOTS))if(f.endsWith('.jpg'))unlinkSync(join(SHOTS,f));
const proofPdf=join(RUN,'payment-proof.pdf');writeFileSync(proofPdf,'%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');
// A plain file server for site/ with no API, the way GitHub Pages serves it.
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.jpg':'image/jpeg'};
const pages=http.createServer((req,res)=>{const file=resolve(ROOT,'site',decodeURIComponent(new URL(req.url,'http://x').pathname.slice(1))||'index.html');if(!file.startsWith(resolve(ROOT,'site'))||!existsSync(file)){res.writeHead(404);return res.end();}res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(readFileSync(file));});
pages.listen(0,'127.0.0.1');await once(pages,'listening');
const STATIC='http://localhost:'+pages.address().port;

const {chromium}=await loadPlaywright();
const browser=await chromium.launch({channel:'chrome',headless:!HEADED,slowMo:HEADED?120:0});
const chromeVersion=browser.version();
const results=[];   // one entry per check per device

async function runSuite(device){
 // ---- A fresh store for this device ----
 const dir=join(RUN,device.key);mkdirSync(dir,{recursive:true});
 const {server,store}=createApp({dbPath:join(dir,'qa.sqlite'),imagesDir:join(dir,'uploads')});
 store.db.prepare('INSERT INTO users VALUES(?,?,?,?,?)').run('qa-admin',ADMIN.email,'Store owner',await passwordHash(ADMIN.password),'admin');
 server.listen(0,'127.0.0.1');await once(server,'listening');
 const B='http://localhost:'+server.address().port;
 const mobile=device.key==='mobile';

 // ---- Step runner ----
 let current=null,shotCount=0,order=0;
 function watch(page,who){
  page.on('dialog',d=>d.accept());
  page.on('pageerror',e=>current?.errors.push(`${who}: script error: ${e.message}`));
  page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))current?.errors.push(`${who}: ${m.text()}`);});
  page.on('response',r=>{if(r.status()>=400&&!(current?.allow||[]).includes(r.status()))current?.errors.push(`${who}: HTTP ${r.status()} ${r.request().method()} ${new URL(r.url()).pathname}`);});
 }
 const newPage=async who=>{const page=await (await browser.newContext(device.context)).newPage();watch(page,who);return page;};
 const shopper=await newPage('shopper'),owner=await newPage('owner');
 const people={shopper,owner};
 async function shot(page,caption,{full=false,focus=null}={}){
  if(focus){await page.locator(focus).first().evaluate(el=>el.scrollIntoView({block:'start'}));await page.waitForTimeout(250);}
  const name=`${device.key}-${String(++shotCount).padStart(3,'0')}-${caption.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50)}.jpg`;
  await page.screenshot({path:join(SHOTS,name),fullPage:full,type:'jpeg',quality:70});current.shots.push({name,caption});
 }
 // Every check ends with a screenshot of the page it worked on, pass or fail.
 async function step(area,title,did,who,fn,{allow=[]}={}){
  current={device:device.key,order:++order,area,title,did,allow,errors:[],shots:[],notes:[],page:people[who]};
  for(const page of [shopper,owner])await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close())).catch(()=>{});
  try{const note=await fn();if(note)current.notes.push(note);current.status=current.errors.length?'WARN':'PASS';}
  catch(error){current.status='FAIL';current.notes.push(error.message.split('\n')[0]);}
  try{await shot(current.page,current.status==='FAIL'?'Screen when it failed':'Result');}catch{}
  results.push(current);console.log(`${device.label.padEnd(7)} ${current.status.padEnd(4)} ${area} / ${title}${current.notes.length?' — '+current.notes.join('; '):''}`);
 }
 const check=(condition,message)=>{if(!condition)throw Error(message);};
 const go=(page,path,base=B)=>page.goto(base+path,{waitUntil:'domcontentloaded'});
 const notice=(page,text)=>page.waitForSelector(`#notice.visible:has-text("${text}")`,{timeout:20000});
 const cards=page=>page.locator('#products article').allTextContents();
 const view=async v=>{await owner.click(`[data-view=${v}]`);await owner.waitForTimeout(400);};
 const openOrder=async id=>{await view('orders');await owner.fill('#order-search',id);await owner.click(`[data-order="${id}"]`);await owner.waitForSelector(`h1:has-text("${id}")`);};
 const act=async(prepare,button)=>{if(prepare)await prepare();const before=await owner.textContent('#order-action h2');await owner.click(`#action-form button:has-text("${button}")`);await notice(owner,'Order updated');await owner.waitForFunction(t=>document.querySelector('#order-action h2')?.textContent!==t,before);};
 const openShoe=async page=>{await page.locator('#products article').first().locator('.product-photo').click();await page.waitForSelector('#product-dialog[open]');};
 const addToBag=async(search,size)=>{await go(shopper,'/index.html');await shopper.waitForSelector('#products article');await shopper.fill('#search',search);await openShoe(shopper);await shopper.click(`[data-size="${size}"]`);await shopper.click('#add-to-bag');};
 const contact=async()=>{await shopper.fill('[name=name]',CUSTOMER.first+' '+CUSTOMER.last);await shopper.fill('[name=email]',CUSTOMER.email);await shopper.fill('[name=phone]',CUSTOMER.phone);};
 const noSideScroll=async page=>{const w=await page.evaluate(()=>document.documentElement.scrollWidth),max=device.context.viewport.width;check(w<=max,`page is ${w}px wide on a ${max}px screen (sideways scrolling)`);};

 // ================= 1. Storefront =================
 const S1='1. Storefront';
 await step(S1,'Home page loads the live catalogue','Opened the home page and waited for the product grid.','shopper',async()=>{await go(shopper,'/');await shopper.waitForSelector('#products article');const n=(await cards(shopper)).length;check(n===27,`expected 27 starter shoes, saw ${n}`);check(await shopper.isVisible('#sale-showcase img'),'sale showcase missing');await noSideScroll(shopper);await shot(shopper,'Home page, full length',{full:true});return `${n} shoes shown`;});
 for(const [file,label,category] of [['new-in','New in',null],['men','Men','Men'],['women','Women','Women'],['kids','Kids','Kids'],['sale','Sale','Sale'],['brands','Brands',null]])
  await step(S1,`${label} page`,`Opened ${file}.html, checked the shoe grid and the active filter, then scrolled to the shoes.`,'shopper',async()=>{await go(shopper,`/${file}.html`);await shopper.waitForSelector('#products article');const n=(await cards(shopper)).length;check(n>0,'no products');if(category){const active=await shopper.textContent('.tabs button.active');check(active.toLowerCase().includes(category.toLowerCase()),`active tab "${active}"`);}if(category==='Sale'){const all=await cards(shopper);check(all.every(t=>/SAVE R|OUT OF STOCK/.test(t)),'non-sale shoe on Sale page');}await noSideScroll(shopper);await shot(shopper,`${label} page top`);await shopper.locator('#shop').evaluate(el=>el.scrollIntoView({block:'start'}));return `${n} shoes`;});
 await step(S1,'Search','Typed "converse" in the search box.','shopper',async()=>{await go(shopper,'/');await shopper.waitForSelector('#products article');await shopper.fill('#search','converse');const all=await cards(shopper);check(all.length&&all.every(t=>/CONVERSE/.test(t)),'non-Converse result');await shopper.locator('#shop').evaluate(el=>el.scrollIntoView({block:'start'}));return `${all.length} Converse shoes`;});
 await step(S1,'Budget filter','Chose "Under R500".','shopper',async()=>{await shopper.fill('#search','');await shopper.selectOption('#budget','500');const prices=await shopper.locator('#products .price').allTextContents();check(prices.length&&prices.every(p=>Number(p.replace(/[^\d.]/g,''))<500),'price over R500: '+prices.join(', '));await shopper.locator('#shop').evaluate(el=>el.scrollIntoView({block:'start'}));return prices.join(', ');});
 await step(S1,'Sort by price','Chose "Price: low to high" for all prices.','shopper',async()=>{await shopper.selectOption('#budget','99999');await shopper.selectOption('#sort','low');const prices=(await shopper.locator('#products .price').allTextContents()).map(p=>Number(p.replace(/[^\d.]/g,'')));check(prices.every((p,i)=>!i||p>=prices[i-1]),'not ascending');await shopper.locator('#shop').evaluate(el=>el.scrollIntoView({block:'start'}));await shot(shopper,'Sorted low to high');await shopper.selectOption('#sort','featured');return `R${prices[0]} → R${prices.at(-1)}`;});
 await step(S1,'Shop by brand','Clicked the Vans brand tile.','shopper',async()=>{await shopper.click('#brand-list [data-brand="Vans"]');const all=await cards(shopper);check(all.length&&all.every(t=>/VANS/.test(t)),'non-Vans result');return `${all.length} Vans shoes`;});
 await step(S1,'Sale carousel','Paused the hero sale rotation and clicked the next arrow.','shopper',async()=>{await go(shopper,'/');await shopper.waitForSelector('#sale-next');await shopper.click('#sale-pause');// The design hides the "1 / 11" counter, so compare the visible slide instead.
  const showing=()=>shopper.locator('.sale-slide.is-active').getAttribute('aria-label');const before=await showing();await shot(shopper,'Before next');await shopper.click('#sale-next');const after=await showing();check(before!==after,'slide did not change');await shopper.locator('#sale-showcase').evaluate(el=>el.scrollIntoView({block:'start'}));return `${before.split(',')[0]} → ${after.split(',')[0]}`;});
 await step(S1,'Size guide','Opened the size guide.','shopper',async()=>{await shopper.click('#size-guide');check(await shopper.isVisible('text=UK size guide'),'size guide missing');});
 await step(S1,'Delivery and payment info','Opened "Delivery & payment" in the footer.','shopper',async()=>{await shopper.click('#delivery-info');const text=await shopper.textContent('#info-content');check(/Soweto/.test(text)&&/PAXI/.test(text)&&/ID/.test(text),'delivery text incomplete');});
 await step(S1,'Product details','Opened a shoe and chose a size.','shopper',async()=>{await openShoe(shopper);await shopper.locator('#product-detail [data-size]:not([disabled])').first().click();check(!(await shopper.isDisabled('#add-to-bag')),'add to bag disabled');});

 // ================= 2. Accounts =================
 const S2='2. Accounts';
 await step(S2,'Wrong password is refused','Signed in with a wrong password.','shopper',async()=>{await go(shopper,'/login.html');await shopper.fill('#email','nobody@example.com');await shopper.fill('#password','Wrong-password-1');await shopper.click('button[type=submit]');await shopper.waitForSelector('#auth-error:has-text("Invalid")');return await shopper.textContent('#auth-error');},{allow:[401]});
 await step(S2,'Protected pages ask for sign-in','Opened checkout and order tracking while signed out.','shopper',async()=>{await go(shopper,'/checkout.html');await shopper.waitForURL(/login\.html/);await go(shopper,'/track.html');await shopper.waitForURL(/login\.html/);await shopper.waitForSelector('#email');},{allow:[401]});
 await step(S2,'Create an account','Filled the sign-up form, accepted the terms and submitted.','shopper',async()=>{await go(shopper,'/signup.html?next=account.html');await shopper.fill('#first-name',CUSTOMER.first);await shopper.fill('#last-name',CUSTOMER.last);await shopper.fill('#email',CUSTOMER.email);await shopper.fill('#password',CUSTOMER.password);await shopper.check('.account-form input[type=checkbox]');await shot(shopper,'Sign-up form filled');await shopper.click('button[type=submit]');await shopper.waitForSelector(`text=${CUSTOMER.first} ${CUSTOMER.last}`);});
 await step(S2,'Sign out and back in','Signed out from My account, then signed in again.','shopper',async()=>{await shopper.click('#customer-logout');await shopper.waitForURL(/login\.html/);await shopper.fill('#email',CUSTOMER.email);await shopper.fill('#password',CUSTOMER.password);await shopper.click('button[type=submit]');await shopper.waitForSelector('text=Order history');},{allow:[401]});
 await step(S2,'Forgot password page','Opened the forgot-password page.','shopper',async()=>{await go(shopper,'/forgot-password.html');check(await shopper.isVisible('text=Back to sign in'),'no way back');await noSideScroll(shopper);});
 await step(S2,'Customers cannot open store management','Opened admin.html as the customer.','shopper',async()=>{await go(shopper,'/admin.html');await shopper.waitForSelector('text=Administrator access required.');});

 // ================= 3. Store settings =================
 const S3='3. Store settings';
 await step(S3,'Owner signs in','Signed in as the administrator.','owner',async()=>{await go(owner,'/login.html?next=admin.html');await owner.fill('#email',ADMIN.email);await owner.fill('#password',ADMIN.password);await owner.click('button[type=submit]');await owner.waitForSelector('text=A good day starts here.');check(await owner.isVisible('text=Add your bank details.'),'bank reminder missing');await noSideScroll(owner);return 'bank-details reminder shown';});
 await step(S3,'Bank details and delivery fees','Entered bank details and set the Soweto delivery fee to R45.','owner',async()=>{await view('settings');await owner.fill('[name=bankName]','Capitec');await owner.fill('[name=accountHolder]','Kat Sneakers');await owner.fill('[name=accountNumber]','1234567890');await owner.fill('[name=branchCode]','470010');await owner.fill('[name=sowetoFee]','45');await shot(owner,'Settings filled in',{full:true});await owner.click('button:has-text("Save settings")');await notice(owner,'Settings saved');await view('dashboard');check(!(await owner.isVisible('text=Add your bank details.')),'reminder still shown');});

 // ================= 4. Products & stock =================
 const S4='4. Products & stock';
 await step(S4,'Add a shoe from photo search','Typed "Nike Air Force 1", picked a photo, set R1 599, Men + Women, 2 pairs per size and 0 in UK 12.','owner',async()=>{await view('products');await owner.click('#add-product');await owner.fill('[name=name]','Nike Air Force 1');await owner.press('[name=name]','Tab');await owner.waitForSelector('.image-option img',{timeout:30000});const found=await owner.textContent('#image-status');await owner.locator('.image-option').first().click();await owner.waitForSelector('#image-status:has-text("Photo added")',{timeout:30000});check(await owner.inputValue('[name=brand]')==='Nike','brand not filled in');await owner.fill('[name=colour]','Triple White');await owner.fill('[name=price]','1599');await owner.check('input[name=categories][value=Men]');await owner.check('input[name=categories][value=Women]');await owner.fill('#fill-qty','2');await owner.click('#fill-sizes');await owner.locator('[data-stock="12"]').fill('0');await noSideScroll(owner);await shot(owner,'Product editor before saving',{full:true});await owner.click('#save-product');await notice(owner,'added to the store');return found;});
 await step(S4,'Change the price and put it on sale','Edited the shoe: R1 499, original price R1 799.','owner',async()=>{await owner.locator('.product-row',{hasText:'Triple White'}).getByRole('button',{name:'Edit'}).click();await owner.fill('[name=price]','1499');await owner.fill('[name=was]','1799');await owner.click('#save-product');await notice(owner,'updated');const row=owner.locator('.product-row',{hasText:'Triple White'});const text=await row.textContent();check(text.includes('R1 499.00')&&text.includes('R1 799.00'),text);await row.evaluate(el=>el.scrollIntoView({block:'center'}));});
 await step(S4,'Invalid sale price is refused','Entered an original price lower than the selling price.','owner',async()=>{await owner.locator('.product-row',{hasText:'Triple White'}).getByRole('button',{name:'Edit'}).click();await owner.fill('[name=was]','1000');await owner.click('#save-product');await owner.waitForSelector('#product-form .error:has-text("original price")');await owner.locator('#product-form .error').evaluate(el=>el.scrollIntoView({block:'center'}));await shot(owner,'Error message');const message=await owner.textContent('#product-form .error');await owner.click('#back-products');return message;},{allow:[400]});
 await step(S4,'Add a shoe with an uploaded photo','Uploaded a photo for "Puma Kids Velcro Runner", R549, Kids sizes, 1 pair each.','owner',async()=>{await owner.click('#add-product');await owner.fill('[name=name]','Kids Velcro Runner');await owner.fill('[name=brand]','Puma');await owner.locator('#image-upload').setInputFiles(join(ROOT,'site/images/sneakers/puma-white-red.jpg'));await owner.waitForSelector('#image-status:has-text("Photo added")');await owner.fill('[name=price]','549');await owner.check('input[name=categories][value=Kids]');await owner.click('[data-preset=kids]');await owner.fill('#fill-qty','1');await owner.click('#fill-sizes');await shot(owner,'Upload editor',{focus:'#stock-grid'});await owner.click('#save-product');await notice(owner,'added to the store');});
 await step(S4,'Mark a shoe out of stock','Clicked "Mark out of stock" on Converse Junior All Star.','owner',async()=>{const row=owner.locator('.product-row',{hasText:'Junior All Star'});await row.getByRole('button',{name:'Mark out of stock'}).click();await notice(owner,'now shows as out of stock');await row.evaluate(el=>el.scrollIntoView({block:'center'}));});
 await step(S4,'Hide a shoe','Set Vans Sk8-Hi Classic to Hidden.','owner',async()=>{await owner.locator('.product-row',{hasText:'Sk8-Hi Classic'}).getByRole('button',{name:'Edit'}).click();await owner.check('input[name=status][value=hidden]');await shot(owner,'Availability set to Hidden',{focus:'input[name=status]'});await owner.click('#save-product');await notice(owner,'updated');const row=owner.locator('.product-row',{hasText:'Sk8-Hi Classic'});check((await row.textContent()).includes('Hidden'),'not hidden');await row.evaluate(el=>el.scrollIntoView({block:'center'}));});
 await step(S4,'Delete a shoe','Deleted Kat Everyday Teal Everyday and confirmed.','owner',async()=>{await owner.locator('.product-row',{hasText:'Teal Everyday'}).getByRole('button',{name:'Edit'}).click();await owner.click('#delete-product');await notice(owner,'Shoe deleted');check(!(await owner.locator('.product-row',{hasText:'Teal Everyday'}).count()),'still listed');});
 await step(S4,'Filter to out-of-stock shoes','Clicked the "Out of stock" count.','owner',async()=>{await owner.click('[data-product-filter=sold-out]');const rows=await owner.locator('.product-row').allTextContents();await owner.locator('#product-results').evaluate(el=>el.scrollIntoView({block:'center'}));await shot(owner,'Filtered list');await owner.click('[data-product-filter=sold-out]');check(rows.length===1&&rows[0].includes('Junior All Star'),`${rows.length} rows`);});

 // ================= 5. Shopping =================
 const S5='5. Shopping';
 await step(S5,'Store reflects the changes','Reloaded the shop as the customer and searched for the out-of-stock shoe.','shopper',async()=>{await go(shopper,'/');await shopper.waitForSelector('#products article');const all=await cards(shopper);check(all.find(t=>t.includes('Junior All Star'))?.includes('OUT OF STOCK'),'no out-of-stock tag');check(all.at(-1).includes('OUT OF STOCK'),'sold-out shoe not last');check(!all.some(t=>t.includes('Sk8-Hi Classic')||t.includes('Teal Everyday')),'hidden or deleted shoe shown');await shopper.fill('#search','Junior All Star');await shopper.locator('#shop').evaluate(el=>el.scrollIntoView({block:'start'}));return `${all.length} shoes`;});
 await step(S5,'Out-of-stock shoe cannot be bought','Opened the out-of-stock shoe.','shopper',async()=>{await openShoe(shopper);check(await shopper.locator('#product-detail button:has-text("Out of stock")').isDisabled(),'buy button enabled');});
 await step(S5,'Sold-out sizes and stock limit','Opened the new Air Force 1, checked UK 12 is sold out, then added UK 8 three times (only 2 in stock).','shopper',async()=>{await shopper.fill('#search','Triple White');await openShoe(shopper);check(await shopper.locator('[data-size="12"]').isDisabled(),'UK 12 can be chosen');await shopper.click('[data-size="8"]');const low=await shopper.textContent('#size-stock');await shot(shopper,'UK 12 crossed out, low stock note');await shopper.click('#add-to-bag');for(let i=0;i<2;i++){await openShoe(shopper);await shopper.click('[data-size="8"]');await shopper.click('#add-to-bag');}const toast=await shopper.textContent('#toast');check(/no more pairs/.test(toast),toast);check((await shopper.textContent('#bag-count')).trim()==='2','bag count wrong');return `"${low}" then "${toast}"`;});
 await step(S5,'Bag','Opened the bag.','shopper',async()=>{await shopper.click('#product-dialog [data-close]').catch(()=>{});await shopper.click('#open-bag');const summary=await shopper.textContent('#bag-summary');check(summary.includes('R2 998'),summary);});
 let sowetoOrder,paxiOrder,cancelOrder;
 await step(S5,'Checkout needs a delivery choice','Filled contact details and pressed Place order without choosing delivery.','shopper',async()=>{await go(shopper,'/checkout.html');await shopper.waitForSelector('#checkout-form');await contact();await shopper.click('#checkout-form button[type=submit]');check(shopper.url().includes('checkout'),'order placed without delivery');await noSideScroll(shopper);});
 await step(S5,'Soweto door delivery order','Chose "I live in Soweto", 88 Vilakazi Street, Orlando West, and placed the order.','shopper',async()=>{await shopper.check('input[name=method][value=soweto]');await shopper.fill('[name=address]','88 Vilakazi Street');await shopper.selectOption('[name=area]','Orlando West');await shopper.fill('[name=notes]','Green gate');const total=await shopper.textContent('#checkout-form button[type=submit]');await shot(shopper,'Checkout with Soweto delivery',{full:true});await shopper.click('#checkout-form button[type=submit]');await shopper.waitForURL(/track\.html/);sowetoOrder=new URL(shopper.url()).searchParams.get('order');const bank=await shopper.textContent('.bank-details');check(bank.includes('Capitec')&&bank.includes(sowetoOrder),'bank details missing');check(total.includes('R3 043.00'),total);await shot(shopper,'Pay by EFT page',{full:true});return `${sowetoOrder}: ${total.trim()} (2 × R1 499 + R45)`;});
 await step(S5,'Upload proof of payment','Uploaded a PDF proof on the order page.','shopper',async()=>{await shopper.locator('#proof-form input[name=proof]').setInputFiles(proofPdf);await shopper.click('#proof-form button');await shopper.waitForSelector('text=Proof received. Next: review.');});
 await step(S5,'PAXI order','Bought the kids shoe, chose PAXI to PEP Bloemfontein Mimosa Mall (7-9 days), placed the order and uploaded proof.','shopper',async()=>{await addToBag('Kids Velcro','1');await go(shopper,'/checkout.html');await shopper.waitForSelector('#checkout-form');await contact();await shopper.check('input[name=method][value=paxi]');await shopper.fill('[name=paxiPoint]','PEP Bloemfontein Mimosa Mall');await shopper.fill('[name=city]','Bloemfontein');await shopper.selectOption('[name=province]','Free State');const total=await shopper.textContent('#checkout-form button[type=submit]');await shot(shopper,'Checkout with PAXI',{full:true});await shopper.click('#checkout-form button[type=submit]');await shopper.waitForURL(/track\.html/);paxiOrder=new URL(shopper.url()).searchParams.get('order');await shopper.locator('#proof-form input[name=proof]').setInputFiles(proofPdf);await shopper.click('#proof-form button');await shopper.waitForSelector('text=Proof received');check(total.includes('R608.95'),total);return `${paxiOrder}: ${total.trim()} (R549 + R59.95 PAXI)`;});
 await step(S5,'Order to be cancelled','Placed a third order (Puma Suede Classic, Soweto) and did not pay.','shopper',async()=>{await addToBag('Suede Classic','7');await go(shopper,'/checkout.html');await shopper.waitForSelector('#checkout-form');await contact();await shopper.check('input[name=method][value=soweto]');await shopper.fill('[name=address]','88 Vilakazi Street');await shopper.selectOption('[name=area]','Orlando West');await shopper.click('#checkout-form button[type=submit]');await shopper.waitForURL(/track\.html/);cancelOrder=new URL(shopper.url()).searchParams.get('order');return cancelOrder;});

 // ================= 6. Orders & delivery =================
 const S6='6. Orders & delivery';
 await step(S6,'Dashboard shows proofs to check','Opened the dashboard.','owner',async()=>{await go(owner,'/admin.html');await owner.waitForSelector('.metric');const n=(await owner.textContent('[data-queue=proof_uploaded] strong')).trim();check(n==='2',`count ${n}`);await noSideScroll(owner);});
 await step(S6,'Next action shows first on the order page','Opened the Soweto order and checked where the "Check payment" box starts.','owner',async()=>{await openOrder(sowetoOrder);const top=await owner.evaluate(()=>document.querySelector('#order-action').getBoundingClientRect().top);// The box's heading and first field must be on the first screen, without scrolling.
 if(mobile)check(top+150<device.context.viewport.height,`action box starts ${top|0}px down, below the first screen`);await noSideScroll(owner);await shot(owner,'Order page, full length',{full:true});await owner.evaluate(()=>scrollTo(0,0));return `"Check payment" starts ${top|0}px from the top`;});
 await step(S6,'Soweto: approve, pack, deliver','Approved payment, packed, marked out for delivery with a note, then delivered.','owner',async()=>{await act(()=>owner.check('[name=confirmed]'),'Approve payment');await act(()=>owner.check('[name=checked]'),'Mark packed');await act(()=>owner.fill('[name=note]','Arriving after 3pm'),'Mark out for delivery');await shot(owner,'Out for delivery',{focus:'#order-action'});const message=await owner.locator('.message-entry').last().textContent();await act(()=>owner.check('#action-form input[type=checkbox]'),'Mark delivered');check(await owner.isVisible('text=Delivered to the customer.'),'not delivered');check(/out for delivery to 88 Vilakazi Street, Orlando West\. Arriving after 3pm/.test(message),message);const wa=await owner.locator('.message-entry a:has-text("WhatsApp")').first().getAttribute('href');check(wa.startsWith('https://wa.me/27725550101'),wa);await owner.evaluate(()=>scrollTo(0,0));return 'WhatsApp link opens +27 72 555 0101';});
 await step(S6,'PAXI: reject proof, customer re-uploads','Rejected the proof with a reason; the customer saw the reason and uploaded a new proof.','shopper',async()=>{await openOrder(paxiOrder);await owner.fill('#reject-form textarea','The amount on the proof does not match.');await owner.click('#reject-form button');await notice(owner,'Proof rejected');await go(shopper,'/track.html?order='+paxiOrder);await shopper.waitForSelector('text=Please upload a new proof');await shot(shopper,'Customer sees rejection reason',{focus:'.notice-box'});await shopper.locator('#proof-form input[name=proof]').setInputFiles(proofPdf);await shopper.click('#proof-form button');await shopper.waitForSelector('text=Proof received');});
 await step(S6,'PAXI: approve, pack, send, collected','Approved, packed, tried to dispatch without a tracking number, then sent with PX778899 and marked collected.','owner',async()=>{await openOrder(paxiOrder);await act(()=>owner.check('[name=confirmed]'),'Approve payment');await act(()=>owner.check('[name=checked]'),'Mark packed');await owner.click('#action-form button:has-text("Mark sent with PAXI")');await owner.waitForTimeout(300);check(await owner.isVisible('#action-form button:has-text("Mark sent with PAXI")'),'sent without tracking number');await act(()=>owner.fill('[name=tracking]','PX778899'),'Mark sent with PAXI');await go(shopper,'/track.html?order='+paxiOrder);await shopper.waitForSelector('text=PX778899');const page=await shopper.textContent('main');check(/collection PIN/.test(page)&&/Bring your ID/.test(page),'PAXI collection info missing');await shot(shopper,'Customer sees PAXI tracking',{full:true});await go(owner,'/admin.html');await openOrder(paxiOrder);await act(()=>owner.check('#action-form input[type=checkbox]'),'Mark collected');await owner.evaluate(()=>scrollTo(0,0));});
 await step(S6,'Store cancels an unpaid order','Cancelled the third order; the customer sees that the store cancelled it.','shopper',async()=>{await openOrder(cancelOrder);await owner.click('#cancel-form button');await notice(owner,'Order cancelled');await go(shopper,'/track.html?order='+cancelOrder);await shopper.waitForSelector('text=cancelled by Kat Sneakers');});
 await step(S6,'Stock goes down after a sale','Reopened the Air Force 1 in the shop after both UK 8 pairs were paid for.','shopper',async()=>{await go(shopper,'/');await shopper.waitForSelector('#products article');await shopper.fill('#search','Triple White');await openShoe(shopper);check(await shopper.locator('[data-size="8"]').isDisabled(),'UK 8 still for sale');check(!(await shopper.locator('[data-size="9"]').isDisabled()),'UK 9 wrongly sold out');return 'UK 8 sold out, UK 9 still available';});
 await step(S6,'Record a phone/WhatsApp sale','Recorded a WhatsApp sale for Sipho Ndlovu with PAXI to PEP Mthatha Plaza and a proof.','owner',async()=>{await go(owner,'/admin.html');await view('new');await owner.fill('[name=name]','Sipho Ndlovu');await owner.fill('[name=email]','sipho@example.com');await owner.fill('[name=phone]','083 444 5566');await owner.check('input[name=method][value=paxi]');await owner.fill('[name=paxiPoint]','PEP Mthatha Plaza');await owner.fill('[name=city]','Mthatha');await owner.selectOption('[name=province]','Eastern Cape');await owner.selectOption('[name=source]','WhatsApp');await owner.locator('#sale-form input[name=proof]').setInputFiles(proofPdf);await shot(owner,'Sale form filled',{full:true});await owner.click('#sale-form button');await notice(owner,'New sale recorded');check((await owner.textContent('.admin-top .status')).includes('Proof to check'),'wrong status');});
 await step(S6,'Customer updates','Opened Customer updates.','owner',async()=>{await view('messages');const n=await owner.locator('.message-entry').count();check(n>=8,`${n} messages`);return `${n} message drafts, each with WhatsApp and Email links`;});
 await step(S6,'Customer order history','Opened My account as the customer.','shopper',async()=>{await go(shopper,'/account.html');await shopper.waitForSelector('text=Order history');const n=((await shopper.textContent('main')).match(/KAT-/g)||[]).length;check(n===3,`${n} orders`);await noSideScroll(shopper);await shot(shopper,'Account, full length',{full:true});});

 // ================= 7. GitHub Pages mode =================
 const S7='7. GitHub Pages (no server)';
 await step(S7,'Shop works without the server','Served site/ as plain files (like GitHub Pages) and opened the home page.','shopper',async()=>{const page=await newPage('pages');current.page=page;current.allow=[404];await go(page,'/',STATIC);await page.waitForSelector('#products article');const n=(await cards(page)).length;check(n===27,`${n} shoes`);await noSideScroll(page);return `${n} shoes from the built-in catalogue`;});

 await Promise.all(browser.contexts().map(c=>c.close()));server.close();store.db.close();
}

for(const device of DEVICES)await runSuite(device);
await browser.close();pages.close();

// ================= Report =================
const icon={PASS:'✅',WARN:'⚠️',FAIL:'❌'};
const checks=[...new Map(results.map(r=>[r.area+'|'+r.title,{area:r.area,title:r.title,did:r.did}])).values()];
const find=(c,device)=>results.find(r=>r.device===device&&r.area===c.area&&r.title===c.title);
const count=(device,s)=>results.filter(r=>r.device===device&&r.status===s).length;
const failed=results.filter(r=>r.status==='FAIL').length;
const areas=[...new Set(checks.map(c=>c.area))];
const when=new Date().toLocaleString('en-ZA',{timeZone:'Africa/Johannesburg',dateStyle:'long',timeStyle:'short'});
const findings=existsSync(join(OUT,'findings.md'))?readFileSync(join(OUT,'findings.md'),'utf8').trim():'';
const cell=r=>r?`${icon[r.status]} ${r.status==='PASS'?'Pass':r.status==='WARN'?'Warning':'Fail'}`:'—';
const imgs=(r,width)=>r?r.shots.map(s=>`<a href="screenshots/${s.name}"><img src="screenshots/${s.name}" width="${width}" alt="${s.caption}"></a><br><sub>${s.caption}</sub>`).join('<br><br>'):'';
const anchor=c=>(c.area+' '+c.title).toLowerCase().replace(/[^a-z0-9]+/g,'-');
let md=`# Kat Sneakers test report

${failed?`**${failed} check${failed===1?'':'s'} failed.**`:'**Every check passed on desktop and mobile.**'}

| | Desktop | Mobile |
| --- | --- | --- |
| Screen | ${DEVICES[0].size} | ${DEVICES[1].size} |
| Passed | ${count('desktop','PASS')} of ${checks.length} | ${count('mobile','PASS')} of ${checks.length} |
| Warnings | ${count('desktop','WARN')} | ${count('mobile','WARN')} |
| Failed | ${count('desktop','FAIL')} | ${count('mobile','FAIL')} |

Run on ${when} SAST in Google Chrome ${chromeVersion} with Node.js ${process.version}. Each screen size used its own fresh throwaway store, so your real \`data/\` folder was not touched. Rerun with \`npm run test:chrome\`, or \`npm run test:chrome:watch\` to watch Chrome do it.

**How to judge:** every check below shows what I did, the result on each screen size, and the screenshots side by side (click one to open it full size). Tick the boxes and add notes under each check.

## All checks

| # | Check | Desktop | Mobile |
| --- | --- | --- | --- |
${checks.map((c,i)=>`| ${i+1} | [${c.title}](#${anchor(c)}) | ${cell(find(c,'desktop'))} | ${cell(find(c,'mobile'))} |`).join('\n')}

`;
if(findings)md+=findings+'\n\n';
md+='## Every check, with screenshots\n\n';
let n=0;
for(const area of areas){
 md+=`### ${area}\n\n`;
 for(const c of checks.filter(x=>x.area===area)){
  const d=find(c,'desktop'),m=find(c,'mobile');
  md+=`<a id="${anchor(c)}"></a>\n\n#### ${++n}. ${c.title}\n\n**What I did:** ${c.did}\n\n`;
  md+=`| | Desktop | Mobile |\n| --- | --- | --- |\n| Result | ${cell(d)}${d?.notes.length?' — '+d.notes.join('; ').replace(/\|/g,'/'):''} | ${cell(m)}${m?.notes.length?' — '+m.notes.join('; ').replace(/\|/g,'/'):''} |\n`;
  const errors=[...new Set([...(d?.errors||[]).map(e=>'Desktop: '+e),...(m?.errors||[]).map(e=>'Mobile: '+e)])];
  if(errors.length)md+=`| Browser errors | ${errors.filter(e=>e.startsWith('Desktop')).join('<br>').replace(/\|/g,'/')||'—'} | ${errors.filter(e=>e.startsWith('Mobile')).join('<br>').replace(/\|/g,'/')||'—'} |\n`;
  md+=`\n<table><tr><th>Desktop</th><th>Mobile</th></tr><tr><td valign="top">${imgs(d,560)}</td><td valign="top">${imgs(m,230)}</td></tr></table>\n\n`;
  md+=`**Your verdict:**\n\n- [ ] Desktop looks right\n- [ ] Mobile looks right\n- Notes: \n\n---\n\n`;
 }
}
writeFileSync(join(OUT,'TEST-REPORT.md'),md);
rmSync(RUN,{recursive:true,force:true});
console.log(`\nDesktop: ${count('desktop','PASS')} passed, ${count('desktop','FAIL')} failed. Mobile: ${count('mobile','PASS')} passed, ${count('mobile','FAIL')} failed.\nReport: docs/testing/TEST-REPORT.md`);
process.exitCode=failed?1:0;
