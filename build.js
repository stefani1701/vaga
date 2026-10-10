/* Assembles src/* into index.html. No dependencies: node build.js
   NOTE: replacements are passed as functions — a plain string would let
   $$ in the source be eaten as a replacement escape. */
const fs=require('fs'),p=require('path');
const src=f=>fs.readFileSync(p.join(__dirname,'src',f),'utf8');
let out=src('shell.html')
  .replace('/*__DATA__*/',()=>src('data.js'))
  .replace('/*__REC__*/',()=>src('recipes.js'))
  .replace('/*__SYNC__*/',()=>src('sync.js'))
  .replace('/*__APP__*/',()=>src('app.js'));
fs.writeFileSync(p.join(__dirname,'index.html'),out);
console.log('index.html  '+(out.length/1024).toFixed(0)+' KB');
