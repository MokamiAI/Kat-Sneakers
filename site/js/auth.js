const authContent=document.querySelector('.account-content');
const destination=new URLSearchParams(location.search).get('next');
const next=['checkout.html','admin.html','account.html'].includes(destination)?destination:'account.html';
function authError(message){let error=document.querySelector('#auth-error');if(!error){error=document.createElement('p');error.id='auth-error';error.setAttribute('role','alert');error.style.color='#b42318';error.style.fontSize='13px';error.style.lineHeight='1.7';document.querySelector('.account-form')?.append(error);}error.textContent=message;}
async function renderAccount(){
 const {user}=await Store.me();if(!user){location.replace('login.html');return;}
 const orders=await Store.orders();
 authContent.innerHTML=`<p class="eyebrow">MY KAT SNEAKERS</p><h1>Welcome back,<br>${Store.escape(user.name)}.</h1><p class="account-intro">${Store.escape(user.email)}</p><div class="account-cards"><article><span class="card-number">01</span><h2>Your orders</h2><p>${orders.length} saved order${orders.length===1?'':'s'}.</p><a href="new-in.html">Find your next pair &#8599;</a></article><article><span class="card-number">02</span><h2>Ready to order?</h2><p>Your bag is saved on this browser until you place your order.</p><a href="checkout.html">Go to checkout &#8599;</a></article></div><h2 style="font-size:25px;margin:28px 0 15px">Order history</h2><div>${orders.map(o=>`<article class="account-note"><strong>${Store.escape(o.id)}</strong><p>${Store.escape(Store.labels[o.status])} / ${Store.money(o.total)}<br>${new Date(o.created).toLocaleDateString('en-ZA',{timeZone:'Africa/Johannesburg'})}</p><a href="track.html?order=${encodeURIComponent(o.id)}">View order & payment &#8599;</a></article>`).join('')||'<p class="account-intro">No orders yet. Choose a pair and size, then open your bag to check out.</p>'}</div>${user.role==='admin'?'<a class="button" href="admin.html">Manage store &#8599;</a>':''}<button class="button light" id="customer-logout">Sign out</button>`;
 document.querySelector('#customer-logout').onclick=async()=>{await Store.logout();location.href='login.html';};
}
async function setupAuth(){
 if(location.pathname.endsWith('/account.html')){await renderAccount();return;}
 const form=document.querySelector('.account-form');if(!form)return;
 const signup=!!document.querySelector('#first-name');
 document.querySelectorAll('.account-switch a,.account-bottom a').forEach(a=>{a.href=a.getAttribute('href')+'?next='+encodeURIComponent(next);});
 form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;const button=form.querySelector('button[type=submit]');button.disabled=true;try{const data={email:document.querySelector('#email').value.trim(),password:document.querySelector('#password').value};if(signup)data.name=(document.querySelector('#first-name').value+' '+document.querySelector('#last-name').value).trim();await Store.request(signup?'/signup':'/login',data);form.reset();location.href=next;}catch(error){authError(error.message);button.disabled=false;}});
}
setupAuth().catch(error=>{if(authContent)authContent.insertAdjacentHTML('beforeend',`<p role="alert">${Store.escape(error.message)}</p>`);});
