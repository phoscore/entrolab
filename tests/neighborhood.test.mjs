import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {buildNeighborhood,readNeighborhoodSource} from '../cosmic-explorer/neighborhood-build.mjs';
import {PC_TO_LY,galacticPosition,projectNeighborhood,neighborhoodRow,neighborhoodIndex,
  NEIGHBORHOOD_RELEASE,NEIGHBORHOOD_RADIUS} from '../dist/explorer/foundation/neighborhood-format.mjs';
import {cameraScale,screenPoint,worldPoint,zoomAt} from '../dist/explorer/camera.mjs';
import {NEIGHBORHOOD_URL,loadNeighborhood,neighborhoodLoader,neighborhoodDetails} from '../dist/explorer/neighborhood-data.mjs';

const local=async (url,{signal})=>{signal.throwIfAborted();return new Response(await readFile(url));};
const signal=new AbortController().signal;

test('Galactic ICRS axes and parsec-to-light-year conversion preserve the radial distance',()=>{
  const gc=galacticPosition(266.4049948019624,-28.936173958689423,10);
  assert.ok(Math.hypot(gc[0]-10,gc[1],gc[2])<2e-6);
  const pole=galacticPosition(192.85948,27.12825,10);
  assert.ok(Math.hypot(pole[0],pole[1],pole[2]-10)<2e-6);
  for(const [a,d] of [[0,90],[0,-90],[359.9999,0],[0,0],[45,-17]]) {
    assert.ok(Math.abs(Math.hypot(...galacticPosition(a,d,37))-37)<1e-12);
  }
  assert.ok(Math.abs(PC_TO_LY-3.2615637771674)<1e-12);
  assert.throws(()=>galacticPosition(360,0,1),/Invalid ICRS/);
  assert.throws(()=>galacticPosition(0,0,-1),/Invalid ICRS/);
});

test('XY and XZ projection report different plane separations and preserve zoom anchoring',()=>{
  assert.deepEqual(projectNeighborhood([3,4,12],'xy'),{point:[3,-4],radius:5,depth:12});
  assert.deepEqual(projectNeighborhood([3,4,12],'xz'),{point:[3,-12],radius:Math.hypot(3,12),depth:4});
  const camera={x:0,y:0,zoom:0}, anchor=[220,156], frame=[-25,-25,25,25];
  const initial=worldPoint(anchor,camera,640,420,frame);
  const next=zoomAt(camera,.8,anchor,640,420,frame);
  assert.ok(screenPoint(initial,next,640,420,frame).every((v,i)=>Math.abs(v-anchor[i])<1e-10));
  assert.ok(cameraScale(next,640,420,frame)>cameraScale(camera,640,420,frame));
});

test('Immutable neighborhood package reproduces all files and independent Gaia, Bailer-Jones and Astropy references',async()=>{
  const built=await buildNeighborhood();
  assert.ok(built.checks.rows>=30);
  assert.equal(built.manifest.release,NEIGHBORHOOD_RELEASE);
  assert.equal(built.manifest.radius,NEIGHBORHOOD_RADIUS);
  assert.ok(built.files.get('manifest.json').length+built.files.get('positions.bin').length<=1024*1024);
  const physical=(await readdir(NEIGHBORHOOD_URL,{recursive:true,withFileTypes:true})).filter(e=>e.isFile());
  assert.equal(physical.length,built.files.size);
  for(const [path,bytes] of built.files) assert.deepEqual(await readFile(new URL(path,NEIGHBORHOOD_URL)),Buffer.from(bytes),path);
  const credits=(await readFile(new URL('CREDITS.md',NEIGHBORHOOD_URL),'utf8'));
  for(const text of ['CC BY-NC 3.0 IGO','https://creativecommons.org/licenses/by-nc/3.0/igo/','CC BY 4.0','ESA/Gaia/DPAC','10.3847/1538-3881/abd806']) assert.ok(credits.includes(text),text);
});

test('All neighborhood points preserve exact Gaia IDs and spatial posterior medians, with detail records fetched lazily',async()=>{
  const {rows}=await readNeighborhoodSource();
  const requests=[];
  const fetcher=(url,options)=>{requests.push(url.pathname);return local(url,options);};
  const data=await loadNeighborhood(signal,fetcher);
  assert.equal(data.ids.length,rows.length);
  assert.equal(requests.length,2);
  assert.ok(requests[0].endsWith('manifest.json')&&requests[1].endsWith('positions.bin'));
  assert.equal(new Set(data.order).size,rows.length);
  for(const [i,row] of rows.entries()) {
    assert.equal(String(data.ids[i]),row.id);
    const xyz=data.xyz.subarray(3*i,3*i+3);
    assert.ok(Math.abs(Math.hypot(...xyz)-row.median)<5e-6);
  }
  const loader=neighborhoodLoader(data.manifest,fetcher);
  try {
    for(const i of [0,Math.floor(rows.length/2),rows.length-1]) {
      const r=rows[i];
      assert.equal(neighborhoodIndex(data.ids,r.id),i);
      const detail=await neighborhoodDetails(data,loader,i);
      assert.deepEqual(detail,{...r,xyz:galacticPosition(r.ra,r.dec,r.median)});
      assert.ok(detail.lo<=detail.median&&detail.median<=detail.hi);
    }
    assert.equal(neighborhoodIndex(data.ids,'9999999999999999999'),-1);
    assert.ok(requests.slice(2).every(path=>/\/details\/\d+\.csv$/.test(path)));
    const bad=neighborhoodLoader(data.manifest,async()=>new Response(new Uint8Array(100)));
    try {
      await assert.rejects(neighborhoodDetails(data,bad,0),/integrity|budget/);
      assert.equal(bad.cache.byteLength,0);
    } finally {bad.dispose();}
    await assert.rejects(loadNeighborhood(signal,async()=>new Response('invalid')),/integrity/);
  } finally {loader.dispose();}
});

test('Invalid population, missing parallax, poor astrometric fits and unordered quantiles are excluded',()=>{
  const row='35227046884571776,43.26964247679057,16.86437381897744,260.98843,0.09342672,12.263103,1.3042897,31,13,3.8302217,3.8315592,3.8329766';
  assert.equal(neighborhoodRow(row).median,3.8315592);
  for(const invalid of [
    row.replace('260.98843','-260.98843'),row.replace('0.09342672',''),row.replace('1.3042897','1.4'),
    row.replace(',31,13,',',3,13,'),row.replace('3.8302217','4.2'),row.replace('3.8329766','8'),
  ]) assert.throws(()=>neighborhoodRow(invalid));
});
