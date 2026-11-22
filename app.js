(() => {
'use strict';
const root=document.documentElement;
const min=0.85,max=1.5,step=0.1;
const store=(key,val)=>{try{localStorage.setItem('brera-'+key,String(val));}catch(e){}};
const load=(key)=>{try{return localStorage.getItem('brera-'+key);}catch(e){return null;}};
let size=Number(load('size'))||1;
size=Math.max(min,Math.min(max,size));
const applySize=()=>{root.style.setProperty('--font-mult',size.toFixed(2));store('size',size)};
applySize();
document.getElementById('font-up')?.addEventListener('click',()=>{size=Math.min(max,+(size+step).toFixed(2));applySize()});
document.getElementById('font-down')?.addEventListener('click',()=>{size=Math.max(min,+(size-step).toFixed(2));applySize()});
document.getElementById('font-reset')?.addEventListener('click',()=>{size=1;applySize()});
const contrast=document.getElementById('contrast');
const applyContrast=(on)=>{root.classList.toggle('high-contrast',on);contrast?.setAttribute('aria-pressed',String(on));if(contrast) contrast.textContent=on?'Disattiva contrasto elevato':'Attiva contrasto elevato';store('contrast',on?'1':'0')};
applyContrast(load('contrast')==='1');
contrast?.addEventListener('click',()=>applyContrast(!root.classList.contains('high-contrast')));
const menu=document.querySelector('.menu-toggle');
const mobile=document.getElementById('mobile-navigation');
const closeMenu=()=>{if(menu&&mobile){menu.setAttribute('aria-expanded','false');mobile.hidden=true}};
if(menu&&mobile){
 menu.hidden=false;
 menu.addEventListener('click',()=>{const opening=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(opening));mobile.hidden=!opening});
 mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('keydown',(ev)=>{if(ev.key==='Escape')closeMenu()});
}
const search=document.getElementById('chapter-search');
const cards=Array.from(document.querySelectorAll('.chapter'));
const navLinks=Array.from(document.querySelectorAll('.chapter-links a'));
const status=document.getElementById('search-status');
const empty=document.getElementById('no-results');
const normalize=(s)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('it-IT').trim();
const filter=(raw)=>{
 const q=normalize(raw);
 let count=0;
 cards.forEach((el)=>{const found=!q||normalize(el.textContent).includes(q);el.hidden=!found;if(found)count++});
 navLinks.forEach((a)=>{const target=document.querySelector(a.getAttribute('href'));a.hidden=Boolean(target&&target.hidden)});
 if(empty)empty.hidden=count>0;
 if(status)status.textContent=q?`${count} ${count===1?'tema trovato':'temi trovati'}`:`${cards.length} temi disponibili`;
};
search?.addEventListener('input',()=>filter(search.value));
window.addEventListener('hashchange',()=>{const el=document.querySelector(location.hash||'#top');if(el?.classList.contains('chapter')&&el.hidden){if(search){search.value='';filter('')}}});

// The reading mode hides only chapter details; the full text is always still present.
const quickToggle=document.getElementById('quick-mode');
const quickStatus=document.getElementById('reading-mode-status');
const setQuick=(on)=>{
 document.body.classList.toggle('quick-active',on);
 quickToggle?.setAttribute('aria-pressed',String(on));
 if(quickToggle)quickToggle.textContent=on?'Mostra il testo completo':'Attiva lettura rapida';
 if(quickStatus)quickStatus.textContent=on?'Solo i concetti essenziali':'Testo completo visibile';
 store('quick',on?'1':'0');
};
setQuick(load('quick')==='1');
quickToggle?.addEventListener('click',()=>setQuick(!document.body.classList.contains('quick-active')));
// Search can find material inside the full text: reveal it immediately when used.
search?.addEventListener('input',()=>{
 if(search.value.trim()&&document.body.classList.contains('quick-active'))setQuick(false);
});
})();
