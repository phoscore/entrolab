import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {buildDeepSky,readDesiSource,desiFootprint} from '../cosmic-explorer/desi-build.mjs';
import {skyCoordinates} from '../cosmic-explorer/tiles.mjs';
import {DESI_RELEASE,DESI_COUNT,DESI_SIDE,decodeDesiTile,desiRow,desiBand,desiSearchPath} from '../dist/explorer/foundation/desi-format.mjs';
import {DESI_URL,loadDesiManifest,makeDesiLoader,loadDesiOverview,planDesi,findDesi,desiQuery,desiDetail} from '../dist/explorer/desi-data.mjs';
import {viewDesiCounts} from '../dist/explorer/desi-paint.mjs';

const actual = path=>readFile(new URL(path,DESI_URL));
const local = async (url,{signal})=>{
  signal.throwIfAborted();
  return new Response(await readFile(url));
};
const signal = new AbortController().signal;
const manifest = await loadDesiManifest(signal,local);
const {rows,receipt} = await readDesiSource();

test('DESI release regenerates every byte with independent official FITS comparisons and distinct data credits', async()=>{
  const result=await buildDeepSky();
  assert.equal(result.manifest.counts.sources,DESI_COUNT);
  assert.equal(result.referenceRows,50);
  assert.equal(receipt.reference.files.length,50);
  assert.equal(result.manifest.footprint.tiles,2275);
  assert.ok(result.footprintSquareDegrees>8000 && result.footprintSquareDegrees<11000);
  const files=(await readdir(DESI_URL,{recursive:true,withFileTypes:true})).filter(f=>f.isFile());
  assert.equal(files.length,result.files.size);
  for (const [path,expected] of result.files) assert.deepEqual(await actual(path),Buffer.from(expected),path);
  const credits=(await actual('CREDITS.md')).toString('utf8');
  for(const required of ['CC BY 4.0','https://creativecommons.org/licenses/by/4.0/','10.3847/1538-3881/ae4c43','Tohono O’odham','DESI acknowledgments']) assert.ok(credits.includes(required),required);
});

test('DESI tiles and search shards map every exact TARGETID and redshift band to the matching row', async()=>{
  const seenTiles=new Set(),seenSearch=new Set();
  async function walk(node) {
    if (node.children) {
      assert.equal(node.count,node.children.reduce((total,child)=>total+child.count,0));
      for (const child of node.children) await walk(child);
    } else for (const file of node.files) {
      const tile=decodeDesiTile(await actual(file.path),file.count);
      const [left,bottom,span]=node.bounds;
      for (const [i,row] of tile.rows.entries()) {
        const original=rows[row];
        const [u,v]=skyCoordinates(original.ra,original.dec);
        assert.ok(u>=left&&u<left+span&&v>=bottom&&v<bottom+span);
        assert.ok(Math.abs(left+span*tile.xy[2*i]-u)<=span*2**-24);
        assert.ok(Math.abs(bottom+span*tile.xy[2*i+1]-v)<=span*2**-24);
        assert.equal(tile.flags[i],desiBand(original.z));
        assert.equal(tile.ids[i],original.id);
        assert.ok(!seenTiles.has(row));
        seenTiles.add(row);
      }
    }
  }
  await walk(manifest.tree);
  for (const path of Object.keys(manifest.packages).filter(p=>p.startsWith('search/'))) {
    for (const [id,i,band] of JSON.parse(await actual(path))) {
      assert.equal(desiSearchPath(id),path);
      assert.equal(id,rows[i].id);
      assert.equal(band,desiBand(rows[i].z));
      assert.ok(!seenSearch.has(i));seenSearch.add(i);
    }
  }
  assert.equal(seenTiles.size,DESI_COUNT);
  assert.equal(seenSearch.size,DESI_COUNT);
});

test('DESI overview counts actual cells by redshift, while the footprint geometry wraps across RA zero',async()=>{
  const loader=makeDesiLoader(manifest,{fetcher:local});
  try {
    const data=await loadDesiOverview(manifest,loader);
    const totals=viewDesiCounts(data,[0,0,1,1],'all');
    assert.equal(totals.selected,DESI_COUNT);
    assert.equal(viewDesiCounts(data,[0,0,1,1],'low').selected,manifest.counts.low);
    assert.equal(viewDesiCounts(data,[0,0,1,1],'high').selected,manifest.counts.high);
    assert.ok(data.coverage.some(v=>v===0));
    assert.ok(data.coverage.some(v=>v===4));
    const coverage=desiFootprint([{ra:0,dec:0}]);
    assert.ok(coverage[64*DESI_SIDE]&&coverage[65*DESI_SIDE-1]);
    const cell=[new Uint16Array(DESI_SIDE**2),new Uint16Array(DESI_SIDE**2)];
    for (const r of rows) {
      const [u,v]=skyCoordinates(r.ra,r.dec);
      cell[desiBand(r.z)][Math.floor(v*DESI_SIDE)*DESI_SIDE+Math.floor(u*DESI_SIDE)]++;
    }
    assert.deepEqual(data.low,cell[0]);assert.deepEqual(data.high,cell[1]);
    assert.equal(planDesi(manifest,{viewport:[0,0,1,1],zoom:3,width:320}).tiles,null);
  } finally {loader.dispose();}
});

test('DESI detail paths verify identity and digest, preserve z, and abort obsolete requests',async()=>{
  const loader=makeDesiLoader(manifest,{fetcher:local});
  try {
    const sample=rows[925];
    assert.equal(desiQuery('DESI DR1 '+sample.id),sample.id);
    const ref=await findDesi(loader,sample.id,'all');
    assert.deepEqual(await desiDetail(manifest,loader,ref,signal),sample);
    assert.equal(await findDesi(loader,sample.id,desiBand(sample.z)?'low':'high'),null);
    await assert.rejects(desiDetail(manifest,loader,{...ref,id:'123456'},signal),/identity mismatch/);
  } finally {loader.dispose();}
  const bad=makeDesiLoader(manifest,{fetcher:async()=>new Response(new Uint8Array(manifest.packages['overview.bin'].bytes))});
  await assert.rejects(loadDesiOverview(manifest,bad),/integrity/);
  assert.equal(bad.cache.byteLength,0);
  bad.dispose();
  const held=makeDesiLoader(manifest,{fetcher:async (_,{signal})=>new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true}))});
  const pending=held.request(DESI_RELEASE,'overview.bin');
  held.changeView();
  await assert.rejects(pending,{name:'AbortError'});
  held.dispose();
});

test('DESI import fails on blank, warning, non-galaxy or out-of-selection raw values',()=>{
  const row='39628379988689587,251.5359034749192,25.29005210286309,0.012,1.5e-5,0,395,9239,131074,GALAXY,t,DESI J251.5358+25.2900';
  assert.equal(desiBand(desiRow(row).z),1);
  for (const broken of [
    row.replace('1.5e-5',''), row.replace('e-5,0,','e-5,1,'), row.replace('395,','40,'),
    row.replace('GALAXY','STAR'),row.replace('0.012','0.025'),row.replace('131074','1'),row.replace(',t,',',f,'),
  ]) assert.throws(()=>desiRow(broken));
});
