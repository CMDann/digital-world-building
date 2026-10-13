// Play mode owns temporary motion and viewing; stopping restores all authored object transforms.
import * as THREE from 'three';
import { VRButton } from '../vendor/three/VRButton.js';
import { buildObject, createRecord, applyRecord } from './objects.js';
import { motionAt } from './motion.js';
import { ScenePhysics } from './physics.js';
import { physicsSettings } from './physics-settings.js';
export async function createPlayer({renderer,scene,camera,orbit,viewport,objects,getLevel,onToggle,status}) {
  const $=id=>document.getElementById(id);
  let active=false,paused=false,time=0,mode='orbit',yaw=0,pitch=0,editorView,wasGrid=false;
  const keys=new Set(),position=new THREE.Vector3(),direction=new THREE.Vector3();
  const avatar=await buildObject(createRecord('person'));avatar.visible=false;scene.add(avatar);
  const rig=new THREE.Group();scene.add(rig);rig.add(camera);
  let physics=null;
  const teleportRay=new THREE.Raycaster();
  const groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
  renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local-floor');
  const vrButton=VRButton.createButton(renderer);$('xr-entry').append(vrButton);
  const controllers=[],controllerData=[];
  for(let i=0;i<2;i++){
    const controller=renderer.xr.getController(i);rig.add(controller);controllers.push(controller);
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,0,-1)]),new THREE.LineBasicMaterial({color:'#b6f27b'}));line.scale.z=15;controller.add(line);
    const marker=new THREE.Mesh(new THREE.RingGeometry(.2,.3,24),new THREE.MeshBasicMaterial({color:'#b6f27b',side:THREE.DoubleSide}));marker.rotation.x=-Math.PI/2;marker.visible=false;scene.add(marker);
    const state={controller,line,marker,input:null,cooldown:0,hit:null};controllerData.push(state);
    controller.addEventListener('connected',event=>state.input=event.data);
    controller.addEventListener('disconnected',()=>state.input=null);
    controller.addEventListener('selectstart',()=>{if(active&&renderer.xr.isPresenting&&state.hit){const head=new THREE.Vector3();renderer.xr.getCamera().getWorldPosition(head);rig.position.x+=state.hit.x-head.x;rig.position.z+=state.hit.z-head.z;rig.position.y=state.hit.y;position.copy(state.hit);physics?.teleportPlayer(position);}});
  }
  function resetLimbs(object){const parts=object.userData.walkParts;if(parts)for(const part of [...parts.legs,...parts.arms])part.rotation.x=0;}
  function animateLimbs(object,phase,moving){const parts=object.userData.walkParts;if(!parts)return;const swing=moving?Math.sin(phase)*.55:0;parts.legs[0].rotation.x=swing;parts.legs[1].rotation.x=-swing;parts.arms[0].rotation.x=-swing;parts.arms[1].rotation.x=swing;}
  function restoreObjects(){for(const record of getLevel().objects){const object=objects.get(record.id);if(object){applyRecord(object,record);resetLimbs(object);}}}
  function start(){if(active)return;active=true;paused=false;time=0;physics=new ScenePhysics(getLevel().objects,objects,getLevel().spawn||[0,0,7]);editorView={position:camera.position.clone(),target:orbit.target.clone()};position.fromArray(getLevel().spawn||[0,0,7]);yaw=0;pitch=0;onToggle(true);document.body.classList.add('playing');$('play-overlay').hidden=false;$('play-scene').textContent='■ Stop';$('pause-play').textContent='Pause';setMode($('view-mode').value);status('Playing scene. Collisions are active. Walk into movable props to push or topple them.');}
  async function stop(){if(!active)return;if(renderer.xr.isPresenting)await renderer.xr.getSession().end();document.exitPointerLock?.();if(document.fullscreenElement===viewport)await document.exitFullscreen();active=false;physics=null;keys.clear();restoreObjects();rig.position.set(0,0,0);rig.rotation.set(0,0,0);camera.position.copy(editorView.position);orbit.target.copy(editorView.target);orbit.enabled=true;camera.rotation.order='XYZ';orbit.update();avatar.visible=false;controllerData.forEach(s=>s.marker.visible=false);document.body.classList.remove('playing');$('play-overlay').hidden=true;$('play-scene').textContent='▶ Play';onToggle(false);status('Back in the editor. Your original object placements are restored.');}
  function setMode(value){mode=value;keys.clear();physics?.setPlayerEnabled(mode!=='orbit'&&!renderer.xr.isPresenting);document.exitPointerLock?.();orbit.enabled=mode==='orbit'&&!renderer.xr.isPresenting;avatar.visible=active&&mode==='third';$('crosshair').hidden=mode!=='first';if(mode==='orbit'){camera.position.copy(editorView.position);orbit.target.copy(editorView.target);orbit.update();}else{camera.rotation.order='YXZ';updateCamera(1);}$('play-help').textContent=mode==='orbit'?'Drag to orbit · Scroll to zoom · Choose a perspective above':'Click the view to look around · WASD / arrows to move · Shift to run · Esc releases the mouse';}
  function updateCamera(dt){if(mode==='first'){camera.position.copy(position).add(new THREE.Vector3(0,1.65,0));camera.rotation.set(pitch,yaw,0,'YXZ');}else if(mode==='third'){const offset=new THREE.Vector3(0,2.6,5.2).applyAxisAngle(new THREE.Vector3(0,1,0),yaw);const desired=position.clone().add(offset);camera.position.lerp(desired,Math.min(1,dt*10));camera.lookAt(position.x,position.y+1.3+pitch,position.z);avatar.position.copy(position);avatar.rotation.y=yaw+Math.PI;}}
  $('view-mode').onchange=e=>{if(renderer.xr.isPresenting){status('Exit VR before changing camera perspective.');return;}setMode(e.target.value);};
  $('play-scene').onclick=()=>{if(active)stop().catch(e=>status(e.message,true));else start();};$('stop-play').onclick=()=>stop().catch(e=>status(e.message,true));
  $('pause-play').onclick=()=>{paused=!paused;$('pause-play').textContent=paused?'Resume':'Pause';};
  $('restart-play').onclick=()=>{time=0;restoreObjects();physics=new ScenePhysics(getLevel().objects,objects,getLevel().spawn||[0,0,7]);physics.setPlayerEnabled(mode!=='orbit'&&!renderer.xr.isPresenting);position.fromArray(getLevel().spawn||[0,0,7]);yaw=0;pitch=0;paused=false;$('pause-play').textContent='Pause';if(renderer.xr.isPresenting){rig.position.copy(position);rig.rotation.set(0,0,0);}};
  $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await viewport.requestFullscreen();}catch{status('Fullscreen is unavailable here. Open the editor in a regular browser window.',true);}};
  renderer.domElement.addEventListener('click',()=>{if(active&&mode!=='orbit'&&!renderer.xr.isPresenting){try{const result=renderer.domElement.requestPointerLock();result?.catch(()=>status('Mouse capture is unavailable. Drag to look instead.'));}catch{status('Mouse capture is unavailable. Drag to look instead.');}}});
  let looking=false;renderer.domElement.addEventListener('pointerdown',e=>{if(active&&mode!=='orbit'&&e.button===0)looking=true;});window.addEventListener('pointerup',()=>looking=false);
  window.addEventListener('mousemove',e=>{if(!active||mode==='orbit'||renderer.xr.isPresenting)return;if(document.pointerLockElement===renderer.domElement||looking){yaw-=e.movementX*.0025;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.0025,-1.2,1.2);}});
  window.addEventListener('keydown',e=>{if(!active||['INPUT','SELECT','BUTTON'].includes(document.activeElement.tagName))return;if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(e.key.toLowerCase())){keys.add(e.key.toLowerCase());e.preventDefault();}});
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());
  renderer.xr.addEventListener('sessionstart',()=>{if(!active)start();physics?.setPlayerEnabled(false);document.exitPointerLock?.();orbit.enabled=false;avatar.visible=false;rig.position.copy(position);rig.rotation.set(0,yaw,0);camera.position.set(0,0,0);camera.rotation.set(0,0,0);status('VR: point at a floor and press trigger to teleport. Thumbstick left/right snaps your view.');});
  renderer.xr.addEventListener('sessionend',()=>{rig.position.set(0,0,0);rig.rotation.set(0,0,0);controllerData.forEach(s=>s.marker.visible=false);setMode(mode);});
  function walkableObjects(){return getLevel().objects.filter(r=>['ground','plane','road','ramp','stairs','box'].includes(r.type)&&r.visible).map(r=>objects.get(r.id));}
  function updateXR(dt){const surfaces=walkableObjects();for(const state of controllerData){state.controller.updateWorldMatrix(true,false);teleportRay.ray.origin.setFromMatrixPosition(state.controller.matrixWorld);teleportRay.ray.direction.set(0,0,-1).transformDirection(state.controller.matrixWorld);teleportRay.far=30;const hit=teleportRay.intersectObjects(surfaces,true).find(h=>h.face&&h.face.normal.clone().transformDirection(h.object.matrixWorld).y>.5);const clear=hit&&physics?.canTeleport(hit.point);state.hit=clear?hit.point:null;state.marker.visible=!!clear;if(hit){state.marker.position.copy(hit.point);state.marker.position.y+=.03;state.line.scale.z=hit.distance;}else state.line.scale.z=15;state.cooldown=Math.max(0,state.cooldown-dt);const axes=state.input?.gamepad?.axes;const axis=axes?.[2]??axes?.[0]??0;if(Math.abs(axis)>.7&&state.cooldown===0){const before=new THREE.Vector3();renderer.xr.getCamera().getWorldPosition(before);rig.rotateY(-Math.sign(axis)*Math.PI/6);rig.updateMatrixWorld(true);const after=new THREE.Vector3();camera.getWorldPosition(after);rig.position.x+=before.x-after.x;rig.position.z+=before.z-after.z;state.cooldown=.35;}}}
  function update(dt){
    if(!active)return;
    dt=Math.min(dt,.05);
    const xr=renderer.xr.isPresenting;
    const forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0);
    const side=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
    direction.set(side,0,-forward);
    const moving=direction.lengthSq()>0&&mode!=='orbit'&&!xr&&!paused;
    if(moving)direction.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw).multiplyScalar(keys.has('shift')?6:3);else direction.set(0,0,0);
    if(!paused){physics.update(dt,direction);time=physics.elapsed;}
    $('play-time').value=`${Math.floor(time/60)}:${String(Math.floor(time%60)).padStart(2,'0')}`;
    for(const record of getLevel().objects){
      const object=objects.get(record.id),b=record.behavior;if(!object||!b||b.type==='none')continue;
      const motion=motionAt(b,time);
      if(physicsSettings(record).mode==='none'){
        const offset=new THREE.Vector3(motion.x,0,motion.z).applyAxisAngle(new THREE.Vector3(0,1,0),record.rotation[1]);
        object.position.fromArray(record.position).add(offset);object.rotation.y=record.rotation[1]+motion.yaw;
      }
      const body=physics.entries.get(record.id)?.body;
      animateLimbs(object,time*b.speed*7,body?body.velocity.length()>0.15:motion.walking);
    }
    if(xr){updateXR(dt);return;}
    if(mode==='orbit'){orbit.update();return;}
    physics.playerPosition(position);updateCamera(dt);animateLimbs(avatar,time*8,moving);
  }
  return {get active(){return active;},start,stop,update};
}
