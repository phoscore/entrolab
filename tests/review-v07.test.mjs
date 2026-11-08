import test from 'node:test';import assert from 'node:assert/strict';
import {celsiusToKelvin} from '../dist/extreme-data.mjs';
import {thermalHarness} from './thermal-ui-harness.mjs';
test('review P2: exact Celsius lower boundary can be transferred without changing source or model',()=>{
 const h=thermalHarness();try{const before=h.inspect(),k=celsiusToKelvin(-23.15);h.el('temperatureTransferValue').value=String(k);h.el('celsiusInput').value='-23.15';h.el('celsiusInput').fire('change');assert.equal(h.el('thermalTransfer').disabled,false);h.el('thermalTransfer').click();assert.equal(h.el('thermalB').value,'250');assert.equal(h.el('temperatureTransferValue').value,String(k));assert.equal(h.el('celsiusInput').value,'-23.15');assert.deepEqual(h.inspect(),before)}finally{h.dispose()}
});
test('review P2: sub-millisecond time axis has distinct exact-value labels',()=>{
 const h=thermalHarness();try{h.apply({ca:1,cb:1,g:1000});const axis=h.el('thermalChart').children.filter(e=>e.tagName==='text').slice(-3).map(e=>e.textContent.trim());assert.equal(new Set(axis).size,3,JSON.stringify(axis));assert.notEqual(axis[2],'0');assert.equal(h.inspect().result.tau,.0005)}finally{h.dispose()}
});
test('review P3: replacing a transferred draft with a preset clears the obsolete notice',()=>{
 const h=thermalHarness();try{h.transfer(400);assert.match(h.el('thermalTransferNote').textContent,/400/);const before=h.inspect();h.el('preset-balanced').click();assert.equal(h.el('thermalA').value,'320');assert.equal(h.el('thermalB').value,'320');assert.equal(h.el('thermalTransferNote').textContent,'');assert.deepEqual(h.inspect(),before)}finally{h.dispose()}
});

const {thermalTransferCandidate,formatThermalTime,thermalCurveTimes}=await import('../dist/thermal-view.mjs');
test('review transfer: equivalent decimal/scientific Kelvin and Celsius endpoints have identical valid drafts',()=>{
 for(const [k,c]of [[250,'-23.15'],[600,'326.85']]){
  const source={unit:'celsius',value:c},before=structuredClone(source),converted=celsiusToKelvin(Number(c));
  assert.equal(thermalTransferCandidate(converted,source).temperature,k);assert.deepEqual(source,before);
  assert.equal(thermalTransferCandidate(k,{unit:'kelvin',value:String(k)}).temperature,k);
 }
 assert.equal(thermalTransferCandidate(celsiusToKelvin(-23.15),{unit:'celsius',value:'-2.315e1'}).temperature,250);
 assert.equal(thermalTransferCandidate(600,{unit:'kelvin',value:'6e2'}).temperature,600);
 assert.equal(thermalTransferCandidate(600+Number.EPSILON*600,{unit:'celsius',value:'326.85'}).rounded,true);
});
test('review transfer: genuine outside decimal inputs and non-conversion errors are never clamped',()=>{
 for(const [unit,values,k]of [['kelvin',['249.99999999999999999','249.99999999999997','600.00000000000000001','6.000000000000001e2'],250],['celsius',['-23.150000000000000001','-2.3150000000000000001e1','326.850000000000000001','326.850000000001'],600]])for(const value of values)assert.equal(thermalTransferCandidate(k,{unit,value}),null,value);
 for(const k of [250-1e-12,600+1e-12,0,1e12,NaN,Infinity,-Infinity,'250',null])assert.equal(thermalTransferCandidate(k,{unit:'celsius',value:'-23.15'}),null,String(k));
 assert.equal(thermalTransferCandidate(250-Number.EPSILON*250),null);assert.equal(thermalTransferCandidate(250-Number.EPSILON*250,{unit:'kelvin',value:'250'}),null);
 assert.equal(thermalTransferCandidate(273.15,{unit:'celsius',value:'0e1000000'}).temperature,273.15);
 for(const value of ['', ' ', 'garbage', 'NaN','Infinity'])assert.equal(thermalTransferCandidate(350,{unit:'celsius',value}),null);
});
test('review time formatting: tiny, ordinary and maximal windows round-trip visibly in DE/EN',()=>{
 for(const locale of ['de-DE','en-US'])for(const horizon of [.0025,250,2.5e9,1e12]){
  const values=[0,horizon/2,horizon],labels=values.map(x=>formatThermalTime(x,locale));assert.equal(new Set(labels).size,3);
  for(let i=0;i<3;i++){const parsed=Number(labels[i].replace(',','.'));assert(Number.isFinite(parsed));assert(Math.abs(parsed-values[i])<=Math.abs(values[i])*.0005)}
 }
 for(const v of [1e-15,.0005,.00125,1,50,5e8,1e12])assert.notEqual(formatThermalTime(v,'en-US'),'0',String(v));
});
test('review curve sampling: finite sorted bounded analytical times retain the early relaxation',()=>{
 for(const tau of [.0005,1,50,5e8])for(const horizon of [5*tau,Math.max(10,5*tau),1e12]){
  const times=thermalCurveTimes(tau,horizon);assert(times.length<=65);assert.equal(times[0],0);assert.equal(times.at(-1),horizon);assert(times.every((x,i)=>Number.isFinite(x)&&x>=0&&x<=horizon&&(!i||x>times[i-1])));
 }
 const tau=.0005,horizon=10,old=Array.from({length:65},(_,i)=>horizon*i/64),now=thermalCurveTimes(tau,horizon),exact=t=>320+30*Math.exp(-t/tau);
 const interp=(times,t)=>{const i=times.findIndex(x=>x>=t);if(i<=0)return exact(times[0]);const a=times[i-1],b=times[i];return exact(a)+(exact(b)-exact(a))*(t-a)/(b-a)};
 let oldMax=0,newMax=0;for(let i=0;i<=1000;i++){const t=8*tau*i/1000;oldMax=Math.max(oldMax,Math.abs(interp(old,t)-exact(t)));newMax=Math.max(newMax,Math.abs(interp(now,t)-exact(t)))}
 assert(oldMax>25);assert(newMax<.1);assert(now.filter(t=>t<=8*tau).length>=49);
});
test('review notice: manual edits, Reset, successful Apply and language keep draft provenance truthful',()=>{
 const h=thermalHarness();try{
  h.transfer(400);const original=h.inspect();h.language('en');assert.match(h.el('thermalTransferNote').textContent,/400/);assert.equal(h.el('thermalB').value,'400');assert.deepEqual(h.inspect(),original);
  for(const event of ['input','change']){h.el('thermalB').value='410';h.el('thermalForm').fire(event);assert.equal(h.el('thermalTransferNote').textContent,'');assert.deepEqual(h.inspect(),original);h.transfer(400)}
  h.el('thermalReset').click();assert.equal(h.el('thermalTransferNote').textContent,'');assert.equal(h.el('thermalB').value,'290');
  h.transfer(400);h.apply({});assert.equal(h.el('thermalTransferNote').textContent,'');assert.equal(h.inspect().params.b,400);
  h.transfer(350);h.el('thermalB').value='360';h.language('de');assert.equal(h.el('thermalTransferNote').textContent,'');assert.equal(h.el('thermalB').value,'360');assert.equal(h.inspect().params.b,400);
 }finally{h.dispose()}
});
