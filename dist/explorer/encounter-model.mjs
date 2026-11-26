export function sampleVector(rows,day){
  if(!rows?.length||!Number.isFinite(day)||day<rows[0][0]||day>rows.at(-1)[0])return null;
  let lo=0,hi=rows.length-1;
  while(hi-lo>1){
    const mid=(lo+hi)>>>1;
    if(rows[mid][0]<=day)lo=mid;else hi=mid;
  }
  const a=rows[lo],b=rows[hi],interval=b[0]-a[0];
  const t=(day-a[0])/interval,s=t*t,c=s*t,dt=interval*86400;
  const position=[],velocity=[];
  for(let i=1;i<=3;i++){
    const d=b[i]-a[i];
    position.push(t===1?b[i]:a[i]+(3*s-2*c)*d+(c-2*s+t)*dt*a[i+3]+(c-s)*dt*b[i+3]);
    velocity.push((6*t-6*s)*d/dt+(3*s-4*t+1)*a[i+3]+(3*s-2*t)*b[i+3]);
  }
  return [...position,...velocity];
}

export function closestApproach(rows){
  const r2=state=>state[1]**2+state[2]**2+state[3]**2;
  const nearest=rows.reduce((best,row,i)=>r2(row)<r2(rows[best])?i:best,0);
  if(nearest===0||nearest===rows.length-1)throw Error('Closest point lies at the coverage edge');
  let lo=rows[nearest-1][0],hi=rows[nearest+1][0];
  const radial=day=>{
    const [x,y,z,vx,vy,vz]=sampleVector(rows,day);
    return x*vx+y*vy+z*vz;
  };
  if(radial(lo)>=0||radial(hi)<=0)throw Error('Closest point not bracketed');
  while(hi-lo>1e-9){
    const mid=(lo+hi)/2;
    if(radial(mid)<0)lo=mid;else hi=mid;
  }
  const day=(lo+hi)/2;
  return {day,distanceKm:Math.hypot(...sampleVector(rows,day).slice(0,3))};
}
