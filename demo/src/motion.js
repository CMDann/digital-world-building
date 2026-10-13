// Play actions are deterministic functions of elapsed time, so restart always reproduces a route.
export function motionAt(behavior,time) {
  if(!behavior||behavior.type==='none'||time<behavior.delay)return {x:0,z:0,yaw:0,walking:false};
  const duration=behavior.distance/behavior.speed;
  const elapsed=time-behavior.delay;
  if(behavior.type==='drive'){
    const leg=behavior.loop?Math.floor(elapsed/duration):0;
    const progress=behavior.loop?(elapsed%duration)/duration:Math.min(1,elapsed/duration);
    const returning=leg%2===1;
    return {x:0,z:(returning?1-progress:progress)*behavior.distance,yaw:returning?Math.PI:0,walking:behavior.loop||elapsed<duration};
  }
  const radius=behavior.distance/(Math.PI*2);
  const progress=behavior.loop?elapsed/duration:Math.min(1,elapsed/duration);
  const angle=progress*Math.PI*2;
  return {x:radius*(1-Math.cos(angle)),z:radius*Math.sin(angle),yaw:angle,walking:behavior.loop||elapsed<duration};
}
