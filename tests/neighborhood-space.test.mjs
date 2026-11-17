import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {NEIGHBORHOOD_URL,loadNeighborhood} from '../dist/explorer/neighborhood-data.mjs';
import {distanceDisplay,neighborhoodDirection,neighborhoodFocus,neighborhoodGroups,neighborhoodHit,
  neighborhoodHome,neighborhoodProjector,neighborhoodRotate,neighborhoodZoom} from '../dist/explorer/neighborhood-space.mjs';

const close=(a,b,epsilon=1e-10)=>assert.ok(Math.abs(a-b)<=epsilon,`${a} ≠ ${b}`);

test('perspective keeps a right-handed orthonormal basis with the Galactic orientation',()=>{
  const width=320,height=450;
  const camera={...neighborhoodHome(),yaw:0,pitch:0};
  const neutral=neighborhoodProjector(camera,width,height);
  assert.deepEqual(neighborhoodDirection(camera),{longitude:180,latitude:-0});
  assert.ok(neutral.project([0,1,0]).x>width/2);
  assert.ok(neutral.project([0,0,1]).y<height/2);
  assert.ok(neutral.project([1,0,0]).depth<neutral.project([0,0,0]).depth);
  for(const [yaw,pitch] of [[-.8,.55],[1.9,-.94],[5,1.32]]){
    const {distance,project}=neighborhoodProjector({...camera,yaw,pitch},width,height);
    const axes=[[1,0,0],[0,1,0],[0,0,1]].map(v=>{
      const {x,y,depth}=project(v);
      return [(x-width/2)*depth/(height*.9),(height/2-y)*depth/(height*.9),distance-depth];
    });
    for(let i=0;i<3;i++)for(let j=0;j<3;j++)close(axes[i].reduce((s,v,k)=>s+v*axes[j][k],0),i===j?1:0);
    const [a,b,c]=axes;
    close(a[0]*(b[1]*c[2]-b[2]*c[1])-a[1]*(b[0]*c[2]-b[2]*c[0])+a[2]*(b[0]*c[1]-b[1]*c[0]),1);
  }
});

test('equal aim directions have independent distances, depth order and selectable overlaps',()=>{
  const camera={...neighborhoodHome(),yaw:0,pitch:0};
  const {distance,project}=neighborhoodProjector(camera,320,400);
  assert.equal(project([distance,0,0]),null);
  assert.equal(project([distance*.98,0,0]),null);
  assert.equal(project([Infinity,0,0]),null);
  assert.ok(project([distance*.96,0,0]));
  assert.throws(()=>neighborhoodProjector({...camera,yaw:NaN},320,400),/Invalid/);
  const xyz=new Float32Array([2,0,0,20,0,0,-5,3,0,5,3,0]);
  const data={xyz,order:[0,1,2,3],magnitude:[10,10,10,10]};
  const free=neighborhoodGroups(project,320,400,data,-1,new Map());
  assert.equal(free.visible,4);
  const marker=neighborhoodHit(free.marks,160,200);
  assert.deepEqual(marker.members,[0,1]);
  assert.equal(marker.row,1);
  const chosen=neighborhoodGroups(project,320,400,data,0,new Map());
  assert.equal(neighborhoodHit(chosen.marks,160,200).row,0);
  assert.ok(chosen.marks.every((v,i)=>!i||chosen.marks[i-1].depth>=v.depth));
  assert.equal(chosen.visible,chosen.marks.length+chosen.overlap+chosen.limited);
  assert.equal(Math.hypot(...xyz.subarray(0,3)),2);
  assert.equal(Math.hypot(...xyz.subarray(3,6)),20);
  assert.ok(project([2,3,0]).x<project([20,3,0]).x);
});

test('focus and camera rotations use every original packed coordinate without mutating it',async()=>{
  const data=await loadNeighborhood(new AbortController().signal,async url=>new Response(await readFile(url)));
  const binary=await readFile(new URL('positions.bin',NEIGHBORHOOD_URL));
  const before=new Float32Array(data.xyz);
  assert.equal(data.ids.length,2753);
  for(let row=0;row<data.ids.length;row++){
    const record=12+24*row;
    assert.equal(data.ids[row],binary.readBigUInt64LE(record));
    for(let axis=0;axis<3;axis++)assert.equal(data.xyz[3*row+axis],binary.readFloatLE(record+8+4*axis));
  }
  for(const [w,h] of [[320,440],[390,340],[970,650]])for(const camera of [
    neighborhoodHome(),neighborhoodRotate(neighborhoodHome(),-180,180),neighborhoodRotate(neighborhoodHome(),480,-175),
  ]){
    const {project}=neighborhoodProjector(camera,w,h);
    const result=neighborhoodGroups(project,w,h,data,-1,new Map());
    assert.equal(result.visible,data.ids.length);
    assert.equal(result.visible,result.marks.length+result.overlap+result.limited);
    assert.ok(result.marks.length<=(w<500?1050:2200));
    const vector=data.xyz.subarray(96,99);
    const focus=neighborhoodFocus(camera,vector);
    const projected=neighborhoodProjector(focus,w,h).project(vector);
    close(projected.x,w/2);close(projected.y,h/2);
    assert.equal(neighborhoodZoom(camera,-1).zoom,0);
    assert.equal(neighborhoodZoom(camera,100).zoom,2.4);
  }
  assert.deepEqual(data.xyz,before);
  assert.throws(()=>neighborhoodFocus(neighborhoodHome(),[0,NaN,0]),/Invalid/);
});

test('display precision follows uncertainty without changing measurements',()=>{
  assert.deepEqual(distanceDisplay(1.302,1.300,1.305,'ly'),{value:4.2,interval:null});
  assert.deepEqual(distanceDisplay(18.9,17.4,20.6,'pc'),{value:19,interval:[17,21]});
});
