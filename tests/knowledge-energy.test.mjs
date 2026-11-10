import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {termById} from '../dist/knowledge.mjs';
import {knowledgeDE,knowledgeEN} from '../dist/knowledge-text.mjs';
import {C,G,EPS,energy} from '../dist/physics.mjs';

test('energy help: gravity resolves to mechanics, thermal reference retains its stable deep link',()=>{
 const source=readFileSync(new URL('../dist/knowledge-ui.mjs',import.meta.url),'utf8');
 const id=source.match(/\['systemEnergy','([^']+)'\]/)[1];
 assert.equal(id,'mechanicalenergy');assert.equal(termById[id].model,'gravity');
 assert.equal(termById.energy.model,'thermal');assert.equal(termById.energy.target,'guide-energy');
 assert(termById[id].sources.includes('physics-code'));assert(termById.energy.sources.includes('thermal-code'));
});
test('energy help: DE/EN identify actual units and soften gravity without thermal substitutions',()=>{
 const m=termById.mechanicalenergy,u=termById.energy;
 assert.match(m.equation,/Σᵢ<ⱼ/);assert.match(m.equation,/ε²/);assert.match(m.equation,/M☉·AU²\/d²/);
 for(const catalog of [knowledgeDE,knowledgeEN]){
  const text=catalog[m.short]+' '+catalog[m.long];
  assert.match(text,/E = K \+ V_ε/);assert.match(text,/10⁻⁷ AU/);assert.match(text,/M☉·AU²/);
  assert.doesNotMatch(text,/C_A|C_B|ΔU = Q/);
  assert.match(catalog[u.long],/U = C_A T_A \+ C_B T_B/);
  assert.notEqual(catalog[m.label],catalog[u.label]);
 }
});
test('energy help: stated mechanical expression agrees with an independent SI calculation',()=>{
 const bs=[{m:1.4,x:-.6,y:.2,vx:.003,vy:-.002},{m:.07,x:2.1,y:-.8,vx:-.001,vy:.008},{m:1e-6,x:.2,y:.4,vx:0,vy:0}];
 const unit=C.sun*(C.AU/C.day)**2;
 let si=0;
 for(const b of bs)si+=.5*(b.m*C.sun)*((b.vx*C.AU/C.day)**2+(b.vy*C.AU/C.day)**2);
 for(let i=0;i<bs.length;i++)for(let j=i+1;j<bs.length;j++){
  const a=bs[i],b=bs[j],r=Math.sqrt(((a.x-b.x)*C.AU)**2+((a.y-b.y)*C.AU)**2+(EPS*C.AU)**2);
  si-=C.G*(a.m*C.sun)*(b.m*C.sun)/r;
 }
 // Independent unit conversion has a different evaluation order; allow only roundoff.
 assert(Math.abs(energy(bs)-si/unit)<=32*Number.EPSILON*Math.abs(si/unit));
 assert(unit>1e42);assert.notEqual(energy(bs),si);
});
test('energy help: pair potential is finite at coincidence and kinetic reference is explicit',()=>{
 const a={m:2,x:0,y:0,vx:3,vy:4},b={m:5,x:0,y:0,vx:0,vy:0};
 assert.equal(energy([a]),25);assert.equal(energy([]),0);
 assert.equal(energy([a,b]),25-G*10/EPS);
 const inputs=JSON.stringify([a,b]);energy([a,b]);assert.equal(JSON.stringify([a,b]),inputs);
});
