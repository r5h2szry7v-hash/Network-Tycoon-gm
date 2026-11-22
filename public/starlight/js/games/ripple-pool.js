/* Starlight Playground activity module */

(function(){
 var screen=document.getElementById("ripplePoolScreen"),open=document.getElementById("ripplePoolOpen"),back=document.getElementById("ripplePoolBack"),surface=document.getElementById("ripplePoolSurface"),reduced=document.documentElement.classList.contains("pref-reduced-motion"),lastPoint=null,lastSpawn=0;
 if(!screen||!open||!surface)return;
 function show(){document.getElementById("landingScreen").hidden=true;document.getElementById("gameScreen").classList.remove("active");document.getElementById("gameScreen").setAttribute("aria-hidden","true");var studio=document.getElementById("colorStudio");studio.classList.remove("active");studio.setAttribute("aria-hidden","true");var spinner=document.getElementById("orbitSpinnerScreen");if(spinner)spinner.hidden=true;screen.hidden=false;window.scrollTo({top:0,behavior:reduced?"auto":"smooth"});surface.focus()}
 function hide(){window.StarlightApp.returnToPlayground()}
 function ripple(x,y,intensity){intensity=Math.max(.18,Math.min(1,intensity||.5));var count=reduced?1:Math.round(4+intensity*6);for(var n=0;n<count;n++){var w=document.createElement("i");w.className="ripple-wave"+(n%2?" soft":"");w.style.left=x+"px";w.style.top=y+"px";w.style.animationDelay=reduced?"0ms":(n*75)+"ms";w.style.setProperty("--ripple-scale",String(3.5+intensity*3+n*.18));w.style.setProperty("--ripple-alpha",String(.42+intensity*.48));surface.appendChild(w);w.addEventListener("animationend",function(){this.remove()},{once:true});setTimeout(function(node){return function(){if(node.isConnected)node.remove()}}(w),reduced?300:4000)}}
 function point(e){var r=surface.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
 open.addEventListener("click",show);back.addEventListener("click",hide);
 surface.addEventListener("pointerdown",function(e){if(e.button!==undefined&&e.button!==0)return;surface.setPointerCapture(e.pointerId);surface.classList.remove("is-released");lastPoint=point(e);lastSpawn=performance.now();ripple(lastPoint.x,lastPoint.y,e.pressure||.5);e.preventDefault()});
 surface.addEventListener("pointermove",function(e){if(!lastPoint)return;var p=point(e),dx=p.x-lastPoint.x,dy=p.y-lastPoint.y,dist=Math.hypot(dx,dy),now=performance.now();if(dist>18&&now-lastSpawn>28){var steps=Math.min(3,Math.floor(dist/18));for(var s=1;s<=steps;s++)ripple(lastPoint.x+dx*s/steps,lastPoint.y+dy*s/steps);lastPoint=p;lastSpawn=now}});
 function end(){lastPoint=null;surface.classList.add("is-released")}surface.addEventListener("pointerup",end);surface.addEventListener("pointercancel",end);
 surface.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){var r=surface.getBoundingClientRect();ripple(r.width/2,r.height/2);e.preventDefault()}});
})();
