import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {ATLAS_RELEASE,DENSITY_SIDE,atlasRow,atlasLines,decodeAtlasTile,decodeAtlasSearch,flagOf,MASKS} from '../cosmic-explorer/atlas-format.mjs';
import {frozenExport,capture,atlasSha256} from '../cosmic-explorer/atlas-build.mjs';
import {skyCoordinates} from '../cosmic-explorer/tiles.mjs';
import {ATLAS_URL,loadAtlasManifest,makeAtlasLoader,planAtlas,loadAtlasTiles,loadDensity,searchAtlas,atlasDetail} from '../dist/explorer/atlas-data.mjs';
import {densityIndex,densityCounts,densityBitmap} from '../dist/explorer/atlas-paint.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const dataDir=fileURLToPath(ATLAS_URL);
const file=async path=>new Uint8Array(await readFile(new URL(path,ATLAS_URL)));
const localFetch=async (url,{signal})=>{
  signal.throwIfAborted();
  return new Response(await readFile(fileURLToPath(url)));
};
const signal=new AbortController().signal;
const manifest=await loadAtlasManifest(signal,localFetch);
const original=await frozenExport(dataDir);
const rows=atlasLines(original).map(atlasRow);

test('Gaia display feathers occupied edges without painting any empty catalogue cells',async()=>{
  const loader=makeAtlasLoader(manifest,{fetcher:localFetch});
  try {
    const counts=await loadDensity(manifest,loader),resolution=DENSITY_SIDE*3;
    for(const [filter,occupiedCount] of [['all',15134],['position',727],['parallax',15088]]) {
      const index=densityIndex(counts,filter);
      let image;
      const canvas={getContext:()=>({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData:value=>{image=value;}})};
      densityBitmap(index,canvas);
      let visible=0,empty=0;
      for(let y=0;y<DENSITY_SIDE;y++)for(let x=0;x<DENSITY_SIDE;x++) {
        const alpha=image.data[4*((DENSITY_SIDE-1-y)*3+1)*resolution+4*(x*3+1)+3];
        if(index.values[y*DENSITY_SIDE+x]) {assert.ok(alpha>0,`invisible ${filter} ${x},${y}`);visible++;}
        else {assert.equal(alpha,0,`painted empty ${filter} ${x},${y}`);empty++;}
      }
      assert.equal(visible,occupiedCount);
      assert.equal(visible+empty,DENSITY_SIDE**2);
    }
  }finally{loader.dispose();}
});

test('shipped Gaia licence and package digests match, and the historical First Light sample is byte-identical',async()=>{
  const credits=await file('CREDITS.md');
  const notice=new TextDecoder().decode(credits);
  assert.match(notice,/\[CC BY-NC 3\.0 IGO\]\(https:\/\/creativecommons\.org\/licenses\/by-nc\/3\.0\/igo\/\)/);
  assert.match(notice,/https:\/\/www\.cosmos\.esa\.int\/web\/gaia-users\/license\)/);
  assert.match(notice,/https:\/\/www\.cosmos\.esa\.int\/web\/esdc\/terms-and-conditions\)/);
  assert.match(notice,/NonCommercial condition limits reuse/);
  assert.match(notice,/separate authorization from ESA before commercial use/);
  assert.match(notice,/separate from the licence of the website source code/);

  const sampleUrl=new URL('../dist/explorer/data/v0.9.5-sample.1/',import.meta.url);
  const sampleBytes=await readFile(new URL('manifest.json',sampleUrl));
  assert.equal(atlasSha256(sampleBytes),'570dc33b4824bd01e39a3c7065caf0e4a9db2f977aa8699c486a552441ddea6e');
  const sample=JSON.parse(sampleBytes);
  for (const [url,release,count] of [[ATLAS_URL,manifest,463],[sampleUrl,sample,57]]) {
    const entries=await readdir(url,{recursive:true,withFileTypes:true});
    assert.equal(entries.filter(entry=>entry.isFile()).length,count);
    assert.equal(Object.keys(release.packages).length+1,count);
    for (const [path,expected] of Object.entries(release.packages)) {
      const bytes=await readFile(new URL(path,url));
      assert.equal(bytes.length,expected.bytes,path);
      assert.equal(atlasSha256(bytes),expected.sha256,path);
    }
  }
});

test('Real Sky build reproduces all shipped files and 62 official ESA cross-checks from frozen bytes',()=>{
  const result=spawnSync(process.execPath,['scripts/build-real-sky.mjs','--check'],{cwd:root,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const report=JSON.parse(result.stdout);
  assert.equal(report.release,ATLAS_RELEASE);
  assert.equal(atlasSha256(original),capture.sha256);
  assert.equal(report.counts.sources,50635);
  assert.deepEqual(report.counts.byMask,capture.solutionCounts);
  assert.equal(report.counts.negativeParallax,12);
  assert.equal(report.counts.nullParallax,779);
  assert.ok(report.counts.skyStrata.every(z=>z.every(n=>n>0)));
  assert.equal(report.crossCheck.rows,62);
  assert.equal(report.crossCheck.compared,531);
  assert.equal(report.crossCheck.missing,27);
  assert.equal(report.crossCheck.maximum.ra,0);
  assert.equal(report.crossCheck.maximum.dec,0);
});

test('all directions and all exact 64-bit IDs survive the Phase 1 tile envelope and disjoint leaf assignment',async()=>{
  const seen=new Uint8Array(rows.length);
  async function visit(node) {
    if (node.children) {
      assert.equal(node.count,node.children.reduce((n,c)=>n+c.count,0));
      for (const child of node.children) await visit(child);
      return;
    }
    assert.equal(node.count,node.files.reduce((n,p)=>n+p.count,0));
    const [x,y,size]=node.bounds;
    for (const leaf of node.files) {
      const tile=decodeAtlasTile(await file(leaf.path),leaf.count,rows.length);
      assert.deepEqual(leaf.bounds,node.bounds);
      for (let i=0;i<leaf.count;i++) {
        const index=tile.rows[i], row=rows[index], [u,v]=skyCoordinates(row.ra,row.dec);
        assert.equal(seen[index]++,0,'source assigned twice');
        assert.equal(tile.ids[i],row.id);
        assert.equal(tile.flags[i],flagOf(row));
        assert.ok(u>=x&&u<x+size&&v>=y&&v<y+size,'source on wrong side of half-open cell');
        assert.ok(Math.abs(x+tile.xy[i*2]*size-u)<=size*2**-24);
        assert.ok(Math.abs(y+tile.xy[i*2+1]*size-v)<=size*2**-24);
      }
    }
  }
  await visit(manifest.tree);
  assert.ok(seen.every(n=>n===1));
});

test('overview cells conserve true counts per mask and detail selection uses bounded complete footprints',async()=>{
  const loader=makeAtlasLoader(manifest,{fetcher:localFetch});
  try {
    const density=await loadDensity(manifest,loader);
    assert.equal(density.length,DENSITY_SIDE**2*MASKS.length);
    for (const [filter,count] of [['all',50635],['position',779],['parallax',49856]]) {
      const index=densityIndex(density,filter);
      assert.equal(densityCounts(index,[0,0,1,1]).visible,count);
      assert.equal(densityCounts(index,[.3,.3,.3,.4]).visible,0);
    }
    assert.equal(planAtlas(manifest,[0,0,1,1],0,320).mode,'density');
    assert.equal(planAtlas(manifest,[0,0,1,1],5,320).mode,'density','over-budget full sphere remains density');
    for (const [ra,dec] of [[0,0],[359.9999,0],[0,89.9],[180,-89.9],[45,.96997],[256,-28]]) {
      const [u,v]=skyCoordinates(ra,dec), vp=[Math.max(0,u-.005),Math.max(0,v-.005),Math.min(1,u+.005),Math.min(1,v+.005)];
      const plan=planAtlas(manifest,vp,2,320);
      assert.equal(plan.mode,'points');
      assert.ok(plan.tiles.length<=14 && plan.tiles.reduce((sum,leaf)=>sum+leaf.count,0)<=1600);
      const visible=(await loadAtlasTiles(manifest,loader,plan)).reduce((sum,tile)=>sum+tile.rows.length,0);
      assert.equal(visible,plan.tiles.reduce((sum,leaf)=>sum+leaf.count,0));
    }
  }finally{loader.dispose();}
});

test('sharded ID search and detail pages identify the same raw measurements, including missing and negative parallax',async()=>{
  const loaded=[];
  const loader=makeAtlasLoader(manifest,{fetcher:(url,opts)=>{loaded.push(url.pathname);return localFetch(url,opts);}});
  try {
    const choices=[rows[0],rows.find(r=>r.mask===3),rows.find(r=>r.parallax<0),rows.find(r=>r.mask===95),rows.at(-1)];
    for (const source of choices) {
      const {matches,total}=await searchAtlas(manifest,loader,'Gaia DR3 '+source.id);
      assert.equal(total,1);
      assert.equal(matches[0].id,source.id);
      const match=matches[0];
      assert.deepEqual(await atlasDetail(manifest,loader,match,signal),source);
      await assert.rejects(atlasDetail(manifest,loader,{...match,id:'42'},signal),/identity mismatch/);
      assert.equal((await searchAtlas(manifest,loader,source.id,source.mask===3?'parallax':'position')).total,0);
    }
    const largest=Object.entries(manifest.search).sort(([,a],[,b])=>manifest.packages[b].bytes-manifest.packages[a].bytes)[0];
    const [prefix,path]=largest;
    const decoded=decodeAtlasSearch(await file(path),prefix,rows.length);
    const {total,matches}=await searchAtlas(manifest,loader,prefix);
    assert.equal(total,decoded.length);assert.equal(matches.length,24);
    assert.ok(loaded.every(p=>p.includes('/search/')||p.includes('/details/')));
    assert.deepEqual(await searchAtlas(manifest,loader,'Proxima'),{matches:[],total:0});
  }finally {loader.dispose();}
});

test('corrupt, wrong-release, oversized and aborted packets never enter the Gaia cache',async()=>{
  const loader=makeAtlasLoader(manifest,{fetcher:async()=>new Response(new Uint8Array(manifest.packages['density.bin'].bytes))});
  await assert.rejects(loadDensity(manifest,loader),/integrity mismatch/);
  await assert.rejects(loader.request('old-release','density.bin'),/Unknown Gaia/);
  assert.equal(loader.cache.byteLength,0);
  loader.dispose();
  const oversized=makeAtlasLoader(manifest,{fetcher:async()=>new Response(new Uint8Array(manifest.packages['density.bin'].bytes+1))});
  await assert.rejects(loadDensity(manifest,oversized),/byte budget/);
  oversized.dispose();
  const delayed=makeAtlasLoader(manifest,{parallel:1,fetcher:async (_,{signal})=>new Promise((resolve,reject)=>{
    signal.addEventListener('abort',()=>reject(signal.reason),{once:true});
  })});
  const inFlight=delayed.request(ATLAS_RELEASE,'density.bin');
  const waiting=delayed.request(ATLAS_RELEASE,Object.values(manifest.search)[0]);
  delayed.changeView();
  await assert.rejects(inFlight,{name:'AbortError'});await assert.rejects(waiting,{name:'AbortError'});
  assert.equal(delayed.cache.byteLength,0);assert.equal(delayed.queued,0);
  delayed.dispose();
});

test('numeric CSV contract rejects invalid astrometry while retaining genuine nulls and negatives',()=>{
  const row=rows.find(r=>r.mask===3);
  assert.equal(row.parallax,null);assert.equal(row.ruwe,null);
  assert.ok(rows.some(r=>r.parallax<0));
  assert.throws(()=>atlasRow('1234,360,0,6,3,,,,1,1'),/outside sky/);
  assert.throws(()=>atlasRow('1234,0,0,6,3,1,1,,1,1'),/parallax mismatch/);
  assert.throws(()=>atlasRow('1234,0,0,8,3,,,,1,1'),/photometry selection/);
  assert.throws(()=>atlasRow('1234,0,0,6,31,-1,0,1,1,1'),/parallax mismatch/);
  assert.throws(()=>atlasRow('1e6,0,0,6,3,,,,1,1'),/source_id/);
});
