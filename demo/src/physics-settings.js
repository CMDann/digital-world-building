// Defaults are shared by the inspector, file format, and play simulation.
const movable = new Set(['box','sphere','cylinder','cone','torus','capsule','pyramid','bench','car','person']);
export function physicsSettings(record) {
  const disabled = record.type.endsWith('Light') || record.type === 'bush';
  return {mode:disabled?'none':movable.has(record.type)?'dynamic':'fixed',mass:record.type==='person'?70:record.type==='car'?800:record.type==='bench'?25:5,restitution:0.1,...record.physics};
}
