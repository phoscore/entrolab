// Deterministic crops/encoding of the approved master; no generation or redraw.
// Development-only external dependency: ImageMagick 7 (`magick`). No runtime npm package.
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const source='docs/v0.8/assets/a3-glitched-entity-master.jpg';
const expected='5dfb6a91195d7c3925cee9ae202332c26476de257b1a2f5b1469da1c08536ab3';
const hash=b=>createHash('sha256').update(b).digest('hex');
const original=await readFile(resolve(root,source));
if(hash(original)!==expected)throw new Error('Master checksum differs; refusing derivative generation.');
const definitions=[
 {id:'hero',crop:[0,0,1536,1536],width:512,height:512,purpose:'Complete figure / full original composition'},
 {id:'peek',crop:[340,100,960,960],width:256,height:256,purpose:'Upper body / edge peek; deliberate original-image crop'},
 {id:'icon',crop:[520,180,560,560],width:128,height:128,purpose:'Compact mask; decorative in-app icon, not the active favicon'}
];
const manifest={schema:1,approval:'pending-explicit-user-visual-approval',source,sourceSha256:expected,sourceBytes:original.length,sourceWidth:1536,sourceHeight:1536,method:'Only crop + Lanczos resize + opaque WebP encoding; no drawing or generative reinterpretation; black background intentionally retained.',tool:execFileSync('magick',['-version'],{encoding:'utf8'}).split('\n')[0],quality:94,alpha:false,assets:[]};
const out='dist/assets/creature-candidates';
await mkdir(resolve(root,out),{recursive:true});
for(const d of definitions){
 const path=`${out}/${d.id}.webp`,[x,y,w,h]=d.crop;
 execFileSync('magick',[resolve(root,source),'-crop',`${w}x${h}+${x}+${y}`,'+repage','-filter','Lanczos','-resize',`${d.width}x${d.height}`,'-strip','-define','webp:method=6','-quality','94',resolve(root,path)]);
 const bytes=await readFile(resolve(root,path));
 const decoded=execFileSync('magick',['identify','-format','%w %h %[channels]',resolve(root,path)],{encoding:'utf8'});
 if(!decoded.startsWith(`${d.width} ${d.height} `))throw new Error('Unexpected derivative size: '+decoded);
 manifest.assets.push({...d,path,bytes:(await stat(resolve(root,path))).size,sha256:hash(bytes),decodedChannels:decoded.split(' ').slice(2).join(' '),estimatedRgbaBytes:d.width*d.height*4});
}
if(hash(await readFile(resolve(root,source)))!==expected)throw new Error('Master changed.');
// Approval follows only exactly matching source/derivative hashes.
try{
 const approval=JSON.parse(await readFile(resolve(root,'docs/v0.8/assets/creature-approval.json'),'utf8'));
 if(approval.sourceSha256===expected&&manifest.assets.every(a=>approval.assets?.[a.id]===a.sha256)){
  manifest.approval='approved-in-user-chat';manifest.approvalDate=approval.date;
  manifest.approvalEvidence='User explicitly replied "approved!" to the displayed Original/Hero/Peek/Icon comparison for Phase E. No merge, deployment, favicon or production-brand approval.';
 }
}catch{}
await writeFile(resolve(root,'docs/v0.8/assets/creature-candidates.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest,null,2));
