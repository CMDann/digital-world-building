import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const pages=await (await fetch('http://127.0.0.1:9223/json')).json();
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Page.javascriptDialogOpening')send('Page.handleJavaScriptDialog',{accept:true});});
function send(method,params={}){return new Promise((resolve,reject)=>{const n=++id;const timer=setTimeout(()=>reject(new Error('CDP timeout: '+method+' '+JSON.stringify(params).slice(0,180))),15000);pending.set(n,{resolve:value=>{clearTimeout(timer);resolve(value);},reject});ws.send(JSON.stringify({id:n,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function waitFor(expression){for(let i=0;i<100;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,100));}throw new Error('Timed out: '+expression);}
const click=id=>evaluate(`document.getElementById(${JSON.stringify(id)}).click()`);
const set=(id,value)=>evaluate(`(()=>{const e=document.getElementById(${JSON.stringify(id)});e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('change',{bubbles:true}));})()`);
await send('Runtime.enable');await send('Page.enable');await evaluate('delete document.documentElement.dataset.editorReady');await send('Page.navigate',{url:'http://127.0.0.1:8080/dist-pages/index.html'});await waitFor('document.documentElement.dataset.editorReady==="true"');
assert.equal(await evaluate('document.getElementById("storage-mode").textContent'),'BROWSER WORKSPACE');
console.log('Static page booted');const initial=await evaluate('document.querySelectorAll(".object-row").length');
// Build every new object through the actual UI, catching missing geometry constructors.
console.log('Adding objects');const types=['cone','torus','capsule','pyramid','plane','ramp','wall','stairs','arch','house','road','fence','bush','streetlamp','person'];
for(let i=0;i<types.length;i++){await evaluate(`document.querySelector('[data-add=${types[i]}]').click()`);await waitFor(`document.querySelectorAll('.object-row').length===${initial+i+1}`);}
assert.equal(await evaluate('document.getElementById("behavior-type").value'),'wander');
await set('behavior-speed','1.5');await set('behavior-distance','8');await set('behavior-delay','1');
const name='static-smoke-'+Date.now();await set('scene-name',name);await click('save-scene');await waitFor(`document.getElementById('status').textContent.includes('this browser: ${name}.json')`);
const stored=await evaluate(`new Promise((resolve,reject)=>{const r=indexedDB.open('world-seed-scenes',1);r.onsuccess=()=>{const q=r.result.transaction('levels').objectStore('levels').get('${name}.json');q.onsuccess=()=>resolve(q.result.data);q.onerror=reject;};})`);
assert.equal(stored.objects.at(-1).behavior.speed,1.5);assert.equal(stored.objects.at(-1).behavior.delay,1);
console.log('Browser save passed; starting Play');await click('play-scene');await waitFor('document.body.classList.contains("playing")');await waitFor('document.getElementById("play-time").value!=="0:00"');
await click('pause-play');const pausedTime=await evaluate('document.getElementById("play-time").value');await new Promise(r=>setTimeout(r,1200));assert.equal(await evaluate('document.getElementById("play-time").value'),pausedTime);
await click('pause-play');await set('view-mode','first');assert.equal(await evaluate('document.getElementById("crosshair").hidden'),false);
const firstBefore=(await send('Page.captureScreenshot',{format:'png'})).data;await evaluate('document.activeElement.blur()');await send('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW'});await new Promise(r=>setTimeout(r,350));await send('Input.dispatchKeyEvent',{type:'keyUp',key:'w',code:'KeyW'});
const firstAfter=(await send('Page.captureScreenshot',{format:'png'})).data;assert.ok(firstBefore!==firstAfter,'First-person movement changes the view');await set('view-mode','third');await click('restart-play');await waitFor('document.getElementById("play-time").value==="0:00"');
await new Promise(r=>setTimeout(r,600));await fs.writeFile('tests/play-preview.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
assert.ok(await evaluate('document.querySelector("#xr-entry button, #xr-entry a") !== null'));
const fullscreen=await send('Runtime.evaluate',{expression:'document.getElementById("viewport").requestFullscreen()',awaitPromise:true,userGesture:true});assert.equal(fullscreen.exceptionDetails,undefined);assert.equal(await evaluate('document.fullscreenElement?.id'),'viewport');await click('stop-play');await waitFor('!document.body.classList.contains("playing")');assert.equal(await evaluate('document.fullscreenElement===null'),true);assert.equal(await evaluate('Number(document.getElementById("position-0").value)'),stored.objects.at(-1).position[0]);
await evaluate('delete document.documentElement.dataset.editorReady');await send('Page.reload');await waitFor('document.documentElement.dataset.editorReady==="true"');await click('open-scene');await waitFor(`Array.from(document.querySelectorAll('#saved-levels button')).some(b=>b.textContent==='${name}.json')`);await evaluate(`Array.from(document.querySelectorAll('#saved-levels button')).find(b=>b.textContent==='${name}.json').click()`);await waitFor(`document.querySelectorAll('.object-row').length===${initial+types.length}`);
assert.equal(await evaluate('document.getElementById("scene-name").value'),name);
await evaluate(`new Promise(resolve=>{const r=indexedDB.open('world-seed-scenes',1);r.onsuccess=()=>{const tx=r.result.transaction('levels','readwrite');tx.objectStore('levels').delete('${name}.json');tx.oncomplete=resolve;};})`);
await evaluate('delete document.documentElement.dataset.editorReady');await send('Page.navigate',{url:'http://127.0.0.1:8080/'});await waitFor('document.documentElement.dataset.editorReady==="true"');await fs.writeFile('tests/editor-preview.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
assert.deepEqual(errors,[]);console.log('PASS: static subfolder boot; all 15 new props; behavior editing; IndexedDB save and reload; Play/pause/restart/stop; first/third-person modes; XR fallback; no browser exceptions.');ws.close();
