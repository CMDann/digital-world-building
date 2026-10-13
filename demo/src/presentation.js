// The clock uses the presenter's browser locale and time zone.
function updateClock(){const now=new Date();for(const clock of document.querySelectorAll('.local-clock')){clock.textContent=now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});clock.dateTime=now.toISOString();clock.title=now.toLocaleDateString([],{weekday:'long',month:'long',day:'numeric'})+' · '+Intl.DateTimeFormat().resolvedOptions().timeZone;}}
updateClock();setInterval(updateClock,1000);
const stage=document.getElementById('lesson-stage'),canvas=stage.querySelector('.lesson-split');
let frame;
function fit(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
 if(document.fullscreenElement!==stage){canvas.style.removeProperty('transform');canvas.style.removeProperty('left');canvas.style.removeProperty('top');return;}
 const bar=stage.querySelector('.reader-bar').getBoundingClientRect().height+3;
 const width=canvas.offsetWidth,height=canvas.scrollHeight,availableWidth=stage.clientWidth-32,availableHeight=stage.clientHeight-bar-24;
 const scale=Math.min(availableWidth/width,availableHeight/height);
 canvas.style.transform=`scale(${scale})`;canvas.style.left=`${(stage.clientWidth-width*scale)/2}px`;canvas.style.top=`${bar+12+(availableHeight-height*scale)/2}px`;
 });}
new ResizeObserver(fit).observe(canvas);
new MutationObserver(fit).observe(document.getElementById('slide-content'),{childList:true,subtree:true});
stage.addEventListener('load',fit,true);window.addEventListener('resize',fit);document.addEventListener('fullscreenchange',fit);document.fonts.ready.then(fit);
