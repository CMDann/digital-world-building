// Rebuild the portable, self-contained workshop starter worlds.
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { validateLevel } from '../src/level-format.js';
import { physicsSettings } from '../src/physics-settings.js';
const directory=new URL('../content/starters/',import.meta.url);
await fs.mkdir(directory,{recursive:true});
const catalog=[];
function world(name,ground='#88a57a',sky='#c4d6dc',ambient=1.3){const scene={format:'world-seed',version:1,name,environment:{background:sky,ambient},camera:{position:[22,18,25],target:[0,1,0]},spawn:[0,0,10],objects:[]};add(scene,'ground',[0,0,0],[6,1,6],ground);add(scene,'directionalLight',[12,22,10],[1,1,1],'#fff0d5',{intensity:3});return scene;}
function add(scene,type,position=[0,0,0],scale=[1,1,1],color='#b9ad95',extra={}){const record={id:randomUUID(),type,name:type[0].toUpperCase()+type.slice(1),position,rotation:[0,0,0],scale,color,visible:true,physics:physicsSettings({type}),...extra};scene.objects.push(record);return record;}
const fixed={physics:{mode:'fixed',mass:5,restitution:.1}};
const behavior=(type,speed,distance)=>({type,speed,distance,delay:0,loop:true});
async function save(scene,file,icon,description){validateLevel(scene);await fs.writeFile(new URL(file,directory),JSON.stringify(scene,null,2)+'\n');catalog.push({file,title:scene.name,icon,description,count:scene.objects.length});}
let s=world('Open meadow');await save(s,'open-meadow.json','□','A clear 120 m meadow with daylight. Start with space and build anything.');
s=world('Village street');
for(const x of [-8,8])for(const z of [-14,-6,2,10]){add(s,'house',[x,0,z],[1.3,1.3,1.3],x<0?'#ceb89a':'#a8b8be',{rotation:[0,x<0?Math.PI/2:-Math.PI/2,0]});add(s,'tree',[x*1.7,0,z],[1.2,1.2,1.2],'#4c7757');}
add(s,'road',[0,0,0],[1.6,1,5],'#4c5560');for(const z of [-12,0,12]){add(s,'streetlamp',[-4,0,z],[1,1,1],'#43545c');add(s,'person',[5,0,z],[1,1,1],'#c18968',{behavior:behavior('wander',.9,3)});}add(s,'car',[-1.5,0,-14],[1,1,1],'#bc634d',{behavior:behavior('drive',2,28)});s.spawn=[5,0,16];await save(s,'village-street.json','⌂','A tree-lined neighborhood with walking residents and a car driving down the street.');
s=world('Forest clearing','#789366','#c5d8d3');
for(let i=0;i<36;i++){const angle=i*2.39996,r=13+(i%5)*3;add(s,'tree',[Math.cos(angle)*r,0,Math.sin(angle)*r],[1+(i%3)*.25,1.3+(i%4)*.2,1+(i%3)*.25],['#416b4b','#547d58','#365b44'][i%3]);}for(let i=0;i<8;i++){const a=i*Math.PI/4;add(s,'rock',[Math.cos(a)*7,0,Math.sin(a)*7],[1.1,1.1,1.1],'#9d9c8d');}add(s,'bench',[-3,0,-3],[1,1,1],'#b18c60');add(s,'bench',[3,0,-3],[1,1,1],'#b18c60');add(s,'person',[0,0,-4],[1,1,1],'#bd8962',{behavior:behavior('wander',.8,4)});await save(s,'forest-clearing.json','♠','A quiet clearing surrounded by trees, rocks, and benches. Practice scale and placement.');
s=world('Physics playground','#9aabb3');
for(let y=0;y<4;y++)for(let x=0;x<5-y;x++)add(s,'box',[-3+x*1.05+y*.525,y*1.01,-3],[1,1,1],['#c98161','#e2bc76','#7ba6b4','#b295bf'][y]);
for(let i=0;i<12;i++)add(s,'box',[5,0,-6+i*.7],[1.3,2,.24],i%2?'#c2a3c9':'#88afc0',{physics:{mode:'dynamic',mass:2,restitution:.05}});
add(s,'sphere',[-5,2,1],[2,2,2],'#d39963',{physics:{mode:'dynamic',mass:30,restitution:.65}});add(s,'ramp',[-8,0,-2],[2,2,2],'#a3abb3');add(s,'person',[-2,0,2],[1,1,1],'#537e9d',{behavior:behavior('drive',1,9),rotation:[0,Math.PI,0]});await save(s,'physics-playground.json','▦','Knock over stacked crates and dominoes. Press Play, then walk into props in first person.');
s=world('Sculpture gallery','#c6c2b8','#dedcd4',1.7);
add(s,'wall',[0,0,-10],[5,1.5,1],'#e5dfd2');for(const x of [-10,10])add(s,'wall',[x,0,0],[5,1.5,1],'#ded6c7',{rotation:[0,Math.PI/2,0]});
for(const [i,type]of ['sphere','torus','cone','pyramid','capsule','cylinder'].entries()){const x=(i%3-1)*6,z=i<3?-5:3;add(s,'box',[x,0,z],[2,1,2],'#eee9df',fixed);add(s,type,[x,1,z],[1.1,1.1,1.1],['#c78862','#91b9bd','#a69ac1'][i%3],fixed);}add(s,'arch',[0,0,10],[1.5,1.5,1.5],'#d3bc99');s.spawn=[0,0,8];await save(s,'sculpture-gallery.json','◈','A walkable exhibition of primitive shapes. Experiment with composition, color, and scale.');
s=world('Night plaza','#555e69','#101b30',.35);
add(s,'cylinder',[0,0,0],[5,.5,5],'#8895a0',fixed);add(s,'torus',[0,1,0],[2,2,2],'#7db9d1',fixed);
for(let i=0;i<6;i++){const a=i*Math.PI/3,x=Math.cos(a)*11,z=Math.sin(a)*11;add(s,'streetlamp',[x,0,z],[1.3,1.3,1.3],'#3d4654');add(s,'bench',[x*.7,0,z*.7],[1,1,1],'#aa8d76',{rotation:[0,-a-Math.PI/2,0]});}add(s,'pointLight',[0,4,0],[1,1,1],'#6bc7ff',{intensity:160});for(const x of [-4,4])add(s,'person',[x,0,3],[1,1,1],'#ba8eac',{behavior:behavior('wander',.7,4)});await save(s,'night-plaza.json','☾','A plaza after dark. Balance ambient light, warm lamps, and a colored centerpiece.');
s=world('Driving avenue');add(s,'road',[0,0,0],[2.5,1,10],'#535c66');
for(const x of [-10,10])for(let z=-30;z<=30;z+=10){add(s,'tree',[x,0,z],[1.5,1.5,1.5],'#597d52');add(s,'fence',[x*.8,0,z],[1,1,1],'#a78f6d');}for(const [i,x]of [-2,2].entries())add(s,'car',[x,0,i?28:-28],[1,1,1],i?'#97bfc2':'#ce9065',{rotation:[0,i?Math.PI:0,0],behavior:behavior('drive',4,56)});s.camera={position:[26,22,35],target:[0,1,0]};s.spawn=[7,0,15];await save(s,'driving-avenue.json','⇄','Two cars on repeating routes. Adjust speeds, delays, and distances in the inspector.');
s=world('Adventure course','#b1a482','#c3d7df');
for(let i=0;i<5;i++){const z=8-i*5;add(s,'arch',[0,0,z],[1.5,1.5,1.5],'#b99c79');add(s,'cylinder',[-5,0,z],[1,1+i*.3,1],'#ba9472',fixed);add(s,'cylinder',[5,0,z],[1,1+i*.3,1],'#ba9472',fixed);}add(s,'stairs',[-7,0,-16],[2,2,2],'#b1b1a0');add(s,'ramp',[7,0,-16],[2,2,2],'#b1b1a0');for(let i=0;i<6;i++)add(s,'sphere',[(i%3-1)*2,0,-20-Math.floor(i/3)*2],[1,1,1],'#cf926b');await save(s,'adventure-course.json','∩','Walk through arches and around obstacles. Test movement, collisions, and viewpoints.');
s=JSON.parse(await fs.readFile(new URL('../levels/park-study.json',import.meta.url),'utf8'));await save(s,'park-study.json','♧','The original park, with paths, trees, props, and room to expand.');
await fs.writeFile(new URL('../content/starters.json',import.meta.url),JSON.stringify(catalog,null,2)+'\n');console.log('Created '+catalog.length+' validated starter worlds.');
