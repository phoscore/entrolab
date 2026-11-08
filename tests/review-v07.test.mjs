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
