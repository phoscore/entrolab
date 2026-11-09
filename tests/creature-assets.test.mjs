import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const bytes=path=>readFileSync(new URL(path,root));
const sha=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(bytes('docs/v0.8/assets/creature-candidates.json'));

test('v0.8 assets: approved original and review copy remain byte-identical',()=>{
 const original=bytes(manifest.source);
 assert.equal(original.length,144400);
 assert.equal(sha(original),'5dfb6a91195d7c3925cee9ae202332c26476de257b1a2f5b1469da1c08536ab3');
 assert.deepEqual(bytes('dist/assets/creature-candidates/original-review.jpg'),original);
 assert.equal(manifest.sourceSha256,sha(original));
});

test('v0.8 assets: three bounded local WebP crops have recorded hashes and byte budgets',()=>{
 assert.deepEqual(manifest.assets.map(a=>a.id),['hero','peek','icon']);
 const budgets={hero:64000,peek:32000,icon:16000};
 for(const a of manifest.assets){
  const b=bytes(a.path);
  assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');
  assert.equal(b.length,a.bytes);assert.equal(sha(b),a.sha256);assert(b.length<=budgets[a.id]);
  const [x,y,w,h]=a.crop;assert(x>=0&&y>=0&&x+w<=1536&&y+h<=1536);
  assert.equal(w,h);assert.equal(a.width,a.height);assert(a.width<=512);
  assert.equal(a.estimatedRgbaBytes,a.width*a.height*4);
 }
 assert.equal(manifest.alpha,false);
});

test('v0.8 assets: candidate preview is separate from app and keeps branding unchanged',()=>{
 const html=bytes('dist/index.html').toString(),review=bytes('dist/asset-review.html').toString();
 assert(!html.includes('creature-candidates'));
 assert.match(html,/<title>entrolab - emptiness pro max<\/title>/);
 assert.match(html,/rel="icon"[^>]+favicon.svg/);
 assert.match(review,/SICHTFREIGABE AUSSTEHEND/);
 assert.match(review,/kein transparenter Freisteller/);
});
