import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function presentation(storageAvailable=true){
 const values=new Map();
 const context={File,localStorage:{getItem:key=>{if(!storageAvailable)throw Error('Blocked storage');return values.get(key)||null;},setItem:(key,value)=>{if(!storageAvailable)throw Error('Blocked storage');values.set(key,value);},removeItem:key=>values.delete(key)},fetch:()=>{throw Error('The presentation must not call a server.');}};
 vm.createContext(context);vm.runInContext(readFileSync(new URL('../catalogue.js',import.meta.url),'utf8')+'\n'+readFileSync(new URL('../api.js',import.meta.url),'utf8')+'\nglobalThis.presentationStore=Store;',context);return {store:context.presentationStore,values};
}
test('pitch works without real accounts, uploads, payment checks or backend requests',async()=>{
 const {store,values}=presentation();
 const samples=await store.orders();assert.equal(samples.length,6);assert.ok(samples.some(o=>o.status==='proof_uploaded'));assert.ok(samples.some(o=>o.status==='shipped'));
 const login=await store.request('/login',{email:'anything',password:'x'});assert.equal(login.user.email,'anything');assert.ok(!values.get('kat-pitch-user').includes('password'));
 const signup=await store.request('/signup',{});assert.ok(signup.user.name);
 const order=await store.create({},[]);assert.equal(order.status,'awaiting_payment');assert.ok(order.customer.address);assert.equal((await store.orders()).length,7);
 const proof=await store.proof(order.id);assert.equal(proof.status,'proof_uploaded');assert.equal(proof.proofs[0].name,'sample-payment-proof.pdf');
 assert.equal((await store.transition(order.id,'paid')).status,'paid');assert.equal((await store.transition(order.id,'packed')).status,'packed');
 const shipped=await store.transition(order.id,'shipped');assert.ok(shipped.courier);assert.ok(shipped.tracking);assert.equal(shipped.messages.at(-1).status,'Sent (simulated)');
 const file=await store.file('anything');assert.equal(file.type,'application/pdf');assert.match(await file.text(),/^%PDF-1.4/);
 store.reset();assert.equal((await store.orders()).length,6);
});
test('walkthrough still works when browser storage is blocked',async()=>{
 const {store}=presentation(false);const order=await store.create({},[]);assert.ok((await store.orders()).some(o=>o.id===order.id));await store.proof(order.id);assert.equal((await store.orders()).find(o=>o.id===order.id).status,'proof_uploaded');
});
