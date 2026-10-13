// Rigid bodies use compound primitive colliders. Authored transforms remain untouched in the level records.
import * as THREE from '../vendor/three/three.module.js';
import * as C from '../vendor/cannon-es/cannon-es.js';
import { physicsSettings } from './physics-settings.js';
import { motionAt } from './motion.js';
const cv=v=>new C.Vec3(v.x,v.y,v.z);
const cq=q=>new C.Quaternion(q.x,q.y,q.z,q.w);
const up=new THREE.Vector3(0,1,0);
export class ScenePhysics {
  constructor(records,objects,spawn=[0,0,7]) {
    this.world=new C.World({gravity:new C.Vec3(0,-9.81,0),allowSleep:true});
    this.world.broadphase=new C.SAPBroadphase(this.world);this.world.solver.iterations=15;
    this.world.defaultContactMaterial.friction=.5;this.world.defaultContactMaterial.restitution=.05;
    this.entries=new Map();this.elapsed=0;this.accumulator=0;this.playerEnabled=true;
    for(const record of records){const object=objects.get(record.id);if(!object||!record.visible)continue;const config=physicsSettings(record);if(config.mode==='none')continue;const entry=this.createEntry(record,object,config);this.entries.set(record.id,entry);this.world.addBody(entry.body);}
    this.player=new C.Body({mass:70,fixedRotation:true,allowSleep:false,linearDamping:.01,material:new C.Material({friction:0,restitution:0})});
    for(const y of [-.5,0,.5])this.player.addShape(new C.Sphere(.32),new C.Vec3(0,y,0));
    this.player.position.set(spawn[0],spawn[1]+.83,spawn[2]);this.player.updateMassProperties();this.world.addBody(this.player);
    this.spawn=spawn.slice();
  }
  createEntry(record,object,config){
    object.updateWorldMatrix(true,true);
    const specs=[];const inverse=object.matrixWorld.clone().invert(),scaleMatrix=new THREE.Matrix4().makeScale(...record.scale);
    const addBox=(size,center,quaternion=new THREE.Quaternion())=>specs.push({shape:new C.Box(new C.Vec3(Math.max(.025,size.x/2),Math.max(.025,size.y/2),Math.max(.025,size.z/2))),center,quaternion});
    const localBounds=new THREE.Box3();
    object.traverse(part=>{if(!part.isMesh||part.userData.editorOnly)return;part.geometry.computeBoundingBox();const matrix=scaleMatrix.clone().multiply(inverse).multiply(part.matrixWorld);localBounds.union(part.geometry.boundingBox.clone().applyMatrix4(matrix));});
    if(localBounds.isEmpty())localBounds.set(new THREE.Vector3(-.25,0,-.25),new THREE.Vector3(.25,.5,.25));
    const center=localBounds.getCenter(new THREE.Vector3()),size=localBounds.getSize(new THREE.Vector3());
    const actor=record.type==='person';const scripted=record.behavior&&record.behavior.type!=='none';
    if(actor){const radius=Math.max(.08,.3*Math.max(record.scale[0],record.scale[2]));const height=1.75*record.scale[1];center.set(0,height/2,0);for(const y of [radius,height/2,height-radius])specs.push({shape:new C.Sphere(Math.min(radius,height/2)),center:new THREE.Vector3(0,y,0),quaternion:new THREE.Quaternion()});}
    else if(record.type==='model')addBox(size,center.clone());
    else {
      let meshIndex=0;
      object.traverse(part=>{
        if(!part.isMesh||part.userData.editorOnly)return;
        if(record.type==='tree'&&meshIndex++>0)return; // Foliage stays passable; the trunk is solid.
        const geometry=part.geometry,matrix=scaleMatrix.clone().multiply(inverse).multiply(part.matrixWorld);
        const p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();matrix.decompose(p,q,s);
        const bounds=geometry.boundingBox,shapeCenter=bounds.getCenter(new THREE.Vector3()).applyMatrix4(matrix),shapeSize=bounds.getSize(new THREE.Vector3()).multiply(s);
        if(geometry.type==='SphereGeometry'&&Math.max(s.x,s.y,s.z)-Math.min(s.x,s.y,s.z)<.001){specs.push({shape:new C.Sphere(geometry.parameters.radius*s.x),center:shapeCenter,quaternion:q});}
        else if(geometry.type==='TorusGeometry'){
          const {radius,tube,arc}=geometry.parameters;const count=Math.max(8,Math.ceil(arc/(Math.PI*2)*24));
          for(let i=0;i<count;i++){const a=(i+.5)/count*arc,point=new THREE.Vector3(Math.cos(a)*radius,Math.sin(a)*radius,0).applyMatrix4(matrix);const orientation=q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),a));addBox(new THREE.Vector3(tube*2,arc*radius/count+tube,tube*2).multiply(s),point,orientation);}
        } else if(record.type==='ramp'){
          const points=[[-1,0,-1],[1,0,-1],[1,1.5,-1],[-1,0,1],[1,0,1],[1,1.5,1]].map(v=>new C.Vec3(v[0]*record.scale[0],v[1]*record.scale[1],v[2]*record.scale[2]));
          specs.push({shape:new C.ConvexPolyhedron({vertices:points,faces:[[0,2,1],[3,4,5],[0,1,4,3],[1,2,5,4],[0,3,5,2]]}),center:new THREE.Vector3(),quaternion:new THREE.Quaternion()});
        } else if(geometry.type==='CylinderGeometry'&&Math.abs(s.x-s.z)<.001){const p=geometry.parameters;specs.push({shape:new C.Cylinder(Math.max(.001,p.radiusTop*s.x),Math.max(.001,p.radiusBottom*s.x),p.height*s.y,12),center:shapeCenter,quaternion:q});}
        else addBox(shapeSize,shapeCenter,q);
      });
    }
    const body=new C.Body({mass:config.mode==='dynamic'?config.mass:0,fixedRotation:actor||(scripted&&config.mode==='dynamic'),linearDamping:.12,angularDamping:.25,allowSleep:!actor&&!scripted,sleepTimeLimit:1,material:new C.Material({friction:(actor||scripted)?0:.55,restitution:config.restitution})});
    // Place the center of mass inside the prop, rather than at its bottom origin.
    for(const spec of specs)body.addShape(spec.shape,cv(spec.center.clone().sub(center)),cq(spec.quaternion));
    body.quaternion.copy(cq(object.quaternion));body.position.copy(cv(object.position.clone().add(center.clone().applyQuaternion(object.quaternion))));body.updateMassProperties();
    return {record,object,body,center,scripted:scripted&&config.mode==='dynamic'};
  }
  setPlayerEnabled(enabled){this.playerEnabled=enabled;this.player.collisionFilterMask=enabled?-1:0;this.player.type=enabled?C.Body.DYNAMIC:C.Body.KINEMATIC;this.player.updateMassProperties();this.player.velocity.setZero();}
  teleportPlayer(position){this.player.position.set(position.x,position.y+.84,position.z);this.player.velocity.setZero();this.player.aabbNeedsUpdate=true;this.player.wakeUp();}
  playerPosition(target=new THREE.Vector3()){return target.set(this.player.position.x,this.player.position.y-.82,this.player.position.z);}
  update(dt,velocity=new THREE.Vector3()){
    this.accumulator+=Math.min(dt,.1);const step=1/120;let count=0;
    while(this.accumulator>=step&&count++<12){
      this.elapsed+=step;
      if(this.playerEnabled){this.player.velocity.x=velocity.x;this.player.velocity.z=velocity.z;this.player.wakeUp();}
      for(const entry of this.entries.values()){
        if(!entry.scripted)continue;
        const {record,body,center}=entry,b=record.behavior;
        const motion=motionAt(b,this.elapsed);
        const offset=new THREE.Vector3(motion.x,0,motion.z).applyAxisAngle(up,record.rotation[1]);
        // A velocity motor can be stopped by walls while still transferring force to loose props.
        const target=new THREE.Vector3().fromArray(record.position).add(offset);
        const angle=record.rotation[1]+motion.yaw;
        body.quaternion.setFromEuler(record.rotation[0],angle,record.rotation[2]);
        target.add(center.clone().applyQuaternion(new THREE.Quaternion(body.quaternion.x,body.quaternion.y,body.quaternion.z,body.quaternion.w)));
        const dx=target.x-body.position.x,dz=target.z-body.position.z,dist=Math.hypot(dx,dz),speed=Math.min(b.speed,dist/step);
        body.velocity.x=dist>.001?dx/dist*speed:0;body.velocity.z=dist>.001?dz/dist*speed:0;body.angularVelocity.setZero();body.wakeUp();
      }
      this.world.step(step);this.accumulator-=step;
    }
    for(const entry of this.entries.values()){
      if(entry.body.mass===0)continue;const {body,object,center}=entry;
      object.quaternion.set(body.quaternion.x,body.quaternion.y,body.quaternion.z,body.quaternion.w);
      object.position.set(body.position.x,body.position.y,body.position.z).sub(center.clone().applyQuaternion(object.quaternion));
      if(body.position.y < -100){body.velocity.setZero();body.angularVelocity.setZero();body.position.copy(cv(new THREE.Vector3().fromArray(entry.record.position).add(center)));body.quaternion.setFromEuler(...entry.record.rotation);}
    }
    if(this.player.position.y < -30)this.teleportPlayer(new THREE.Vector3().fromArray(this.spawn));
  }
  canTeleport(point){
    const feet=point.clone().add(new THREE.Vector3(0,.05,0));
    // Conservative clearance test prevents teleporting into a wall or solid prop.
    for(const {body} of this.entries.values()){body.updateAABB();const a=body.aabb;if(feet.x+.3>a.lowerBound.x&&feet.x-.3<a.upperBound.x&&feet.z+.3>a.lowerBound.z&&feet.z-.3<a.upperBound.z&&feet.y+1.7>a.lowerBound.y&&feet.y<a.upperBound.y)return false;}
    return true;
  }
}
