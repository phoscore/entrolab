// Electrostatic point source in vacuum. Charge is in nC and position in m.
export function electricField(charge,x,y){
 if(![charge,x,y].every(Number.isFinite))throw new RangeError('Finite charge and position required');
 const r=Math.hypot(x,y);
 if(r<.2)return null;
 const magnitude=8.98755179*charge/(r*r);
 return {x:magnitude*x/r,y:magnitude*y/r,magnitude:Math.abs(magnitude)};
}
