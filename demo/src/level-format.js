// Portable level format shared by the browser and local save server.
export const TYPES = ['box', 'sphere', 'cylinder', 'ground', 'tree', 'car', 'rock', 'bench', 'pointLight', 'directionalLight', 'model'];
const finite = (n) => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= 100000;
const vector = (v) => Array.isArray(v) && v.length === 3 && v.every(finite);
const color = (v) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
export function validateLevel(data) {
  const fail = (message) => { throw new Error(message); };
  if (!data || data.format !== 'world-seed' || data.version !== 1) fail('Expected a World Seed scene (version 1).');
  if (typeof data.name !== 'string' || !data.name.trim() || data.name.length > 80) fail('Scene name must be 1–80 characters.');
  if (!data.environment || !color(data.environment.background) || !finite(data.environment.ambient) || data.environment.ambient < 0 || data.environment.ambient > 10) fail('Invalid scene environment.');
  if (!data.camera || !vector(data.camera.position) || !vector(data.camera.target)) fail('Invalid camera position or target.');
  if (!Array.isArray(data.objects) || data.objects.length > 1000) fail('Scenes support up to 1,000 objects.');
  const ids = new Set();
  for (const [i, object] of data.objects.entries()) {
    const label = `Object ${i + 1}`;
    if (!object || typeof object.id !== 'string' || !object.id || ids.has(object.id)) fail(`${label}: missing or duplicate ID.`);
    ids.add(object.id);
    if (!TYPES.includes(object.type)) fail(`${label}: unsupported object type.`);
    if (typeof object.name !== 'string' || object.name.length > 100) fail(`${label}: invalid name.`);
    if (!vector(object.position) || !vector(object.rotation) || !vector(object.scale) || object.scale.some(n => n < 0.01)) fail(`${label}: invalid transform.`);
    if (!color(object.color)) fail(`${label}: invalid color.`);
    if (typeof object.visible !== 'boolean') fail(`${label}: invalid visibility.`);
    if (object.type.endsWith('Light') && (!finite(object.intensity) || object.intensity < 0 || object.intensity > 10000)) fail(`${label}: invalid light intensity.`);
    if (object.type === 'model' && (typeof object.model !== 'string' || !/^data:application\/octet-stream;base64,[A-Za-z0-9+/]+=*$/.test(object.model) || object.model.length > 28000000)) fail(`${label}: expected an embedded GLB model under 20 MB.`);
  }
  return data;
}
export function levelFilename(name) {
  const slug = name.normalize('NFKD').replace(/[^a-zA-Z0-9 _-]/g, '').trim().replace(/\s+/g, '-').toLowerCase().slice(0, 80);
  if (!slug || /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i.test(slug)) throw new Error('Use a scene name with letters or numbers.');
  return `${slug}.json`;
}
