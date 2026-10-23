import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { openStore, email, text, passwordHash } from '../server/store.mjs';

// Password input is muted. Credentials are never written to logs or committed files.
let muted=false;
const output=new Writable({write(chunk,encoding,callback){if(!muted)process.stdout.write(chunk);callback();}});
const rl=createInterface({input:process.stdin,output,terminal:process.stdin.isTTY});
try{
 const address=email(await rl.question('Administrator email: '));
 const name=text(await rl.question('Administrator name: '),'name',100);
 process.stdout.write('New password (10+ characters; hidden): ');muted=true;
 const password=await rl.question('');muted=false;process.stdout.write('\n');
 const hashed=await passwordHash(password);
 const {db}=openStore(process.env.KAT_DB||resolve('data/kat.sqlite'));
 if(db.prepare('SELECT id FROM users WHERE email=?').get(address))throw Error('That email already exists. Choose a separate administrator email.');
 db.prepare('INSERT INTO users VALUES(?,?,?,?,?)').run(randomUUID(),address,name,hashed,'admin');db.close();
 console.log('Administrator created. Sign in at /admin.html using your new credentials.');
}catch(error){process.stderr.write('\n'+error.message+'\n');process.exitCode=1;}finally{rl.close();}
