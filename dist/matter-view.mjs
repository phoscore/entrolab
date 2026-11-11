import {t, locale, localizeTree, onLanguageChange} from './i18n.mjs';
import {photonSystem, deuteronBinding} from './matter-model.mjs';

const instances = new WeakMap();

export function initMatterView(doc = globalThis.document) {
 if (instances.has(doc)) return instances.get(doc);
 const root = doc.getElementById('matterExperiments');
 if (!root) return null;
 const cleanup = [];
 root.innerHTML = `<section class="panel matter-station" aria-labelledby="photonTitle">
   <h2 id="photonTitle" data-i18n="v09.photon.title"></h2><p class="experiment-lead" data-i18n="v09.photon.lead"></p>
   <div class="station-grid">
    <svg id="photonVectors" class="matter-figure" viewBox="0 0 410 270" role="img" data-i18n-aria-label="v09.photon.svg"></svg>
    <div class="station-readout"><div class="experiment-controls">
     <label class="gas-a"><span data-i18n="v09.photon.energyA"></span><input id="photonA" type="number" min=".01" max="1000" step="any" value="1" required aria-describedby="photonError"></label>
     <label class="gas-b"><span data-i18n="v09.photon.energyB"></span><input id="photonB" type="number" min=".01" max="1000" step="any" value="1" required aria-describedby="photonError"></label>
     <label class="photon-angle"><span data-i18n="v09.photon.angle"></span> <output id="photonAngleValue" for="photonAngle">90°</output><input id="photonAngle" type="range" min="0" max="180" step="1" value="90"></label>
     <button type="button" class="secondary" id="photonParallel" data-i18n="v09.photon.parallel"></button>
     <button type="button" class="secondary" id="photonOpposed" data-i18n="v09.photon.opposed"></button>
    </div><p class="error" id="photonError" role="status"></p>
    <dl class="readout-list"><dt data-i18n="v09.photon.mass"></dt><dd id="photonMass"></dd>
     <dt data-i18n="v09.photon.total"></dt><dd id="photonMomentum"></dd></dl></div>
   </div><details><summary data-i18n="v09.modelDetails"></summary>
    <p class="experiment-equation">M² c⁴ = (E₁ + E₂)² − c² |p₁ + p₂|² = 4 E₁ E₂ sin²(θ/2)</p>
    <p data-i18n="v09.photon.limits"></p><a href="https://pdg.lbl.gov/2024/reviews/rpp2024-rev-kinematics.pdf" target="_blank" rel="noopener">Particle Data Group · Kinematics</a>
   </details></section>
  <section class="panel matter-station" aria-labelledby="bindingTitle">
   <h2 id="bindingTitle" data-i18n="v09.binding.title"></h2><p class="experiment-lead" data-i18n="v09.binding.lead"></p>
   <div class="station-grid">
    <figure class="experiment-figure"><svg id="bindingDiagram" class="matter-figure" viewBox="0 0 410 240" aria-hidden="true"></svg><figcaption data-i18n="v09.binding.scale"></figcaption></figure>
    <div class="station-readout">
     <div class="experiment-controls"><button type="button" class="secondary" id="bindingFree" data-i18n="v09.binding.free"></button><button type="button" class="secondary" id="bindingBound" data-i18n="v09.binding.bound"></button></div>
     <p id="bindingSelected" class="experiment-values" role="status"></p>
     <dl class="readout-list"><dt data-i18n="v09.binding.diff"></dt><dd id="bindingEnergy"></dd>
     <dt data-i18n="v09.binding.massDiff"></dt><dd id="bindingMass"></dd></dl>
    </div>
   </div><details><summary data-i18n="v09.modelDetails"></summary>
    <p class="experiment-equation">Eᵦ = (mₚ + mₙ − m_d) c²</p><p data-i18n="v09.binding.limits"></p>
    <a href="https://physics.nist.gov/cuu/pdf/JPCRD2022CODATA.pdf" target="_blank" rel="noopener">NIST · CODATA 2022</a>
   </details>
  </section>`;
 const $ = id => doc.getElementById(id);
 const fields = [$('photonA'), $('photonB')], energies = [1, 1], invalid = [false, false];
 let angle = 90, binding = 'free';
 let result = photonSystem(...energies, angle);
 const reference = deuteronBinding();
 const listen = (node, event, handler) => {
  node.addEventListener(event, handler);
  cleanup.push(() => node.removeEventListener(event, handler));
 };
 const put = (id, value) => { if ($(id).textContent !== value) $(id).textContent = value; };
 const format = (value, digits) => new Intl.NumberFormat(locale(), {maximumFractionDigits: digits}).format(value);
 function arrow(vector, colour, origin, scale) {
  const [x, y] = origin, [dx, dy] = [vector[0] * scale, -vector[1] * scale];
  const length = Math.hypot(dx, dy);
  if (length < .15) return '';
  const head = Math.min(8, length * .35), ex = x + dx, ey = y + dy, ux = dx / length, uy = dy / length;
  return `<path d="M${x} ${y}L${ex} ${ey}m${-head * (ux + .6 * uy)} ${-head * (uy - .6 * ux)}L${ex} ${ey}l${-head * (ux - .6 * uy)} ${-head * (uy + .6 * ux)}" fill="none" stroke="${colour}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
 }
 function photons() {
  result = photonSystem(...energies, angle);
  const fmt = value => Math.abs(value) > 0 && Math.abs(value) < .001 ? value.toExponential(2).replace('.', locale() === 'de-DE' ? ',' : '.') : format(value, 4);
  put('photonAngleValue', angle + '°');
  $('photonAngle').setAttribute('aria-valuetext', angle + '°');
  put('photonMass', fmt(result.restEnergy) + ' MeV/c²');
  put('photonMomentum', '(' + result.momentum.map(fmt).join(' | ') + ') MeV/c');
  const error = t('v09.photon.invalid');
  fields.forEach((field, i) => { field.setCustomValidity(invalid[i] ? error : ''); field.setAttribute('aria-invalid', String(invalid[i])); });
  put('photonError', invalid.some(Boolean) ? error : '');
  const origin = [194, 181], scale = 123 / Math.max(...energies, Math.hypot(...result.momentum));
  const rad = angle * Math.PI / 180, arcX = origin[0] + 31 * Math.cos(rad), arcY = origin[1] - 31 * Math.sin(rad);
  const arc = angle > 0 ? `<path d="M225 181A31 31 0 0 0 ${arcX} ${arcY}" fill="none" stroke="#f3c492" stroke-width="1.5"/>` : '';
  $('photonVectors').innerHTML = `<path d="M25 181H385M194 40V222" fill="none" stroke="#35425c"/>
   ${arc}${arrow(result.momentum, '#b3bed8', origin, scale)}
   ${arrow([energies[0], 0], '#82e2ed', origin, scale)}${arrow(result.photonB, '#c7a8ff', origin, scale)}
   <circle cx="194" cy="181" r="3" fill="#eef4ff"/>
   <text x="24" y="247" fill="#82e2ed" font-size="16">p₁</text><text x="69" y="247" fill="#c7a8ff" font-size="16">p₂</text>
   <text x="114" y="247" fill="#b3bed8" font-size="16">p₁ + p₂</text><text x="315" y="247" fill="#f3c492" font-size="16">${angle}°</text>`;
 }
 function bindings() {
  const free = binding === 'free';
  $('bindingFree').setAttribute('aria-pressed', String(free));
  $('bindingBound').setAttribute('aria-pressed', String(!free));
  put('bindingSelected', t(free ? 'v09.binding.free' : 'v09.binding.bound') + ' · ' + format(reference[binding], 6) + ' MeV');
  put('bindingEnergy', format(reference.difference, 6) + ' MeV');
  put('bindingMass', format(reference.difference, 6) + ' MeV/c²');
  $('bindingDiagram').innerHTML = `<g fill="none" stroke-width="2">
    <rect x="17" y="19" width="182" height="107" rx="11" stroke="${free ? '#82e2ed' : '#39415b'}"/>
    <rect x="211" y="19" width="182" height="107" rx="11" stroke="${free ? '#39415b' : '#c7a8ff'}"/>
   </g><g font-size="18" text-anchor="middle">
    <circle cx="71" cy="70" r="20" fill="#347584"/><circle cx="145" cy="70" r="20" fill="#6c56a4"/>
    <circle cx="292" cy="70" r="20" fill="#347584"/><circle cx="312" cy="70" r="20" fill="#6c56a4"/>
    <text x="71" y="76" fill="#fff">p</text><text x="145" y="76" fill="#fff">n</text>
    <text x="285" y="76" fill="#fff">p</text><text x="317" y="76" fill="#fff">n</text>
   </g>
   <path d="M60 169H350M60 160v18M350 160v18" fill="none" stroke="#b3bed8" stroke-width="2"/>
   <circle cx="${free ? 350 : 60}" cy="169" r="6" fill="#f3c492"/>
   <text x="205" y="208" text-anchor="middle" fill="#f3c492" font-size="18">ΔE = ${format(reference.difference, 4)} MeV</text>`;
 }
 fields.forEach((field, i) => listen(field, 'input', () => {
  const value = field.valueAsNumber;
  invalid[i] = !Number.isFinite(value) || value < .01 || value > 1000;
  if (!invalid[i]) energies[i] = value;
  photons();
 }));
 const turn = degrees => { angle = degrees; $('photonAngle').value = String(degrees); photons(); };
 listen($('photonAngle'), 'input', event => turn(event.target.valueAsNumber));
 listen($('photonParallel'), 'click', () => turn(0));
 listen($('photonOpposed'), 'click', () => turn(180));
 listen($('bindingFree'), 'click', () => { binding = 'free'; bindings(); });
 listen($('bindingBound'), 'click', () => { binding = 'bound'; bindings(); });
 cleanup.push(onLanguageChange(() => { photons(); bindings(); }));
 localizeTree(root); photons(); bindings();
 let disposed = false;
 const controller = {
  inspect: () => ({energies: [...energies], angle, result: structuredClone(result), binding}),
  dispose() { if(disposed)return; disposed = true; cleanup.forEach(off => off()); root.replaceChildren(); instances.delete(doc); }
 };
 instances.set(doc, controller);
 return controller;
}
if (globalThis.document) {
 initMatterView();
 globalThis.entrolabMatter = {inspect: () => instances.get(document)?.inspect()};
}
