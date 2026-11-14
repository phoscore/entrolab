import {language, onLanguageChange} from '../i18n.mjs';
import {translate, number, measurement, objectName} from './text.mjs';
import {loadCatalog, makeLoader, loadSky, findObjects, DATA_URL} from './catalog.mjs';
import {homeCamera, cameraScale, screenPoint, worldPoint, project, unproject, panBy, zoomAt, centerObject, visibleGroups, hitGroup, skyViewport, niceStep, MAX_ZOOM} from './camera.mjs';

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
    </div><div id="exAnnouncement" class="ex-reader" role="status" aria-live="polite"></div>`;
  const $ = id => root.querySelector(`#${id}`);
  const canvas = $('exCanvas'), ctx = canvas.getContext('2d');
  const listeners = new AbortController();
  const listen = (target, type, fn, options = {}) => target.addEventListener(type, fn, {...options, signal: listeners.signal});
  let camera = homeCamera(), selected = null, data = null, sky = [], results = [], groups = [];
  let active = false, seen = true, disposed = false, frame = null, dirty = true;
  let session = null, loader = null, skyRevision = 0, searchRevision = 0;
  let loading = true, skyLoading = false, failed = false, searchFailed = false;
  let width = 1, height = 1, draws = 0, duration = 0;
  const pointers = new Map();
  let gesture = null, moved = false;

  function localize() {
    for (const el of root.querySelectorAll('[data-ex]')) el.textContent = t(el.dataset.ex);
    canvas.setAttribute('aria-label', `${t('map')}. ${t('help')}`);
    $('exControls').setAttribute('aria-label', t('camera'));
    $('exOut').setAttribute('aria-label', t('zoomOut'));
    $('exIn').setAttribute('aria-label', t('zoomIn'));
    $('exCredits').href = new URL('CREDITS.md', DATA_URL);
    $('exManifest').href = new URL('manifest.json', DATA_URL);
    $('exLegend').replaceChildren(...['star', 'source', 'galaxy', 'exoplanet'].map(kind => {
      const label = node('span');
      const dot = node('span', '', 'ex-dot'); dot.dataset.kind = kind;
      label.append(dot, document.createTextNode(t(kind)));
      return label;
    }));
    showList(); showInspector(); invalidate();
  }

  function showList() {
    const focused = $('exList').contains(document.activeElement) ? document.activeElement.dataset.object : null;
    $('exSearchCount').textContent = searchFailed ? t('error') : loading ? t('loading') : `${results.length} ${t('results')}`;
    $('exList').replaceChildren(...results.map(object => {
      const button = node('button'); button.type = 'button'; button.dataset.object = object.id;
      button.setAttribute('aria-pressed', String(object.id === selected));
      button.append(node('span', objectName(object)), node('small', `${t(object.kind)}${object.direction ? '' : ' · ' + t('noDirection')}`));
      return button;
    }));
    if (data && !results.length && !searchFailed) $('exList').append(node('p', t('emptySearch'), 'ex-small'));
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

  function showInspector() {
    const inspector = $('exInspector'); inspector.replaceChildren();
    const object = data?.objects.find(o => o.id === selected);
    $('exCenter').disabled = !object?.direction;
    if (!object) { inspector.append(node('p', t('choose'), 'ex-selected'), node('p', t('chooseHint'), 'ex-small')); return; }
    inspector.append(node('p', objectName(object), 'ex-selected'), node('p', t(object.kind), 'ex-small'), node('p', object.id, 'ex-small'));
    evidence(inspector, {evidence: object.identity.evidence});
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
    $('exAnnouncement').textContent = `${objectName(object)} · ${t(object.kind)}${object.direction ? '' : ' · ' + t('noDirection')}`;
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
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
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
      ctx.fillText(`${n(ra)}°`, x + 5, Math.min(height - 12, Math.max(28, bottom - 12)));
    }
    const lowDec = unproject(0, Math.min(180, viewBottom))[1], highDec = unproject(0, Math.max(0, viewTop))[1];
    const decStep = niceStep(Math.max(.0001, (highDec - lowDec) / 7));
    for (let dec = Math.ceil(lowDec / decStep) * decStep; dec <= highDec; dec += decStep) {
      const [, y] = screen(project(0, Math.max(-90, Math.min(90, dec)))); ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
      ctx.fillText(`${n(dec)}°`, Math.max(10, left + 8), y - 6);
    }
    groups = visibleGroups(sky, camera, width, height, selected);
    for (const group of groups) {
      const object = group.objects[0], chosen = object.id === selected;
      const color = object.kind === 'star' ? '#ffdc9c' : object.kind === 'galaxy' ? '#c2a7ef' : '#94b6ce';
      const radius = group.objects.length > 1 ? 15 : chosen ? 6 : 4;
      ctx.shadowBlur = chosen ? 18 : 9; ctx.shadowColor = color;
      ctx.fillStyle = group.objects.length > 1 ? '#1a3449' : color; ctx.strokeStyle = color; ctx.lineWidth = 1;
      ctx.beginPath();
      if (object.kind === 'galaxy' && group.objects.length === 1) {
        ctx.moveTo(group.x, group.y - radius - 1); ctx.lineTo(group.x + radius + 1, group.y); ctx.lineTo(group.x, group.y + radius + 1); ctx.lineTo(group.x - radius - 1, group.y); ctx.closePath();
      } else ctx.arc(group.x, group.y, radius, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
      if (group.objects.length > 1) {
        ctx.fillStyle = '#e0f6fa'; ctx.textAlign = 'center'; ctx.font = '12px "DM Sans", sans-serif'; ctx.fillText(group.objects.length, group.x, group.y + 4); ctx.textAlign = 'left';
      }
      if (chosen) {
        ctx.beginPath(); ctx.arc(group.x, group.y, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.font = '11px "DM Sans", sans-serif'; ctx.fillStyle = '#eaf6f4';
        const title = objectName(object); const length = ctx.measureText(title).width;
        ctx.fillText(title, Math.max(8, Math.min(width - length - 8, group.x + 18)), Math.max(18, group.y - 16));
      }
    }
    ctx.restore();
    ctx.strokeStyle = '#608590'; ctx.lineWidth = 1; ctx.strokeRect(left, top, right - left, bottom - top);
    ctx.font = '10px "DM Sans", sans-serif'; ctx.fillStyle = '#9ab0be';
    if (top >= 14 && top < height) ctx.fillText(t('north'), Math.max(10, left + 6), top - 9);
    if (bottom >= 0 && bottom < height - 14) ctx.fillText(t('south'), Math.max(10, left + 6), bottom + 17);
    const scaleDegrees = niceStep(60 / scale), pixels = scaleDegrees * scale;
    ctx.strokeStyle = '#c5e1e0';ctx.beginPath();ctx.moveTo(18,height-33);ctx.lineTo(18+pixels,height-33);ctx.stroke();
    ctx.fillStyle = '#c5e1e0';ctx.fillText(`ΔRA ${n(scaleDegrees)}° · Dec 0°`,18,height-42);
    $('exCount').textContent = `${groups.reduce((sum, g) => sum + g.objects.length, 0)} / 19 ${t('visible')}`;
    $('exZoom').value = String(camera.zoom);
    $('exScale').textContent = `${n(10 ** camera.zoom)}×`;
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
    try {
      const matches = await findObjects(data.manifest, data.objects, loader, $('exSearch').value);
      if (!active || disposed || revision !== searchRevision) return;
      results = matches; searchFailed = false; $('exError').hidden = !failed; showList();
    } catch (error) {
      if (!active || disposed || revision !== searchRevision) return;
      searchFailed = true; results = []; $('exError').hidden = false; showList();
    }
  }

  async function start() {
    const own = new AbortController(); session = own;
    loading = !data; failed = false; searchFailed = false; $('exError').hidden = true; invalidate();
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
    frame = null; pointers.clear(); gesture = null; canvas.dataset.interacting = 'false';
  }
  function setActive(value) {
    if (disposed || active === value) return;
    active = value;
    if (active) { resize(); void start(); } else stop();
  }

  const zoom = amount => {camera = zoomAt(camera, camera.zoom + amount, [width / 2, height / 2], width, height); changed();};
  listen($('exIn'), 'click', () => zoom(.25)); listen($('exOut'), 'click', () => zoom(-.25));
  listen($('exZoom'), 'input', () => {camera = zoomAt(camera, Number($('exZoom').value), [width / 2, height / 2], width, height);changed();});
  listen($('exHome'), 'click', () => {camera = homeCamera(); changed();});
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
  const point = event => {const rect = canvas.getBoundingClientRect();return [event.clientX - rect.left, event.clientY - rect.top];};
  function resetGesture() {
    const points = [...pointers.values()];
    if (!points.length) {gesture = null; return;}
    const midpoint = points.length > 1 ? [(points[0][0] + points[1][0]) / 2, (points[0][1] + points[1][1]) / 2] : points[0];
    gesture = {camera: {...camera}, midpoint, span: points.length > 1 ? Math.hypot(points[0][0] - points[1][0], points[0][1] - points[1][1]) : 0};
  }
  listen(canvas, 'pointerdown', event => {
    if (event.button !== 0 || pointers.size >= 2) return;
    canvas.focus({preventScroll:true});canvas.setPointerCapture(event.pointerId);canvas.dataset.interacting = 'true';
    pointers.set(event.pointerId, point(event)); moved = pointers.size > 1; resetGesture();
  });
  listen(canvas, 'pointermove', event => {
    if (!pointers.has(event.pointerId) || !gesture) return;
    pointers.set(event.pointerId, point(event));
    const points = [...pointers.values()];
    const midpoint = points.length > 1 ? [(points[0][0]+points[1][0])/2,(points[0][1]+points[1][1])/2] : points[0];
    const dx = midpoint[0] - gesture.midpoint[0], dy = midpoint[1] - gesture.midpoint[1];
    if (Math.hypot(dx, dy) > 4) moved = true;
    let next = gesture.camera;
    if (points.length > 1 && gesture.span > 0) {
      const span = Math.hypot(points[0][0]-points[1][0],points[0][1]-points[1][1]);
      next = zoomAt(next, next.zoom + Math.log10(Math.max(1, span) / gesture.span), gesture.midpoint, width, height);
    }
    camera = panBy(next, dx, dy, width, height); changed();
  });
  function release(event) {
    if (!pointers.has(event.pointerId)) return;
    if (event.type === 'pointerup' && !moved && pointers.size === 1) {
      const [x,y] = point(event), hit = hitGroup(groups,x,y);
      if (hit?.objects.length === 1) select(hit.objects[0]);
      else if (hit) {
        const center = worldPoint([hit.x,hit.y],camera,width,height);
        camera = {...camera,x:center[0],y:center[1],zoom:Math.min(MAX_ZOOM,camera.zoom + .8)};
        results = hit.objects; $('exSearch').value = ''; showList(); changed();
        $('exAnnouncement').textContent = `${t('group')} · ${hit.objects.length}`;
      }
    }
    pointers.delete(event.pointerId); resetGesture();
    if (!pointers.size) canvas.dataset.interacting = 'false';
  }
  listen(canvas,'pointerup',release);listen(canvas,'pointercancel',release);listen(canvas,'lostpointercapture',release);
  listen(canvas, 'wheel', event => {
    if (document.activeElement !== canvas) return;
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1);
    camera = zoomAt(camera, camera.zoom - Math.max(-.4,Math.min(.4,delta*.001)),point(event),width,height);changed();
  }, {passive:false});
  listen(canvas,'keydown',event => {
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home','Escape'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Escape') {canvas.blur();$('exHome').focus();return;}
    if (event.key === 'Home') camera = homeCamera();
    else if (['+','=','-'].includes(event.key)) {zoom(event.key === '-' ? -.25 : .25);return;}
    else camera = panBy(camera,event.key==='ArrowLeft'?48:event.key==='ArrowRight'?-48:0,event.key==='ArrowUp'?48:event.key==='ArrowDown'?-48:0,width,height);
    changed();
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
    inspect: () => ({active,loading,failed,searchFailed,selected,camera:{...camera},draws,duration,scheduled:frame!==null,requests:loader?.active??0,queued:loader?.queued??0,cacheBytes:loader?.cache.byteLength??0,objectCount:data?.objects.length??0,groups:groups.map(g=>({x:g.x,y:g.y,ids:g.objects.map(o=>o.id)}))}),
    dispose() {if(disposed)return;active=false;stop();disposed=true;listeners.abort();observer.disconnect();intersection.disconnect();unsubscribe();root.replaceChildren();},
  };
}
