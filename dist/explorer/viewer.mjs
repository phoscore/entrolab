import {language, onLanguageChange} from '../i18n.mjs';
import {translate, number, measurement, objectName} from './text.mjs';
import {loadCatalog, makeLoader, loadSky, findObjects, DATA_URL} from './catalog.mjs';
import {homeCamera, cameraScale, screenPoint, worldPoint, project, unproject, centerObject, visibleGroups, hitGroup, skyViewport, niceStep, MAX_ZOOM} from './camera.mjs';
import {mapGestures} from './gestures.mjs';
import {placeLabels, drawLabels} from './labels.mjs';
import {preferredStarName, systemFor} from './identities.mjs';
import {searchKey} from './foundation/access.mjs';

export function mountExplorer(root) {
  const t = key => translate(key, language());
  const n = value => number(value, language());
  const node = (tag, content, className) => {
    const el = document.createElement(tag);
    if (content !== undefined) el.textContent = content;
    if (className) el.className = className;
    return el;
  };
  root.innerHTML = `
    <div class="ex-heading"><div><p class="ex-kicker" data-ex="subtitle"></p><h1>Cosmic Explorer</h1><p data-ex="intro"></p></div></div>
    <div class="ex-mode-bar" role="group" aria-label="Cosmic Explorer">
      <button type="button" id="exSkyMode" data-ex="skyMode" aria-pressed="true" aria-controls="exSkyPanel"></button>
      <button type="button" id="exSolarMode" data-ex="solarMode" aria-pressed="false" aria-controls="exSolarPanel"></button>
    </div>
    <div id="exSolarPanel" hidden></div>
    <div id="exSkyPanel">
    <div class="ex-orientation"><strong data-ex="observer"></strong>
      <details><summary data-ex="skyHelp"></summary><p data-ex="skyExplanation"></p><p data-ex="skyScope"></p></details>
    </div>
    <div class="ex-layout">
      <div class="ex-left">
        <div class="ex-map-head"><div><strong data-ex="map"></strong><p data-ex="projection"></p></div>
          <div class="ex-controls" role="group" id="exControls">
            <button type="button" id="exOut">−</button><button type="button" id="exIn">+</button>
            <button type="button" id="exHome" data-ex="fit"></button>
            <button type="button" id="exCenter" data-ex="center" disabled></button>
          </div>
        </div>
        <div class="ex-map"><canvas id="exCanvas" tabindex="0" aria-describedby="exHelp exProjection"></canvas><p class="ex-overlay" id="exMapMessage"></p></div>
        <div class="ex-map-foot"><span id="exCount"></span><span data-ex="coverage"></span></div>
        <div class="ex-zoom"><label for="exZoom" data-ex="zoom"></label><input id="exZoom" type="range" min="0" max="5" step="0.01" value="0"><output id="exScale"></output></div>
        <div class="ex-legend" id="exLegend"></div>
        <div class="ex-error" id="exError" role="alert" hidden><p data-ex="error"></p><button type="button" id="exRetry" data-ex="retry"></button></div>
        <div class="ex-notes"><p id="exHelp" data-ex="help"></p>
          <details><summary data-ex="projection"></summary><p id="exProjection" data-ex="limits"></p><p data-ex="fixed"></p></details>
          <details><summary data-ex="sample"></summary><p data-ex="sampleNote"></p><a id="exCredits" data-ex="credits" target="_blank" rel="noopener"></a> · <a id="exManifest" data-ex="manifest" target="_blank" rel="noopener"></a></details>
        </div>
      </div>
      <aside class="ex-aside"><h2 data-ex="sources"></h2><label for="exSearch" data-ex="search"></label><input id="exSearch" type="search" autocomplete="off" aria-describedby="exSearchHint"><p id="exSearchHint" class="ex-small" data-ex="searchHint"></p><p id="exSearchCount" class="ex-small" aria-live="polite"></p><div id="exList" class="ex-list"></div>
        <section class="ex-inspector" aria-labelledby="exInspectorHeading"><h2 id="exInspectorHeading" data-ex="inspector"></h2><div id="exInspector"></div></section>
      </aside>
    </div></div><div id="exAnnouncement" class="ex-reader" role="status" aria-live="polite"></div>`;
  const $ = id => root.querySelector(`#${id}`);
  const canvas = $('exCanvas'), ctx = canvas.getContext('2d');
  const listeners = new AbortController();
  const listen = (target, type, fn, options = {}) => target.addEventListener(type, fn, {...options, signal: listeners.signal});
  let camera = homeCamera(), selected = null, data = null, sky = [], results = [], groups = [];
  let active = false, seen = true, disposed = false, frame = null, dirty = true;
  let session = null, loader = null, skyRevision = 0, searchRevision = 0;
  let loading = true, skyLoading = false, searchLoading = false, failed = false, searchFailed = false;
  let width = 1, height = 1, draws = 0, duration = 0;
  let panelActive = false, mode = 'sky', solar = null, solarPending = false, solarStatus = 'solarLoad';
  const starName = object => preferredStarName(object, language());

  function localize() {
    for (const el of root.querySelectorAll('[data-ex]')) el.textContent = t(el.dataset.ex);
    canvas.setAttribute('aria-label', `${t('map')}. ${t('help')}`);
    $('exControls').setAttribute('aria-label', t('camera'));
    $('exOut').setAttribute('aria-label', t('zoomOut'));
    $('exIn').setAttribute('aria-label', t('zoomIn'));
    $('exCredits').href = new URL('CREDITS.md', DATA_URL);
    $('exManifest').href = new URL('manifest.json', DATA_URL);
    $('exLegend').replaceChildren(...['star', 'source', 'galaxy', 'groupLegend', 'noMapPlanets'].map(kind => {
      const label = node('span');
      if (kind !== 'noMapPlanets') {
        const dot = node('span', '', 'ex-dot'); dot.dataset.kind = kind;
        label.append(dot);
      }
      label.append(document.createTextNode(t(kind)));
      return label;
    }));
    if (!solar && mode === 'solar') $('exSolarPanel').textContent = t(solarStatus);
    showList(); showInspector(); invalidate();
  }

  function showList() {
    const focused = $('exList').contains(document.activeElement) ? document.activeElement.dataset.object : null;
    const resultLabel = `${results.length} ${t(results.length === 1 ? 'oneResult' : 'results')}`;
    $('exSearchCount').textContent = searchFailed ? t('error') : loading ? t('loading') : searchLoading ? t('loadingSearch') : resultLabel;
    $('exList').replaceChildren(...results.map(object => {
      const button = node('button'); button.type = 'button'; button.dataset.object = object.id;
      button.setAttribute('aria-pressed', String(object.id === selected));
      const preferred = starName(object);
      button.append(node('span', preferred ?? objectName(object)), node('small', `${t(object.kind)}${preferred ? ' · ' + objectName(object) : ''}${object.direction ? '' : ' · ' + t('noDirection')}`));
      return button;
    }));
    if (data && !results.length && !searchLoading && !searchFailed) $('exList').append(node('p', t('emptySearch'), 'ex-small'));
    if (focused) [...$('exList').querySelectorAll('button')].find(button => button.dataset.object === focused)?.focus({preventScroll:true});
  }

  function evidence(container, q) {
    const p = q?.evidence;
    if (!p) return;
    const details = node('details'), summary = node('summary', t('provenance'));
    details.append(summary);
    const dl = node('dl');
    const add = (label, value) => { dl.append(node('dt', label), node('dd', String(value))); };
    add(t('release'), `${p.source} · ${data.manifest.sources[p.source]?.release ?? ''}`);
    add(t('row'), p.row); add(t('field'), p.columns.join(', '));
    if (q.model) add(t('derived'), q.model);
    if (p.reference) add(t('reference'), p.reference);
    const source = data.manifest.sources[p.source];
    const href = /^https:\/\//.test(p.reference ?? '') ? p.reference : source?.reference ?? source?.access;
    if (/^https:\/\//.test(href ?? '')) {
      const a = node('a', t('reference')); a.href = href; a.target = '_blank'; a.rel = 'noopener'; details.append(a);
    }
    details.append(dl); container.append(details);
  }

  function quantity(container, label, q) {
    const dl = node('dl'); dl.append(node('dt', label), node('dd', measurement(q, language())));
    container.append(dl); evidence(container, q);
  }

  function showSystem(container, object) {
    const system = systemFor(object,data.manifest.release);
    if (!system) return;
    const details = node('details',undefined,'ex-system-info');
    details.append(node('summary',t('system')),node('h3',system.host),node('p',`${t('host')} · ${system.aliases.join(' · ')}`,'ex-small'));
    details.append(node('p',t('systemScope'),'ex-small'),node('h4',t('systemNames')));
    const planets = node('ul');
    for (const planet of system.planets) {
      planets.append(node('li',`${planet} · ${t(planet === object.identity.id ? 'systemSample' : 'systemNameOnly')}`));
    }
    const source = node('a','Open Exoplanet Catalogue');
    source.href = system.source;source.target = '_blank';source.rel = 'noopener';
    details.append(planets,source);
    container.append(details);
  }

  function showInspector() {
    const inspector = $('exInspector'); inspector.replaceChildren();
    const object = data?.objects.find(o => o.id === selected);
    $('exCenter').disabled = !object?.direction;
    if (!object) { inspector.append(node('p', t('choose'), 'ex-selected'), node('p', t('chooseHint'), 'ex-small')); return; }
    inspector.append(node('p', starName(object) ?? objectName(object), 'ex-selected'), node('p', t(object.kind), 'ex-small'), node('p', object.id, 'ex-small'));
    evidence(inspector, {evidence: object.identity.evidence});
    if (object.classificationEvidence) evidence(inspector,{evidence:object.classificationEvidence});
    showSystem(inspector,object);
    if (object.aliases.length) {
      const aliases = node('details'); aliases.append(node('summary', t('aliases')), node('p', object.aliases.map(a => a.name).join(' · '), 'ex-small')); inspector.append(aliases);
    }
    inspector.append(node('h3', t('direction')));
    if (object.direction) {
      quantity(inspector, 'RA', object.direction.ra); quantity(inspector, 'Dec', object.direction.dec);
      inspector.append(node('p', `${t('frame')} · ${object.direction.frame} · ${object.direction.role}`, 'ex-small'));
      if (object.direction.epoch) inspector.append(node('p', `${t('epoch')} · ${object.direction.epoch.value} ${object.direction.epoch.system}`, 'ex-small'));
    } else inspector.append(node('p', t('noPosition'), 'ex-small'));
    if (object.parallax) { inspector.append(node('h3', t('parallax'))); quantity(inspector, t('catalog'), object.parallax); }
    inspector.append(node('h3', t('distance')));
    if (!object.distances.length) inspector.append(node('p', t('noDistance'), 'ex-small'));
    for (const d of object.distances) {
      quantity(inspector, t(d.method), d.measurement);
      inspector.append(node('p', `${t(d.measurement.status)} · ${d.kind} · ${d.origin}`, 'ex-small'));
    }
    if (object.redshift) {
      inspector.append(node('h3', t('redshift'))); quantity(inspector, object.redshift.frame, object.redshift.measurement);
    }
    for (const orbit of object.orbits) {
      inspector.append(node('h3', t('orbit')), node('p', t('orbitNote'), 'ex-small'));
      for (const [key, q] of Object.entries(orbit.elements)) quantity(inspector, t(key), q);
      if (orbit.phase) quantity(inspector, `${t('phase')} · ${orbit.phase.kind} · ${orbit.phase.timeSystem ?? t('unknown')}`, orbit.phase.epoch);
    }
    if (object.quality) {
      const details = node('details'); details.append(node('summary', t('quality')));
      for (const [key, value] of Object.entries(object.quality)) details.append(node('p', `${key} · ${value === null ? t('unknown') : value}`, 'ex-small'));
      inspector.append(details);
    }
  }

  function select(object, center = true) {
    selected = object.id;
    if (center) camera = centerObject(camera, object);
    for (const button of $('exList').querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.object === selected));
    showInspector();
    $('exAnnouncement').textContent = `${starName(object) ?? objectName(object)} · ${t(object.kind)}${object.direction ? '' : ' · ' + t('noDirection')}`;
    changed();
  }

  function invalidate() {
    dirty = true;
    if (!disposed && active && seen && !document.hidden && frame === null) frame = requestAnimationFrame(draw);
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const changedSize = width !== rect.width || height !== rect.height;
    width = rect.width; height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 1.75);
    const backingWidth = Math.round(width * dpr), backingHeight = Math.round(height * dpr);
    if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
      canvas.width = backingWidth;
      canvas.height = backingHeight;
    }
    ctx?.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    invalidate();
    if (changedSize) void refreshSky();
  }
  function draw() {
    frame = null;
    if (!active || !seen || document.hidden || disposed || !dirty) return;
    dirty = false;
    const started = performance.now();
    if (ctx) render();
    draws++;
    duration = performance.now() - started;
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    const screen = point => screenPoint(point, camera, width, height);
    const [left, top] = screen([0, 0]), [right, bottom] = screen([360, 180]);
    ctx.save();
    ctx.beginPath(); ctx.rect(left, top, right - left, bottom - top); ctx.clip();
    ctx.fillStyle = '#12263866'; ctx.fillRect(left, top, right - left, bottom - top);
    ctx.lineWidth = 1; ctx.strokeStyle = '#81b2c021';
    const scale = cameraScale(camera, width, height);
    const step = niceStep(80 / scale);
    const [viewLeft, viewTop] = worldPoint([0, 0], camera, width, height);
    const [viewRight, viewBottom] = worldPoint([width, height], camera, width, height);
    ctx.font = '10px "DM Sans", sans-serif'; ctx.fillStyle = '#9ab0be';
    for (let ra = Math.ceil(Math.max(0, viewLeft) / step) * step; ra <= Math.min(360, viewRight); ra += step) {
      const [x] = screen([ra, 90]); ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke();
      const label = `${n(ra)}°`;
      if (x > Math.max(32, left + 30) && x + 5 + ctx.measureText(label).width < Math.min(width, right)) {
        ctx.fillText(label, x + 5, Math.min(height - 54, Math.max(28, bottom - 12)));
      }
    }
    const lowDec = unproject(0, Math.min(180, viewBottom))[1], highDec = unproject(0, Math.max(0, viewTop))[1];
    const decStep = niceStep(Math.max(.0001, (highDec - lowDec) / 7));
    let lastDecLabel = Infinity;
    for (let dec = Math.ceil(lowDec / decStep) * decStep; dec <= highDec; dec += decStep) {
      const [, y] = screen(project(0, Math.max(-90, Math.min(90, dec)))); ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
      if (Math.abs(dec) < 90 && y >= 18 && y < height - 50 && lastDecLabel - y >= 14) {
        ctx.fillText(`${n(dec)}°`, Math.max(10, left + 8), y - 6);
        lastDecLabel = y;
      }
    }
    groups = visibleGroups(sky, camera, width, height, selected);
    const labels = [];
    for (const group of groups) {
      const object = group.objects[0], chosen = object.id === selected;
      const color = object.kind === 'star' ? '#ffdc9c' : object.kind === 'galaxy' ? '#c2a7ef' : '#94b6ce';
      const multi = group.objects.length > 1, x = group.x, y = group.y;
      const radius = multi ? 15 : chosen ? 8 : object.kind === 'star' ? 6 : 5;
      ctx.shadowBlur = chosen ? 18 : 9; ctx.shadowColor = color;
      ctx.fillStyle = multi || object.kind === 'source' ? '#17283d' : color; ctx.strokeStyle = color; ctx.lineWidth = 1.25;
      ctx.beginPath();
      if (multi || object.kind === 'star' || object.kind === 'galaxy') {
        const vertices = multi ? 6 : object.kind === 'star' ? 8 : 4;
        for (let i = 0; i < vertices; i++) {
          const angle = i * 2 * Math.PI / vertices - Math.PI / 2;
          const r = !multi && object.kind === 'star' && i % 2 ? radius * .32 : radius;
          const px = x + Math.cos(angle) * r, py = y + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
        }
        ctx.closePath();
      } else ctx.arc(x,y,radius,0,Math.PI*2);
      ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
      if (multi) {
        ctx.fillStyle = '#e0f6fa'; ctx.textAlign = 'center'; ctx.font = '12px "DM Sans", sans-serif'; ctx.fillText(group.objects.length, group.x, group.y + 4); ctx.textAlign = 'left';
      }
      if (chosen) {
        ctx.strokeStyle = '#c7fff0'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x,y,14,0,Math.PI*2); ctx.stroke();
      }
      const caption = multi ? t(object.kind === 'galaxy' ? 'groupGalaxies' : 'groupGaia')
        : starName(object) ?? (chosen || (object.kind === 'galaxy' && camera.zoom > .6) ? objectName(object) : '');
      labels.push({x,y,radius:chosen?14:radius,label:caption,selected:chosen,priority:chosen?10:object.kind==='star'?5:multi?3:1});
    }
    ctx.font = '12px "DM Sans", sans-serif';
    drawLabels(ctx,placeLabels(labels,label=>ctx.measureText(label).width,width,height,{
      top:Math.max(8,top+12),bottom:Math.min(height-59,bottom-26),limit:width<420?5:10,
    }));
    ctx.restore();
    ctx.strokeStyle = '#608590'; ctx.lineWidth = 1; ctx.strokeRect(left, top, right - left, bottom - top);
    ctx.font = '10px "DM Sans", sans-serif'; ctx.fillStyle = '#9ab0be';
    const poleX = Math.min(width - 10, right - 6);
    ctx.textAlign = 'right';
    if (top >= 14 && top < height && poleX >= 100) ctx.fillText(t('north'), poleX, top - 9);
    if (bottom >= 0 && bottom < height - 14 && poleX >= 100) ctx.fillText(t('south'), poleX, bottom + 17);
    ctx.textAlign = 'left';
    const scaleDegrees = niceStep(60 / scale), pixels = scaleDegrees * scale;
    ctx.strokeStyle = '#c5e1e0';ctx.beginPath();ctx.moveTo(18,height-33);ctx.lineTo(18+pixels,height-33);ctx.stroke();
    ctx.fillStyle = '#c5e1e0';ctx.fillText(`ΔRA ${n(scaleDegrees)}° · Dec 0°`,18,height-42);
    $('exCount').textContent = `${groups.reduce((sum, g) => sum + g.objects.length, 0)} / 19 ${t('visible')}`;
    $('exZoom').value = String(camera.zoom);
    $('exScale').textContent = `${n(Math.round(10 ** camera.zoom * 100) / 100)}×`;
    $('exOut').disabled = camera.zoom === 0;
    $('exIn').disabled = camera.zoom === MAX_ZOOM;
    $('exMapMessage').textContent = failed ? t('error') : loading ? t('loading') : skyLoading ? t('loadingSky') : groups.length ? '' : t('empty');
  }

  async function refreshSky() {
    if (!data || !loader || !active) return;
    const revision = ++skyRevision;
    skyLoading = true; invalidate();
    try {
      const result = await loadSky(data.manifest, data.objects, loader, skyViewport(camera, width, height));
      if (!active || disposed || revision !== skyRevision) return;
      sky = result.objects; failed = false; $('exError').hidden = !searchFailed;
    } catch (error) {
      if (!active || disposed || revision !== skyRevision) return;
      sky = []; failed = true; $('exError').hidden = false;
    } finally {
      if (revision === skyRevision) { skyLoading = false; invalidate(); }
    }
  }
  function changed() { invalidate(); void refreshSky(); }

  async function search() {
    if (!data || !loader || !active) return;
    const revision = ++searchRevision;
    const query = $('exSearch').value;
    searchLoading = Boolean(query.trim());
    if (searchLoading) {
      searchFailed = false;
      results = [];
      showList();
    }
    try {
      const matches = await findObjects(data.manifest, data.objects, loader, query);
      if (!active || disposed || revision !== searchRevision) return;
      const extra = query.trim() ? data.objects.filter(o=>[preferredStarName(o,'de'),preferredStarName(o,'en')].some(name=>name && searchKey(name).startsWith(searchKey(query)))) : [];
      results = [...new Set([...matches,...extra])]; searchLoading = false; searchFailed = false; $('exError').hidden = !failed; showList();
    } catch (error) {
      if (!active || disposed || revision !== searchRevision) return;
      searchLoading = false; searchFailed = true; results = []; $('exError').hidden = false; showList();
    }
  }

  async function start() {
    const own = new AbortController(); session = own;
    loading = !data; failed = false; searchLoading = false; searchFailed = false; $('exError').hidden = true; invalidate();
    try {
      const loaded = data ?? await loadCatalog(own.signal);
      if (own.signal.aborted || disposed || !active) return;
      data = loaded; loading = false; loader = makeLoader(data.manifest);
      results = data.objects; showList(); showInspector(); resize();
      await Promise.all([refreshSky(), search()]);
    } catch (error) {
      if (own.signal.aborted || disposed || !active) return;
      failed = true; loading = false; $('exError').hidden = false; invalidate();
    }
  }
  function stop() {
    session?.abort(); loader?.dispose(); loader = null; skyRevision++; searchRevision++;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null; gestures.cancel();
  }
  function setSkyActive(value) {
    if (disposed || active === value) return;
    active = value;
    if (active) { resize(); void start(); } else stop();
  }

  function setActive(value) {
    if (disposed) return;
    panelActive = value;
    setSkyActive(value && mode === 'sky');
    solar?.setActive(value && mode === 'solar');
  }
  async function changeMode(next) {
    mode = next;
    const system = mode === 'solar';
    $('exSkyMode').setAttribute('aria-pressed',String(!system));
    $('exSolarMode').setAttribute('aria-pressed',String(system));
    $('exSkyPanel').hidden = system;
    $('exSolarPanel').hidden = !system;
    setActive(panelActive);
    if (!system || solar || solarPending) return;
    solarPending = true;
    solarStatus = 'solarLoad';
    $('exSolarPanel').textContent = t(solarStatus);
    try {
      const {mountSolar} = await import('./solar-view.mjs');
      if (disposed) return;
      solar = mountSolar($('exSolarPanel'));
      solar.setActive(panelActive && mode === 'solar');
    } catch {
      if (!disposed) {
        solarStatus = 'solarError';
        $('exSolarPanel').textContent = t(solarStatus);
      }
    } finally {solarPending = false;}
  }
  listen($('exSkyMode'),'click',()=>void changeMode('sky'));
  listen($('exSolarMode'),'click',()=>void changeMode('solar'));
  const fit = () => {camera = homeCamera();changed();};
  listen($('exIn'), 'click', () => gestures.zoomBy(.25)); listen($('exOut'), 'click', () => gestures.zoomBy(-.25));
  listen($('exZoom'), 'input', () => gestures.zoomTo(Number($('exZoom').value)));
  listen($('exHome'), 'click', fit);
  listen($('exCenter'), 'click', () => {const object = data?.objects.find(o => o.id === selected);if (object) select(object);});
  listen($('exRetry'), 'click', () => {stop();void start();});
  listen($('exSearch'), 'input', search);
  listen($('exList'), 'click', event => {const id = event.target.closest('button')?.dataset.object; const object = data?.objects.find(o => o.id === id); if (object) select(object);});
  listen($('exList'), 'keydown', event => {
    const buttons = [...$('exList').querySelectorAll('button')], current = buttons.indexOf(document.activeElement);
    if (current < 0 || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : Math.max(0, Math.min(buttons.length - 1, current + (event.key === 'ArrowDown' ? 1 : -1)));
    buttons[next]?.focus();
  });
  const gestures = mapGestures(canvas, listen, {
    getCamera:()=>camera, size:()=>[width,height],
    setCamera(next) {camera=next;changed();},
    fit, exit:()=>$('exHome').focus(),
    tap(x,y) {
      const hit = hitGroup(groups,x,y);
      if (hit?.objects.length === 1) select(hit.objects[0]);
      else if (hit) {
        const center = worldPoint([hit.x,hit.y],camera,width,height);
        camera = {...camera,x:center[0],y:center[1],zoom:Math.min(MAX_ZOOM,camera.zoom + .8)};
        searchRevision++; searchLoading = false; searchFailed = false; $('exError').hidden = !failed;
        results = hit.objects; $('exSearch').value = ''; showList(); changed();
        $('exAnnouncement').textContent = `${t('group')} · ${hit.objects.length}`;
      }
    },
  });
  listen(document,'visibilitychange',() => {
    if(document.hidden){if(frame!==null)cancelAnimationFrame(frame);frame=null;}else invalidate();
  });
  const observer = new ResizeObserver(resize);observer.observe(canvas);
  const intersection = new IntersectionObserver(entries=>{seen=entries[0].isIntersecting;if(seen)invalidate();else if(frame!==null){cancelAnimationFrame(frame);frame=null;}});intersection.observe(canvas);
  const unsubscribe = onLanguageChange(localize);
  localize();
  return {
    setActive,
    inspect: () => ({active,mode,solar:solar?.inspect()??null,loading,failed,searchFailed,selected,camera:{...camera},draws,duration,scheduled:frame!==null,requests:loader?.active??0,queued:loader?.queued??0,cacheBytes:loader?.cache.byteLength??0,objectCount:data?.objects.length??0,groups:groups.map(g=>({x:g.x,y:g.y,ids:g.objects.map(o=>o.id)}))}),
    dispose() {if(disposed)return;active=false;stop();disposed=true;listeners.abort();solar?.dispose();observer.disconnect();intersection.disconnect();unsubscribe();root.replaceChildren();},
  };
}
