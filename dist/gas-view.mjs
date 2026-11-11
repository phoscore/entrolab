import {t, locale, localizeTree, onLanguageChange} from './i18n.mjs';
import {gasStatistics, gasSample, gasHistogram, maxwellDensity, gasTemperatureValid, periodicPosition} from './gas-model.mjs';
import {prepareLabCanvas} from './lab-canvas.mjs';

const instances = new WeakMap();
const colours = ['#82e2ed', '#c7a8ff'];
const binCount = 30;
const sampleCount = 160;
const timeScale = 0.0004;

export function initGasView(doc = globalThis.document) {
 if (instances.has(doc)) return instances.get(doc);
 const root = doc.getElementById('gasExperiment');
 if (!root) return null;
 const win = doc.defaultView, view = doc.getElementById('extreme');
 const motion = win.matchMedia('(prefers-reduced-motion: reduce)');
 const cleanup = [];
 root.innerHTML = `<section class="panel gas-lab" aria-labelledby="gasTitle">
  <h3 id="gasTitle" data-i18n="v09.gas.title"></h3><p class="experiment-lead" data-i18n="v09.gas.lead"></p>
  <figure class="experiment-figure"><div class="gas-frame"><canvas id="gasCanvas" aria-hidden="true"></canvas></div>
  <figcaption data-i18n="v09.gas.projection"></figcaption></figure>
  <div class="experiment-controls">
   <label class="gas-a"><span data-i18n="v09.gas.tempA"></span><input id="gasA" type="number" min="30" max="3000" step="any" value="150" required aria-describedby="gasError"></label>
   <label class="gas-b"><span data-i18n="v09.gas.tempB"></span><input id="gasB" type="number" min="30" max="3000" step="any" value="600" required aria-describedby="gasError"></label>
   <button type="button" class="secondary" id="gasPause"></button>
   <label><span data-i18n="v09.gas.speed"></span><select id="gasSpeed"><option value=".25">0.25×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option></select></label>
   <button type="button" class="secondary" id="gasResample" data-i18n="v09.gas.sample"></button>
   <button type="button" class="secondary" id="gasCopy" data-i18n="v09.gas.copy" aria-describedby="gasTransfer"></button>
  </div>
  <p id="gasError" class="error" role="status"></p><p id="gasTransfer" class="hint"></p>
  <p id="gasMetrics" class="experiment-values" role="status"></p><p id="gasSampleMetrics" class="hint"></p>
  <figure class="experiment-figure gas-chart"><h4 data-i18n="v09.gas.chart"></h4><svg id="gasChart" viewBox="0 0 520 176" aria-hidden="true"></svg>
   <figcaption><span data-i18n="v09.gas.axes"></span><br><span data-i18n="v09.gas.legend"></span></figcaption>
  </figure>
  <details><summary data-i18n="v09.modelDetails"></summary><p data-i18n="v09.gas.formula"></p><p data-i18n="v09.gas.limits"></p>
   <a href="https://openstax.org/books/university-physics-volume-2/pages/2-4-distribution-of-molecular-speeds" target="_blank" rel="noopener">OpenStax · Distribution of Molecular Speeds</a>
  </details></section>`;
 const $ = id => doc.getElementById(id);
 const canvas = $('gasCanvas'), fields = [$('gasA'), $('gasB')];
 const listen = (element, event, handler) => {
  element.addEventListener(event, handler);
  cleanup.push(() => element.removeEventListener(event, handler));
 };
 const temperatures = [150, 600], invalid = [false, false];
 let statistics = temperatures.map(gasStatistics), seed = 9047, sample = gasSample(seed, sampleCount);
 let paused = motion.matches, seen = false, raf = null, last = null, time = 0, tempo = 1, frames = 0, frameMs = 0;
 let disposed = false, canvasAvailable = true, surface, paintKey = '', boxLabels;

 const number = (value, digits = 0) => new Intl.NumberFormat(locale(), {maximumFractionDigits: digits}).format(value);
 const put = (id, value) => { if ($(id).textContent !== value) $(id).textContent = value; };
 function labValue() {
  const value = globalThis.entrolabTemperature?.read();
  return gasTemperatureValid(value) && !($('temperatureError')?.textContent) ? value : null;
 }
 function bridge() {
  const ready = labValue() !== null;
  $('gasCopy').disabled = !ready;
  put('gasTransfer', t(ready ? 'v09.gas.copyReady' : 'v09.gas.copyRange'));
 }
 function labels() {
  if (motion.matches) paused = true;
  const pause=$('gasPause'), disabling=motion.matches || !canvasAvailable;
  if(disabling && doc.activeElement===pause)fields[0].focus({preventScroll:true});
  pause.disabled=disabling;
  put('gasPause', t(motion.matches ? 'v09.motionReduced' : paused ? 'v09.resume' : 'v09.pause'));
  const error = t('v09.gas.invalid');
  fields.forEach((field, i) => {
   field.setCustomValidity(invalid[i] ? error : '');
   field.setAttribute('aria-invalid', String(invalid[i]));
  });
  put('gasError', invalid.some(Boolean) ? error : '');
  bridge();
 }
 function chart() {
  boxLabels=temperatures.map((value,i)=>(i?'B':'A')+' · '+number(value,2)+' K');
  const max = Math.ceil(Math.max(...statistics.map(s => s.sigma)) * 4.7 / 100) * 100;
  const samples = statistics.map(s => gasHistogram(sample, s.sigma, max, binCount));
  const xs = Array.from({length: 151}, (_, i) => i * max / 150);
  const curves = statistics.map(s => xs.map(x => maxwellDensity(x, s.sigma)));
  const peak = Math.max(...curves.flat(), ...samples.flatMap(s => s.density)) * 1.08;
  const sx = v => 24 + 477 * v / max, sy = v => 148 - 134 * v / peak;
  const draw = ['<path d="M24 12V148H502" fill="none" stroke="#7686a2"/>'];
  for (let j = 0; j <= 4; j++) {
   const v = j * max / 4, x = sx(v);
   draw.push(`<path d="M${x} 148v5" stroke="#a6b4ca"/><text x="${x}" y="170" text-anchor="middle" fill="#cbd4e8" font-size="13">${number(v)}</text>`);
  }
  samples.forEach(({density}, i) => density.forEach((value, k) => {
   const width = 477 / binCount;
   draw.push(`<rect x="${24 + width * k + i * width * .48}" y="${sy(value)}" width="${width * .44}" height="${148 - sy(value)}" fill="${colours[i]}" opacity=".36"/>`);
  }));
  curves.forEach((curve, i) => {
   const d = curve.map((v, j) => (j === 0 ? 'M' : 'L') + sx(xs[j]).toFixed(2) + ' ' + sy(v).toFixed(2)).join(' ');
   draw.push(`<path d="${d}" stroke="${colours[i]}" stroke-width="2" ${i ? 'stroke-dasharray="5 3"' : ''} fill="none"/>`);
  });
  $('gasChart').innerHTML = draw.join('');
  put('gasMetrics', t('v09.gas.metrics', {a: number(statistics[0].rms), b: number(statistics[1].rms), ratio: number(statistics[1].rms / statistics[0].rms, 3)}));
  const mean = sample.reduce((sum, p) => sum + p.speed, 0) / sample.length;
  put('gasSampleMetrics', t('v09.gas.sampleMetrics', {n: sample.length, a: number(mean * statistics[0].sigma),
   b: number(mean * statistics[1].sigma), tailA: samples[0].tail, tailB: samples[1].tail}));
 }
 const visible = () => !disposed && seen && !doc.hidden && view.classList.contains('active');
 const running = () => visible() && !motion.matches && !paused && canvasAvailable && !!surface;
 function measure() {
  if (!visible()) return;
  const dpr = Math.min(win.devicePixelRatio || 1, 1.25);
  surface = prepareLabCanvas(canvas, dpr);
  if (!surface && canvas.getClientRects().length) {
   canvasAvailable = false;
   canvas.parentElement.hidden = true;
   const note = doc.createElement('p');
   note.dataset.i18n = 'v09.gas.noCanvas';
   note.textContent = t('v09.gas.noCanvas');
   canvas.parentElement.after(note);
   labels();
  }
  paintKey = '';
 }
 function paint() {
  if (!visible() || !surface) return;
  const key = [surface.width, surface.height, temperatures.join(), seed, time, locale()].join('|');
  if (key === paintKey) return;
  paintKey = key;
  const started = win.performance.now(), {ctx: x, width: w, height: h} = surface;
  x.fillStyle = '#080d18'; x.fillRect(0, 0, w, h);
  const side = Math.max(1, Math.min(h - 34, (w - 26) / 2)), radius = side > 165 ? 1.6 : 1.15;
  for (let i = 0; i < 2; i++) {
   const left = (i + .5) * w / 2 - side / 2, top = (h - side) / 2 + 6;
   x.fillStyle = i ? '#15132a' : '#0d222d'; x.fillRect(left, top, side, side);
   x.strokeStyle = i ? '#65558b' : '#346477'; x.strokeRect(left, top, side, side);
   x.fillStyle = colours[i]; x.font = '600 12px system-ui';
   x.fillText(boxLabels[i], left + 3, top - 7);
   x.beginPath();
   const displacement = statistics[i].sigma * time;
   for (const particle of sample) {
    const px = left + radius + periodicPosition(particle.x + particle.vx * displacement) * (side - radius * 2);
    const py = top + radius + periodicPosition(particle.y + particle.vy * displacement) * (side - radius * 2);
    x.moveTo(px + radius, py); x.arc(px, py, radius, 0, 2 * Math.PI);
   }
   x.fill();
  }
  frames++; frameMs = win.performance.now() - started;
 }
 function tick(now) {
  raf = null;
  if (!running()) return;
  if (last === null) last = now;
  else if (now - last >= 32) {
   time += Math.min(100, now - last) * .001 * timeScale * tempo;
   last = now;
   paint();
  }
  schedule();
 }
 function schedule() {
  if (running()) {
   if (raf === null) raf = win.requestAnimationFrame(tick);
  } else {
   if (raf !== null) win.cancelAnimationFrame(raf);
   raf = null; last = null;
  }
 }
 function temperature(i, value) {
  invalid[i] = !gasTemperatureValid(value);
  if (!invalid[i]) {
   temperatures[i] = value; statistics[i] = gasStatistics(value);
   time = 0; chart(); paint();
  }
  labels();
 }
 fields.forEach((field, i) => listen(field, 'input', () => temperature(i, field.valueAsNumber)));
 listen($('gasPause'), 'click', () => { paused = !paused; labels(); schedule(); });
 listen($('gasResample'), 'click', () => { seed++; sample = gasSample(seed, sampleCount); time = 0; chart(); paint(); });
 listen($('gasSpeed'), 'change', event => { tempo = Number(event.target.value); });
 listen($('gasCopy'), 'click', () => {const value = labValue(); if (value !== null) { fields[0].value = String(value); temperature(0, value); }});
 for (const id of ['kelvinInput','celsiusInput']) listen($(id), 'input', bridge);
 cleanup.push(globalThis.entrolabTemperature?.subscribe(bridge) ?? (()=>{}));
 cleanup.push(onLanguageChange(() => { labels(); chart(); paint(); }));
 listen(motion, 'change', () => { labels(); schedule(); });
 listen(doc, 'visibilitychange', () => { if(visible()&&!surface)measure(); paint(); schedule(); });
 for(const tab of doc.querySelectorAll('[data-tab]')) listen(tab, 'click', () => { paint(); schedule(); });
 const intersection = new win.IntersectionObserver(([entry]) => {
  if(disposed)return;
  seen = entry.isIntersecting;
  if(visible() && !surface && canvasAvailable) measure();
  paint(); schedule();
 });
 intersection.observe(canvas);
 const resize = new win.ResizeObserver(() => { if(!disposed && canvasAvailable) { measure(); paint(); schedule(); } });
 resize.observe(canvas.parentElement);
 localizeTree(root); labels(); chart();
 const controller = {
  inspect: () => ({temperatures: [...temperatures], statistics: statistics.map(s=>({...s})), seed, paused, seen, frames, frameMs, time, scheduled: raf !== null}),
  dispose() {
   if(disposed)return;
   disposed = true; schedule(); intersection.disconnect(); resize.disconnect();
   cleanup.forEach(off => off()); surface = null; canvas.width = canvas.height = 0;
   root.replaceChildren(); instances.delete(doc);
  }
 };
 instances.set(doc, controller);
 return controller;
}
if(globalThis.document) {
 initGasView();
 globalThis.entrolabGas = {inspect: () => instances.get(document)?.inspect()};
}
