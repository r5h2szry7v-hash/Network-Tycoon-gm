(()=>{
 'use strict';
 const characters=[
  {
   id:'mack',name:'Mack',src:'/images/dog-dark.webp',role:'Steady observer who spots risks and plans ahead.',
   lines:['That machine came together nicely.','Solid work. You gave every part a purpose.']
  },
  {
   id:'pooch',name:'Pooch',src:'/images/dog-tan.webp',role:'Upbeat guide who celebrates progress and helps players get started.',
   lines:['The marble made it! Let’s see what the next machine asks of us.','Bell rung! I knew those parts would work together.']
  }
 ];
 const moods=['idle','celebrate','think','reassure'];
 const preferenceKey='portfolio-companions-enabled-v1';
 const legacyPreferenceKey='network-tycoon-companion-settings-v1';
 function areCompanionsEnabled(){
  try{
   const saved=localStorage.getItem(preferenceKey);
   if(saved==='true')return true;
   if(saved==='false')return false;
   const legacy=localStorage.getItem(legacyPreferenceKey);
   if(legacy&&JSON.parse(legacy).guidance===false)return false;
  }catch{}
  return true;
 }
 function setCompanionsEnabled(enabled){
  const value=Boolean(enabled);
  try{localStorage.setItem(preferenceKey,String(value))}catch{}
  window.dispatchEvent(new CustomEvent('portfolio-companions:change',{detail:{enabled:value}}));
  return value;
 }
 window.addEventListener('storage',event=>{
  if(event.key===preferenceKey)window.dispatchEvent(new CustomEvent('portfolio-companions:change',{detail:{enabled:areCompanionsEnabled()}}));
 });
 window.PortfolioCompanionAssets=Object.freeze({
  schemaVersion:1,
  characters:Object.freeze(characters.map(character=>Object.freeze({...character,lines:Object.freeze([...character.lines])}))),
  moods:Object.freeze(moods),
  areCompanionsEnabled,
  setCompanionsEnabled
 });
})();
