import test from 'node:test';
import assert from 'node:assert/strict';
import {motionAt} from '../src/motion.js';
const drive={type:'drive',speed:2,distance:10,delay:2,loop:false};
test('delayed driving starts at origin and stops at end of route',()=>{assert.equal(motionAt(drive,1).z,0);assert.equal(motionAt(drive,4).z,4);assert.equal(motionAt(drive,100).z,10);assert.equal(motionAt(drive,100).walking,false);});
test('repeated driving returns along the same route',()=>{const b={...drive,loop:true};assert.equal(motionAt(b,9).z,6);assert.equal(motionAt(b,9).yaw,Math.PI);assert.equal(motionAt(b,12).z,0);});
test('walking returns to its authored starting point after one circuit',()=>{const b={type:'wander',speed:1,distance:8,delay:0,loop:false};assert.ok(Math.abs(motionAt(b,8).x)<1e-9);assert.ok(Math.abs(motionAt(b,8).z)<1e-9);assert.equal(motionAt(b,8).walking,false);assert.equal(motionAt(b,2).walking,true);});
