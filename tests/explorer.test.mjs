import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {homeCamera, cameraScale, project, unproject, worldPoint, screenPoint, zoomAt, panBy, centerObject, visibleGroups, hitGroup, skyViewport} from '../dist/explorer/camera.mjs';
import {loadCatalog, checkedBytes, makeLoader, loadSky, findObjects, DATA_URL} from '../dist/explorer/catalog.mjs';
import {measurement, text} from '../dist/explorer/text.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const localFetch = async (url, {signal}) => {
  signal.throwIfAborted();
  return new Response(await readFile(url), {status:200});
};
const signal = new AbortController().signal;
const sample = await loadCatalog(signal, localFetch);
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);

test('Explorer: deployed artifacts exactly reproduce the pinned sample and foundation modules', () => {
  const result = spawnSync(process.execPath,['scripts/build-explorer.mjs','--check'],{cwd:root,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  assert.equal(sample.objects.length,22);
  assert.equal(sample.manifest.schemaVersion,1);
  assert.equal(sample.objects.filter(o=>o.direction).length,19);
  assert.equal(sample.objects.filter(o=>o.kind==='source').length,10);
});

test('Explorer: cylindrical projection preserves directions and exposes the RA seam and poles', () => {
  for(const [ra,dec] of [[0,0],[359.999,-45],[180,80],[217.39232147200883,-62.676]]) {
    const [x,y]=project(ra,dec), [r,d]=unproject(x,y); close(r,ra);close(d,dec);
  }
  assert.deepEqual(project(0,0),[0,90]);
  close(project(0,-90)[1],180);
  close(project(0,90)[1],0);
  assert.throws(()=>project(360,0));
  assert.throws(()=>project(0,91));
  assert.deepEqual(skyViewport(homeCamera(),1000,540),[0,0,1,1]);
});

test('Explorer: logarithmic zoom retains the pointer anchor and pan uses CSS pixel scale', () => {
  for(const [w,h] of [[1000,540],[320,360],[320.5,360]]) {
    const camera={x:180,y:90,zoom:1},anchor=[w*.61,h*.42];
    const world=worldPoint(anchor,camera,w,h);
    const zoomed=zoomAt(camera,2.3,anchor,w,h), next=screenPoint(world,zoomed,w,h);
    close(next[0],anchor[0]);close(next[1],anchor[1]);
    const moved=panBy(camera,27,-18,w,h), spot=screenPoint(world,moved,w,h);
    close(spot[0]-anchor[0],27);close(spot[1]-anchor[1],-18);
    close(cameraScale(zoomed,w,h)/cameraScale(camera,w,h),10**1.3);
    assert.equal(zoomAt(camera,-50,anchor,w,h).zoom,0);
    assert.equal(zoomAt(camera,50,anchor,w,h).zoom,5);
  }
});

test('Explorer: selection and clustering use real identities and unknown directions keep the camera', () => {
  const object=sample.objects.find(o=>o.kind==='star');
  const camera=centerObject(homeCamera(),object);
  assert.deepEqual(screenPoint(project(object.direction.ra.value,object.direction.dec.value),camera,1000,500),[500,250]);
  assert.strictEqual(centerObject(camera,sample.objects.find(o=>!o.direction)),camera);
  const groups=visibleGroups(sample.objects,homeCamera(),1000,540);
  assert.equal(groups.reduce((sum,g)=>sum+g.objects.length,0),19);
  assert.equal(new Set(groups.flatMap(g=>g.objects.map(o=>o.id))).size,19);
  const isolated=visibleGroups(sample.objects,camera,1000,500,object.id);
  const selected=isolated.find(g=>g.objects.some(o=>o.id===object.id));
  assert.equal(selected.objects.length,1);
  assert.equal(hitGroup(isolated,500,250).objects[0].id,object.id);
});

test('Explorer: verified tile rows and prefix shards resolve to the same catalogue objects', async () => {
  const loader=makeLoader(sample.manifest,localFetch);
  try {
    const sky=await loadSky(sample.manifest,sample.objects,loader,[0,0,1,1]);
    assert.equal(sky.objects.length,19);
    for(const query of ['Bellerophon','ｂｅｌｌｅｒｏｐｈｏｎ','TRAPPIST','Gaia','g','not-a-real-name']) {
      const results=await findObjects(sample.manifest,sample.objects,loader,query);
      assert.ok(results.every(o=>sample.objects.includes(o)));
      if(query.toLowerCase().includes('beller')||query.includes('ｂｅ'))assert.equal(results[0].identity.id,'51 Peg b');
      if(query==='not-a-real-name')assert.equal(results.length,0);
    }
    assert.ok(loader.cache.byteLength<=1024*1024);
    loader.dispose();
    await assert.rejects(loader.request(sample.manifest.release,'objects.json'),{name:'AbortError'});
  } finally {loader.dispose();}
});

test('Explorer: transport rejects bad hashes, oversized responses, HTTP errors and aborts', async () => {
  const meta=sample.manifest.packages['objects.json'], url=new URL('objects.json',DATA_URL);
  await assert.rejects(checkedBytes(url,{...meta,sha256:'0'.repeat(64)},signal,localFetch),/integrity/);
  await assert.rejects(checkedBytes(url,{...meta,bytes:2},signal,localFetch),/budget/);
  await assert.rejects(checkedBytes(url,meta,signal,async()=>new Response('',{status:404})),/HTTP 404/);
  const abort=new AbortController();abort.abort();
  await assert.rejects(loadCatalog(abort.signal,localFetch),{name:'AbortError'});
});

test('Explorer: measurements distinguish partial errors, physical limits, unknowns and quantiles in DE/EN', () => {
  for(const lang of ['de','en']) {
    for(const values of Object.values(text))assert.ok(values[0]&&values[1]);
    const partial=measurement({status:'catalog',value:4.0144479,unit:'d',limit:null,uncertainty:{kind:'asymmetric',minus:null,plus:.0000041}},lang);
    assert.match(partial,lang==='de'?/negative Fehlerseite unbekannt/:/negative error unknown/);
    assert.match(measurement({status:'catalog',value:4,unit:'d',limit:'upper'},lang),lang==='de'?/Obergrenze/:/Upper limit/);
    assert.equal(measurement({status:'unknown'},lang),lang==='de'?'unbekannt':'unknown');
    assert.match(measurement({status:'derived',value:5,unit:'pc',uncertainty:{kind:'quantiles',p16:4,p84:6}},lang),lang==='de'?/Perzentil/:/percentile/);
  }
});
