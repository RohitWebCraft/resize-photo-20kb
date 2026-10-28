const $=id=>document.getElementById(id);
const fmt=n=>n>=1048576?(n/1048576).toFixed(2)+' MB':(n/1024).toFixed(1)+' KB';
const wait=()=>new Promise(r=>setTimeout(r,30));
const isImg=f=>/^image\/(jpeg|png)$/.test(f.type);
const say=(t,c)=>{const m=$('msg');m.className='stat '+(c||'');m.textContent=t};
function zone(id,cb){
  const d=$(id),i=d.querySelector('input');
  d.ondragover=e=>{e.preventDefault();d.classList.add('on')};
  d.ondragleave=()=>d.classList.remove('on');
  d.ondrop=e=>{e.preventDefault();d.classList.remove('on');cb([...e.dataTransfer.files])};
  i.onchange=()=>{cb([...i.files]);i.value=''};
}
const loadBlob=b=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('Cannot read image'));i.src=URL.createObjectURL(b)});
const toBlob=(c,q)=>new Promise(r=>c.toBlob(r,'image/jpeg',q));
function blank(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);return [c,x]}
function scaled(c,f){if(f>=1)return c;const [o,x]=blank(Math.max(1,Math.round(c.width*f)),Math.max(1,Math.round(c.height*f)));x.drawImage(c,0,0,o.width,o.height);return o}
function sizeTarget(v,u){const n=parseFloat($(v).value);return n>0?Math.round(n*($(u).value==='MB'?1048576:1024)):null}
async function compressTo(c,target){
  for(const f of [1,.85,.7,.55,.42,.32,.24,.16,.1]){
    const cc=scaled(c,f);let lo=.05,hi=.95,found=null;
    for(let i=0;i<7;i++){const q=(lo+hi)/2,bl=await toBlob(cc,q);if(bl.size<=target){found={bl,c:cc};lo=q}else hi=q}
    if(!found){const bl=await toBlob(cc,.05);if(bl.size<=target)found={bl,c:cc}}
    if(found)return found;
  }
  return null;
}
let _u=null;
function finish(best,fname){
  if(_u)URL.revokeObjectURL(_u);_u=URL.createObjectURL(best.bl);
  $('pv').src=_u;$('pv').classList.remove('hide');
  const a=$('dl');a.href=_u;a.download=fname;a.classList.remove('hide');
  const m=$('msg');m.className='stat ok';
  m.innerHTML='✔ Done. Size: <span class="size">'+fmt(best.bl.size)+'</span> · '+best.c.width+'×'+best.c.height+' px';
}
async function output(c,fname){
  const t=sizeTarget('ck','cu');
  say(t?'Compressing…':'Creating image…');await wait();
  let best;
  if(t){best=await compressTo(c,t);if(!best){say('Could not reach that size. Try a larger size.','err');return}}
  else best={bl:await toBlob(c,.92),c};
  finish(best,fname);
}
if('serviceWorker' in navigator&&location.protocol.startsWith('http')){
  window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
