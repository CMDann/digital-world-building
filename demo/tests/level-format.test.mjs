import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateLevel,levelFilename} from '../src/level-format.js';
const starter=JSON.parse(fs.readFileSync(new URL('../levels/park-study.json',import.meta.url)));
test('starter scene is valid and portable',()=>{assert.equal(validateLevel(starter),starter);assert.ok(starter.objects.some(o=>o.type==='tree'));assert.ok(starter.objects.some(o=>o.type==='car'));});
test('reject invalid transforms, duplicate IDs and unsupported versions',()=>{for(const mutate of [s=>s.objects[0].position[0]=null,s=>s.objects[0].scale[0]=0,s=>s.objects[1].id=s.objects[0].id,s=>s.version=42,s=>s.objects[0].type='unknown',s=>s.environment.ambient=-1]){const s=structuredClone(starter);mutate(s);assert.throws(()=>validateLevel(s));}});
test('model records must embed their asset rather than refer to external URLs',()=>{const s=structuredClone(starter);Object.assign(s.objects[0],{type:'model',model:'https://example.com/model.glb'});assert.throws(()=>validateLevel(s));});
test('level filenames cannot escape levels or name reserved Windows devices',()=>{assert.equal(levelFilename('../../My scene'),'my-scene.json');assert.throws(()=>levelFilename('CON'));assert.throws(()=>levelFilename('...'));});
