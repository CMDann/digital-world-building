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

await send('Runtime.enable');await send('Page.enable');await evaluate('delete document.documentElement.dataset.editorReady');await send('Page.navigate',{url:'http://127.0.0.1:8080/?check='+Date.now()+'#build'});await waitFor('document.documentElement.dataset.editorReady==="true"');
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await evaluate('document.querySelector("[data-add=box]").click()');await waitFor('document.getElementById("object-name").value==="Box"');await set('object-name','Keep across tabs');const count=await evaluate('document.querySelectorAll(".object-row").length');
await click('tab-learn');await waitFor('document.querySelectorAll("[data-slide]").length===15');assert.equal(await evaluate('document.querySelectorAll(".workbook-card").length'),10);
await evaluate('document.querySelectorAll("[data-slide]")[5].click()');assert.ok(await evaluate('document.getElementById("slide-content").textContent.includes("COMFORT")'));
await evaluate('document.getElementById("slide-search").value="Geometry";document.getElementById("slide-search").dispatchEvent(new Event("input"))');assert.ok(await evaluate('document.querySelectorAll("[data-slide]").length<15'));
await evaluate('document.getElementById("slide-search").value="";document.getElementById("slide-search").dispatchEvent(new Event("input"))');
await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Delete',code:'Delete'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Delete',code:'Delete'});
const links=await evaluate('Array.from(document.querySelectorAll(".workbook-card a")).map(a=>a.href)');for(const url of links){const response=await fetch(url);assert.equal(response.status,200,url);assert.ok(Number(response.headers.get('content-length'))>0||(await response.arrayBuffer()).byteLength>100);}
await fs.writeFile('tests/learn-preview.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
await click('theme-toggle');assert.equal(await evaluate('document.documentElement.dataset.theme'),'light');assert.ok((await evaluate('getComputedStyle(document.body).backgroundColor')).includes('240'));
await click('theme-toggle');await click('tab-build');await waitFor('document.body.dataset.tab==="build"');assert.equal(await evaluate('document.getElementById("object-name").value'),'Keep across tabs');assert.equal(await evaluate('document.querySelectorAll(".object-row").length'),count);
assert.ok((await evaluate('getComputedStyle(document.body).fontFamily')).includes('Space Mono'));
await click('tab-webxr');await waitFor('document.body.dataset.tab==="webxr"');
for(const id of ['demo1','demo2','demo3','demo4','demo5','vr','ar','assets']){await evaluate('document.querySelector("[data-example='+id+']").click()');await waitFor('document.getElementById("example-frame").contentDocument?.documentElement?.dataset.demoReady==="true"');await new Promise(r=>setTimeout(r,350));assert.ok(await evaluate('document.getElementById("example-frame").contentDocument.querySelector("canvas").width>100'));console.log('Example OK:',id);}
await evaluate('document.querySelector("[data-example=demo5]").click()');await waitFor('document.getElementById("example-frame").contentDocument?.documentElement?.dataset.demoReady==="true"');await new Promise(r=>setTimeout(r,400));await fs.writeFile('tests/webxr-preview.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
await click('launch-xr');await waitFor('document.body.classList.contains("playing")');await click('tab-learn');await waitFor('document.body.dataset.tab==="learn"&&!document.body.classList.contains("playing")');assert.equal(await evaluate('document.getElementById("example-frame").getAttribute("src")'),'about:blank');
await evaluate('delete document.documentElement.dataset.editorReady');await send('Page.navigate',{url:'http://127.0.0.1:8080/dist-pages/index.html#learn'});await waitFor('document.documentElement.dataset.editorReady==="true"&&document.querySelectorAll(".workbook-card").length===10');await click('tab-webxr');await waitFor('document.getElementById("example-frame").contentDocument?.documentElement?.dataset.demoReady==="true"');
assert.equal((await fetch('http://127.0.0.1:8080/dist-pages/downloads/PDF/00_Worksheet_Packet_All.pdf')).status,200);
await evaluate('delete document.documentElement.dataset.editorReady');await send('Page.navigate',{url:'http://127.0.0.1:8080/?check='+Date.now()+'#build'});await waitFor('document.documentElement.dataset.editorReady==="true"');await fs.writeFile('tests/build-preview.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
assert.deepEqual(errors,[]);console.log('PASS: all tabs, 15 focused lessons, search, 20 workbook downloads, theme, scene preservation, hidden-tab shortcuts, 8 examples, Play exit, and static subfolder hosting.');ws.close();

