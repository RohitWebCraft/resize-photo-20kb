// FormFit image zoom viewer: tap any <img class="zoomable"> to open.
(function(){
  let m,img,info,stage,s=1,x=0,y=0,fit=1,W=1,H=1;const pts=new Map();let pd=0;
  const dpr=window.devicePixelRatio||1;
  function apply(){
    img.style.transform='translate('+x+'px,'+y+'px) scale('+s+')';
    img.classList.toggle('px',s*dpr>=2);
    info.textContent=Math.round(s*dpr*100)+'% · '+W+'×'+H+' px';
  }
  function center(ns){
    const r=stage.getBoundingClientRect();s=ns;x=(r.width-W*s)/2;y=(r.height-H*s)/2;apply();
  }
  function zoomAt(cx,cy,f){
    const ns=Math.min(64,Math.max(.1,s*f)),k=ns/s;x=cx-(cx-x)*k;y=cy-(cy-y)*k;s=ns;apply();
  }
  function mid(){const r=stage.getBoundingClientRect();return [r.width/2,r.height/2]}
  function close(){m.classList.add('hide');document.body.style.overflow='';img.removeAttribute('src')}
  function build(){
    m=document.createElement('div');m.className='zm hide';m.setAttribute('role','dialog');m.setAttribute('aria-label','Zoomed image');
    m.innerHTML='<div class="zt"><span class="zi"></span><span class="zbtns"><button data-a="out" aria-label="Zoom out">−</button><button data-a="in" aria-label="Zoom in">+</button><button data-a="fit">Fit</button><button data-a="one">100%</button><button data-a="x" aria-label="Close">✕</button></span></div><div class="zs"><img alt="Zoomed preview" draggable="false"></div>';
    document.body.appendChild(m);
    img=m.querySelector('img');info=m.querySelector('.zi');stage=m.querySelector('.zs');
    m.querySelector('.zbtns').onclick=e=>{
      const a=e.target.dataset.a;if(!a)return;const [cx,cy]=mid();
      if(a==='x')close();else if(a==='in')zoomAt(cx,cy,1.5);else if(a==='out')zoomAt(cx,cy,1/1.5);
      else if(a==='fit')center(fit);else if(a==='one')center(1/dpr);
    };
    stage.addEventListener('wheel',e=>{e.preventDefault();const r=stage.getBoundingClientRect();zoomAt(e.clientX-r.left,e.clientY-r.top,Math.exp(-e.deltaY*.0015))},{passive:false});
    stage.addEventListener('pointerdown',e=>{stage.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pts.size===2){const [a,b]=[...pts.values()];pd=Math.hypot(a.x-b.x,a.y-b.y)}});
    stage.addEventListener('pointermove',e=>{
      const p=pts.get(e.pointerId);if(!p)return;
      if(pts.size===2){
        pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
        const [a,b]=[...pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y),r=stage.getBoundingClientRect();
        if(pd)zoomAt((a.x+b.x)/2-r.left,(a.y+b.y)/2-r.top,d/pd);pd=d;
      }else{x+=e.clientX-p.x;y+=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;apply()}
    });
    const up=e=>{pts.delete(e.pointerId);pd=0};
    stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);
    stage.addEventListener('dblclick',()=>center(Math.abs(s-fit)<.01?1/dpr:fit));
    document.addEventListener('keydown',e=>{
      if(m.classList.contains('hide'))return;const [cx,cy]=mid();
      if(e.key==='Escape')close();else if(e.key==='+'||e.key==='=')zoomAt(cx,cy,1.5);else if(e.key==='-')zoomAt(cx,cy,1/1.5);
    });
  }
  function open(src){
    if(!m)build();
    m.classList.remove('hide');document.body.style.overflow='hidden';
    img.onload=()=>{
      W=img.naturalWidth;H=img.naturalHeight;
      const r=stage.getBoundingClientRect();fit=Math.min(r.width/W,r.height/H)*.95;center(fit);
    };
    img.src=src;
  }
  document.addEventListener('click',e=>{
    const t=e.target;if(t.tagName==='IMG'&&t.classList.contains('zoomable')&&t.getAttribute('src'))open(t.src);
  });
})();
