'use strict';
const colors = [
  ['Scarlet','#ed0900'],['Amber','#dc731c'],['Gold','#ffdf60'],['Ivory','#ffeaa4'],['White','#f7f7f2'],['Silver','#c5c6c2'],['Stone','#777b72'],['Azure','#5476b7'],['Leaf','#569447'],['Clay','#b18162'],
  ['Crimson','#980c08'],['Blood red','#b20b06'],['Umber','#453326'],['Rust','#602708'],['Forest','#173f24'],['Moss','#286530'],['Midnight','#101455'],['Indigo','#2e2d7d'],['Charcoal','#3f423d'],['Obsidian','#171916']
];
const original = document.querySelector('#original');
const canvas = document.querySelector('#emblems');
const ctx = canvas.getContext('2d', {willReadFrequently:true});
const palette = document.querySelector('#palette');
const status = document.querySelector('#selection');
const reset = document.querySelector('#reset');
// Interior bounds preserve the original carved stone frames and lower controls.
const columns = [[30,79],[110,158],[185,232],[258,304],[334,382],[410,455],[485,532],[558,607]];
const rows = [[12,72],[98,158],[183,244],[267,329]];
let pixels;
let ready = false;
function chooseColor(index) {
  if (!ready) return;
  const [name,hex] = colors[index];
  const rgb = [1,3,5].map(start=>parseInt(hex.slice(start,start+2),16));
  const layer = ctx.createImageData(640,426);
  for(const [top,bottom] of rows) for(const [left,right] of columns) {
    for(let y=top;y<bottom;y++) for(let x=left;x<right;x++) {
      const p=(y*640+x)*4;
      const lum=.2126*pixels[p]+.7152*pixels[p+1]+.0722*pixels[p+2];
      // Colorize the brighter engraving, keeping recesses dark and texture visible.
      const relief=Math.max(0,Math.min(1,(lum-19)/95));
      const edge=Math.min(1,(x-left)/3,(right-1-x)/3,(y-top)/3,(bottom-1-y)/3);
      for(let c=0;c<3;c++) layer.data[p+c]=Math.min(255,rgb[c]*(.35+lum/155)+lum*.12);
      layer.data[p+3]=Math.round(relief*edge*235);
    }
  }
  ctx.clearRect(0,0,640,426);
  ctx.putImageData(layer,0,0);
  palette.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  status.textContent=name+' · All 32 emblems';
  reset.disabled=false;
}
colors.forEach(([name,hex],index)=>{
  const button=document.createElement('button');
  button.type='button';
  button.className='swatch';
  button.title=name;
  button.setAttribute('aria-label',name+' — highlight all emblems');
  button.setAttribute('aria-pressed','false');
  button.style.cssText=`left:${(218+(index%10)*32)/640*100}%;top:${(index<10?345:379)/426*100}%;width:${23/640*100}%;height:${23/426*100}%;--color:${hex}`;
  button.disabled=true;
  button.addEventListener('click',()=>chooseColor(index));
  button.addEventListener('keydown',event=>{
    const offset={ArrowRight:1,ArrowLeft:-1,ArrowDown:10,ArrowUp:-10}[event.key];
    if(offset!==undefined){event.preventDefault();const next=(index+offset+20)%20;palette.children[next].focus();chooseColor(next);}
  });
  palette.append(button);
});
function initialize(){
  if(ready)return;
  ctx.drawImage(original,0,0,640,426);
  pixels=ctx.getImageData(0,0,640,426).data;
  ctx.clearRect(0,0,640,426);
  ready=true;
  palette.querySelectorAll('button').forEach(button=>button.disabled=false);
}
original.addEventListener('load',initialize);
if(original.complete&&original.naturalWidth)initialize();
original.addEventListener('error',()=>{status.textContent='The artwork could not load. Please reload the page.';});
reset.addEventListener('click',()=>{
  ctx.clearRect(0,0,640,426);
  palette.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed','false'));
  status.textContent='Choose a color below the emblems';reset.disabled=true;
});
const mobile=matchMedia('(max-width:600px)');
function resizePalette(){palette.classList.toggle('mobile',mobile.matches);}
mobile.addEventListener('change',resizePalette);resizePalette();
