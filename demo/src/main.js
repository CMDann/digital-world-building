// Scene editor: records are the source of truth; Three.js is the editable view.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { buildObject, applyRecord, disposeObject, createRecord, validateGLB } from './objects.js';
import { validateLevel } from './level-format.js';
import { initializeStorage, listScenes, loadScene, saveScene } from './storage.js';
const $ = id => document.getElementById(id);
const viewport=$('viewport'), objects=new Map();
let level, selected=null, dirty=false, busy=false, history=[], cursor=-1, savedState='', dragStart=null;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(45,1,.1,2000);
let renderer;
try { renderer=new THREE.WebGLRenderer({antialias:true}); } catch(error) { $('loading').textContent='WebGL could not start. Try Chrome or Edge with graphics acceleration enabled.'; throw error; }
renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.toneMapping=THREE.ACESFilmicToneMapping;
viewport.prepend(renderer.domElement);
const orbit=new OrbitControls(camera,renderer.domElement); orbit.enableDamping=true; orbit.maxPolarAngle=Math.PI*.49; orbit.minDistance=.5; orbit.maxDistance=500;
const transform=new TransformControls(camera,renderer.domElement); transform.setSize(.85); scene.add(transform.getHelper());
const ambient=new THREE.HemisphereLight('#eff7ff','#667454',1.3); scene.add(ambient);
const grid=new THREE.GridHelper(100,100,'#687d7e','#a4b4b1'); grid.position.y=.015; grid.material.transparent=true; grid.material.opacity=.24; scene.add(grid);
const selectionBox=new THREE.BoxHelper(new THREE.Object3D(),'#d5ff86'); scene.add(selectionBox); selectionBox.visible=false;
const raycaster=new THREE.Raycaster();
function status(message,error=false){$('status').textContent=message;$('status').style.color=error?'#ffb5a9':'';}
function setDirty(value){dirty=value;$('dirty').style.visibility=value?'visible':'hidden';document.title=`${value?'• ':''}${level?.name || 'World Seed'} · Scene Editor`;}
function capture(){return {...structuredClone(level),camera:{position:camera.position.toArray(),target:orbit.target.toArray()}};}
function checkpoint(){const json=JSON.stringify(capture());if(history[cursor]===json)return;history=history.slice(0,cursor+1);history.push(json);if(history.length>35)history.shift();cursor=history.length-1;setDirty(json!==savedState);updateHistory();}
function updateHistory(){$('undo').disabled=cursor<=0;$('redo').disabled=cursor>=history.length-1;}
async function action(fn){if(busy)return;busy=true;try{await fn();}catch(error){status(error.message,true);console.error(error);}finally{busy=false;}}
async function mount(data,{resetHistory=true}={}) {
  validateLevel(data);
  const built=[];
  try {for(const record of data.objects) built.push([record,await buildObject(record)]);}catch(error){built.forEach(([,object])=>disposeObject(object));throw error;}
  transform.detach(); selected=null; selectionBox.visible=false;
  objects.forEach(object=>{scene.remove(object);disposeObject(object);});objects.clear();
  level=structuredClone(data);
  for(const [record,object] of built){objects.set(record.id,object);scene.add(object);}
  scene.background=new THREE.Color(level.environment.background);ambient.intensity=level.environment.ambient;
  camera.position.fromArray(level.camera.position);orbit.target.fromArray(level.camera.target);orbit.update();
  $('scene-name').value=level.name;$('background').value=level.environment.background;$('ambient').value=ambient.intensity;$('ambient-value').value=ambient.intensity.toFixed(1);
  renderList();renderInspector();if(resetHistory){history=[];cursor=-1;checkpoint();}updateHistory();
}
const selectedRecord=()=>level.objects.find(record=>record.id===selected);
function select(id){selected=id;const object=objects.get(id);transform.detach();selectionBox.visible=!!object&&object.visible;if(object){selectionBox.setFromObject(object);if(object.visible)transform.attach(object);}renderList();renderInspector();}
function renderList(){
  $('object-count').textContent=level.objects.length;$('object-list').replaceChildren();
  for(const record of level.objects){const button=document.createElement('button');button.className=`object-row${record.id===selected?' selected':''}${record.visible?'':' dimmed'}`;button.dataset.id=record.id;button.setAttribute('aria-pressed',record.id===selected);const symbol=document.createElement('span');symbol.className='object-symbol';symbol.textContent=record.type.endsWith('Light')?'☼':record.type==='tree'?'♠':'◇';const label=document.createElement('span');label.className='object-title';label.textContent=record.name;button.append(symbol,label);button.onclick=()=>{if(!busy)select(record.id);};$('object-list').append(button);}
}
for(const property of ['position','rotation','scale']){const label=document.createElement('div');label.className='transform-label';label.textContent=property[0].toUpperCase()+property.slice(1)+(property==='rotation'?' (degrees)':'');const row=document.createElement('div');row.className='axis-row';for(let axis=0;axis<3;axis++){const wrapper=document.createElement('label');wrapper.className='axis-input';const span=document.createElement('span');span.textContent='XYZ'[axis];const input=document.createElement('input');input.type='number';input.step=property==='rotation'?'5':'.1';input.id=`${property}-${axis}`;input.setAttribute('aria-label',`${property} ${'XYZ'[axis]}`);if(property==='scale')input.min='.01';input.onchange=()=>{const record=selectedRecord();if(!record||busy)return;const n=Number(input.value);if(input.value===''||!Number.isFinite(n)||Math.abs(n)>100000||(property==='scale'&&n<.01)){renderInspector();return;}record[property][axis]=property==='rotation'?THREE.MathUtils.degToRad(n):n;applyRecord(objects.get(selected),record);checkpoint();};wrapper.append(span,input);row.append(wrapper);}$('transform-fields').append(label,row);}
function renderInspector(){const record=selectedRecord();$('no-selection').hidden=!!record;$('selection-fields').hidden=!record;if(!record)return;$('selected-type').textContent=record.type.replace(/([a-z])([A-Z])/g,'$1 $2');$('object-name').value=record.name;$('object-visible').checked=record.visible;$('object-color').value=record.color;$('material-fields').hidden=record.type==='model';$('light-fields').hidden=!record.type.endsWith('Light');if(record.intensity!==undefined)$('light-intensity').value=record.intensity;for(const property of ['position','rotation','scale'])record[property].forEach((value,i)=>{$(`${property}-${i}`).value=Number((property==='rotation'?THREE.MathUtils.radToDeg(value):value).toFixed(3));});}
function changeRecord(fn){const record=selectedRecord();if(!record||busy)return;fn(record);applyRecord(objects.get(selected),record);select(selected);checkpoint();}
$('object-name').onchange=e=>changeRecord(r=>r.name=e.target.value.trim()||r.type);
$('object-visible').onchange=e=>changeRecord(r=>r.visible=e.target.checked);
$('object-color').onchange=e=>changeRecord(r=>r.color=e.target.value);
$('light-intensity').onchange=e=>{const n=Number(e.target.value);if(Number.isFinite(n)&&n>=0&&n<=10000)changeRecord(r=>r.intensity=n);else renderInspector();};
async function addRecord(record){if(level.objects.length>=1000)throw new Error('Scene is limited to 1,000 objects.');const object=await buildObject(record);level.objects.push(record);objects.set(record.id,object);scene.add(object);select(record.id);checkpoint();status(`Added ${record.name}. Drag the colored handles to position it.`);}
function addPosition(type){return [Math.round(orbit.target.x),type.endsWith('Light')?5:0,Math.round(orbit.target.z)];}
document.querySelectorAll('[data-add]').forEach(button=>button.onclick=()=>action(()=>addRecord(createRecord(button.dataset.add,addPosition(button.dataset.add)))));
function setMode(mode){transform.setMode(mode);document.querySelectorAll('[data-mode]').forEach(button=>button.classList.toggle('active',button.dataset.mode===mode));}
document.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>setMode(button.dataset.mode));
transform.addEventListener('dragging-changed',event=>{orbit.enabled=!event.value;if(!event.value)checkpoint();});
transform.addEventListener('objectChange',()=>{const record=selectedRecord(),object=objects.get(selected);if(!record||!object)return;object.scale.set(Math.max(.01,object.scale.x),Math.max(.01,object.scale.y),Math.max(.01,object.scale.z));record.position=object.position.toArray();record.rotation=[object.rotation.x,object.rotation.y,object.rotation.z];record.scale=object.scale.toArray();renderInspector();setDirty(true);});
$('snap').onchange=e=>{transform.setTranslationSnap(e.target.checked?1:null);transform.setRotationSnap(e.target.checked?Math.PI/12:null);transform.setScaleSnap(e.target.checked?.1:null);};
renderer.domElement.addEventListener('pointerdown',e=>{dragStart={x:e.clientX,y:e.clientY,button:e.button,handle:!!transform.axis};});
renderer.domElement.addEventListener('pointerup',e=>{if(busy||!dragStart||dragStart.button!==0||dragStart.handle||transform.dragging||Math.hypot(e.clientX-dragStart.x,e.clientY-dragStart.y)>4)return;const bounds=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-bounds.left)/bounds.width*2-1,-(e.clientY-bounds.top)/bounds.height*2+1),camera);const hits=raycaster.intersectObjects([...objects.values()].filter(object=>object.visible),true);let object=hits[0]?.object;while(object&&!object.userData.recordId)object=object.parent;select(object?.userData.recordId||null);});
function frameObject(object){const bounds=new THREE.Box3().setFromObject(object);if(bounds.isEmpty())return;const center=bounds.getCenter(new THREE.Vector3());const distance=Math.max(3,bounds.getSize(new THREE.Vector3()).length()*1.2);const direction=camera.position.clone().sub(orbit.target).normalize();orbit.target.copy(center);camera.position.copy(center).addScaledVector(direction,distance);orbit.update();}
$('focus').onclick=()=>{if(selected)frameObject(objects.get(selected));};
$('frame-all').onclick=()=>{const bounds=new THREE.Box3();objects.forEach(object=>{if(object.visible&&!object.userData.light)bounds.expandByObject(object);});if(bounds.isEmpty())return;const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3()).length();orbit.target.copy(center);camera.position.copy(center).add(new THREE.Vector3(1,.8,1).normalize().multiplyScalar(Math.max(8,size)));orbit.update();};
$('duplicate').onclick=()=>action(async()=>{const record=selectedRecord();if(!record)return;const copy=structuredClone(record);copy.id=crypto.randomUUID();copy.name+=' copy';copy.position[0]+=1.5;await addRecord(copy);});
$('delete').onclick=()=>{if(!selected||busy)return;const object=objects.get(selected),name=selectedRecord().name;transform.detach();scene.remove(object);disposeObject(object);objects.delete(selected);level.objects=level.objects.filter(record=>record.id!==selected);select(null);checkpoint();status(`Deleted ${name}. Undo is available.`);};
async function stepHistory(delta){const index=cursor+delta;if(index<0||index>=history.length)return;await mount(JSON.parse(history[index]),{resetHistory:false});cursor=index;setDirty(history[cursor]!==savedState);updateHistory();status(delta<0?'Undo':'Redo');}
$('undo').onclick=()=>action(()=>stepHistory(-1));$('redo').onclick=()=>action(()=>stepHistory(1));
$('scene-name').onchange=e=>{level.name=e.target.value.trim()||'Untitled scene';e.target.value=level.name;checkpoint();};
$('background').oninput=e=>{scene.background.set(e.target.value);};$('background').onchange=e=>{level.environment.background=e.target.value;checkpoint();};
$('ambient').oninput=e=>{ambient.intensity=Number(e.target.value);$('ambient-value').value=ambient.intensity.toFixed(1);};$('ambient').onchange=()=>{level.environment.ambient=ambient.intensity;checkpoint();};
$('grid').onchange=e=>grid.visible=e.target.checked;
async function save(){const data=capture();validateLevel(data);const body=JSON.stringify(data);if(new Blob([body]).size>40*1024*1024)throw new Error('Scene exceeds 40 MB. Remove models or use Export JSON.');status('Saving scene…');let result=await saveScene(data);if(result.conflict){if(!confirm('A scene with this name already exists. Replace that saved scene?')){status('Save cancelled. Choose another name to save a separate copy.');return;}result=await saveScene(data,true);}savedState=body;setDirty(false);status(`Saved to ${result.location}${result.filename}`);}
$('save-scene').onclick=()=>action(save);
$('export-scene').onclick=()=>{try{const data=validateLevel(capture());const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download=(data.name.replace(/[^a-z0-9_-]+/gi,'-')||'scene')+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Exported scene JSON.');}catch(error){status(error.message,true);}};
function allowReplace(){return !dirty||confirm('Discard unsaved changes and open another scene?');}
$('open-scene').onclick=()=>action(async()=>{$('saved-levels').replaceChildren();$('open-dialog').showModal();const files=await listScenes();if(!files.length)$('saved-levels').textContent='No saved scenes yet.';for(const entry of files){const button=document.createElement('button');button.textContent=entry.filename;button.dataset.source=entry.source;button.title=entry.source==='browser'?'Saved in this browser':entry.source==='example'?'Bundled example':'Project levels folder';button.onclick=()=>action(async()=>{if(!allowReplace())return;await mount(await loadScene(entry));savedState=JSON.stringify(capture());setDirty(false);$('open-dialog').close();status(`Opened ${entry.filename}`);});$('saved-levels').append(button);}});
$('close-dialog').onclick=()=>$('open-dialog').close();
$('new-scene').onclick=()=>action(async()=>{if(!allowReplace())return;const ground=createRecord('ground'),sun=createRecord('directionalLight',[8,12,6]);await mount({format:'world-seed',version:1,name:'Untitled scene',environment:{background:'#c4d6dc',ambient:1.3},camera:{position:[17,15,19],target:[0,0,0]},objects:[ground,sun]});savedState='';setDirty(true);status('New scene. Add objects from the library.');});
$('import-json').onclick=()=>$('json-file').click();
$('json-file').onchange=e=>{const file=e.target.files[0];e.target.value='';if(!file)return;action(async()=>{if(!allowReplace())return;if(file.size>40*1024*1024)throw new Error('Scene JSON must be under 40 MB.');await mount(JSON.parse(await file.text()));savedState='';setDirty(true);$('open-dialog').close();status('Imported scene. Save to add it to the levels folder.');});};
$('import-model').onclick=()=>$('model-file').click();
async function importModel(file){if(!file.name.toLowerCase().endsWith('.glb'))throw new Error('Choose a .glb model with embedded textures.');if(file.size>20*1024*1024)throw new Error('Choose a GLB smaller than 20 MB.');const buffer=await file.arrayBuffer();validateGLB(buffer);const model=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve('data:application/octet-stream;base64,'+reader.result.split(',')[1]);reader.onerror=()=>reject(new Error('Could not read model.'));reader.readAsDataURL(file);});const record=createRecord('model',addPosition('model'));record.name=file.name.replace(/\.glb$/i,'').slice(0,100);record.model=model;await addRecord(record);frameObject(objects.get(record.id));status(`Imported ${file.name}. The model is embedded when you save.`);}
$('model-file').onchange=e=>{const file=e.target.files[0];e.target.value='';if(file)action(()=>importModel(file));};
viewport.addEventListener('dragover',e=>{e.preventDefault();viewport.classList.add('drag-over');});viewport.addEventListener('dragleave',()=>viewport.classList.remove('drag-over'));viewport.addEventListener('drop',e=>{e.preventDefault();viewport.classList.remove('drag-over');const file=e.dataTransfer.files[0];if(file)action(()=>importModel(file));});
window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)||$('open-dialog').open)return;const key=e.key.toLowerCase();if((e.ctrlKey||e.metaKey)&&key==='s'){e.preventDefault();action(save);return;}if((e.ctrlKey||e.metaKey)&&key==='z'){e.preventDefault();action(()=>stepHistory(e.shiftKey?1:-1));return;}if((e.ctrlKey||e.metaKey)&&key==='d'){e.preventDefault();$('duplicate').click();return;}if(e.ctrlKey||e.metaKey)return;if(key==='w')setMode('translate');if(key==='e')setMode('rotate');if(key==='r')setMode('scale');if(key==='f')$('focus').click();if(key==='delete'||key==='backspace'){e.preventDefault();$('delete').click();}if(key==='escape')select(null);});
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
new ResizeObserver(()=>{const {width,height}=viewport.getBoundingClientRect();camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);}).observe(viewport);
renderer.setAnimationLoop(()=>{orbit.update();if(selected&&objects.get(selected)?.visible){selectionBox.setFromObject(objects.get(selected));selectionBox.visible=true;}else selectionBox.visible=false;renderer.render(scene,camera);});
try{let storageMode='browser';try{storageMode=await initializeStorage();}catch(error){status(error.message,true);}$('storage-mode').textContent=storageMode==='folder'?'LOCAL WORKSPACE':'BROWSER WORKSPACE';$('storage-description').textContent=storageMode==='folder'?'Saved in your project’s levels folder.':'Saved in this browser, plus bundled examples. Export JSON to back up or share your scenes.';const response=await fetch('./levels/park-study.json');if(!response.ok)throw new Error('Starter scene could not load.');await mount(await response.json());savedState=JSON.stringify(capture());setDirty(false);$('loading').hidden=true;status('Ready. Select an object, or add one from the library.');document.documentElement.dataset.editorReady='true';}catch(error){$('loading').textContent=`Could not start: ${error.message}`;status(error.message,true);console.error(error);}

