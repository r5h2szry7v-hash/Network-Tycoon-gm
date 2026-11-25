(()=>{
 'use strict';
 const assets=window.PortfolioCompanionAssets||{};
 const pups=Array.isArray(assets.characters)?assets.characters:[];
 const moods=new Set(Array.isArray(assets.moods)?assets.moods:[]);
 function announce(target,{pup,line,mood='idle'}={}){
  if(!target)return null;const data=pups.find(item=>item.name===pup||item.id===String(pup||'').toLowerCase())||pups[0];if(!data?.src)return null;
  target.querySelector('.portfolio-companion')?.remove();const card=document.createElement('div');card.className='portfolio-companion';card.dataset.mood=moods.has(mood)?mood:'idle';card.setAttribute('role','status');card.setAttribute('aria-live','polite');
  const image=document.createElement('img');image.src=data.src;image.alt='';const copy=document.createElement('span');const label=document.createElement('strong');label.textContent=data.name+' says';const lines=Array.isArray(data.lines)?data.lines:[];const message=document.createElement('span');message.textContent=line||lines[Math.floor(Math.random()*lines.length)]||'';copy.append(label,message);card.append(image,copy);const anchor=target.querySelector('.win-actions,.celebration-machine,.modal-actions');if(anchor)target.insertBefore(card,anchor);else target.append(card);return card;
 }
 function mountTinker(){
  const modal=document.getElementById('win-modal'),title=document.getElementById('win-title');if(!modal||!title||!pups.length)return;
  let count=0;const observe=()=>{if(modal.hidden)return;count++;const data=pups[count%pups.length];announce(modal.querySelector('.home-dialog'),{pup:data.name,line:data.lines[Math.floor(Math.random()*data.lines.length)],mood:'celebrate'})};
  new MutationObserver(observe).observe(modal,{attributes:true,attributeFilter:['hidden']});
  if(!modal.hidden)observe();
 }
 function mountCritterRescue(){
  const dialog=document.getElementById('winDialog');if(!dialog)return;
  const observe=()=>{if(!dialog.open)return;announce(dialog.querySelector('.win-card'),{pup:'Pooch',line:'All three friends are home safe. That was a thoughtful trail!',mood:'celebrate'})};
  new MutationObserver(observe).observe(dialog,{attributes:true,attributeFilter:['open']});
  if(dialog.open)observe();
 }
 function mountMatchGarden(){
  const cover=document.getElementById('modalCover');if(!cover)return;
  const observe=()=>{const modal=cover.querySelector('#modal');if(!modal)return;if(!cover.classList.contains('open')){delete modal.dataset.companionShown;return}const heading=modal.querySelector('.win-copy h2');if(!heading||!/^beautifully matched!/i.test(heading.textContent.trim())||modal.dataset.companionShown)return;modal.dataset.companionShown='yes';announce(modal,{pup:'Pooch',line:'Another garden level blooms! You’re getting quicker at spotting those pairs.',mood:'celebrate'})};
  new MutationObserver(observe).observe(cover,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  observe();
 }
 window.PortfolioCompanions=Object.freeze({announce,mountTinker,mountCritterRescue,mountMatchGarden,moods:Object.freeze([...moods])});
 function mount(){mountTinker();mountCritterRescue();mountMatchGarden()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
