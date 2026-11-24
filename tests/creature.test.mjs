import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {creaturePolicy,creatureRandom,planAppearance,restDelay,validMode} from '../dist/creature-policy.mjs';
import {freeCreatureSpace} from '../dist/creature-places.mjs';
import {de,en} from '../dist/i18n.mjs';

const fixed=(...values)=>()=>values.shift();

test('creature: eligibility gates all work and preserves static reduced/legacy still modes',()=>{
 assert.deepEqual(creaturePolicy(),{moving:true,still:false});
 for(const input of [{reduced:true},{mode:'still'}])assert.deepEqual(creaturePolicy(input),{moving:false,still:true});
 for(const input of [{mode:'off'},{hidden:true},{seen:false},{editing:true},{focus:true},{guide:true}]){
  assert.deepEqual(creaturePolicy(input),{moving:false,still:false});
  assert.deepEqual(creaturePolicy({...input,reduced:true}),{moving:false,still:false});
 }
 assert.equal(validMode('bad'),false);
 for(const value of ['subtle','still','off'])assert(validMode(value));
});

test('creature: seeded visits reproduce, select four sequences and skip opportunities',()=>{
 assert.equal(planAppearance(fixed(.10)),null);
 for(const [roll,sequence] of [[.19,'mischief'],[.31,'glitch'],[.48,'curiosity'],[.85,'observer']]){
  assert.deepEqual(planAppearance(fixed(roll,.5)),{sequence,duration:6400});
 }
 assert.equal(planAppearance(fixed(.64,.5),true).sequence,'curiosity');
 assert.equal(planAppearance(fixed(.64,.5),false).sequence,'observer');
 const one=creatureRandom(75),two=creatureRandom(75),seen=new Set();
 for(let i=0;i<1200;i++){
  const a=planAppearance(one),b=planAppearance(two);
  assert.deepEqual(a,b);
  seen.add(a?.sequence);
  if(a)assert(a.duration>=4900&&a.duration<=7900);
 }
 assert.equal(seen.size,5);
});

test('creature: a skipped opportunity consumes only the choice roll',()=>{
 const values=[.1,.77,.25];
 const random=()=>values.shift();
 assert.equal(planAppearance(random),null);
 assert.deepEqual(planAppearance(random),{sequence:'observer',duration:5650});
 assert.deepEqual(values,[]);
});

test('creature: bounded first and later waits',()=>{
 assert.equal(restDelay(fixed(0),true),6000);
 assert.equal(restDelay(fixed(.99999),true),12000);
 assert.equal(restDelay(fixed(0)),22000);
 assert.equal(restDelay(fixed(.99999)),58000);
});

test('creature: general preference has a DE and EN label',()=>{
 assert.equal(de['v0925.decorativeMotion'],'Dekorative Bewegung');
 assert.equal(en['v0925.decorativeMotion'],'Decorative motion');
});

test('creature: rendering and scheduling never depend on laboratory code or Math.random',()=>{
 for(const file of ['creature-ui.mjs','creature-policy.mjs','creature-art.mjs']){
  const code=readFileSync(new URL('../dist/'+file,import.meta.url),'utf8');
  assert.doesNotMatch(code,/Math\.random\s*\(|entrolab(?:Entropy|Gas|Thermal)|requestAnimationFrame|setInterval|\.webp/);
 }
});

test('creature: uses only free, on-screen heading space and narrows to a peek on mobile',()=>{
 const rect=(left,top,right,bottom)=>({left,top,right,bottom});
 const viewport=rect(0,0,1440,900),band=rect(48,180,1392,274);
 const title=rect(48,180,651,244),badge=rect(1130,212,1392,238);
 const spot=freeCreatureSpace(band,[title,badge],viewport);
 assert.equal(spot.pose,'hero');
 assert(spot.x+48>title.right&&spot.x+48+spot.width<badge.left);
 const compact=rect(12,80,308,202),mobile=rect(0,0,320,800);
 assert.equal(freeCreatureSpace(compact,[rect(12,80,235,200)],mobile,true).pose,'peek');
 assert.equal(freeCreatureSpace(compact,[rect(12,80,275,200)],mobile,true),null);
 assert.equal(freeCreatureSpace(rect(48,-94,1392,1),[],viewport),null);
});
