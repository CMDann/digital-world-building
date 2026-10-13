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


await send('Runtime.enable');await send('Page.enable');
await send('Page.navigate',{url:'http://127.0.0.1:8080/?labtest='+Date.now()+'#learn'});
await waitFor('document.documentElement.dataset.editorReady==="true"&&document.querySelectorAll("[data-slide]").length===15');
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
assert.deepEqual(await evaluate('Array.from(document.querySelectorAll(".workspace-tabs button")).map(b=>b.dataset.tab)'),['learn','webxr','build','code']);
const ids=await evaluate('Array.from(document.querySelectorAll("[data-slide]")).map(b=>b.dataset.slide)');
for(const id of ids){await evaluate(`document.querySelector(${JSON.stringify(`[data-slide="${id}"]`)}).click()`);await waitFor('document.getElementById("lesson-frame").contentDocument?.documentElement?.dataset.demoReady==="true"&&!document.getElementById("lesson-copy-code").disabled');const src=await evaluate('document.getElementById("lesson-source").href');assert.equal(await evaluate('document.getElementById("lesson-code-content").textContent'),await (await fetch(src)).text());assert.ok(await evaluate('document.getElementById("lesson-frame").contentDocument.querySelector("canvas").width>100'));}
await evaluate(`document.querySelector('[data-slide="12"]').click()`);await waitFor('document.getElementById("lesson-frame").contentDocument?.documentElement?.dataset.demoReady==="true"');
await new Promise(r=>setTimeout(r,300));await fs.writeFile('tests/learn-preview.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
await send('Runtime.evaluate',{expression:'document.getElementById("lesson-present").click()',userGesture:true});await waitFor('document.fullscreenElement?.id==="lesson-stage"');await evaluate('document.exitFullscreen()');
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});assert.ok(await evaluate('document.getElementById("panel-learn").scrollWidth<=document.getElementById("panel-learn").clientWidth+1'));
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await click('tab-build');await waitFor('document.body.dataset.tab==="build"');assert.equal(await evaluate('document.getElementById("lesson-frame").getAttribute("src")'),'about:blank');
await click('starter-scenes');await waitFor('document.getElementById("starter-dialog").open');const starters=await evaluate('Array.from(document.querySelectorAll("[data-starter]")).map(b=>b.dataset.starter)');assert.equal(starters.length,9);
for(const file of starters){await evaluate(`document.querySelector(${JSON.stringify(`[data-starter="${file}"]`)}).click()`);await waitFor('!document.getElementById("starter-dialog").open');assert.ok(await evaluate('document.getElementById("scene-name").value.endsWith(" copy")'));await click('play-scene');await waitFor('document.body.classList.contains("playing")');await new Promise(r=>setTimeout(r,200));await click('stop-play');await waitFor('!document.body.classList.contains("playing")');await click('starter-scenes');await waitFor('document.getElementById("starter-dialog").open');console.log('Starter OK:',file);}
await click('close-starters');
await send('Page.navigate',{url:'http://127.0.0.1:8080/dist-pages/index.html?labtest='+Date.now()+'#build'});await waitFor('document.documentElement.dataset.editorReady==="true"');await click('starter-scenes');await waitFor('document.querySelectorAll("[data-starter]").length===9');await evaluate(`document.querySelector('[data-starter="night-plaza.json"]').click()`);await waitFor('document.getElementById("scene-name").value==="Night plaza copy"');
await send('Page.navigate',{url:'http://127.0.0.1:8080/?labtest='+Date.now()+'#learn/11'});await waitFor('document.documentElement.dataset.editorReady==="true"');
assert.deepEqual(errors,[]);console.log('PASS: tab order, all 15 live lessons and exact source, presentation fullscreen, mobile width, unload, 9 playable starter copies, and static hosting.');ws.close();
