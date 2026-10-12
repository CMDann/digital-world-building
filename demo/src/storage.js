// Persistence adapter: project files locally, IndexedDB on static hosts such as GitHub Pages.
import { validateLevel, levelFilename } from './level-format.js';
let localServer=false, database;
export async function initializeStorage(){
  try{const response=await fetch('./api/levels');localServer=response.ok && (response.headers.get('content-type')||'').includes('application/json') && Array.isArray(await response.json());}catch{localServer=false;}
  if(!localServer) database=await new Promise((resolve,reject)=>{const request=indexedDB.open('world-seed-scenes',1);request.onupgradeneeded=()=>request.result.createObjectStore('levels',{keyPath:'filename'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(new Error('Browser storage is unavailable. Use Export JSON to keep scenes.'));});
  return localServer?'folder':'browser';
}
function transaction(mode,operation){return new Promise((resolve,reject)=>{if(!database){reject(new Error('Browser storage is unavailable. Use Export JSON instead.'));return;}const tx=database.transaction('levels',mode);const request=operation(tx.objectStore('levels'));tx.oncomplete=()=>resolve(request.result);tx.onerror=()=>reject(new Error('Browser storage could not save this scene. Use Export JSON to keep a copy.'));tx.onabort=()=>reject(new Error('Storage is full or unavailable. Use Export JSON to keep a copy.'));});}
export async function listScenes(){
  if(localServer){const response=await fetch('./api/levels');if(!response.ok)throw new Error('Could not list the levels folder.');return (await response.json()).map(filename=>({filename,source:'folder'}));}
  let bundled=[];try{const response=await fetch('./levels/index.json');if(response.ok)bundled=await response.json();}catch{}
  const saved=await transaction('readonly',store=>store.getAll());
  return [...saved.map(item=>({filename:item.filename,source:'browser'})),...bundled.map(filename=>({filename,source:'example'}))];
}
export async function loadScene(entry){
  if(entry.source==='browser'){const row=await transaction('readonly',store=>store.get(entry.filename));if(!row)throw new Error('Saved scene was not found in this browser.');return validateLevel(row.data);}
  const response=await fetch(`./levels/${encodeURIComponent(entry.filename)}`);if(!response.ok)throw new Error('Could not open that scene.');return validateLevel(await response.json());
}
export async function saveScene(data,overwrite=false){
  validateLevel(data);const filename=levelFilename(data.name);
  if(localServer){const response=await fetch(`./api/levels${overwrite?'?overwrite=1':''}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(response.status===409)return {conflict:true};const result=await response.json();if(!response.ok)throw new Error(result.error||'Could not save scene.');return {filename:result.filename,location:'levels/'};}
  if(!overwrite && await transaction('readonly',store=>store.get(filename)))return {conflict:true};
  await transaction('readwrite',store=>store.put({filename,data:structuredClone(data),updatedAt:Date.now()}));return {filename,location:'this browser: '};
}
