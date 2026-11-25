(()=>{
'use strict';

const dogAssets=window.PortfolioCompanionAssets?.characters||[];
const DOGS=Object.fromEntries(dogAssets.map(({name,src})=>[name,{src}]));
if(!DOGS.Mack||!DOGS.Pooch)throw new Error('Network Tycoon requires Mack and Pooch in the shared companion registry.');
const CATS=[
 {name:'Kitty',src:'/paws/images/cat-black-sleek.webp',lines:['Oops. I was napping.','Pounce? You moved.','Nice map. Mine now.']},
 {name:'Kit’n',src:'/paws/images/cat-black-fluffy.webp',lines:['This map is my box.','I allow this visit.','Region claimed!']},
 {name:'Westley',src:'/paws/images/cat-gray.webp',lines:['I came when I chose.','Quite the territory.','I was supervising.']}
];
const SVG='http://www.w3.org/2000/svg',PREFS_KEY='network-tycoon-companion-settings-v1', $=selector=>document.querySelector(selector);
const DEFAULT_PREFS={guidance:true,catFrequency:'regular',animationPace:'playful'};
const CAT_TIMING={occasional:{min:30000,max:40000},regular:{min:5000,max:12000},frequent:{min:2000,max:7000}};
let prefs=readPrefs(),catTimer=0,catGroup=null,catRemaining=0,catLastTick=Date.now(),lastMapInteraction=0,lastModalTitle='',lastToast='',lastRecap='',lastCustomerCount=null,lastMilestone=0,lastFinanceReaction=0,eventQueue=[],seenEventKeys=new Set(),reactionTimer=0,settingsObserver=null;

function readPrefs(){try{return{...DEFAULT_PREFS,...JSON.parse(localStorage.getItem(PREFS_KEY)||'{}')}}catch{return{...DEFAULT_PREFS}}}
function savePrefs(){try{localStorage.setItem(PREFS_KEY,JSON.stringify(prefs))}catch{}}
function enabled(){return window.PortfolioCompanionAssets?.areCompanionsEnabled?.()!==false}
function randomBetween(min,max){return min+Math.random()*(max-min)}
function applyAnimationPace(){document.documentElement.classList.toggle('nt-companions-gentle',prefs.animationPace==='gentle')}

const styles=`
.nt-story-narrator,.nt-map-companion-helper{--nt-companion-ink:#244a42;--nt-companion-accent:#28765d}
.nt-story-narrator{display:flex;align-items:center;gap:8px;margin:8px 0 10px;padding:7px 9px;border:1px solid #c7e4d4;border-radius:13px;background:linear-gradient(110deg,#f2fff7,#f4f5ff);color:#244a42;font-size:.82rem;line-height:1.38;font-weight:700}
.nt-story-narrator img{width:44px;height:44px;flex:0 0 44px;object-fit:contain;filter:drop-shadow(0 3px 4px #183c3450);animation:nt-pup-bob 2.2s ease-in-out infinite;transform-origin:center bottom;will-change:transform}
.nt-story-narrator strong{display:block;color:#28765d;font-size:.72rem;letter-spacing:.04em;text-transform:uppercase}
.nt-coach-portrait{width:100%;height:100%;object-fit:contain;padding:2px;filter:drop-shadow(0 3px 4px #183c3450);animation:nt-pup-bob 2.05s ease-in-out infinite;transform-origin:center bottom;will-change:transform}
.nt-coach-voice{display:flex;align-items:center;gap:7px;margin-top:6px;color:#28765d;font-size:.78rem;font-weight:800;line-height:1.35}
.nt-coach-voice img{width:34px;height:34px;flex:0 0 34px;object-fit:contain;filter:drop-shadow(0 3px 3px #183c3450);animation:nt-pup-bob 2.2s ease-in-out infinite;transform-origin:center bottom;will-change:transform}
.nt-map-companion-helper{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:8px 0;padding:7px 9px;border:1px solid #c6dfd4;border-radius:14px;background:linear-gradient(110deg,#f3fff8,#f5f7ff);color:#183e3a;box-shadow:0 5px 14px #193e3012}
.nt-helper-button{display:flex;align-items:center;gap:7px;min-height:40px;padding:4px 10px;border:1px solid #85baa0;border-radius:12px;background:#e1f5e9;color:#17513e;font:850 .8rem/1.2 system-ui,sans-serif;cursor:pointer;transition:transform .18s,box-shadow .18s}
.nt-helper-button:hover{transform:translateY(-2px);box-shadow:0 4px 10px #193e3025}
.nt-helper-faces{display:flex;align-items:center}
.nt-helper-faces img{width:34px;height:34px;object-fit:contain;margin-left:-4px;filter:drop-shadow(0 3px 3px #183c3450);animation:nt-pup-bob 2.15s ease-in-out infinite;transform-origin:center bottom;will-change:transform}
.nt-helper-faces img:first-child{margin-left:0;animation-delay:-.75s}
.nt-helper-message{display:none;align-items:center;gap:8px;flex:1 1 220px;min-width:180px;padding:4px 3px 4px 7px;font-size:.8rem;line-height:1.38;font-weight:750}
.nt-helper-message.is-open{display:flex}.nt-helper-message[hidden]{display:none!important}
.nt-helper-message img{width:42px;height:42px;flex:0 0 42px;object-fit:contain;filter:drop-shadow(0 3px 3px #183c3450);animation:nt-pup-bob 2.15s ease-in-out infinite;transform-origin:center bottom;will-change:transform}
.nt-helper-message p{margin:0}.nt-helper-actions{display:flex;gap:5px;margin-left:auto}
.nt-helper-actions button{min-width:36px;min-height:36px;border:1px solid #c6dfd4;border-radius:10px;background:#fff;color:#28534a;font-weight:900}
.nt-helper-actions button:focus-visible,.nt-helper-button:focus-visible{outline:3px solid #f3b94f;outline-offset:2px}
.nt-companion-settings{padding:12px;border:1px solid #c7e4d4;border-radius:14px;background:linear-gradient(110deg,#f2fff7,#f4f5ff)}
.nt-companion-settings .settings-toggle-list{margin-bottom:9px}
.nt-companion-settings .setting-field{margin-top:8px}
.nt-map-cat{cursor:pointer;overflow:visible;transition:opacity .22s ease}
.nt-map-cat-motion{transform-box:fill-box;transform-origin:center;animation:nt-cat-drift 3.4s ease-in-out infinite}
.nt-map-cat image{pointer-events:none;filter:drop-shadow(0 3px 3px #183c3440)}
.nt-map-cat:focus{outline:none;filter:drop-shadow(0 0 5px #f0ad44)}
.nt-map-cat-hit{fill:transparent;stroke:transparent;pointer-events:all;cursor:pointer}
.nt-map-cat-bubble{pointer-events:none}.nt-map-cat-bubble rect{fill:#fff9ec;stroke:#8a6943;stroke-width:2}.nt-map-cat-bubble text{fill:#3a302a;font:800 14px system-ui,sans-serif}
.nt-map-cat-quiet{opacity:0!important;pointer-events:none!important}
.nt-map-cat-poked .nt-map-cat-motion{animation:nt-cat-pounce .58s cubic-bezier(.2,1.5,.3,1) both!important}
.nt-map-cat-poked image{filter:drop-shadow(0 0 7px #ffc547)}
.nt-event-reaction{position:fixed;z-index:35;left:50%;bottom:calc(20px + env(safe-area-inset-bottom));display:grid;grid-template-columns:48px minmax(0,1fr) 32px;align-items:center;gap:9px;width:min(470px,calc(100vw - 24px));padding:9px 10px;border:1px solid #8bc5a0;border-left:5px solid #32a078;border-radius:16px;background:linear-gradient(110deg,#f3fff8,#f5f5ff);color:#1d3d3a;box-shadow:0 14px 34px #102b3c3d;transform:translate(-50%,18px) scale(.98);opacity:0;pointer-events:none;transition:opacity .24s ease,transform .32s cubic-bezier(.2,.9,.25,1.15)}
.nt-event-reaction.is-visible{opacity:1;transform:translate(-50%,0) scale(1);pointer-events:auto}
.nt-event-reaction[data-kind="service"]{border-color:#e1a36c;border-left-color:#e08343;background:linear-gradient(110deg,#fff7ed,#fff9f0)}
.nt-event-reaction[data-kind="capacity"]{border-color:#e0be68;border-left-color:#d19a27;background:linear-gradient(110deg,#fffbea,#fff8ec)}
.nt-event-reaction[data-kind="finance"]{border-color:#8daec8;border-left-color:#4d82ad;background:linear-gradient(110deg,#f0f8ff,#f7f5ff)}
.nt-event-reaction img{width:46px;height:46px;object-fit:contain;filter:drop-shadow(0 3px 4px #183c3450);animation:nt-pup-bob 1.8s ease-in-out infinite;transform-origin:center bottom;will-change:transform}
.nt-event-reaction-copy{min-width:0;font-size:.83rem;line-height:1.35;font-weight:750}
.nt-event-reaction-copy strong{display:block;margin-bottom:2px;color:#246b55;font-size:.68rem;letter-spacing:.05em;text-transform:uppercase}
.nt-event-reaction button{width:32px;height:32px;border:1px solid #b8d3c5;border-radius:10px;background:#fff;color:#31584d;font-size:1.15rem;font-weight:900}
.nt-event-reaction button:focus-visible{outline:3px solid #f3b94f;outline-offset:2px}
.nt-companion-settings select{min-height:42px;width:100%;padding:8px 10px;border:1px solid #cbded4;border-radius:10px;background:#fff;color:#244a42;font:700 .85rem system-ui,sans-serif}
html.dark-mode .nt-story-narrator,html.dark-mode .nt-map-companion-helper{background:linear-gradient(110deg,#203a32,#252a40);border-color:#456e5a;color:#effff4;box-shadow:0 5px 14px #0004}
html.dark-mode .nt-story-narrator strong,html.dark-mode .nt-coach-voice{color:#a9e2be}
html.dark-mode .nt-helper-button{background:#29483b;border-color:#5b9b78;color:#eafff1}
html.dark-mode .nt-helper-actions button{background:#263b35;border-color:#466d5a;color:#eafff1}
html.dark-mode .nt-map-cat-bubble rect{fill:#26352f;stroke:#a7cf98}html.dark-mode .nt-map-cat-bubble text{fill:#f1f5e8}
html.dark-mode .nt-companion-settings{background:linear-gradient(110deg,#203a32,#252a40);border-color:#456e5a;color:#effff4}
html.dark-mode .nt-companion-settings select{background:#253b35;border-color:#52735f;color:#effff4}
html.dark-mode .nt-event-reaction{background:linear-gradient(110deg,#203a32,#252a40);border-color:#456e5a;border-left-color:#63ba8b;color:#effff4}
html.dark-mode .nt-event-reaction[data-kind="service"]{background:linear-gradient(110deg,#473528,#342b31);border-color:#8d6548;border-left-color:#e08343}
html.dark-mode .nt-event-reaction[data-kind="capacity"]{background:linear-gradient(110deg,#443b25,#342f30);border-color:#927b42;border-left-color:#dfb952}
html.dark-mode .nt-event-reaction[data-kind="finance"]{background:linear-gradient(110deg,#263a48,#302d45);border-color:#526d82;border-left-color:#78add1}
html.dark-mode .nt-event-reaction-copy strong{color:#b7e9cb}
html.dark-mode .nt-event-reaction button{background:#263b35;border-color:#52735f;color:#effff4}
html.nt-companions-gentle .nt-story-narrator img,html.nt-companions-gentle .nt-coach-portrait,html.nt-companions-gentle .nt-coach-voice img,html.nt-companions-gentle .nt-helper-faces img,html.nt-companions-gentle .nt-helper-message img,html.nt-companions-gentle .nt-event-reaction img{animation-duration:3.8s}
html.nt-companions-gentle .nt-map-cat-motion{animation-duration:6s}
@keyframes nt-pup-bob{0%,100%{transform:translateY(0) rotate(-2deg) scale(1)}24%{transform:translateY(-5px) rotate(1deg) scale(1.04)}52%{transform:translateY(-8px) rotate(3deg) scale(1.02)}78%{transform:translateY(-2px) rotate(-1deg) scale(1.04)}}
@keyframes nt-cat-drift{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-4px) rotate(2deg)}}
@keyframes nt-cat-pounce{0%{transform:scale(1) rotate(0)}35%{transform:scale(1.24) rotate(-12deg)}70%{transform:scale(.92) rotate(8deg)}100%{transform:scale(1) rotate(0)}}
@media(max-width:680px){.nt-story-narrator{font-size:.8rem;gap:6px;margin:7px 0 8px;padding:6px 8px}.nt-story-narrator img{width:36px;height:36px;flex-basis:36px}.nt-map-companion-helper{gap:6px;margin:7px 0;padding:6px}.nt-helper-button{min-height:42px;padding:4px 8px;font-size:.78rem}.nt-helper-message{flex-basis:100%;min-width:0;font-size:.82rem}.nt-map-cat-bubble text{font-size:15px}.nt-event-reaction{bottom:calc(74px + env(safe-area-inset-bottom));grid-template-columns:42px minmax(0,1fr) 34px;gap:7px;padding:8px}.nt-event-reaction img{width:40px;height:40px}.nt-event-reaction-copy{font-size:.8rem}.nt-companion-settings{padding:10px}}
@media(prefers-reduced-motion:reduce){.nt-story-narrator img,.nt-coach-portrait,.nt-coach-voice img,.nt-helper-faces img,.nt-helper-message img,.nt-map-cat-motion,.nt-event-reaction img{animation:none!important;transition:none!important}}
html.pref-reduced-motion .nt-story-narrator img,html.pref-reduced-motion .nt-coach-portrait,html.pref-reduced-motion .nt-coach-voice img,html.pref-reduced-motion .nt-helper-faces img,html.pref-reduced-motion .nt-helper-message img,html.pref-reduced-motion .nt-map-cat-motion,html.pref-reduced-motion .nt-event-reaction,html.pref-reduced-motion .nt-event-reaction img{animation:none!important;transition:none!important}
`;

const storyLines={
 1:['Pooch','Let’s pick a neighborhood and get your first connection underway.'],
 2:['Mack','Two hundred fifty customers! I’ll keep count while you grow the network.'],
 3:['Pooch','Four neighborhoods connected. Now we can help more of town get online.'],
 4:['Mack','The first communities are thriving. Let’s find two more places to serve.'],
 5:['Pooch','Reliable service earns trust. Let’s listen closely and keep those connections healthy.'],
 6:['Mack','A new region means a fresh start. Let’s connect its first neighborhood.'],
 7:['Pooch','Fast Fiber gives busy neighborhoods more room to grow.'],
 8:['Mack','Competition is waking up. Let’s stay ahead by reaching more neighborhoods.'],
 9:['Pooch','Every new customer is counting on us. I’ll help keep the town growing.'],
 10:['Mack','The company has a wider footprint now. Let’s establish service in one more region.'],
 11:['Pooch','Good growth should pay for itself. Let’s keep monthly cash flow positive.'],
 12:['Mack','Sixteen neighborhoods is a real network. Let’s keep every connection dependable.'],
 13:['Pooch','Five thousand customers! There are still more neighbors to welcome.'],
 14:['Mack','Four regions puts us on the county map. Let’s keep extending reliable service.'],
 15:['Pooch','Let’s put Fast Fiber where demand is strongest and capacity matters most.'],
 16:['Mack','A full year of positive cash flow is a strong foundation. Keep balancing growth and costs.'],
 17:['Pooch','Twenty-four neighborhoods connected. This city is growing with us.'],
 18:['Mack','The final goal is in sight. Let’s build lasting revenue across the whole network.']
};

const REACTIONS={
 build:['Pooch','A new neighborhood is online! That gives the town another place to grow.'],
 capacity:['Mack','Capacity is getting tight here. A little more headroom can protect service as customers grow.'],
 service:['Mack','Service needs attention in a neighborhood. Let’s get the network healthy before more customers are affected.'],
 finance:['Mack','That choice changes the company’s cash cushion. Keep an eye on what remains for repairs and the next build.']
};

function addStyles(){if($('#nt-companion-styles'))return;const style=document.createElement('style');style.id='nt-companion-styles';style.textContent=styles;document.head.append(style)}
function addNarration(container,pup,line,key,mood='think'){
 if(!container||!enabled())return;
 if(container.dataset.ntNarration===key)return;
 container.dataset.ntNarration=key;
 container.querySelector('.nt-story-narrator')?.remove();
 const row=document.createElement('div');row.className='nt-story-narrator';row.dataset.mood=mood;
 const image=document.createElement('img');image.src=DOGS[pup].src;image.alt='';
 const words=document.createElement('span'),name=document.createElement('strong'),speech=document.createElement('span');
 name.textContent=pup+' says';speech.textContent=line;words.append(name,speech);row.append(image,words);
 const title=container.querySelector('h3');if(title)title.before(row);else container.prepend(row);
}
function decorateStory(){
 const card=$('#story-campaign-card');if(!card)return;
 if(!enabled()){card.querySelector('.nt-story-narrator')?.remove();delete card.dataset.ntNarration;return;}
 if(card.classList.contains('hidden'))return;
 const copy=card.querySelector('.story-card-copy');if(!copy)return;
 const title=copy.querySelector('h3')?.textContent?.trim()||'',eyebrow=copy.querySelector('.eyebrow')?.textContent||'',chapter=Number(eyebrow.match(/CHAPTER\s+(\d+)/i)?.[1]||0),complete=card.classList.contains('is-complete'),finished=card.classList.contains('is-finished');
 let pair;
 if(finished&&eyebrow.includes('STORY ONE'))pair=['Pooch','We connected the town! Ready for the next story, or shall we keep building freely?'];
 else if(finished)pair=['Mack','What a network. You can keep building in free play whenever you like.'];
 else if(complete)pair=[chapter%2?'Pooch':'Mack','Goal reached! Shall we see what the next chapter brings?'];
 else pair=storyLines[chapter]||['Mack','I’ll keep an eye on the map while you decide where to grow.'];
 addNarration(copy,pair[0],pair[1],[eyebrow,title,complete,finished].join('|'),complete||finished?'reassure':'think');
}
function decorateCoach(){
 const coach=$('#story-coach');if(!coach)return;
 const face=coach.querySelector('.story-coach-icon'),copy=coach.querySelector('.story-coach-copy');
 if(!enabled()){if(face?.dataset.ntOriginal)face.textContent=face.dataset.ntOriginal;copy?.querySelector('.nt-coach-voice')?.remove();delete coach.dataset.ntNarration;return;}
 const title=copy?.querySelector('strong')?.textContent?.trim()||'',body=copy?.querySelector('small')?.textContent?.trim()||'',key=[coach.dataset.guideStep,title,body].join('|');if(coach.dataset.ntNarration===key)return;coach.dataset.ntNarration=key;
 const step=Number((coach.dataset.guideStep||'').replace('chapter-',''))||0,pup=step%2?'Pooch':'Mack';
 if(face){if(!face.dataset.ntOriginal)face.dataset.ntOriginal=face.textContent;face.replaceChildren();const img=document.createElement('img');img.className='nt-coach-portrait';img.dataset.mood='reassure';img.src=DOGS[pup].src;img.alt='';face.append(img);}
 if(copy){copy.querySelector('.nt-coach-voice')?.remove();const voice=document.createElement('span');voice.className='nt-coach-voice';voice.dataset.mood='reassure';const img=document.createElement('img');img.src=DOGS[pup].src;img.alt='';const words=document.createElement('span');words.textContent=pup+': '+(step===1?'I’ll help you find your way around.':step===2?'We can keep track of the important numbers together.':step===3?'Let’s handle urgent needs first; the rest can wait.':step===7?'Tap the glowing neighborhood when you’re ready.':'I’m here if you need a hand with this step.');voice.append(img,words);copy.append(voice);}
}
function refreshGuidance(){
 decorateStory();decorateCoach();
 if(!enabled()){$('.nt-map-companion-helper')?.remove();document.querySelectorAll('.nt-event-reaction').forEach(removeReaction);eventQueue=[];}
 else helper();
}

function settingsMarkup(){
 const content=$('#modal-content'),layout=content?.querySelector('.settings-layout');
 if(!layout||layout.querySelector('.nt-companion-settings'))return;
 const section=document.createElement('section');section.className='settings-section nt-companion-settings';section.innerHTML=`<h3 class="settings-subheading">Companions</h3><div class="settings-toggle-list"><label class="settings-toggle"><input role="switch" type="checkbox" data-nt-guidance ${enabled()?'checked':''}><span class="settings-toggle-copy"><strong>Mack &amp; Pooch moments</strong><small>Show guidance and celebrations across supported games.</small></span><span class="switch-track" aria-hidden="true"></span></label></div><label class="setting-field"><span>Map cat visits</span><select data-nt-cat-frequency aria-label="Map cat visit frequency"><option value="off" ${prefs.catFrequency==='off'?'selected':''}>Off</option><option value="occasional" ${prefs.catFrequency==='occasional'?'selected':''}>Occasional · about every minute</option><option value="regular" ${prefs.catFrequency==='regular'?'selected':''}>Regular · about every 35 seconds</option><option value="frequent" ${prefs.catFrequency==='frequent'?'selected':''}>Frequent · about every 20–25 seconds</option></select></label><label class="setting-field"><span>Character animation pace</span><select data-nt-animation-pace aria-label="Character animation pace"><option value="gentle" ${prefs.animationPace==='gentle'?'selected':''}>Gentle</option><option value="playful" ${prefs.animationPace==='playful'?'selected':''}>Playful</option></select></label>`;
 const audio=layout.querySelector('.settings-audio');if(audio)layout.insertBefore(section,audio);else layout.append(section);
 section.querySelector('[data-nt-guidance]').addEventListener('change',event=>{window.PortfolioCompanionAssets?.setCompanionsEnabled?.(event.currentTarget.checked);refreshGuidance();});
 section.querySelector('[data-nt-cat-frequency]').addEventListener('change',event=>{prefs.catFrequency=event.currentTarget.value;savePrefs();rescheduleCat();});
 section.querySelector('[data-nt-animation-pace]').addEventListener('change',event=>{prefs.animationPace=event.currentTarget.value;savePrefs();applyAnimationPace();});
}
function observeSettings(){
 const content=$('#modal-content');if(!content||settingsObserver)return;
 settingsObserver=new MutationObserver(settingsMarkup);settingsObserver.observe(content,{childList:true,subtree:true});settingsMarkup();
}

function svgNode(tag,attrs){const el=document.createElementNS(SVG,tag);for(const [key,value] of Object.entries(attrs||{}))el.setAttribute(key,String(value));return el}
function spot(root,w,h){
 const box=root.viewBox.baseVal,tiles=[...root.querySelectorAll('.district-tile')],mx=Math.min(88,Math.max(18,box.width*.16)),my=Math.min(78,Math.max(18,box.height*.18));
 for(let i=0;i<35;i++){const x=box.x+mx+Math.random()*Math.max(1,box.width-2*mx-w),y=box.y+my+Math.random()*Math.max(1,box.height-2*my-h),hit=tiles.some(tile=>{try{const r=tile.getBBox();return x+w>r.x-8&&x<r.x+r.width+8&&y+h>r.y-8&&y<r.y+r.height+8}catch{return false}});if(!hit)return{x,y,box}}
 return{x:box.x+box.width*.68,y:box.y+box.height*.66,box};
}
function visibleMap(root){const game=$('#game'),stage=root?.closest('.map-stage'),r=root?.getBoundingClientRect();return Boolean(root&&game&&!game.classList.contains('hidden')&&stage&&stage.getClientRects().length&&root.getClientRects().length&&r&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth)}
function modalOpen(){const modal=$('#modal');return Boolean(modal&&!modal.classList.contains('hidden')||document.querySelector('dialog[open]'))}
function storyPriorityActive(){
 const coach=$('#story-coach');if(coach&&coach.getClientRects().length)return true;
 const card=$('#story-campaign-card');return Boolean(card&&!card.classList.contains('hidden')&&card.querySelector('[data-story-continue]'));
}
function mapRecentlyUsed(){return Date.now()-lastMapInteraction<3000}
function catPaused(){return document.hidden||modalOpen()||storyPriorityActive()||mapRecentlyUsed()}
function catDelay(){const timing=CAT_TIMING[prefs.catFrequency]||CAT_TIMING.regular;return randomBetween(timing.min,timing.max)}
function catDwell(){return prefs.catFrequency==='frequent'?18000:28000}
function scheduleCat(delay=catDelay()){
 if(prefs.catFrequency==='off'||catTimer||catGroup)return;
 catTimer=setTimeout(()=>{catTimer=0;spawnCat()},delay);
}
function clearCat(){clearTimeout(catTimer);catTimer=0;if(catGroup){clearTimeout(catGroup._dismissTimer);catGroup.remove();catGroup=null}catRemaining=0}
function rescheduleCat(){clearTimeout(catTimer);catTimer=0;if(prefs.catFrequency==='off'){clearCat();return}if(catGroup)return;scheduleCat(5000)}
function quote(cat){return cat.lines[Math.floor(Math.random()*cat.lines.length)]}
function spawnCat(){
 const root=$('#city-map');if(prefs.catFrequency==='off')return;
 if(!visibleMap(root)||catPaused()){scheduleCat(4000);return}
 if(root.querySelector('.nt-map-cat'))return;
 const cat=CATS[Math.floor(Math.random()*CATS.length)],w=52,h=52,pos=spot(root,w,h);let x=pos.x,y=pos.y;const box=pos.box;
 const group=svgNode('g',{class:'nt-map-cat',role:'button',tabindex:'0','aria-label':cat.name+' is visiting the map. Tap for a reaction.',transform:`translate(${x} ${y})`});
 const motion=svgNode('g',{class:'nt-map-cat-motion'});motion.append(svgNode('circle',{class:'nt-map-cat-hit',cx:w/2,cy:h/2,r:Math.max(w,h)*.58}));motion.append(svgNode('image',{x:0,y:0,width:w,height:h,href:cat.src,preserveAspectRatio:'xMidYMid meet'}));group.append(motion);
 const react=event=>{event.preventDefault();event.stopPropagation();group.classList.remove('nt-map-cat-poked');void group.getBBox();group.classList.add('nt-map-cat-poked');const line=quote(cat);group.setAttribute('aria-label',cat.name+': '+line);group.querySelector('.nt-map-cat-bubble')?.remove();const bubble=svgNode('g',{class:'nt-map-cat-bubble'}),bx=Math.max(box.x+3,Math.min(box.x+box.width-188,x-68)),by=y-39>=box.y?y-39:y+h+3,rect=svgNode('rect',{x:bx-x,y:by-y,width:184,height:34,rx:12}),label=svgNode('text',{x:bx-x+10,y:by-y+22});label.textContent=cat.name+': '+line;bubble.append(rect,label);group.append(bubble);clearTimeout(group._dismissTimer);group._dismissTimer=setTimeout(()=>group.querySelector('.nt-map-cat-bubble')?.remove(),6800)};
 let pointerStart=null;
 group.addEventListener('pointerdown',event=>{event.stopPropagation();pointerStart={id:event.pointerId,x:event.clientX,y:event.clientY}},{passive:true});
 group.addEventListener('pointerup',event=>{event.stopPropagation();const start=pointerStart;pointerStart=null;if(start&&start.id===event.pointerId&&Math.hypot(event.clientX-start.x,event.clientY-start.y)<12){group._suppressClickUntil=Date.now()+500;react(event)}},{passive:false});
 group.addEventListener('click',event=>{if(Date.now()<group._suppressClickUntil){event.preventDefault();event.stopPropagation();return}react(event)});
 group.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();react(event)}});
 root.append(group);const mapRect=root.getBoundingClientRect(),controls=[...document.querySelectorAll('#map-expand-toggle,#map-popout-close')].filter(el=>el.getClientRects().length);let clear=false;
 for(let i=0;i<40;i++){const r=group.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,target=document.elementFromPoint(cx,cy),overlaps=controls.some(el=>{const q=el.getBoundingClientRect();return r.left<q.right&&r.right>q.left&&r.top<q.bottom&&r.bottom>q.top}),inside=r.left>=mapRect.left&&r.right<=mapRect.right&&r.top>=mapRect.top&&r.bottom<=mapRect.bottom;if(inside&&!overlaps&&group.contains(target)){clear=true;break}const next=spot(root,w,h);x=next.x;y=next.y;group.setAttribute('transform',`translate(${x} ${y})`)}
 if(!clear){const bounds=root.getBoundingClientRect(),left=Math.max(8,bounds.left),right=Math.min(innerWidth-8,bounds.right),top=Math.max(8,bounds.top),bottom=Math.min(innerHeight-8,bounds.bottom),point=root.createSVGPoint();point.x=left+(right-left)*.62;point.y=top+(bottom-top)*.58;const center=point.matrixTransform(root.getScreenCTM().inverse());x=center.x-w/2;y=center.y-h/2;group.setAttribute('transform',`translate(${x} ${y})`)}
 catGroup=group;catRemaining=catDwell();catLastTick=Date.now();
}
function tickCat(){
 if(!catGroup){return}
 if(!catGroup.isConnected){catGroup=null;catRemaining=0;scheduleCat(6000);return}
 const paused=catPaused();catGroup.classList.toggle('nt-map-cat-quiet',paused);
 const now=Date.now(),elapsed=Math.min(800,now-catLastTick);catLastTick=now;
 if(!paused)catRemaining-=elapsed;
 if(catRemaining<=0){catGroup.remove();catGroup=null;catRemaining=0;scheduleCat();}
}
function noteMapUse(event){if(event.target?.closest?.('.nt-map-cat'))return;lastMapInteraction=Date.now()}

function hints(){
 const cash=Number(($('#cash-value')?.textContent||'').replace(/[^\d-]/g,''))||0,flow=Number(($('#flow-value')?.textContent||'').replace(/[^\d-]/g,''))||0,summary=$('#territory-summary')?.textContent||'',connected=Number(summary.match(/(\d+)\s+of/i)?.[1]||0),outage=document.querySelector('.district-tile.world-struggling,.district-map-badge.outage,.district-map-badge.repair'),list=[];
 if(cash<45000)list.push(['Mack',`Cash is getting tight (${cash.toLocaleString()}). Check net flow and avoid stacking big projects until reserves recover.`]);
 if(flow<0)list.push(['Pooch','Monthly net flow is negative. Review pricing, upkeep, and new construction before advancing too many months.']);
 if(outage)list.push(['Mack','A neighborhood may need attention. Open its map tile and check the service status or repair options.']);
 if(connected<4)list.push(['Pooch','Compare neighborhood demand on the map before choosing where to make your next connection.']);
 list.push(['Mack','Fast Fiber adds capacity in an active neighborhood. Use it where customer demand is pressing against the limit.'],['Pooch','The Next Moves queue gathers repairs, opportunities, and requests so you can handle what needs attention first.'],['Mack','Use the map pages to explore more regions when you are ready to extend your footprint.']);return list;
}
function helper(){
 const card=$('.map-card'),game=$('#game'),story=$('#story-campaign-card');if(!card||!game)return;
 let dock=card.querySelector('.nt-map-companion-helper'),shouldShow=enabled()&&!game.classList.contains('hidden')&&(!story||story.classList.contains('hidden'));
 if(!shouldShow){dock?.remove();return}if(dock)return;
 dock=document.createElement('div');dock.className='nt-map-companion-helper';dock.setAttribute('aria-label','Optional hints from Mack and Pooch');
 dock.innerHTML='<button class="nt-helper-button" type="button" aria-expanded="false"><span class="nt-helper-faces"><img data-pup="Mack" alt=""><img data-pup="Pooch" alt=""></span><span>Ask Mack &amp; Pooch for a hint</span></button><div class="nt-helper-message" role="status" aria-live="polite" hidden><img alt=""><p></p><span class="nt-helper-actions"><button type="button" data-next aria-label="Another hint">↻</button><button type="button" data-close aria-label="Close hints">×</button></span></div>';
 dock.querySelectorAll('.nt-helper-faces img').forEach(image=>image.src=DOGS[image.dataset.pup].src);
 const footer=card.querySelector('.map-footer');if(footer)card.insertBefore(dock,footer);else card.append(dock);
 const trigger=dock.querySelector('.nt-helper-button'),message=dock.querySelector('.nt-helper-message'),face=message.querySelector('img'),copy=message.querySelector('p');let index=-1;
 const show=()=>{const list=hints();index=(index+1)%list.length;const item=list[index];message.dataset.mood='think';face.src=DOGS[item[0]].src;copy.textContent=item[0]+': '+item[1];message.hidden=false;message.classList.add('is-open');trigger.setAttribute('aria-expanded','true');trigger.querySelector('span:last-child').textContent='Another tip'};
 trigger.addEventListener('click',show);dock.querySelector('[data-next]').addEventListener('click',show);dock.querySelector('[data-close]').addEventListener('click',()=>{message.hidden=true;message.classList.remove('is-open');trigger.setAttribute('aria-expanded','false');delete message.dataset.mood;trigger.querySelector('span:last-child').textContent='Ask Mack & Pooch for a hint'});
}

function busyForReaction(){const game=$('#game');return document.hidden||modalOpen()||storyPriorityActive()||!game||game.classList.contains('hidden')}
function reactionMarkup(item){
 const card=document.createElement('aside');card.className='nt-event-reaction';card.dataset.kind=item.kind;card.dataset.mood=item.kind==='build'?'celebrate':item.kind==='finance'?'think':'reassure';card.setAttribute('role','status');card.setAttribute('aria-live','polite');
 const img=document.createElement('img');img.src=DOGS[item.pup].src;img.alt='';
 const copy=document.createElement('span');copy.className='nt-event-reaction-copy';const name=document.createElement('strong');name.textContent=item.pup+' noticed';const line=document.createElement('span');line.textContent=item.text;copy.append(name,line);
 const close=document.createElement('button');close.type='button';close.setAttribute('aria-label','Dismiss companion message');close.textContent='×';close.addEventListener('click',()=>removeReaction(card));
 card.append(img,copy,close);return card;
}
function removeReaction(card){if(!card)return;clearTimeout(reactionTimer);card.classList.remove('is-visible');setTimeout(()=>card.remove(),260)}
function queueReaction(kind,customText='',key=''){
 if(!enabled()||!REACTIONS[kind])return;
 const dedupe=key||`${kind}:${Math.floor(Date.now()/10000)}`;if(seenEventKeys.has(dedupe))return;seenEventKeys.add(dedupe);
 const [pup,defaultText]=REACTIONS[kind];eventQueue.push({kind,pup,text:customText||defaultText,at:Date.now()});eventQueue=eventQueue.slice(-3);flushReaction();
}
function flushReaction(){
 if(!enabled()||busyForReaction()||$('.nt-event-reaction')||!eventQueue.length)return;
 eventQueue=eventQueue.filter(item=>Date.now()-item.at<90000);const item=eventQueue.shift();if(!item)return;
 const card=reactionMarkup(item);document.body.append(card);requestAnimationFrame(()=>card.classList.add('is-visible'));clearTimeout(reactionTimer);reactionTimer=setTimeout(()=>removeReaction(card),6500);
}
function inspectCustomers(){
 const value=Number(($('#subs-value')?.textContent||'').replace(/[^\d]/g,''));if(!Number.isFinite(value))return;
 if(lastCustomerCount===null){lastCustomerCount=value;lastMilestone=[100,250,500,1000,2500,5000].filter(mark=>mark<=value).at(-1)||0;return}
 if(value<lastCustomerCount){lastMilestone=[100,250,500,1000,2500,5000].filter(mark=>mark<=value).at(-1)||0;lastCustomerCount=value;return}
 const marks=[100,250,500,1000,2500,5000],milestone=marks.filter(mark=>mark>lastMilestone&&lastCustomerCount<mark&&value>=mark).at(-1);
 if(milestone){lastMilestone=milestone;queueReaction('build',`You passed ${milestone.toLocaleString()} customers. That’s a lot more neighbors online!`,`customers:${milestone}:${$('#month-label')?.textContent||''}`)}
 lastCustomerCount=value;
}
function inspectModal(){
 const modal=$('#modal'),title=$('#modal-title')?.textContent?.trim()||'';if(!modal||modal.classList.contains('hidden')){lastModalTitle='';return}
 if(title===lastModalTitle)return;lastModalTitle=title;const key=`modal:${title}`;
 if(/district connected|network online|fiber upgrade complete|build complete/i.test(title))queueReaction('build','A new neighborhood is online! That gives the town another place to grow.',key);
 else if(/capacity upgrade complete|capacity expanded|network expanded/i.test(title))queueReaction('capacity','That upgrade adds breathing room. Let’s keep watching demand as more households connect.',key);
 else if(/service restored|repair complete|network restored|service recovery/i.test(title))queueReaction('service','Service is back. Keeping neighborhoods connected earns the town’s trust.',key);
 else if(/service disruption|repair required|outage/i.test(title))queueReaction('service','A service interruption needs attention. Let’s get the network healthy before more customers are affected.',key);
 else if(/loan approved|financing decision|funding decision|funding confirmed|capital received/i.test(title))queueReaction('finance','Funding can create room to grow. Keep repayments and your repair reserve in view.',key);
}
function inspectToast(){
 const toast=$('#toast'),text=toast?.textContent?.trim()||'';if(!text||text===lastToast)return;lastToast=text;
 if(/service restored|repair complete|network restored/i.test(text))queueReaction('service','Service is back. Keeping neighborhoods connected earns the town’s trust.',`toast:${text}`);
 else if(/loan approved|financing complete|capital received/i.test(text))queueReaction('finance','Funding can create room to grow. Keep repayments and your repair reserve in view.',`toast:${text}`);
}
function inspectRecap(){
 const news=$('#recap-news')?.innerText?.trim()||'',month=$('#report-period')?.textContent?.trim()||'';if(!news)return;
 const signature=`${month}:${news}`,guidance=$('#recap-guidance')?.getAttribute('aria-label')||'',signatureChanged=signature!==lastRecap,guidanceChanged=guidance!==inspectRecap.lastGuidance;if(!signatureChanged&&!guidanceChanged)return;lastRecap=signature;inspectRecap.lastGuidance=guidance;
 if(signatureChanged&&/outage|service disruption|service impaired|deferred repair|repair needed|network interruption/i.test(news)&&signature!==inspectRecap.lastServiceSignature){inspectRecap.lastServiceSignature=signature;queueReaction('service','A service issue showed up in the monthly report. Check the affected district before it costs more customers.',`service:${month}:${news.slice(0,90)}`)}
 if(signatureChanged&&/capacity.{0,24}(tight|limit|congest|full)|congest.{0,30}capacity/i.test(news))queueReaction('capacity','The monthly report shows capacity pressure. Review the busiest district before service quality slips.',`capacity:${month}:${news.slice(0,90)}`);
 if(guidanceChanged&&/capacity upgrade/i.test(guidance))queueReaction('capacity',guidance.replace(/^Review capacity upgrade:\s*/i,'')+'. A little headroom now can prevent a rough month later.',`guidance:${month}:${guidance}`);
}
function inspectFinanceChoice(target){
 if(!target||Date.now()-lastFinanceReaction<8000)return;
 const text=(target.innerText||target.value||'').trim().toLowerCase(),title=$('#modal-title')?.textContent?.toLowerCase()||'';
 const financeModal=modalOpen()&&/(funding|financ|loan|capital|purchase)/i.test(title);
 const pricingControl=target.matches?.('[data-price],[data-regional-price]');
 if(financeModal&&/(approve|confirm|borrow|cash|loan|continue|accept|fund|choose)/i.test(text)||pricingControl){lastFinanceReaction=Date.now();queueReaction('finance',pricingControl?'Pricing affects both revenue and customer trust. Check the town’s response after the next few months.':'That decision changes the company’s cash cushion. Keep enough room for repairs and the next build.',`finance:${Date.now()}`)}
}
function observeGame(){
 const modal=$('#modal'),title=$('#modal-title'),toast=$('#toast'),recap=$('#recap-news'),customers=$('#subs-value');
 const observer=new MutationObserver(()=>{inspectModal();inspectToast();inspectRecap();inspectCustomers();flushReaction();settingsMarkup()});observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','aria-label']});
 document.addEventListener('click',event=>{const target=event.target?.closest?.('button,[role="button"]');if(target)inspectFinanceChoice(target)},true);
 document.addEventListener('pointerdown',event=>{if(event.target?.closest?.('.map-stage'))noteMapUse(event)},true);
 document.addEventListener('wheel',event=>{if(event.target?.closest?.('.map-stage'))noteMapUse(event)},{passive:true,capture:true});
 if(modal){lastModalTitle=modal.classList.contains('hidden')?'':title?.textContent?.trim()||''}
 if(toast)lastToast=toast.textContent.trim();if(recap)lastRecap=`${$('#report-period')?.textContent?.trim()||''}:${recap.innerText.trim()}`;
 if(customers){const value=Number(customers.textContent.replace(/[^\d]/g,''));if(Number.isFinite(value)){lastCustomerCount=value;lastMilestone=[100,250,500,1000,2500,5000].filter(mark=>mark<=value).at(-1)||0}}
}
function init(){
 addStyles();observeSettings();observeGame();
 const story=$('#story-campaign-card');if(story)new MutationObserver(decorateStory).observe(story,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
 const map=$('#city-map');if(map)new MutationObserver(()=>{decorateCoach();helper();if(!map.querySelector('.nt-map-cat'))scheduleCat(3000+Math.random()*4500)}).observe(map,{childList:true});
 window.addEventListener('portfolio-companions:change',event=>{refreshGuidance();const toggle=document.querySelector('[data-nt-guidance]');if(toggle)toggle.checked=event.detail?.enabled!==false;});\n applyAnimationPace();refreshGuidance();scheduleCat(9000);setInterval(()=>{decorateCoach();helper();settingsMarkup();inspectModal();inspectToast();inspectRecap();inspectCustomers();flushReaction();tickCat()},350);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
