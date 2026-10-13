// Three persistent workspaces. Build stays mounted; example iframes unload when they are not visible.
const $=id=>document.getElementById(id);
const sections=['XR & WebXR foundations','Interaction & comfort','How Three.js works'];
const examples=[
 {id:'demo1',title:'An empty scene',tag:'01 / FOUNDATION',text:'A renderer, a camera, and a scene. The grid and axes establish the coordinates for everything that follows.'},
 {id:'demo2',title:'Geometry',tag:'02 / FORM',text:'Wireframe geometry makes vertices and faces visible. Watch how simple primitives occupy world space.'},
 {id:'demo3',title:'Lighting + materials',tag:'03 / SURFACE',text:'The same building blocks gain weight and depth through lighting and physically based materials.'},
 {id:'demo4',title:'Interaction',tag:'04 / RESPONSE',text:'Hover over a shape to highlight it. Click a highlighted object to launch it back into the bouncing arena.'},
 {id:'demo5',title:'The full experience',tag:'05 / ATMOSPHERE',text:'Fog, floating particles, bloom, lights, and interaction turn a collection of objects into an experience. Hover over the shapes.'},
 {id:'vr',title:'Fully immersive',tag:'VR / VIRTUAL ROOM',text:'The presentation’s virtual room visualization: a wireframe environment and pulsing central orb. A desktop illustration of immersion.'},
 {id:'ar',title:'Enhanced real world',tag:'AR / CONCEPT',text:'The presentation’s holographic-object visualization illustrates augmented reality. This example does not request a camera or perform real-world tracking.'},
 {id:'assets',title:'Solid vs wireframe',tag:'ASSETS / INSPECT',text:'Compare the original talk’s model assets and their mesh structure. Drag to orbit and scroll to zoom.'},
 {id:'ai-scene',title:'AI + XR',tag:'AI / CONNECTIONS',text:'The neural-network visualization from the talk. This is an animated illustration; it does not call an AI service.'},
];
const source='https://github.com/CMDann/vr-lunch-and-learn';
let slides=[],activeSlide=4,activeExample='demo1',loaded=false,navigating=false;
let theme='dark';try{theme=localStorage.getItem('world-seed-theme')||'dark';}catch{}
function applyTheme(){document.documentElement.dataset.theme=theme;$('theme-toggle').querySelector('span').textContent=theme==='dark'?'Light':'Dark';$('theme-toggle').setAttribute('aria-label',`Switch to ${theme==='dark'?'light':'dark'} theme`);$('lesson-frame').contentWindow?.postMessage({type:'workspace-theme',light:theme==='light'},location.origin);$('example-frame').contentWindow?.postMessage({type:'workspace-theme',light:theme==='light'},location.origin);}
$('theme-toggle').onclick=()=>{theme=theme==='dark'?'light':'dark';try{localStorage.setItem('world-seed-theme',theme);}catch{}applyTheme();};applyTheme();
async function navigate(tab,updateHash=true){
 if(!['learn','webxr','build','code'].includes(tab)||navigating)return;
 navigating=true;
 try{const waits=[];document.dispatchEvent(new CustomEvent('workspace:beforechange',{detail:{tab,waitUntil:p=>waits.push(p)}}));await Promise.all(waits);
 for(const name of ['learn','webxr','build','code']){$(`panel-${name}`).hidden=name!==tab;$(`tab-${name}`).setAttribute('aria-selected',name===tab);$(`tab-${name}`).tabIndex=name===tab?0:-1;}
 document.body.dataset.tab=tab;document.dispatchEvent(new CustomEvent('workspace:change',{detail:{tab}}));
 if(updateHash)history.replaceState(null,'',`#${tab}`);
 if(tab==='webxr')showExample(activeExample);else $('example-frame').src='about:blank';
 if(tab==='learn'){if(!loaded)await loadContent();else {const requested=Number(location.hash.split('/')[1]);showSlide(!updateHash&&requested>0&&requested<=slides.length?slides[requested-1].id:activeSlide);}}else {$('lesson-frame').src='about:blank';lessonRequest++;}
 }catch(error){$('status').textContent=error.message;}finally{navigating=false;}
}
document.querySelectorAll('.workspace-tabs button').forEach((button,index)=>{button.onclick=()=>navigate(button.dataset.tab);button.onkeydown=e=>{let target;if(e.key==='ArrowRight')target=(index+1)%4;if(e.key==='ArrowLeft')target=(index+3)%4;if(e.key==='Home')target=0;if(e.key==='End')target=3;if(target!==undefined){e.preventDefault();const next=document.querySelectorAll('.workspace-tabs button')[target];next.focus();navigate(next.dataset.tab);}};});
window.addEventListener('hashchange',()=>navigate(location.hash.slice(1).split('/')[0]||'build',false));
function slideTitle(slide){const doc=new DOMParser().parseFromString(slide.html,'text/html');return (doc.querySelector('h1,h2,h3')?.textContent||`Slide ${slide.id+1}`).replace(/\s+/g,' ').trim();}
function safeSlide(html){
 const doc=new DOMParser().parseFromString(html,'text/html');
 doc.querySelectorAll('script,style,canvas,form,input,button,textarea,select,svg').forEach(el=>el.remove());
 for(const frame of doc.querySelectorAll('iframe')){const link=doc.createElement('a');const url=frame.getAttribute('src')||'';if(url.startsWith('https://www.youtube.com/')||url.startsWith('https://www.youtube-nocookie.com/')){link.href=url;link.textContent='Watch the presentation video ↗';link.target='_blank';link.rel='noopener';frame.replaceWith(link);}else frame.remove();}
 for(const image of doc.querySelectorAll('img')){const original=image.getAttribute('src')||'';if(original.startsWith('assets/')&&!original.endsWith('.glb')){image.src='content/lunch-and-learn/images/'+original.slice(7);image.loading='lazy';}else image.remove();}
 const allowed=new Set(['DIV','SPAN','P','H1','H2','H3','H4','H5','H6','UL','OL','LI','BR','STRONG','EM','B','I','PRE','CODE','A','IMG','TABLE','THEAD','TBODY','TR','TH','TD','BLOCKQUOTE','SMALL','HR']);
 for(const el of [...doc.body.querySelectorAll('*')]){
   if(!allowed.has(el.tagName)){el.replaceWith(...el.childNodes);continue;}
   for(const attr of [...el.attributes])if(!['class','href','src','alt','target','rel','loading'].includes(attr.name))el.removeAttribute(attr.name);
   if(el.tagName==='A'){const href=el.getAttribute('href')||'';if(!/^(https:\/\/|mailto:)/.test(href)){el.removeAttribute('href');}else{el.target='_blank';el.rel='noopener';}}
 }
 return doc.body;
}
function renderIndex(){const query=$('slide-search').value.toLowerCase().trim();$('lesson-sections').replaceChildren();let count=0;sections.forEach((name,section)=>{const matches=slides.filter(slide=>slide.section===section&&(!query||slide.text.includes(query)));if(!matches.length)return;const group=document.createElement('div');group.className='lesson-group';const heading=document.createElement('h3');heading.textContent=`0${section} / ${name}`;group.append(heading);for(const slide of matches){count++;const button=document.createElement('button');button.textContent=`${String(slides.indexOf(slide)+1).padStart(2,'0')}  ${slide.title}`;button.dataset.slide=slide.id;button.className=activeSlide===slide.id?'selected':'';button.setAttribute('aria-current',activeSlide===slide.id?'true':'false');button.onclick=()=>showSlide(slide.id);group.append(button);}$('lesson-sections').append(group);});if(!count)$('lesson-sections').textContent='No matching slides. Try another term.';}
function showSlide(id){const slide=slides.find(s=>s.id===id);if(!slide)return;const index=slides.indexOf(slide);activeSlide=id;const body=safeSlide(slide.html);$('slide-content').replaceChildren(...body.childNodes);$('slide-content').className='slide-body';$('slide-content').querySelector('h1,h2,h3')?.classList.add('lesson-slide-title');$('slide-number').textContent=`${String(index+1).padStart(2,'0')} / ${slides.length} — ${slide.sourceLabel}`;$('previous-slide').disabled=index===0;$('next-slide').disabled=index===slides.length-1;$('slide-related').replaceChildren();
 const mapping={38:'vr',39:'demo1',5:'vr',6:'ar',11:'demo1',12:'demo2',13:'demo3',14:'assets',15:'demo4',16:'demo5',20:'ai-scene'};
 if(mapping[id]){const button=document.createElement('button');button.className='primary';button.textContent='Explore this example in WebXR →';button.onclick=()=>{activeExample=mapping[id];navigate('webxr');};$('slide-related').append(button);}
 showLessonDemo(id);$('lesson-progress-fill').style.width=`${(index+1)/slides.length*100}%`;renderIndex();history.replaceState(null,'',`#learn/${index+1}`);
}
async function loadContent(){try{const [slideResponse,bookResponse]=await Promise.all([fetch('./content/workshop-lessons.json'),fetch('./content/workbooks.json')]);if(!slideResponse.ok||!bookResponse.ok)throw new Error('Learning content could not load. Refresh to retry.');slides=(await slideResponse.json()).map(s=>({...s,title:slideTitle(s),text:new DOMParser().parseFromString(s.html,'text/html').body.textContent.toLowerCase()}));const books=await bookResponse.json();$('workbook-list').replaceChildren();for(const [index,book]of books.entries()){const article=document.createElement('article');article.className='workbook-card';const number=document.createElement('span');number.className='eyebrow';number.textContent=index===0?'THE COMPLETE PACKET':`WORKSHEET ${String(index).padStart(2,'0')}`;const title=document.createElement('h3');title.textContent=index===0?'All nine worksheets':book.title;const links=document.createElement('div');for(const [label,folder,file]of [['PDF ↓','PDF',book.file],['WORD ↓','Word',book.file.replace('.pdf','.docx')]]){const a=document.createElement('a');a.href=`downloads/${folder}/${encodeURIComponent(file)}`;a.download=file;a.textContent=label;links.append(a);}article.append(number,title,links);$('workbook-list').append(article);}loaded=true;const requested=Number(location.hash.split('/')[1]);showSlide(requested>0&&requested<=slides.length?slides[requested-1].id:activeSlide);}catch(error){$('slide-content').textContent=error.message;}}
$('slide-search').oninput=renderIndex;$('previous-slide').onclick=()=>showSlide(slides[slides.findIndex(s=>s.id===activeSlide)-1]?.id);$('next-slide').onclick=()=>showSlide(slides[slides.findIndex(s=>s.id===activeSlide)+1]?.id);$('jump-workbooks').onclick=e=>{e.preventDefault();$('workbooks').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
for(const example of examples.filter(e=>e.id!=='ai-scene')){const button=document.createElement('button');button.dataset.example=example.id;const tag=document.createElement('span');tag.textContent=example.tag;const title=document.createElement('strong');title.textContent=example.title;button.append(tag,title);button.onclick=()=>showExample(example.id);$('example-list').append(button);}
function showExample(id){const example=examples.find(e=>e.id===id);if(!example)return;activeExample=id;$('example-title').textContent=example.title;$('example-description').textContent=example.text;$('example-source').href=`${source}/blob/main/js/demos/${id}.js`;document.querySelectorAll('[data-example]').forEach(b=>{b.classList.toggle('selected',b.dataset.example===id);b.setAttribute('aria-pressed',b.dataset.example===id);});document.dispatchEvent(new CustomEvent('example:select',{detail:{id,theme}}));}
$('example-fullscreen').onclick=()=>{const host=$('example-host');host.requestFullscreen?.().catch(()=>{$('example-description').textContent+=' Fullscreen is unavailable in this browser.';});};
$('build-code').onclick=async()=>{await navigate('code');document.dispatchEvent(new CustomEvent('code:open',{detail:{file:'src/main.js',overview:true}}));};
$('example-build').onclick=()=>navigate('build');$('launch-xr').onclick=async()=>{await navigate('build');if(document.documentElement.dataset.editorReady==='true'&&!document.body.classList.contains('playing'))$('play-scene').click();};

const lessonDemos={4:'ar',5:'vr',6:'ar',7:'vr',38:'vr',8:'demo1',9:'demo4',10:'demo4',39:'demo1',11:'demo1',12:'demo2',13:'demo3',14:'assets',15:'demo4',16:'demo5'};
const lessonContexts={4:'The XR spectrum runs from the physical world to a completely virtual one. This holographic scene illustrates the AR end of that spectrum.',7:'A room gives objects a shared scale and location. This desktop illustration helps explain spatial presence; a headset adds tracked perspective.',38:'This is a desktop illustration of a virtual room. To experience an actual WebXR session, use Build → Play → Enter VR.',8:'Watch how continuous camera motion affects your sense of movement. In a headset, consider user-controlled movement and a stable horizon.',9:'Try the pointer: hover to target, click to act. A tracked controller can use a ray to target objects in a similar way.',10:'Hover and click to try a distance-based selection pattern. The desktop pointer here demonstrates targeting, not hand tracking.'};
let lessonRequest=0,lessonSource='';
async function showLessonDemo(id){
 const key=lessonDemos[id]||'demo1',example=examples.find(e=>e.id===key),request=++lessonRequest;
 $('lesson-frame').src=`examples/viewer.html?demo=${key}&theme=${theme}`;
 $('lesson-demo-title').textContent=example.title;$('lesson-demo-description').textContent=example.text;$('lesson-demo-context').textContent=lessonContexts[id]||'Explore the exact JavaScript in the regular lesson view or the Code tab. Follow the scene, camera, meshes, and animation loop.';
 $('lesson-source').href=`examples/demos/${key}.js`;lessonSource='';$('lesson-code-content').textContent='Loading source…';$('lesson-copy-code').disabled=true;$('lesson-code-status').textContent='';
 try{const response=await fetch(`examples/demos/${key}.js`);if(!response.ok)throw new Error('Source could not load. Use the full source link to retry.');const code=await response.text();if(request!==lessonRequest)return;lessonSource=code;$('lesson-code-content').textContent=code;$('lesson-copy-code').disabled=false;}catch(error){if(request===lessonRequest)$('lesson-code-content').textContent=error.message;}
}
$('lesson-restart').onclick=()=>showLessonDemo(activeSlide);
$('lesson-copy-code').onclick=async()=>{try{await navigator.clipboard.writeText(lessonSource);$('lesson-code-status').textContent='Code copied.';}catch{$('lesson-code-status').textContent='Select the source text to copy it manually.';}};
$('lesson-present').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('lesson-stage').requestFullscreen();}catch{$('lesson-code-status').textContent='Fullscreen is unavailable in this browser.';}};
document.addEventListener('fullscreenchange',()=>{$('lesson-present').textContent=document.fullscreenElement===$('lesson-stage')?'Exit presentation ↙':'Present ↗';});
document.addEventListener('keydown',event=>{if(document.body.dataset.tab!=='learn'||(/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)||(!document.fullscreenElement&&/BUTTON|SUMMARY/.test(event.target.tagName)))||event.ctrlKey||event.metaKey||event.altKey)return;if(event.key==='ArrowRight'){event.preventDefault();$('next-slide').click();}if(event.key==='ArrowLeft'){event.preventDefault();$('previous-slide').click();}});

navigate(location.hash.slice(1).split('/')[0]||'build',false);
