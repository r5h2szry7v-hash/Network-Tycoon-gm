/* Starlight Playground activity module */

(function(){
 var screen=document.getElementById("orbitSpinnerScreen"),open=document.getElementById("orbitSpinnerOpen"),back=document.getElementById("orbitSpinnerBack"),stage=document.getElementById("orbitSpinnerStage"),rotor=document.getElementById("orbitSpinnerRotor"),starfield=document.getElementById("orbitStarfield"),spin=document.getElementById("orbitSpinnerSpin"),hint=document.getElementById("orbitSpinnerHint");
 if(!screen||!open||!stage||!rotor)return;
 var angle=0,velocity=0,frame=0,lastFrame=0,dragging=false,lastPointerAngle=0,lastTime=0,reduced=document.documentElement.classList.contains("pref-reduced-motion");
 function render(){rotor.setAttribute("transform","rotate("+angle+" 180 180)");if(starfield){starfield.setAttribute("transform","rotate("+(-angle*.28)+" 180 180)");starfield.style.opacity=String(.42+Math.min(Math.abs(velocity)/900,.42))}}
 function animate(now){
  if(!lastFrame)lastFrame=now;
  var dt=Math.min((now-lastFrame)/1000,.04);lastFrame=now;
  if(!dragging){angle+=velocity*dt;velocity*=Math.exp(-1.35*dt);if(Math.abs(velocity)<2){velocity=0;frame=0;lastFrame=0;render();return}}
  render();frame=requestAnimationFrame(animate)
 }
 function ensureFrame(){if(!frame){lastFrame=0;frame=requestAnimationFrame(animate)}}
 function pointerAngle(e){var r=stage.getBoundingClientRect();return Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2))*180/Math.PI}
 function openSpinner(){document.getElementById("landingScreen").hidden=true;document.getElementById("gameScreen").classList.remove("active");document.getElementById("gameScreen").setAttribute("aria-hidden","true");var studio=document.getElementById("colorStudio");studio.classList.remove("active");studio.setAttribute("aria-hidden","true");screen.hidden=false;window.scrollTo({top:0,behavior:reduced?"auto":"smooth"});stage.focus()}
 function closeSpinner(){velocity=0;dragging=false;if(frame){cancelAnimationFrame(frame);frame=0}lastFrame=0;window.StarlightApp.returnToPlayground()}
 open.addEventListener("click",openSpinner);back.addEventListener("click",closeSpinner);
 stage.addEventListener("pointerdown",function(e){if(e.button!==undefined&&e.button!==0)return;dragging=true;velocity=0;if(frame){cancelAnimationFrame(frame);frame=0}lastFrame=0;lastPointerAngle=pointerAngle(e);lastTime=performance.now();stage.setPointerCapture(e.pointerId);e.preventDefault()});
 stage.addEventListener("pointermove",function(e){if(!dragging)return;var a=pointerAngle(e),delta=((a-lastPointerAngle+540)%360)-180,now=performance.now(),dt=Math.max(now-lastTime,8);angle+=delta;velocity=delta/dt*1000;lastPointerAngle=a;lastTime=now;render()});
 function release(){if(!dragging)return;dragging=false;if(reduced)velocity=0;else ensureFrame()}
 stage.addEventListener("pointerup",release);stage.addEventListener("pointercancel",release);
 spin.addEventListener("click",function(){if(reduced){hint.textContent="Reduced motion is on. Drag the rings to turn them at your own pace.";return}velocity=480;ensureFrame();hint.textContent="The comet rings are drifting freely."});
 stage.addEventListener("keydown",function(e){if(e.key==="ArrowRight"||e.key==="ArrowUp"){angle+=12;velocity=0;render();e.preventDefault()}else if(e.key==="ArrowLeft"||e.key==="ArrowDown"){angle-=12;velocity=0;render();e.preventDefault()}});
})();
