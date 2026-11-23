import test from 'node:test';
import assert from 'node:assert/strict';
import { C } from '../dist/physics.mjs';
import { compactObject, comparisonPosition } from '../dist/extreme-data.mjs';
import { extremeExample, extremeKinds, extremeExplanation } from '../dist/stellar-examples.mjs';
import { de,en } from '../dist/i18n.mjs';

const close=(actual,expected,tolerance)=>assert(Math.abs(actual-expected)<=tolerance,`${actual} vs ${expected}`);

test('Extreme examples preserve the three original models and classify magnetars as neutron stars',()=>{
 assert.equal(new Set(extremeKinds).size,8);
 for(const m of [1,C.sun,10*C.sun,1e41])for(const kind of ['blackhole','white','neutron']){
  assert.deepEqual(extremeExample(kind,m),compactObject(kind,m));
 }
 const magnetar=extremeExample('magnetar');
 assert.equal(magnetar.mass,compactObject('neutron').mass);
 assert.equal(magnetar.radius,12000);
 assert.equal(magnetar.period,8.69);
 assert.equal(magnetar.field,1.3e10);
 assert(!('temperature' in magnetar));
 assert.match(de[magnetar.name],/Neutronenstern/);
 assert.match(en[magnetar.name],/neutron star/);
 assert.throws(()=>extremeExample('constructor'),RangeError);
});

test('Sun provides a fixed radius and mass reference and agrees with published rounded values',()=>{
 const sun=extremeExample('sun',1e41);
 assert.deepEqual(sun,extremeExample('sun',1));
 close(sun.mass,1.9884e30,1e26);
 assert.equal(sun.radius,695700000);
 assert.equal(sun.density,sun.mass/(4*Math.PI*sun.radius**3/3));
 assert.equal(Math.round(sun.density/10),Math.round(1408/10));
 assert.equal(sun.temperature,5772);
 assert.equal(sun.luminosity,1);
 close(sun.escapeVelocity,Math.sqrt(2*C.G*sun.mass/sun.radius)/1000,.1);
 assert.equal(extremeExample('supergiant').radius/sun.radius,764);
 assert.deepEqual(sun.sources.map(([,url])=>new URL(url).hostname),['nssdc.gsfc.nasa.gov','arxiv.org','nso.edu','solarscience.msfc.nasa.gov']);
});

test('Stellar references use published values and clearly defined radius conventions',()=>{
 const brown=extremeExample('brown'), red=extremeExample('supergiant'), wr=extremeExample('wolf');
 close(brown.mass,5.580e28,1e25);
 assert.equal(brown.radius,71492000);
 assert.equal(brown.temperature,1280);
 close(brown.density,36456,120);
 close(brown.luminosity,2.55391e-5,1e-9);
 close(red.radius,5.315148e11,1);
 close(red.luminosity,88321,125);
 assert.equal(red.temperature,3600);
 close(wr.radius,6.296085e8,1);
 assert.equal(wr.temperature,140000);
 close(wr.massLoss,7.244e-6,1e-9);
 assert.equal(wr.density,null);
 for(const b of [brown,red,wr,extremeExample('magnetar')]){
  assert(!('horizon' in b));
  assert(!('photonSphere' in b));
  assert(b.sources.every(([,url])=>url.startsWith('https://')));
  assert(de[b.assumption]&&en[b.assumption]);
 }
});

test('Luhman 16B distinguishes the literature temperature derivation from the demo in DE and EN',()=>{
 const brown=extremeExample('brown');
 assert(brown.sources.some(([name,url])=>name==='Bedin et al. (2024)'&&url==='https://arxiv.org/abs/2403.08865'));
 assert.match(de[brown.assumption],/1\.280 ± 75 K aus der bolometrischen Leuchtkraft ab.*0,9 Jupiterradien/);
 assert.match(de[brown.assumption],/Demo setzt separat 1 Jupiterradius.*Literaturtemperatur eine illustrative Leuchtkraft/);
 assert.match(en[brown.assumption],/1,280 ± 75 K from the bolometric luminosity.*0\.9 Jupiter radii/);
 assert.match(en[brown.assumption],/demo separately adopts 1 Jupiter radius.*published temperature to calculate an illustrative luminosity/);
});

test('Log radius comparison remains ordered across the entire black-hole mass range',()=>{
 for(const mass of [1,10*C.sun,1e41]){
  const radii=extremeKinds.map(kind=>extremeExample(kind,mass).radius).sort((a,b)=>a-b);
  const lo=radii[0],hi=radii.at(-1);
  close(comparisonPosition(Math.sqrt(lo*hi),'log',hi,lo),0.5,1e-12);
  for(const mode of ['log','linear']){
   const points=radii.map(r=>comparisonPosition(r,mode,hi,lo));
   assert(points.every((p,i)=>p>=0&&p<=1&&(i===0||p>=points[i-1])));
   assert.equal(points.at(-1),1);
   if(mode==='log')assert.equal(points[0],0);
  }
 }
 const ratio=extremeExample('supergiant').radius/extremeExample('neutron').radius;
 close(ratio,44292900,1);
});

test('Object descriptions in both languages distinguish all eight and the three special modes',()=>{
 const states=[
  ...extremeKinds.map(kind=>({kind,disk:true,geometry:false,pulsar:false})),
  {kind:'blackhole',disk:false},{kind:'blackhole',geometry:true},{kind:'neutron',pulsar:true},
 ];
 const keys=states.map(extremeExplanation);
 assert.equal(new Set(keys).size,11);
 for(const locale of [de,en])assert.equal(new Set(keys.map(key=>locale[key])).size,11);
 for(const key of keys)assert(de[key]?.length>35&&en[key]?.length>35,key);
});
