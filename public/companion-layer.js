(()=>{
 'use strict';
 const pups=[
  {name:'Mack',src:'/images/dog-dark.webp',lines:['That machine came together nicely.','Solid work. You gave every part a purpose.']},
  {name:'Pooch',src:'/images/dog-tan.webp',lines:['The marble made it! Let’s see what the next machine asks of us.','Bell rung! I knew those parts would work together.']}
 ];
 const styles=`
 .portfolio-companion{display:flex;align-items:center;gap:10px;margin:12px 0;padding:9px 12px;border:1px solid #a9cfb5;border-left:4px solid #42966a;border-radius:14px;background:#effaf2;color:#203b2d;text-align:left;font-size:.9rem;font-weight:750;line-height:1.4;animation:portfolioCompanionEnter .42s cubic-bezier(.2,.9,.25,1.15) both}
 .portfolio-companion img{width:52px;height:52px;flex:none;object-fit:contain;filter:drop-shadow(0 3px 4px #183c3450);animation:portfolioPupBob 1.9s ease-in-out infinite;transform-origin:center bottom}
 .portfolio-companion strong{display:block;color:#28765d;font-size:.72rem;letter-spacing:.05em;text-transform:uppercase}
 html[data-portfolio-color-mode=dark] .portfolio-companion,html.dark-mode .portfolio-companion{background:#25382d;border-color:#547c5c;color:#f0fff2}
 html[data-portfolio-color-mode=dark] .portfolio-companion strong,html.dark-mode .portfolio-companion strong{color:#a9e2be}
 @media(prefers-color-scheme:dark){html[data-portfolio-color-mode=system] .portfolio-companion{background:#25382d;border-color:#547c5c;color:#f0fff2}html[data-portfolio-color-mode=system] .portfolio-companion strong{color:#a9e2be}}
 @keyframes portfolioPupBob{0%,100%{transform:translateY(0) rotate(-2deg)}28%{transform:translateY(-5px) rotate(2deg)}56%{transform:translateY(-8px) rotate(-1deg)}80%{transform:translateY(-2px) rotate(2deg)}}
 @keyframes portfolioCompanionEnter{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
 @media(prefers-reduced-motion:reduce){.portfolio-companion,.portfolio-companion img{animation:none!important;transition:none!important}}
 html.pref-reduced-motion .portfolio-companion,html.pref-reduced-motion .portfolio-companion img{animation:none!important;transition:none!important}
 @media(max-width:600px){.portfolio-companion{gap:7px;padding:8px;font-size:.82rem}.portfolio-companion img{width:44px;height:44px}}
 `;
 function addStyles(){if(document.getElementById('portfolio-companion-styles'))return;const style=document.createElement('style');style.id='portfolio-companion-styles';style.textContent=styles;document.head.append(style)}
 function announce(target,{pup,line}={}){
  if(!target)return null;addStyles();const data=pups.find(item=>item.name===pup)||pups[0];
  target.querySelector('.portfolio-companion')?.remove();const card=document.createElement('div');card.className='portfolio-companion';card.setAttribute('role','status');card.setAttribute('aria-live','polite');
  const image=document.createElement('img');image.src=data.src;image.alt='';const copy=document.createElement('span');const label=document.createElement('strong');label.textContent=data.name+' says';const message=document.createElement('span');message.textContent=line||data.lines[Math.floor(Math.random()*data.lines.length)];copy.append(label,message);card.append(image,copy);const anchor=target.querySelector('.win-actions,.celebration-machine,.modal-actions');if(anchor)target.insertBefore(card,anchor);else target.append(card);return card;
 }
 function mountTinker(){
  const modal=document.getElementById('win-modal'),title=document.getElementById('win-title');if(!modal||!title)return;
  let count=0;const observe=()=>{if(modal.hidden)return;count++;const data=pups[count%pups.length];announce(modal.querySelector('.home-dialog'),{pup:data.name,line:data.lines[Math.floor(Math.random()*data.lines.length)]})};
  new MutationObserver(observe).observe(modal,{attributes:true,attributeFilter:['hidden']});
  if(!modal.hidden)observe();
 }
 function mountCritterRescue(){
  const dialog=document.getElementById('winDialog');if(!dialog)return;
  const observe=()=>{if(!dialog.open)return;announce(dialog.querySelector('.win-card'),{pup:'Pooch',line:'All three friends are home safe. That was a thoughtful trail!'})};
  new MutationObserver(observe).observe(dialog,{attributes:true,attributeFilter:['open']});
  if(dialog.open)observe();
 }
 function mountMatchGarden(){
  const cover=document.getElementById('modalCover');if(!cover)return;
  const observe=()=>{const modal=cover.querySelector('#modal');if(!modal)return;if(!cover.classList.contains('open')){delete modal.dataset.companionShown;return}const heading=modal.querySelector('.win-copy h2');if(!heading||!/^beautifully matched!/i.test(heading.textContent.trim())||modal.dataset.companionShown)return;modal.dataset.companionShown='yes';announce(modal,{pup:'Pooch',line:'Another garden level blooms! You’re getting quicker at spotting those pairs.'})};
  new MutationObserver(observe).observe(cover,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  observe();
 }
 window.PortfolioCompanions=Object.freeze({announce,mountTinker,mountCritterRescue,mountMatchGarden});
 function mount(){mountTinker();mountCritterRescue();mountMatchGarden()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
