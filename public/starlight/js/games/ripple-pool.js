/* Starlight Playground activity module */

(function(){
 var screen=document.getElementById("ripplePoolScreen"),open=document.getElementById("ripplePoolOpen"),back=document.getElementById("ripplePoolBack"),surface=document.getElementById("ripplePoolSurface"),reduced=document.documentElement.classList.contains("pref-reduced-motion"),lastPoint=null,lastSpawn=0,pressFrame=0,pressActive=false;
 if(!screen||!open||!surface)return;
 function show(){document.getElementById("landingScreen").hidden=true;document.getElementById("gameScreen").classList.remove("active");document.getElementById("gameScreen").setAttribute("aria-hidden","true");var studio=document.getElementById("colorStudio");studio.classList.remove("active");studio.setAttribute("aria-hidden","true");var spinner=document.getElementById("orbitSpinnerScreen");if(spinner)spinner.hidden=true;screen.hidden=false;window.scrollTo({top:0,behavior:reduced?"auto":"smooth"});surface.focus()}
 function hide(){window.StarlightApp.returnToPlayground()}
 function ripple(x,y){var w=document.createElement("i");w.className="ripple-wave"+(Math.random()>.55?" soft":"");w.style.left=x+"px";w.style.top=y+"px";surface.appendChild(w);w.addEventListener("animationend",function(){w.remove()},{once:true});if(reduced)setTimeout(function(){if(w.isConnected)w.remove()},250);else setTimeout(function(){if(w.isConnected)w.remove()},3200)}
 function point(e){var r=surface.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
 function emitWhilePressed(now){if(!pressActive||!lastPoint){pressFrame=0;return}if(now-lastSpawn>210){ripple(lastPoint.x,lastPoint.y);lastSpawn=now}pressFrame=requestAnimationFrame(emitWhilePressed)}
 open.addEventListener("click",show);back.addEventListener("click",hide);
 surface.addEventListener("pointerdown",function(e){if(e.button!==undefined&&e.button!==0)return;surface.setPointerCapture(e.pointerId);lastPoint=point(e);lastSpawn=performance.now();pressActive=true;ripple(lastPoint.x,lastPoint.y);if(!pressFrame)pressFrame=requestAnimationFrame(emitWhilePressed);e.preventDefault()});
 surface.addEventListener("pointermove",function(e){if(!lastPoint)return;var p=point(e),dx=p.x-lastPoint.x,dy=p.y-lastPoint.y,dist=Math.hypot(dx,dy),now=performance.now();if(dist>34&&now-lastSpawn>38){ripple(p.x,p.y);lastPoint=p;lastSpawn=now}});
 function end(){pressActive=false;lastPoint=null;if(pressFrame){cancelAnimationFrame(pressFrame);pressFrame=0}}surface.addEventListener("pointerup",end);surface.addEventListener("pointercancel",end);
 surface.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){var r=surface.getBoundingClientRect();ripple(r.width/2,r.height/2);e.preventDefault()}});
})();
