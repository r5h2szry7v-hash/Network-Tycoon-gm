(function(){
 "use strict";
 var activities=[
  {id:"tracer",name:"Starlight Tracer",icon:"✧",desc:"Trace slow, glowing paths",button:"resumeBtn",screen:"gameScreen"},
  {id:"paint-by-number",name:"Paint by Number",icon:"✿",desc:"Fill calm cosmic illustrations",button:"colorStudioOpen",screen:"colorStudio"},
  {id:"cosmic-orbit-spinner",name:"Cosmic Orbit Spinner",icon:"✦",desc:"Spin a tiny solar system",button:"orbitSpinnerOpen",screen:"orbitSpinnerScreen"},
  {id:"ripple-pool",name:"Ripple Pool",icon:"◉",desc:"Send soft rings across water",button:"ripplePoolOpen",screen:"ripplePoolScreen"},
  {id:"orbiting-orbs",name:"Orbiting Orbs",icon:"☼",desc:"Guide beads through space",button:"orbitingOrbsOpen",screen:"orbitingOrbsScreen"},
  {id:"liquid-nebula",name:"Liquid Nebula",icon:"✺",desc:"Shape drifting clouds of color",button:"liquidNebulaOpen",screen:"liquidNebulaScreen"},
  {id:"comet-tether",name:"Comet Tether",icon:"☄",desc:"Pull a comet and let it spring back",button:"cometTetherOpen",screen:"cometTetherScreen"},
  {id:"stardust-rake",name:"Stardust Rake",icon:"✧",desc:"Sweep glowing grains that settle softly",button:"stardustRakeOpen",screen:"stardustRakeScreen"}
 ];
 function openActivity(id){
  var activity=activities.find(function(item){return item.id===id});
  if(!activity)return false;
  var selector=document.getElementById("playgroundScreen");
  if(selector)selector.hidden=true;
  var buttonId=activity.button;
  if(buttonId==="resumeBtn"){
   var resume=document.getElementById(buttonId);
   if(resume&&resume.disabled)buttonId="newGameBtn";
  }
  var button=document.getElementById(buttonId);
  if(button){button.click();return true}
  return false;
 }
 function returnToPlayground(){
  var entry=document.getElementById("playgroundOpen");
  if(entry)entry.click();
 }
 window.StarlightApp=Object.freeze({
  activities:Object.freeze(activities.map(function(item){return Object.freeze(item)})),
  openActivity:openActivity,
  returnToPlayground:returnToPlayground
 });
})();