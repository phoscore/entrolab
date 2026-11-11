import {prepareLabCanvas} from './lab-canvas.mjs';

const TAU = 2 * Math.PI;
const tilt = -.14;
const hash = n => {
 const value = Math.sin(n * 127.1 + 39.7) * 43758.5453123;
 return value - Math.floor(value);
};

function glow(x, cx, cy, outer, stops) {
 const gradient = x.createRadialGradient(cx, cy, 0, cx, cy, outer);
 for (const [at, color] of stops) gradient.addColorStop(at, color);
 x.fillStyle = gradient;
 x.fillRect(cx - outer, cy - outer, outer * 2, outer * 2);
}

function path(x, points, color, width) {
 x.beginPath();
 points.forEach(([a,b], i) => i ? x.lineTo(a,b) : x.moveTo(a,b));
 x.strokeStyle = color; x.lineWidth = width; x.stroke();
}

function diskPoint(r, phi, q) {
 const s = Math.sin(phi), y = q * r * s;
 // Artistic elevation of the far side. It is not a light-bending solution.
 const arch = s < 0 ? (1 - q) * (.37 + .14 * (3.3 - r)) * s ** 2 : 0;
 return [r * Math.cos(phi), y - arch];
}

function diskTexture(x, r, q, front) {
 const start = front ? 0 : Math.PI;
 for (let lane = 0; lane < 40; lane++) {
  const ring = 1.12 + lane * .062, heat = Math.exp(-((ring - 1.48) ** 2) / .65);
  const points = Array.from({length: 73}, (_, i) => {
   const phi = start + i * Math.PI / 72;
   const drift = .035 * Math.sin(phi * 5 + lane * .3) + .024 * Math.sin(phi * 11 - lane * .7);
   const [px,py] = diskPoint(ring + drift, phi, q);
   return [r * px, r * py];
  });
  const alpha = (front ? .12 : .17) + .23 * heat * hash(lane + 2);
  path(x, points, `rgba(255,${Math.round(75 + 128 * heat)},${Math.round(42 + 85 * heat)},${alpha})`, Math.max(.65, r * (.012 + .015 * heat)));
 }
 for (let j = 0; j < 72; j++) {
  const radius = 1.23 + hash(j + 121) * 2.06, phi = start + hash(j + 311) * 2.93;
  const length = .08 + hash(j + 621) * .27;
  const points = Array.from({length: 8}, (_, i) => diskPoint(radius + i * .005, phi + i * length / 7, q).map(v => v * r));
  const bright = .24 + (1 - q) * .36 * (1 - Math.cos(phi)) / 2;
  path(x, points, `rgba(255,${150 + j % 57},${94 + j % 45},${bright})`, .8 + r * .009);
 }
}

function backdrop(x, w, h, cx, cy, r, disk, q) {
 const dark = x.createLinearGradient(0, 0, 0, h);
 dark.addColorStop(0, '#070b19'); dark.addColorStop(.53, '#080a12'); dark.addColorStop(1, '#03050b');
 x.fillStyle = dark; x.fillRect(0, 0, w, h);
 glow(x, cx * .65, cy * .58, w * .52, [[0,'#20234a71'],[.52,'#13163124'],[1,'#07091d00']]);
 for (let i = 0; i < 190; i++) {
  const px = hash(i + 1) * w, py = hash(i + 431) * h, magnitude = hash(i + 1031);
  x.fillStyle = `rgba(${i % 5 === 0 ? '239,207,184' : '185,203,238'},${.11 + magnitude * .5})`;
  x.fillRect(px, py, magnitude > .94 ? 1.8 : .85, magnitude > .94 ? 1.8 : .85);
 }
 if (!disk) return;
 x.save(); x.translate(cx,cy); x.rotate(tilt);
 x.save(); x.scale(1, .31 + .38 * q);
 glow(x, -.44*r, .11*r, 3.9*r, [[0,'#ffc77a00'],[.24,'#ffb26331'],[.46,'#de522a38'],[.75,'#a02a2019'],[1,'#86231e00']]);
 x.restore();
 diskTexture(x, r, q, false);
 const arch = (1 - q) * 1.02;
 for (let i = 0; i < 9; i++) {
  const k = 1.08 + i * .037;
  x.beginPath(); x.moveTo(-1.57*r, -.04*r);
  x.bezierCurveTo(-.85*r, -(k + arch)*r, .78*r, -(k + arch)*r, 1.62*r, .05*r);
  x.strokeStyle = `rgba(255,${143+i*8},${83+i*8},${.14+i*.042})`;
  x.lineWidth = .8 + (9-i)*r*.009; x.stroke();
 }
 x.restore();
}

function foreground(x, cx, cy, r, disk, q) {
 x.save(); x.translate(cx,cy); x.rotate(tilt);
 x.fillStyle = '#010207'; x.beginPath(); x.arc(0,0,r,0,TAU); x.fill();
 if (disk) {
  x.beginPath(); x.arc(0,0,r*1.022,Math.PI*.74,Math.PI*2.15);
  x.strokeStyle = '#ffcb96b7'; x.lineWidth = Math.max(.7, r*.023); x.stroke();
  diskTexture(x, r, q, true);
 }
 x.restore();
}

const sparks = Array.from({length: 144}, (_, i) => ({
 radius: 1.24 + hash(i+91)*2.2, phase: hash(i+491)*TAU,
 warmth: hash(i+811), rate: .27 + hash(i+511)*.16
}));

function movingTexture(x, cx, cy, r, q, time) {
 x.save(); x.translate(cx,cy); x.rotate(tilt);
 for (const spark of sparks) {
  const phi = (spark.phase + time * spark.rate / spark.radius ** 1.5) % TAU;
  const a = diskPoint(spark.radius, phi, q), b = diskPoint(spark.radius, phi + .035 + .105 * spark.warmth, q);
  if (phi > Math.PI && Math.hypot(...a) < 1.04) continue;
  const gain = .16 + .52 * spark.warmth * (.45 + (1-q) * (.55 - .4 * Math.cos(phi)));
  x.strokeStyle = `rgba(255,${Math.round(154+spark.warmth*84)},${Math.round(94+spark.warmth*78)},${gain})`;
  x.lineWidth = .65 + spark.warmth * 1.25;
  x.beginPath(); x.moveTo(r*a[0],r*a[1]); x.lineTo(r*b[0],r*b[1]); x.stroke();
 }
 x.restore();
}

export function createAccretionRenderer(canvas, {cached = true} = {}) {
 const owner = canvas.ownerDocument;
 let back = null, front = null, previous;
 function layer(target, w, h, width, height, draw) {
  if (!target) target = owner.createElement('canvas');
  target.width = w; target.height = h;
  const ctx = target.getContext('2d');
  ctx.setTransform(w / width, 0, 0, h / height, 0, 0);
  draw(ctx);
  return target;
 }
 return {
  draw({disk, angle}, time, dpr) {
   const fit = prepareLabCanvas(canvas, dpr);
   if (!fit) return false;
   const {ctx, width:w, height:h} = fit, cx = w*.5, cy = h*.50;
   const r = Math.min(w*.135, h*.244), q = .075 + .82 * Math.sin(angle * Math.PI / 180);
   const drawBack = x => backdrop(x,w,h,cx,cy,r,disk,q);
   const drawFront = x => foreground(x,cx,cy,r,disk,q);
   if (cached) {
    const key = [w,h,canvas.width,canvas.height,disk,disk && angle].join('|');
    if (key !== previous) {
     back = layer(back,canvas.width,canvas.height,w,h,drawBack);
     front = layer(front,canvas.width,canvas.height,w,h,drawFront);
     previous = key;
    }
    ctx.drawImage(back,0,0,w,h); ctx.drawImage(front,0,0,w,h);
   } else {
    drawBack(ctx); drawFront(ctx);
   }
   if (disk) movingTexture(ctx,cx,cy,r,q,time);
   return true;
  },
  dispose() {
   for(const canvas of [back,front]) if(canvas)canvas.width=canvas.height=0;
   back = front = null; previous = undefined;
  }
 };
}
