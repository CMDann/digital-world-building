// Starter props are assembled from simple geometry so every scene works without downloaded art.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
export const defaults = {box:'#e9a76c', sphere:'#97b6d5', cylinder:'#d6be83', ground:'#88a57a', tree:'#47765b', car:'#dc876b', rock:'#9da4a3', bench:'#b8875c', pointLight:'#ffe3af', directionalLight:'#fff0d5', model:'#ffffff', cone:'#d6ac79', torus:'#ae97cb', capsule:'#89b9bd', pyramid:'#d8bb85', plane:'#aaaeb4', ramp:'#a1a8af', wall:'#c5b9a4', stairs:'#a8a6a0', arch:'#c7b8a0', house:'#d1b18c', road:'#57616a', fence:'#a18565', bush:'#6f935d', streetlamp:'#485862'};
export function createRecord(type, position = [0,0,0]) {
  return {id:crypto.randomUUID(), type, name:({pointLight:'Point light',directionalLight:'Sun light'})[type] || type[0].toUpperCase()+type.slice(1), position, rotation:[0,0,0], scale:[1,1,1], color:defaults[type], visible:true, ...(type.endsWith('Light') ? {intensity:type === 'pointLight' ? 80 : 3} : {})};
}
function mesh(group, geometry, color, position, tint = false) {
  const part = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color, roughness:.82, flatShading:true}));
  part.position.set(...position); part.castShadow = true; part.receiveShadow = true; part.userData.tint = tint; group.add(part); return part;
}
const box = (g,w,h,d,c,p,t=false) => mesh(g,new THREE.BoxGeometry(w,h,d),c,p,t);
// Refuse external resources: imported GLBs must be self-contained and portable.
export function validateGLB(buffer) {
  if (buffer.byteLength > 20*1024*1024) throw new Error('Choose a GLB smaller than 20 MB.');
  const view = new DataView(buffer);
  if (buffer.byteLength < 20 || view.getUint32(0,true) !== 0x46546c67 || view.getUint32(4,true) !== 2 || view.getUint32(8,true) !== buffer.byteLength || view.getUint32(16,true) !== 0x4e4f534a) throw new Error('This file is not a valid GLB 2.0 model.');
  const length = view.getUint32(12,true);
  if (20 + length > buffer.byteLength) throw new Error('The model file is incomplete.');
  const gltf = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,20,length)).trim());
  for (const entry of [...(gltf.buffers||[]),...(gltf.images||[])]) if (entry.uri && !entry.uri.startsWith('data:')) throw new Error('Use a self-contained GLB with embedded textures and buffers.');
  if ((gltf.extensionsUsed || []).some(x => ['KHR_draco_mesh_compression','EXT_meshopt_compression','KHR_texture_basisu'].includes(x))) throw new Error('Export an uncompressed GLB; Draco, Meshopt, and KTX2 textures are not supported yet.');
}
export async function buildObject(record) {
  const group = new THREE.Group(); group.userData.recordId = record.id;
  const c = record.color;
  switch(record.type) {
    case 'cone': mesh(group,new THREE.ConeGeometry(.7,1.6,24),c,[0,.8,0],true); break;
    case 'torus': mesh(group,new THREE.TorusGeometry(.65,.22,12,32),c,[0,.9,0],true); break;
    case 'capsule': mesh(group,new THREE.CapsuleGeometry(.45,1,6,12),c,[0,.95,0],true); break;
    case 'pyramid': {const p=mesh(group,new THREE.ConeGeometry(1,1.5,4),c,[0,.75,0],true);p.rotation.y=Math.PI/4;break;}
    case 'plane': {const p=mesh(group,new THREE.PlaneGeometry(4,4),c,[0,.01,0],true);p.rotation.x=-Math.PI/2;p.material.side=THREE.DoubleSide;break;}
    case 'ramp': {const shape=new THREE.Shape();shape.moveTo(-1,0);shape.lineTo(1,0);shape.lineTo(1,1.5);shape.closePath();const ramp=mesh(group,new THREE.ExtrudeGeometry(shape,{depth:2,bevelEnabled:false}),c,[0,0,-1],true);break;}
    case 'wall': box(group,4,3,.25,c,[0,1.5,0],true); break;
    case 'stairs': for(let i=0;i<6;i++)box(group,2,(i+1)*.25,.5,c,[0,(i+1)*.125,1.25-i*.5],true);break;
    case 'arch': {box(group,.4,2.1,.5,c,[-1,1.05,0],true);box(group,.4,2.1,.5,c,[1,1.05,0],true);const a=mesh(group,new THREE.TorusGeometry(1,.2,8,24,Math.PI),c,[0,2.1,0],true);a.scale.z=1.25;break;}
    case 'house': {box(group,3,2.5,3,c,[0,1.25,0],true);const roof=mesh(group,new THREE.ConeGeometry(2.6,1.5,4),'#785d52',[0,3.25,0]);roof.rotation.y=Math.PI/4;box(group,.65,1.7,.05,'#685346',[0,.85,1.52]);for(const x of [-.95,.95])box(group,.55,.65,.06,'#a8d1d6',[x,1.6,1.52]);break;}
    case 'road': box(group,4,.12,8,c,[0,.02,0],true);for(let z=-3;z<=3;z+=2)box(group,.12,.02,1,'#f3dfa1',[0,.09,z]);break;
    case 'fence': for(const x of [-1.5,0,1.5])box(group,.15,1.4,.15,c,[x,.7,0],true);for(const y of [.45,1.05])box(group,3.2,.14,.1,c,[0,y,0],true);break;
    case 'bush': for(const [x,y,z,s] of [[0,.65,0,.8],[-.5,.45,.15,.55],[.5,.45,.1,.6]])mesh(group,new THREE.IcosahedronGeometry(s,1),c,[x,y,z],true);break;
    case 'streetlamp': box(group,.14,3.6,.14,c,[0,1.8,0],true);box(group,.75,.12,.14,c,[.3,3.55,0],true);mesh(group,new THREE.SphereGeometry(.23,12,8),'#ffdf97',[.65,3.4,0]);{const bulb=new THREE.PointLight('#ffe0a0',35,12,2);bulb.position.set(.65,3.3,0);group.add(bulb);}break;
    case 'box': box(group,1,1,1,c,[0,.5,0],true); break;
    case 'sphere': mesh(group,new THREE.SphereGeometry(.6,24,16),c,[0,.6,0],true); break;
    case 'cylinder': mesh(group,new THREE.CylinderGeometry(.5,.5,1.2,20),c,[0,.6,0],true); break;
    case 'ground': box(group,20,.18,20,c,[0,-.1,0],true); break;
    case 'tree':
      mesh(group,new THREE.CylinderGeometry(.13,.2,1.7,7),'#705542',[0,.85,0]);
      for (let i=0;i<3;i++) mesh(group,new THREE.ConeGeometry(1.2-i*.25,1.9,8),c,[0,1.8+i*.7,0],true);
      break;
    case 'car':
      box(group,1.8,.65,3.4,c,[0,.85,0],true); box(group,1.55,.7,1.65,c,[0,1.47,-.15],true);
      box(group,1.57,.46,1.28,'#314c5a',[0,1.5,-.15]); box(group,1.6,.1,1.68,c,[0,1.86,-.15],true);
      for (const x of [-.92,.92]) for (const z of [-1.05,1.05]) { const wheel=mesh(group,new THREE.CylinderGeometry(.4,.4,.23,16),'#293137',[x,.45,z]); wheel.rotation.z=Math.PI/2; const hub=mesh(group,new THREE.CylinderGeometry(.2,.2,.25,12),'#b4c0c1',[x,.45,z]); hub.rotation.z=Math.PI/2; }
      for (const x of [-.6,.6]) { box(group,.35,.2,.03,'#fff2c5',[x,.93,1.72]); box(group,.35,.16,.03,'#963f36',[x,.93,-1.72]); }
      break;
    case 'rock': {const stone=mesh(group,new THREE.DodecahedronGeometry(.8,0),c,[0,.45,0],true); stone.scale.set(1,.65,.85); stone.rotation.set(.1,.4,.2); break;}
    case 'bench':
      box(group,2,.16,.62,c,[0,.65,0],true); box(group,2,.6,.12,c,[0,1.08,-.28],true);
      for (const x of [-.72,.72]) {box(group,.13,.6,.5,'#414c48',[x,.3,0]);box(group,.1,.9,.1,'#414c48',[x,.72,-.3]);} break;
    case 'pointLight': case 'directionalLight': {
      const light = record.type === 'pointLight' ? new THREE.PointLight(c,record.intensity,35,2) : new THREE.DirectionalLight(c,record.intensity);
      light.castShadow=true; light.shadow.mapSize.set(1024,1024); light.shadow.bias=-.001;
      if (light.isDirectionalLight) {Object.assign(light.shadow.camera,{left:-25,right:25,top:25,bottom:-25,near:.1,far:150});}
      group.add(light); group.userData.light=light;
      const marker = new THREE.Mesh(new THREE.SphereGeometry(.22,12,8),new THREE.MeshBasicMaterial({color:c,wireframe:true})); marker.userData.editorOnly=true; group.add(marker); break;
    }
    case 'model': {
      const bytes = Uint8Array.from(atob(record.model.split(',')[1]),c=>c.charCodeAt(0)); validateGLB(bytes.buffer);
      const loader = new GLTFLoader(); const gltf = await loader.parseAsync(bytes.buffer,'');
      gltf.scene.traverse(part=>{ if(part.isMesh){part.castShadow=true;part.receiveShadow=true;} }); group.add(gltf.scene); break;
    }
  }
  applyRecord(group,record); return group;
}
export function applyRecord(group,record) {
  group.name=record.name; group.position.fromArray(record.position); group.rotation.set(...record.rotation); group.scale.fromArray(record.scale); group.visible=record.visible;
  group.traverse(part=>{ if(part.userData.tint) part.material.color.set(record.color); if(part.userData.editorOnly) part.material.color.set(record.color); });
  if(group.userData.light){group.userData.light.color.set(record.color);group.userData.light.intensity=record.intensity;}
}
export function disposeObject(group) {
  group.traverse(part=>{part.geometry?.dispose(); if(part.isLight) part.dispose(); for(const mat of (Array.isArray(part.material)?part.material:part.material?[part.material]:[])){ for(const value of Object.values(mat)) if(value?.isTexture) value.dispose(); mat.dispose(); }});
}

