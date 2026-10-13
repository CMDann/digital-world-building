import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const pages=await (await fetch('http://127.0.0.1:9223/json')).json();
const page=pages.find(p=>p.type==='page');
const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);});
function send(method,params={}){return new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function waitFor(expression){for(let i=0;i<100;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,100));}throw new Error('Timed out: '+expression);}
const click=id=>evaluate(`document.getElementById(${JSON.stringify(id)}).click()`);
const set=(id,value)=>evaluate(`(()=>{const e=document.getElementById(${JSON.stringify(id)});e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('change',{bubbles:true}));})()`);
await send('Runtime.enable');await send('Page.enable');await evaluate('delete document.documentElement.dataset.editorReady');await send('Page.reload');
await waitFor('document.documentElement.dataset.editorReady === "true"');
await new Promise(r=>setTimeout(r,1500));
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await new Promise(r=>setTimeout(r,300));
await fs.writeFile('tests/editor-preview.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
const initial=await evaluate('document.querySelectorAll(".object-row").length');assert.equal(initial,JSON.parse(await fs.readFile('levels/park-study.json','utf8')).objects.length);
await evaluate('document.querySelector("[data-add=box]").click()');await waitFor(`document.querySelectorAll('.object-row').length === ${initial+1}`);
await set('object-name','Test cube');await set('position-0','3.5');await set('rotation-1','45');await set('scale-2','2');await set('object-color','#ff0000');await set('physics-mass','8');await set('physics-bounce','0.35');
await click('duplicate');await waitFor(`document.querySelectorAll('.object-row').length === ${initial+2}`);
await click('delete');await waitFor(`document.querySelectorAll('.object-row').length === ${initial+1}`);
await click('undo');await waitFor(`document.querySelectorAll('.object-row').length === ${initial+2}`);
await click('redo');await waitFor(`document.querySelectorAll('.object-row').length === ${initial+1}`);
// Import a tiny real GLB triangle through the file picker.
const geometry=Buffer.alloc(44);const vertices=[0,0,0,1,0,0,0,1,0];vertices.forEach((v,i)=>geometry.writeFloatLE(v,i*4));[0,1,2].forEach((v,i)=>geometry.writeUInt16LE(v,36+i*2));
const gltf={asset:{version:'2.0'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0},indices:1}]}],buffers:[{byteLength:44}],bufferViews:[{buffer:0,byteOffset:0,byteLength:36,target:34962},{buffer:0,byteOffset:36,byteLength:6,target:34963}],accessors:[{bufferView:0,componentType:5126,count:3,type:'VEC3',min:[0,0,0],max:[1,1,0]},{bufferView:1,componentType:5123,count:3,type:'SCALAR'}]};
let json=JSON.stringify(gltf);json=json.padEnd(Math.ceil(json.length/4)*4,' ');const glb=Buffer.alloc(12+8+json.length+8+geometry.length);glb.writeUInt32LE(0x46546c67,0);glb.writeUInt32LE(2,4);glb.writeUInt32LE(glb.length,8);glb.writeUInt32LE(json.length,12);glb.writeUInt32LE(0x4e4f534a,16);glb.write(json,20);glb.writeUInt32LE(geometry.length,20+json.length);glb.writeUInt32LE(0x004e4942,24+json.length);geometry.copy(glb,28+json.length);
await fs.writeFile('tests/triangle.glb',glb);
const dom=await send('DOM.getDocument');const input=await send('DOM.querySelector',{nodeId:dom.root.nodeId,selector:'#model-file'});await send('DOM.setFileInputFiles',{nodeId:input.nodeId,files:[process.cwd()+'/tests/triangle.glb']});await waitFor(`document.querySelectorAll('.object-row').length === ${initial+2}`);
const name='editor-smoke-'+Date.now();await set('scene-name',name);await click('save-scene');await waitFor(`document.getElementById('status').textContent.includes('Saved to levels/${name}.json')`);
const saved=await (await fetch(`http://127.0.0.1:8080/levels/${name}.json`)).json();const cube=saved.objects.find(o=>o.name==='Test cube');assert.equal(cube.position[0],3.5);assert.equal(cube.rotation[1],Math.PI/4);assert.equal(cube.scale[2],2);assert.equal(cube.color,'#ff0000');assert.equal(cube.physics.mass,8);assert.equal(cube.physics.restitution,.35);assert.ok(saved.objects.find(o=>o.type==='model').model.startsWith('data:'));
await click('new-scene');await waitFor('document.querySelectorAll(".object-row").length===2');
await send('Page.handleJavaScriptDialog',{accept:true}).catch(()=>{});
// New scene is dirty; approve the explicit discard prompt for the reopen test.
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.method==='Page.javascriptDialogOpening')send('Page.handleJavaScriptDialog',{accept:true});});
await click('open-scene');await waitFor(`Array.from(document.querySelectorAll('#saved-levels button')).some(b=>b.textContent==='${name}.json')`);
await evaluate(`Array.from(document.querySelectorAll('#saved-levels button')).find(b=>b.textContent==='${name}.json').click()`);
await waitFor(`document.querySelectorAll('.object-row').length===${initial+2}`);
assert.equal(await evaluate('document.getElementById("scene-name").value'),name);
const invalid=await fetch('http://127.0.0.1:8080/api/levels',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"version":9}'});assert.equal(invalid.status,400);
const cross=await fetch('http://127.0.0.1:8080/api/levels',{method:'POST',headers:{Origin:'https://example.com','Content-Type':'application/json'},body:JSON.stringify(saved)});assert.equal(cross.status,403);
await fs.unlink(`levels/${name}.json`);
assert.deepEqual(errors,[]);console.log('PASS: WebGL startup; add, transform, recolor, duplicate, delete, undo/redo; GLB import; folder save and reopen with model; invalid JSON and cross-origin rejection; no browser exceptions.');
ws.close();


