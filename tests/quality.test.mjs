import test from 'node:test';
import assert from 'node:assert/strict';
import {run,collisions} from './numerics.mjs';
import {blackHole,C,scenario} from '../dist/physics.mjs';
import {gravityInputError,MAX_POSITION_AU,MAX_SPEED_KMS} from '../dist/gravity-input.mjs';
import {length,scientific,modelStatus} from '../dist/display.mjs';
import {readFileSync,statSync} from 'node:fs';
const cases=[['binary',36525,.0006,.0001],['solar',36525,1e-8,1e-8],['hole',36525,1e-7,1e-7],['eccentric',3652.5,.0007,.003],['triple',3652.5,.0001,.00001],['encounter',30,.0001,.00001]];
for(const [name,days,a,f] of cases)for(const mode of ['adaptive','fixed'])test(`${name}: ${days} days, ${mode}; energy, momentum and angular momentum`,()=>{const r=run(name,mode,days);assert(r.maxEnergy<(mode==='adaptive'?a:f),JSON.stringify(r));assert(r.maxMomentum<1e-10);assert(r.maxAngularMomentum<1e-10)});
test('fixed Verlet: second-order orbital convergence against h=0.0125 d reference',()=>{const times=365.25*2;const [a,b,c,ref]=[.1,.05,.025,.0125].map(h=>run('eccentric','fixed',times,h));const distance=r=>Math.hypot(...r.positions[1].map((x,i)=>x-ref.positions[1][i]));assert(distance(b)<.35*distance(a));assert(distance(c)<.35*distance(b));console.log('Convergence position differences (AU):',...[a,b,c].map(distance))});
test('collision mass, impulse, dissipation, chain, BH absorption, non-collision and unresolved spin',collisions);
test('Earth Schwarzschild radius displays mm; tiny and astronomical lengths remain meaningful',()=>{assert.match(length(blackHole(C.earth).radius),/^8,87/);assert.match(length(blackHole(C.earth).radius),/mm/);assert.match(length(1e-18),/10⁻¹⁸ m/);assert.match(length(C.AU),/1 AU/);assert.match(length(9.4607304725808e15),/1 Lj/);assert.match(scientific(1e40,'Jahre'),/10⁴⁰/);assert.equal(scientific(Infinity),'—')});
test('BH warnings cover softened regime even beyond 10 Schwarzschild radii',()=>{const bs=[{type:'hole',m:1,x:0,y:0,vx:0,vy:0},{type:'planet',m:1e-6,x:2e-7,y:0,vx:0,vy:0}];assert.match(modelStatus(bs),/außerhalb/);bs[1].x=1;assert.match(modelStatus(bs),/BH-Näherung/);bs[1].vx=C.c*.11*C.day/C.AU;assert.match(modelStatus(bs),/0,1 c/);assert.equal(modelStatus([]),'')});
test('gravity inspector limits preserve Float64 resolution and the Newtonian speed domain',()=>{
 const speed=MAX_SPEED_KMS*1000*C.day/C.AU,body={m:1,x:MAX_POSITION_AU,y:-MAX_POSITION_AU,vx:speed,vy:0};
 assert.equal(gravityInputError(body),null);
 assert.equal(gravityInputError({...body,x:1e16}),'gravity.input.position');
 assert.equal(gravityInputError({...body,x:-1e16}),'gravity.input.position');
 assert.equal(gravityInputError({...body,y:1e16}),'gravity.input.position');
 assert.equal(gravityInputError({...body,x:-MAX_POSITION_AU*1.01}),'gravity.input.position');
 assert.equal(gravityInputError({...body,y:MAX_POSITION_AU*1.01}),'gravity.input.position');
 assert.equal(gravityInputError({...body,y:-MAX_POSITION_AU*1.01}),'gravity.input.position');
 assert.equal(gravityInputError({...body,vx:speed*1.001}),'gravity.input.velocity');
 assert.equal(gravityInputError({...body,vx:-speed*1.001}),'gravity.input.velocity');
 assert.equal(gravityInputError({...body,vx:0,vy:-speed*1.001}),'gravity.input.velocity');
 assert.equal(gravityInputError({...body,vx:speed*.8,vy:speed*.8}),'gravity.input.velocity');
 assert.equal(gravityInputError({...body,x:Infinity}),'gravity.input.finite');
 assert.equal(gravityInputError({...body,m:1e12}),'gravity.input.mass');
 for(const name of ['binary','hole','solar'])for(const existing of scenario(name))assert.equal(gravityInputError(existing),null,`${name}: ${existing.name}`);
 const coordinateStep=2**(Math.floor(Math.log2(MAX_POSITION_AU))-52);
 assert(coordinateStep<1e-7/100);
 assert.equal(MAX_SPEED_KMS,C.c*.01/1000);
});

test('release README and locally hosted font assets match the v0.9.5 RC',()=>{
 const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
 const readme=read('README.md');
 for(const label of ['Gravity Sandbox','Singularities','Extreme Objects','Extreme Temperature Lab','Entrolab','Matter & Fields','Cosmic Explorer','Model & Sources'])assert(readme.includes(label),label);
 assert.match(readme,/--branch main https:\/\/github\.com\/phoscore\/entrolab\.git/);
 assert.match(readme,/1[–-]512 distinguishable markers/);
 assert.match(readme,/v0\.9\.5 RC/);
 assert(!/private source|branch develop|v0\.8\s+is the current/i.test(readme));
 const css=read('dist/style.css');
 assert.match(css,/@font-face/);assert.match(css,/\.\/fonts\/DM-Sans\[opsz,wght\]\.ttf/);assert.match(css,/\.\/fonts\/Space-Grotesk\[wght\]\.ttf/);
 assert(!/fonts\.(?:googleapis|gstatic)\.com/i.test(css));
 for(const [font,author]of [['DM-Sans','The DM Sans Project Authors'],['Space-Grotesk','The Space Grotesk Project Authors']]){
  const license=read('dist/fonts/OFL-'+font+'.txt');
  assert.match(license,/SIL OPEN FONT LICENSE Version 1\.1/);assert(license.includes('Copyright '+(font==='DM-Sans'?'2014':'2020')+' '+author));
 }
 for(const font of ['DM-Sans[opsz,wght].ttf','Space-Grotesk[wght].ttf'])assert(statSync(new URL('../dist/fonts/'+font,import.meta.url)).size>100000,font);
});
