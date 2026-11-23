import test from 'node:test';
import assert from 'node:assert/strict';
import {GravityTrail,TRAIL_CAPACITY,traceGravityTrail} from '../dist/gravity-trail.mjs';
import {energy,safeStep,scenario,step} from '../dist/physics.mjs';

const withoutTrails=bodies=>bodies.map(({id,trail,...body})=>body);

test('Gravity trails retain real Merkur and Venus integrator positions while model states match exactly',()=>{
  const candidate=scenario('solar'), reference=scenario('solar');
  const indices=[1,2], trails=indices.map(()=>new GravityTrail());
  const originals=indices.map(()=>new Map());
  const sparse=indices.map(()=>[]);
  let day=0;
  let largestGap=0;
  for(let frame=0;frame<155;frame++){
    let remaining=frame<30||frame>=130?.5:25;
    while(remaining>1e-12){
      const dt=Math.min(remaining,safeStep(candidate));
      assert.equal(dt,Math.min(remaining,safeStep(reference)));
      assert.equal(step(candidate,dt),step(reference,dt));
      day+=dt;remaining-=dt;
      indices.forEach((index,i)=>{
        const b=candidate[index];
        originals[i].set(day,[b.x,b.y]);
        trails[i].observe(b,day,100);
      });
    }
    if(frame%3===0)indices.forEach((index,i)=>sparse[i].push({day,x:candidate[index].x,y:candidate[index].y}));
  }
  assert.deepEqual(withoutTrails(candidate),withoutTrails(reference));
  assert.equal(energy(candidate),energy(reference));
  assert.ok(day>10*224);
  for(const [i,trail] of trails.entries()){
    const points=trail.snapshot();
    assert.ok(points.length>500&&points.length<=TRAIL_CAPACITY+1);
    assert.equal(points.at(-1).day,day);
    assert.equal(points.filter(p=>p.breakBefore).length,1);
    points.forEach(({x,y,day},j)=>{
      assert.deepEqual([x,y],originals[i].get(day));
      if(j)assert.ok(Math.hypot(x-points[j-1].x,y-points[j-1].y)<=.06+1e-12);
    });
    largestGap=Math.max(largestGap,...sparse[i].slice(1).map((p,k)=>p.day-sparse[i][k].day));
  }
  assert.ok(largestGap>=75-1e-10);
});

test('Gravity trail renderer lifts its pen across a missing interval or unresolved step',()=>{
  const trail=new GravityTrail(), calls=[];
  const sample=(x,day,vx=1)=>trail.observe({x,y:0,vx,vy:0},day,100);
  sample(0,0);sample(.01,.1);sample(.02,.2);
  sample(.5,.3);sample(.51,.4);
  sample(.52,20);sample(.53,20.1);
  sample(.54,20.2,-1);
  const ctx={beginPath(){},moveTo(x){calls.push(['move',x]);},lineTo(x){calls.push(['line',x]);},stroke(){}};
  traceGravityTrail(ctx,trail,p=>p);
  assert.deepEqual(calls,[['move',0],['line',.02],['move',.5],['line',.51],
    ['move',.52],['line',.53],['move',.54]]);
});

test('Gravity trail ring evicts oldest points and keeps its latest genuine endpoint',()=>{
  const trail=new GravityTrail();
  for(let i=0;i<4000;i++)trail.observe({x:i/40,y:0,vx:.25,vy:0},i/10,100);
  const points=trail.snapshot();
  assert.equal(points.length,TRAIL_CAPACITY+1);
  assert.equal(points.at(-1).x,3999/40);
  assert.ok(points[0].day>0&&points[0].breakBefore);
  assert.ok(points.every((p,i)=>i===0||p.day>points[i-1].day&&!p.breakBefore));
});

test('A later zoom does not join historic segments whose screen span exceeds the display limit',()=>{
 const trail=new GravityTrail(), calls=[];
 trail.observe({x:0,y:0,vx:.05,vy:0},1,20);
 trail.observe({x:.05,y:0,vx:.05,vy:0},2,20);
 const ctx={beginPath(){},moveTo(){calls.push('move');},lineTo(){calls.push('line');},stroke(){}};
 traceGravityTrail(ctx,trail,p=>({x:p.x*100,y:0}));
 assert.deepEqual(calls,['move','line']);
 calls.length=0;
 traceGravityTrail(ctx,trail,p=>({x:p.x*800,y:0}));
 assert.deepEqual(calls,['move','move']);
});
