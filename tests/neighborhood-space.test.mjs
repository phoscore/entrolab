import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {NEIGHBORHOOD_URL,loadNeighborhood} from '../dist/explorer/neighborhood-data.mjs';
import {aimFree,freeSpeed,freeToOrbit,moveFree,orbitToFree} from '../dist/explorer/free-camera.mjs';
import {spaceBasis} from '../dist/explorer/solar-space.mjs';
import {distanceDisplay,neighborhoodDirection,neighborhoodFocus,neighborhoodGroups,neighborhoodHit,
  neighborhoodHome,neighborhoodProjector,neighborhoodRotate,neighborhoodZoom,neighborhoodFitDistance,
  NEIGHBORHOOD_FREE_LIMITS,NEIGHBORHOOD_MAX_ZOOM} from '../dist/explorer/neighborhood-space.mjs';

const close=(a,b,epsilon=1e-10)=>assert.ok(Math.abs(a-b)<=epsilon,`${a} ≠ ${b}`);

test('parsec free camera clips near geometry and preserves eye and data through transitions',()=>{
  const width=390,height=440,base=neighborhoodFitDistance(width,height);
  const orbit={...neighborhoodHome(),focus:[1,-3,2],zoom:1};
  const free=orbitToFree(orbit,base);
  const point=[1,2,-3];
  const first=neighborhoodProjector(orbit,width,height).project(point);
  const second=neighborhoodProjector(orbit,width,height,free).project(point);
  for(const key of ['x','y','depth'])close(first[key],second[key]);
  const limits=NEIGHBORHOOD_FREE_LIMITS;
  const [right,up,toward]=spaceBasis(free);
  for(const [i,vector] of [right,up,toward.map(v=>-v)].entries()){
    const axis=[0,0,0];axis[i]=1;
    const moved=moveFree(free,axis,3,2,limits);
    moved.position.forEach((v,j)=>close(v-free.position[j],6*vector[j]));
    assert.deepEqual(aimFree(moved,38,20).position,moved.position);
  }
  assert.equal(freeSpeed(free,8,limits),50);
  assert(moveFree(free,[1,0,0],50,1e6,limits).position.every(v=>Math.abs(v)<=limits.position));
  const turned=aimFree(free,70,-110);
  const resized=neighborhoodFitDistance(320,640);
  const back=orbitToFree(freeToOrbit(turned,resized,NEIGHBORHOOD_MAX_ZOOM),resized);
  back.position.forEach((v,i)=>close(v,turned.position[i]));
  const inside={position:[0,0,0],yaw:0,pitch:0,depth:20};
  const clipped=neighborhoodProjector(orbit,width,height,inside);
  assert.equal(clipped.project([1,0,0]),null);
  assert.equal(clipped.project([-.01,0,0]),null);
  assert.ok(clipped.project([-2,0,0]));
  close(clipped.segment([1,0,0],[-1,0,0])[0].depth,.05);
  assert.deepEqual(point,[1,2,-3]);
});

test('returning from Orbit bounds both ends of each stellar axis before movement',()=>{
  const distance=neighborhoodFitDistance(970,650);
  const limits=NEIGHBORHOOD_FREE_LIMITS;
  const faces=[
    [0, 1,Math.PI,0],[0,-1,0,0],
    [1, 1,-Math.PI/2,0],[1,-1,Math.PI/2,0],
    [2, 1,0,-Math.PI/2+.001],[2,-1,0,Math.PI/2-.001],
  ];
  for(const [axis,sign,yaw,pitch] of faces){
    const position=[12,-23,34];
    position[axis]=sign*1000;
    const free={position,yaw,pitch,depth:distance};
    const orbit=freeToOrbit(free,distance,NEIGHBORHOOD_MAX_ZOOM);
    orbitToFree(orbit,distance,limits).position.forEach((value,i)=>close(value,position[i]));
    const rotated=axis===2?
      neighborhoodRotate(orbit,0,pitch/.007):
      neighborhoodRotate(orbit,Math.PI/2/.007,0);
    const unbounded=orbitToFree(rotated,distance);
    assert(sign*unbounded.position[axis]>1010);
    const bounded=orbitToFree(rotated,distance,limits);
    assert.equal(bounded.position[axis],sign*1000);
    bounded.position.forEach((value,i)=>{if(i!==axis)close(value,unbounded.position[i]);});
    assert.deepEqual([bounded.yaw,bounded.pitch,bounded.depth],[rotated.yaw,rotated.pitch,distance]);

    const [right,up]=spaceBasis(bounded);
    const direction=axis===2?up:right;
    const inward=sign*direction[axis]>0?-1:1;
    const movement=axis===2?[0,inward,0]:[inward,0,0];
    const first=moveFree(bounded,movement,3,.2,limits);
    first.position.forEach((value,i)=>close(value,bounded.position[i]+.6*inward*direction[i]));
    assert(sign*first.position[axis]<1000);
  }
});

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
  const adjacent=[
    {row:3,x:163.9,y:180,depth:18,members:[3]},
    {row:4,x:164.1,y:180,depth:17,members:[4]},
  ];
  assert.deepEqual(neighborhoodHit(adjacent,163.9,180).members,[3,4]);
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
  assert.throws(()=>distanceDisplay(Infinity,1,2,'ly'),/Invalid/);
});
