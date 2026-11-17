import {language, onLanguageChange} from '../i18n.mjs';
import {cameraScale, screenPoint, worldPoint, niceStep, MAX_ZOOM} from './camera.mjs';
import {mapGestures} from './gestures.mjs';
import {placeLabels, drawLabels} from './labels.mjs';
import {AU_KM, J2000, MIN_DAY, MAX_DAY, ORBIT_SOURCE, RADIUS_SOURCE, SUN_SOURCE, bodies, solarState, vectorOnOrbit, eclipticToMap, radiusAU, parseModelDate, formatModelDay, advanceModelDay} from './solar-model.mjs';
import {solarComparison} from './solar-motion.mjs';
import {ORBIT_POSES,spaceCamera,rotateSpace,zoomSpace,spaceProjector,trailSamples} from './solar-space.mjs';

export const SOLAR_FRAME = [-32, -32, 32, 32];
const fit = () => ({x:0, y:0, zoom:0});
const copy = {
  title:['Unser Sonnensystem','Our Solar System'],
  frame:['Draufsicht von Norden auf die Erdbahnebene · Sonne in der Mitte','North-side view of Earth’s orbital plane · Sun at the centre'],
  limit:['Blick auf die J2000-Ekliptik. Die Karte zeigt Abstände in dieser Ebene. Im Inspector steht die räumliche Entfernung zur Sonne.','View of the J2000 ecliptic. The map shows distances in this plane. The inspector gives the spatial distance from the Sun.'],
  help:['Ziehen oder Pfeiltasten verschieben. Zum Rad-Zoom die Karte fokussieren. Pinch oder +/− zum Zoomen, Home für die Übersicht, Escape zurück zur Steuerung.','Drag or use arrows to pan. Focus the map for wheel zoom. Pinch or use +/− to zoom, Home for the overview, Escape back to controls.'],
  model:['Berechnete Modellpositionen · JPL-Näherung','Computed model positions · JPL approximation'],
  science:['Modell und Quellen','Model and sources'],
  scienceNote:['JPL-Tabelle 1, heliozentrische mittlere Ekliptik und Tagundnachtgleiche J2000. Zeitbasis TDB, 1800 bis Anfang 2050. Bahnringe zeigen Ellipsen der gewählten Modellepoche. Abweichungen von einer integrierten Ephemeride sind je nach Planet unterschiedlich.','JPL table 1, heliocentric mean ecliptic and equinox of J2000. TDB, 1800 to the start of 2050. Paths show ellipses at the chosen model epoch. Deviations from an integrated ephemeris vary by planet.'],
  earth:['Die Erdposition verwendet den Erd-Mond-Schwerpunkt. Die Erde selbst liefert den Radius.','Earth’s position uses the Earth–Moon barycentre. The radius is Earth’s.'],
  fit:['Ganzes System','Full system'],
  inner:['Innere Planeten','Inner planets'],
  center:['Auswahl zentrieren','Centre selection'],
  zoom:['Zoom · logarithmisch','Logarithmic zoom'],
  zoomIn:['Hineinzoomen','Zoom in'],
  zoomOut:['Herauszoomen','Zoom out'],
  symbols:['Körper zur Sichtbarkeit vergrößern','Enlarge bodies for visibility'],
  schematic:['Symbole vergrößert · Farben und Saturnring illustrativ','Symbols enlarged · colours and Saturn ring illustrative'],
  scale:['Körperradien im selben Maßstab wie die Bahnen','Body radii use the same scale as the orbits'],
  time:['Modellzeit (TDB)','Model time (TDB)'],
  date:['Datum (TDB)','Date (TDB)'],
  play:['Abspielen','Play'],
  pause:['Pausieren','Pause'],
  prev:['Einen Tag zurück','Step back one day'],
  next:['Einen Tag vor','Step forward one day'],
  rate:['Modelltage pro Sekunde','Model days per second'],
  motion:['Reduzierte Bewegung · Zeit per Datum oder Tagesschritt ändern.','Reduced motion · change time by date or single-day steps.'],
  bodies:['Sonne und Planeten','Sun and planets'],
  selected:['Ausgewählter Körper','Selected body'],
  star:['Zentralstern · Koordinatenursprung','Central star · coordinate origin'],
  planet:['Planet','Planet'],
  distance:['Modellabstand zur Sonne (3D)','Model distance from the Sun (3D)'],
  radius:['Mittlerer Radius','Mean radius'],
  sunRadius:['Nominaler Sonnenradius','Nominal solar radius'],
  axis:['Große Halbachse im Modell','Model semi-major axis'],
  elements:['JPL-Bahnparameter und Modellfehler','JPL orbital elements and model errors'],
  radii:['JPL-Planetenradien','JPL planetary radii'],
  iau:['IAU-Nominalradius der Sonne','IAU nominal solar radius'],
  earthBary:['Erde–Mond-Schwerpunkt','Earth–Moon barycentre'],
  target:['Zielkörper','Target body'],
  reference:['Bezugskörper','Reference body'],
  jump:['Zu Objekt springen','Jump to body'],
  follow:['Auswahl verfolgen','Follow selection'],
  comparison:['Abstand & Bewegung','Distance & motion'],
  choosePair:['Wähle zwei verschiedene Körper für einen Vergleich.','Choose two different bodies to compare.'],
  pairDistance:['Räumlicher 3D-Abstand','Spatial 3D separation'],
  pairProjection:['Abstand in der Kartenebene (X/Y)','Separation in the map plane (X/Y)'],
  pairLight:['Einfache Lichtlaufzeit','Simple light travel time'],
  pairSpeed:['Geschwindigkeit relativ zum Bezugskörper','Speed relative to the reference body'],
  pairRadial:['Radialer Anteil','Radial component'],
  approaching:['Annäherung','approaching'],
  receding:['Entfernung','receding'],
  steady:['momentan weder näher noch ferner','instantaneously neither nearer nor farther'],
  why:['Wie lese ich diesen Vergleich?','How do I read this comparison?'],
  whyBody:['Geschwindigkeit braucht immer einen Bezugskörper: Wir ziehen seine Modellgeschwindigkeit von der des Zielkörpers ab. Der Abstand ändert sich, weil beide Körper ihre Bahnen durchlaufen. Die Linie und der X/Y-Wert zeigen nur die Draufsicht; der 3D-Abstand enthält auch die Höhe über der Bahnebene. Lichtlaufzeit ist hier Abstand geteilt durch c bei festgehaltener Geometrie – keine lichtzeitkorrigierte Signalrechnung.','Speed always needs a reference body: we subtract its model velocity from the target’s. Distance changes as both bodies move on their orbits. The line and X/Y value show only the top-down view; 3D separation also includes height above the orbital plane. Light time here is distance divided by c for a frozen geometry, not a light-time-corrected signal calculation.'],
  method:['Geschwindigkeiten: numerische Ableitung der JPL-Näherungspositionen, keine NASA-Zustandsvektoren. 0,01 TDB-Tag Differenzschritt; an den Grenzen einseitig zweiter Ordnung. Alle Werte heliozentrischer J2000-Ekliptikrahmen. Die Erdposition ist der Erde–Mond-Schwerpunkt.','Velocities: numerical derivatives of the approximate JPL positions, not NASA state vectors. Difference step 0.01 TDB day; second-order one-sided at the bounds. All values share the heliocentric J2000 ecliptic frame. Earth’s position is the Earth–Moon barycentre.'],
  comparisonEpoch:['Modellzeit','Model time'],
  viewGroup:['Ansicht des Sonnensystems','Solar System view'],
  view2d:['2D · Draufsicht','2D · top view'],
  view3d:['3D · Raumansicht','3D · spatial view'],
  topView:['Von oben','From above'],
  angleView:['Schräg','Angled'],
  sideView:['Von der Seite','From the side'],
  sunHome:['Zur Sonne','To the Sun'],
  trailsOn:['Trails an','Trails on'],
  trailsOff:['Trails aus','Trails off'],
  frame3d:['Heliozentrischer J2000-Raum · frei drehbare Kameraperspektive','Heliocentric J2000 space · rotatable camera perspective'],
  help3d:['Ziehen dreht die Kamera, Pinch oder +/− zoomt. Pfeiltasten drehen; Home zeigt alles. Die Spur zeigt vergangene Modellpositionen, keine Lichtspur.','Drag to rotate the camera, pinch or +/− to zoom. Arrow keys rotate; Home fits the system. Trails show past model positions, not observed light.'],
  limit3d:['Perspektivische Projektion auf einen flachen Bildschirm: Bildnähe ist keine räumliche Nähe. Die Sonne ist der Ursprung; die Erdposition ist der Erde–Mond-Schwerpunkt.','Perspective projection onto a flat screen: screen proximity is not spatial proximity. The Sun is the origin; Earth’s position is the Earth–Moon barycentre.'],
  scene3d:['Frei wählbare Perspektive auf vereinfachte JPL-Bahnpositionen. Ekliptikebene J2000, TDB 1800–2050. Symbole sind standardmäßig vergrößert.','Adjustable view of approximate JPL orbital positions. J2000 ecliptic, TDB 1800–2050. Symbols are enlarged by default.'],
  focusScale:['AU am Kamerazentrum','AU at camera focus'],
  pairProjection3d:['Abstand in der J2000-Ekliptikebene (X/Y), nicht im Bild','J2000 ecliptic-plane separation (X/Y), not on screen'],
  whyBody3d:['Geschwindigkeit braucht einen Bezugskörper: Wir ziehen seine Modellgeschwindigkeit von der des Ziels ab. Drehen und Zoomen verändern nur das Bild. Der X/Y-Wert gehört zur Ekliptikebene, der 3D-Abstand enthält auch Z. Die projizierte Linie ist keine maßstäbliche Distanzangabe. Lichtlaufzeit ist Abstand durch c bei festgehaltener Geometrie.','Speed needs a reference body: subtract its model velocity from the target’s. Rotating and zooming change only the image. X/Y belongs to the ecliptic plane; 3D separation also includes Z. The projected line is not a distance scale. Light time is distance divided by c for frozen geometry.'],
};

export function mountSolar(root) {
  const lang = () => language() === 'en' ? 1 : 0;
  const t = key => copy[key][lang()];
  const name = body => body.names[lang()];
  const comparisonName=body=>body.id==='earth'?t('earthBary'):name(body);
  const format = [new Intl.NumberFormat('de-DE',{maximumSignificantDigits:4}),new Intl.NumberFormat('en-GB',{maximumSignificantDigits:4})];
  const n = value => format[lang()].format(value);
  root.innerHTML = `
    <div class="ex-layout ex-solar">
      <div class="ex-left">
        <div class="ex-map-head"><div><strong data-solar="title"></strong><p data-solar="frame"></p></div>
          <div class="ex-controls">
            <button type="button" id="solOut">−</button><button type="button" id="solIn">+</button>
            <button type="button" id="solFit" data-solar="fit"></button>
            <button type="button" id="solInner" data-solar="inner"></button>
            <button type="button" id="solCenter" data-solar="center"></button>
          </div>
        </div>
        <div class="ex-solar-viewbar" role="group" aria-label="" id="solViewBar"><button type="button" id="sol2d" data-solar="view2d" aria-pressed="true"></button><button type="button" id="sol3d" data-solar="view3d" aria-pressed="false"></button><button type="button" id="solSun" data-solar="sunHome"></button><span id="sol3dControls" hidden><button type="button" id="solTop" data-solar="topView"></button><button type="button" id="solAngle" data-solar="angleView"></button><button type="button" id="solSide" data-solar="sideView"></button><button type="button" id="solTrails" aria-pressed="true"></button></span></div>
        <p id="solScene3d" class="ex-solar-caption" data-solar="scene3d" hidden></p>
        <div class="ex-solar-quick">
          <label><span data-solar="target"></span><select id="solTarget"></select></label>
          <label><span data-solar="reference"></span><select id="solReference"></select></label>
          <button type="button" id="solJump" data-solar="jump"></button>
          <button type="button" id="solFollow" data-solar="follow" aria-pressed="false"></button>
        </div>
        <div class="ex-map ex-solar-map"><canvas id="solCanvas" tabindex="0" aria-describedby="solHelp solLimit"></canvas></div>
        <div class="ex-map-foot"><span data-solar="model"></span><span id="solScaleNote"></span><strong id="solPairSummary" hidden></strong></div>
        <div class="ex-zoom"><label for="solZoom" data-solar="zoom"></label><input id="solZoom" type="range" min="0" max="${MAX_ZOOM}" step="0.01" value="0"><output id="solZoomValue"></output></div>
        <div class="ex-time">
          <div class="ex-time-title"><strong data-solar="time"></strong><span id="solTimestamp"></span></div>
          <div class="ex-controls">
            <button type="button" id="solPrev" aria-label="" title="">−1 d</button>
            <button type="button" id="solPlay"></button>
            <button type="button" id="solNext" aria-label="" title="">+1 d</button>
            <button type="button" id="solEpoch">J2000.0</button>
          </div>
          <div class="ex-time-inputs"><label><span data-solar="date"></span><input type="date" id="solDate" min="1800-01-01" max="2050-01-01"></label>
            <label><span data-solar="rate"></span><select id="solRate"><option>1</option><option selected>10</option><option>100</option></select></label>
          </div>
          <p id="solMotion" data-solar="motion" hidden></p>
        </div>
        <div class="ex-notes"><p id="solHelp" data-solar="help"></p><details><summary data-solar="science"></summary>
          <p id="solLimit" data-solar="limit"></p><p data-solar="scienceNote"></p><p data-solar="earth"></p>
          <ul><li><a href="${ORBIT_SOURCE}" data-solar="elements"></a></li><li><a href="${RADIUS_SOURCE}" data-solar="radii"></a></li><li><a href="${SUN_SOURCE}" data-solar="iau"></a></li></ul>
        </details></div>
      </div>
      <aside class="ex-aside"><h2 data-solar="bodies"></h2><div id="solList" class="ex-body-list"></div>
        <label class="ex-symbol-option"><input type="checkbox" id="solSymbols" checked><span data-solar="symbols"></span></label>
        <div class="ex-inspector"><h2 data-solar="selected"></h2><p id="solName" class="ex-selected" aria-live="polite"></p><p id="solKind" class="ex-small"></p>
          <dl><dt data-solar="distance"></dt><dd id="solDistance"></dd>
            <dt id="solRadiusLabel"></dt><dd id="solRadius"></dd>
            <dt id="solAxisLabel" data-solar="axis" hidden></dt><dd id="solAxis" hidden></dd></dl>
          <p id="solEarth" class="ex-small" data-solar="earth" hidden></p>
        </div>
        <section class="ex-compare" aria-labelledby="solCompareTitle">
          <h2 id="solCompareTitle" data-solar="comparison"></h2>
          <p id="solPairTitle" class="ex-selected" aria-live="polite"></p>
          <p id="solPairEmpty" data-solar="choosePair"></p>
          <dl id="solPairValues" hidden>
            <dt data-solar="pairDistance"></dt><dd id="solPairDistance"></dd>
            <dt id="solPairProjectionLabel" data-solar="pairProjection"></dt><dd id="solPairProjection"></dd>
            <dt data-solar="pairLight"></dt><dd id="solPairLight"></dd>
            <dt data-solar="pairSpeed"></dt><dd id="solPairSpeed"></dd>
            <dt data-solar="pairRadial"></dt><dd id="solPairRadial"></dd>
          </dl>
          <p id="solPairEpoch" class="ex-small"></p>
          <details><summary data-solar="why"></summary><p data-solar="whyBody"></p><p data-solar="method"></p></details>
        </section>
      </aside>
    </div>`;
  const $ = id => root.querySelector('#'+id);
  const canvas = $('solCanvas'), ctx = canvas.getContext('2d');
  const abort = new AbortController();
  const listen = (el,type,fn,opts={}) => el.addEventListener(type,fn,{...opts,signal:abort.signal});
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false, visible = false, raf = null, clock = null;
  let day = J2000, camera = fit(), space=spaceCamera(), view='2d', trails=true, selected = 'sun', reference = 'sun', follow = false, enlarged = true;
  const trailCache=new Map(),spacePointers=new Map();
  let spaceGesture=null,spaceMoved=false;
  let stateDay = null, state = [], markers = [], width = 1, height = 1;
  let draws = 0, drawMs = 0, lastReadout = null;
  const buttons = bodies.map(body => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.body = body.id;
    button.style.setProperty('--body-color',body.color);
    $('solList').append(button);
    listen(button,'click',()=>select(body.id,true));
    return {body,button};
  });
  for(const body of bodies)for(const id of ['solTarget','solReference']) {
    const option=document.createElement('option');option.value=body.id;$(id).append(option);
  }

  function current() {
    if (stateDay !== day) {state = solarState(day);stateDay = day;}
    return state;
  }
  function selectedBody() { return current().find(entry=>entry.body.id === selected); }
  function invalidate() {
    if (active && visible && !document.hidden && raf === null) raf = requestAnimationFrame(draw);
  }
  function setCamera(next) {
    if(follow && (next.x!==camera.x || next.y!==camera.y)) {
      follow=false;$('solFollow').setAttribute('aria-pressed','false');
    }
    camera = next;invalidate();
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    width = rect.width; height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1,1.75);
    const w = Math.round(width*dpr), h = Math.round(height*dpr);
    if (canvas.width !== w || canvas.height !== h) {canvas.width=w;canvas.height=h;}
    ctx?.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);
    invalidate();
  }
  function center() {
    const vector=selectedBody().vector;
    if(view==='3d')space={...space,focus:[...vector]};
    else {const [x,y]=eclipticToMap(vector);camera={...camera,x,y};}
    invalidate();
  }
  function select(id, recenter) {
    selected = id;
    $('solTarget').value=id;
    if (recenter || follow) center();
    updateInspector();
    invalidate();
  }
  function updateInspector() {
    const {body,distanceAU,orbit} = selectedBody();
    $('solName').textContent = name(body);
    $('solKind').textContent = t(orbit?'planet':'star');
    $('solDistance').textContent = `${orbit ? '≈ ' : ''}${n(distanceAU)} AU · ${n(distanceAU*AU_KM)} km`;
    $('solRadiusLabel').textContent = t(orbit?'radius':'sunRadius');
    $('solRadius').textContent = n(body.radiusKm)+' km';
    $('solAxis').hidden = $('solAxisLabel').hidden = !orbit;
    $('solAxis').textContent = orbit ? n(orbit.a)+' AU' : '';
    $('solEarth').hidden = body.id !== 'earth';
    for (const {body,button} of buttons) {
      button.setAttribute('aria-pressed',String(body.id===selected));
      button.dataset.reference=String(body.id===reference&&reference!==selected);
    }
    $('solReference').value=reference;
    const pair=selected!==reference?solarComparison(day,selected,reference):null;
    $('solPairEmpty').hidden=Boolean(pair);$('solPairValues').hidden=!pair;
    $('solPairTitle').textContent=pair?`${comparisonName(body)} ↔ ${comparisonName(bodies.find(b=>b.id===reference))}`:'';
    $('solPairSummary').hidden=!pair;
    if(pair)$('solPairSummary').textContent=`${$('solPairTitle').textContent} · ≈ ${n(pair.distanceAU)} AU · ≈ ${n(pair.speedKmS)} km/s`;
    $('solPairProjectionLabel').textContent=t(view==='3d'?'pairProjection3d':'pairProjection');
    $('solPairEpoch').textContent=`${t('comparisonEpoch')}: ${formatModelDay(day).replace('T',' ')} TDB · ${t('model')}`;
    if(pair) {
      $('solPairDistance').textContent=`≈ ${n(pair.distanceAU)} AU · ${n(pair.distanceKm)} km`;
      $('solPairProjection').textContent=`≈ ${n(pair.projectedAU)} AU`;
      const light=pair.lightSeconds<120?`${n(pair.lightSeconds)} s`:
        pair.lightSeconds<7200?`${n(pair.lightSeconds/60)} min`:`${n(pair.lightSeconds/3600)} h`;
      $('solPairLight').textContent=`≈ ${light} (d/c)`;
      $('solPairSpeed').textContent=`≈ ${n(pair.speedKmS)} km/s`;
      $('solPairRadial').textContent=`${pair.radialKmS>=0?'+':''}${n(pair.radialKmS)} km/s · ${t(pair.radialKmS>0?'receding':pair.radialKmS<0?'approaching':'steady')}`;
    }
  }
  function updateClock(force = false) {
    const time = formatModelDay(day);
    $('solTimestamp').textContent = time.replace('T',' ')+' TDB';
    if (force || document.activeElement !== $('solDate')) $('solDate').value = time.slice(0,10);
    $('solPrev').disabled = day<=MIN_DAY;
    $('solNext').disabled = day>=MAX_DAY;
    $('solPlay').disabled = reduced.matches || day>=MAX_DAY;
    $('solPlay').textContent = t(clock ? 'pause':'play');
    $('solMotion').hidden = !reduced.matches;
  }
  function localize() {
    for (const el of root.querySelectorAll('[data-solar]')) el.textContent = t(el.dataset.solar);
    for (const {body,button} of buttons) button.textContent = name(body);
    for(const id of ['solTarget','solReference'])for(const option of $(id).options) option.textContent=name(bodies.find(body=>body.id===option.value));
    $('solTarget').value=selected;$('solReference').value=reference;
    for (const [id,key] of [['solIn','zoomIn'],['solOut','zoomOut'],['solPrev','prev'],['solNext','next']]) {
      $(id).setAttribute('aria-label',t(key)); $(id).title=t(key);
    }
    canvas.setAttribute('aria-label',t(view==='3d'?'view3d':'title'));
    $('solViewBar').setAttribute('aria-label',t('viewGroup'));
    root.querySelector('[data-solar="frame"]').textContent=t(view==='3d'?'frame3d':'frame');
    $('solHelp').textContent=t(view==='3d'?'help3d':'help');
    $('solLimit').textContent=t(view==='3d'?'limit3d':'limit');
    root.querySelector('[data-solar="whyBody"]').textContent=t(view==='3d'?'whyBody3d':'whyBody');
    $('solTrails').textContent=t(trails?'trailsOn':'trailsOff');
    $('solScaleNote').textContent = t(enlarged?'schematic':'scale');
    updateClock();updateInspector();invalidate();
  }

  function draw(time) {
    raf = null;
    if (!active || !visible || document.hidden) return;
    const started = performance.now();
    if (clock) {
      day = advanceModelDay(clock.day,Math.max(0,time-clock.start)/1000,clock.rate);
      if (day === MAX_DAY) clock = null;
    }
    if(follow) {
      const vector=selectedBody().vector;
      if(view==='3d')space={...space,focus:[...vector]};
      else {const [x,y]=eclipticToMap(vector);camera={...camera,x,y};}
    }
    if (ctx) render();
    // DOM readouts are refreshed at most five times per second during playback.
    if (!clock || lastReadout === null || time - lastReadout >= 200) {
      updateClock();updateInspector();lastReadout = time;
    }
    draws++;
    drawMs = performance.now()-started;
    if (clock) invalidate();
  }

  function render() {
    if(view==='3d'){renderSpace();return;}
    ctx.clearRect(0,0,width,height);
    const scale = cameraScale(camera,width,height,SOLAR_FRAME);
    const screen = point => screenPoint(point,camera,width,height,SOLAR_FRAME);
    const [left,top] = worldPoint([0,0],camera,width,height,SOLAR_FRAME);
    const [right,bottom] = worldPoint([width,height],camera,width,height,SOLAR_FRAME);
    const step = niceStep(72/scale);
    ctx.strokeStyle = '#34587558';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x=Math.ceil(left/step)*step;x<=right;x+=step) {
      const [px] = screen([x,0]);ctx.moveTo(px,0);ctx.lineTo(px,height);
    }
    for (let y=Math.ceil(top/step)*step;y<=bottom;y+=step) {
      const [,py] = screen([0,y]);ctx.moveTo(0,py);ctx.lineTo(width,py);
    }
    ctx.stroke();

    // The marker and the path use the same fitted elements at the displayed TDB epoch.
    const entries = current();
    for (const {body,orbit} of entries) {
      if (!orbit) continue;
      const {a,e,p,q} = orbit, b = a*Math.sqrt(1-e*e);
      const [x,y] = screen([-a*e*p[0],a*e*p[1]]);
      ctx.beginPath();
      ctx.save();
      // Affine projection of the orbital ellipse. The stroke remains in CSS pixels.
      ctx.transform(a*p[0]*scale,-a*p[1]*scale,b*q[0]*scale,-b*q[1]*scale,x,y);
      ctx.arc(0,0,1,0,2*Math.PI);
      ctx.restore();
      ctx.strokeStyle = body.color+(selected===body.id?'c0':'55');
      ctx.lineWidth = selected===body.id ? 1.6 : 1;
      ctx.stroke();
    }

    markers = entries.map(({body,vector})=>{
      const [x,y] = screen(eclipticToMap(vector));
      const radius = enlarged ? body.size : radiusAU(body)*scale;
      const chosen = selected === body.id;
      const isReference=reference===body.id&&reference!==selected;
      return {body,x,y,radius,selected:chosen,reference:isReference,priority:chosen?20:isReference?15:body.id==='sun'?10:1,label:name(body)};
    }).filter(m=>m.x+m.radius>=0&&m.x-m.radius<=width&&m.y+m.radius>=0&&m.y-m.radius<=height);
    if(selected!==reference) {
      const a=markers.find(m=>m.body.id===selected),b=markers.find(m=>m.body.id===reference);
      if(a&&b) {
        ctx.strokeStyle='#9de4dd8c';ctx.lineWidth=1.2;ctx.setLineDash([4,5]);
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);
      }
    }
    markers.sort((a,b)=>Number(a.selected)-Number(b.selected));
    for (const marker of markers) drawBody(marker);
    ctx.font = '12px "DM Sans", sans-serif';
    drawLabels(ctx,placeLabels(markers,label=>ctx.measureText(label).width,width,height,{bottom:height-52}));

    const bar = niceStep(42/scale);
    ctx.strokeStyle = ctx.fillStyle = '#cde4e5';
    ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.moveTo(17,height-25);ctx.lineTo(17+bar*scale,height-25);
    ctx.moveTo(17,height-28);ctx.lineTo(17,height-22);
    ctx.moveTo(17+bar*scale,height-28);ctx.lineTo(17+bar*scale,height-22);
    ctx.stroke();
    ctx.fillText(bar>=.01?n(bar)+' AU':n(bar*AU_KM)+' km',17,height-34);
    $('solZoom').value = String(camera.zoom);
    $('solZoomValue').textContent = n(10**camera.zoom)+'×';
    $('solIn').disabled = camera.zoom === MAX_ZOOM;
    $('solOut').disabled = camera.zoom === 0;
  }

  function renderSpace() {
    ctx.clearRect(0,0,width,height);
    const screen=spaceProjector(space,width,height);
    const strokePath=(vectors,color,lineWidth=1)=>{
      ctx.beginPath();let drawing=false;
      for(const vector of vectors){
        const p=screen(vector);
        if(!p){drawing=false;continue;}
        if(drawing)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);
        drawing=true;
      }
      ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.stroke();
    };
    // Geometric reference rings in the J2000 ecliptic, not sources.
    for(const radius of [1,5,10,20,30]){
      const ring=Array.from({length:97},(_,i)=>{
        const a=2*Math.PI*i/96;return [radius*Math.cos(a),radius*Math.sin(a),0];
      });
      strokePath(ring,'#7093a724');
    }
    strokePath([[-32,0,0],[32,0,0]],'#88afba40',1);
    strokePath([[0,-32,0],[0,32,0]],'#88afba40',1);
    const entries=current();
    for(const {body,orbit} of entries){
      if(!orbit)continue;
      strokePath(Array.from({length:145},(_,i)=>vectorOnOrbit(orbit,2*Math.PI*i/144)),
        body.color+(selected===body.id?'77':'35'),selected===body.id?1.5:1);
    }
    if(trails)for(const {body,orbit} of entries){
      if(!orbit)continue;
      let cached=trailCache.get(body.id);
      if(!cached||cached.day!==day){
        cached=trailSamples(day,body);trailCache.set(body.id,cached);
      }
      const points=cached.samples;
      for(let i=1;i<points.length;i++){
        const a=screen(points[i-1].vector),b=screen(points[i].vector);
        if(!a||!b)continue;
        ctx.strokeStyle=body.color+Math.round(20+180*(i/points.length)**2).toString(16).padStart(2,'0');
        ctx.lineWidth=selected===body.id?2.6:1.8;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
    }
    markers=entries.map(({body,vector})=>{
      const p=screen(vector);if(!p)return null;
      const radius=enlarged?Math.min(52,Math.max(2,body.size*85/p.depth)):
        radiusAU(body)*p.pixelsPerAU;
      const chosen=selected===body.id;
      return {body,x:p.x,y:p.y,depth:p.depth,radius,selected:chosen,
        reference:reference===body.id&&reference!==selected,
        priority:chosen?20:body.id===reference?15:body.id==='sun'?10:1,label:name(body)};
    }).filter(m=>m&&m.x+m.radius>=0&&m.x-m.radius<=width&&m.y+m.radius>=0&&m.y-m.radius<=height);
    if(selected!==reference){
      const a=markers.find(m=>m.body.id===selected),b=markers.find(m=>m.body.id===reference);
      if(a&&b){
        ctx.strokeStyle='#9de4dd88';ctx.lineWidth=1.2;ctx.setLineDash([4,5]);
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);
      }
    }
    // Painter's order: far bodies first. Hit testing below reverses this order.
    markers.sort((a,b)=>b.depth-a.depth);
    for(const marker of markers)drawBody(marker);
    ctx.font='12px "DM Sans", sans-serif';
    drawLabels(ctx,placeLabels(markers,label=>ctx.measureText(label).width,width,height,{bottom:height-52}));
    const pixelsAtFocus=height*.9/(85/10**space.zoom);
    const bar=niceStep(46/pixelsAtFocus);
    ctx.strokeStyle=ctx.fillStyle='#cde4e5';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(17,height-25);ctx.lineTo(17+bar*pixelsAtFocus,height-25);
    ctx.moveTo(17,height-28);ctx.lineTo(17,height-22);
    ctx.moveTo(17+bar*pixelsAtFocus,height-28);ctx.lineTo(17+bar*pixelsAtFocus,height-22);
    ctx.stroke();
    ctx.fillText(`${n(bar)} ${t('focusScale')}`,17,height-34);
    $('solZoom').value=String(space.zoom);
    $('solZoomValue').textContent=n(10**space.zoom)+'×';
    $('solIn').disabled=space.zoom===MAX_ZOOM;
    $('solOut').disabled=space.zoom===0;
  }

  function drawBody({body,x,y,radius,selected:chosen,reference:isReference}) {
    if (enlarged && body.id === 'saturn') {
      ctx.strokeStyle = '#e8d6a1a8';ctx.lineWidth=2;
      ctx.beginPath();ctx.ellipse(x,y,radius*1.85,radius*.55,-.43,0,Math.PI*2);ctx.stroke();
    }
    if (enlarged) {
      const paint = ctx.createRadialGradient(x-radius*.35,y-radius*.35,0,x,y,radius);
      paint.addColorStop(0,'#fff4df');
      paint.addColorStop(.4,body.color);
      paint.addColorStop(1,body.color+'75');
      ctx.fillStyle=paint;
      ctx.shadowColor=body.color;ctx.shadowBlur=body.id==='sun'?27:12;
    } else ctx.fillStyle=body.color;
    ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    if (chosen) {
      ctx.strokeStyle='#d8f8f0';ctx.lineWidth=1.5;ctx.setLineDash([3,3]);
      ctx.beginPath();ctx.arc(x,y,Math.max(9,radius+5),0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    } else if(isReference) {
      ctx.strokeStyle='#f8c68f';ctx.lineWidth=1.6;
      ctx.beginPath();ctx.arc(x,y,Math.max(9,radius+5),0,Math.PI*2);ctx.stroke();
    }
  }

  function suspend() {
    cancelSpace();
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null; clock = null; gestures.cancel(); updateClock();
  }
  function changeDay(value) {
    clock = null;day = value;lastReadout = null;
    updateClock(true);updateInspector();invalidate();
  }
  function beginClock() {
    if (!active || !visible || document.hidden || reduced.matches || day>=MAX_DAY) return;
    clock = {day,start:performance.now(),rate:Number($('solRate').value)};
    lastReadout = null;updateClock();invalidate();
  }
  const gestures = mapGestures(canvas, listen, {
    enabled:()=>view==='2d',
    getCamera:()=>camera, setCamera, size:()=>[width,height], frame:SOLAR_FRAME,
    fit:()=>setCamera(fit()), exit:()=>$('solFit').focus(),
    tap(x,y) {
      const hit = markers.map(m=>[m,Math.hypot(m.x-x,m.y-y)]).filter(([m,d])=>d<=Math.max(13,m.radius+3)).sort((a,b)=>a[1]-b[1])[0];
      if (hit) select(hit[0].body.id,false);
    },
  });
  const zoomBy=delta=>{if(view==='3d'){space=zoomSpace(space,delta);invalidate();}
    else gestures.zoomBy(delta);};
  const fitView=()=>{
    follow=false;$('solFollow').setAttribute('aria-pressed','false');
    if(view==='3d'){space=spaceCamera();invalidate();}
    else setCamera(fit());
  };
  listen($('solIn'),'click',()=>zoomBy(.25));
  listen($('solOut'),'click',()=>zoomBy(-.25));
  listen($('solZoom'),'input',()=>{
    const value=Number($('solZoom').value);
    if(view==='3d'){space=zoomSpace(space,value-space.zoom);invalidate();}
    else gestures.zoomTo(value);
  });
  listen($('solFit'),'click',fitView);
  listen($('solInner'),'click',()=>{
    if(view==='3d'){space={...spaceCamera(),zoom:1.2};invalidate();}
    else setCamera({...fit(),zoom:1.2});
  });
  listen($('solCenter'),'click',center);
  function cancelSpace(){
    for(const id of spacePointers.keys())if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
    spacePointers.clear();spaceGesture=null;canvas.dataset.interacting='false';
  }
  function spacePoint(event){
    const r=canvas.getBoundingClientRect();
    return [event.clientX-r.left,event.clientY-r.top];
  }
  function resetSpaceGesture(){
    const points=[...spacePointers.values()];
    const mid=points.length===2?[(points[0][0]+points[1][0])/2,(points[0][1]+points[1][1])/2]:points[0];
    spaceGesture=mid?{point:mid,span:points.length===2?Math.hypot(points[0][0]-points[1][0],points[0][1]-points[1][1]):0,camera:space}:null;
  }
  listen(canvas,'pointerdown',event=>{
    if(view!=='3d'||event.button!==0||spacePointers.size>=2)return;
    canvas.focus({preventScroll:true});canvas.setPointerCapture(event.pointerId);
    spacePointers.set(event.pointerId,spacePoint(event));
    spaceMoved=spacePointers.size>1;resetSpaceGesture();
    canvas.dataset.interacting='true';
  });
  listen(canvas,'pointermove',event=>{
    if(view!=='3d'||!spacePointers.has(event.pointerId)||!spaceGesture)return;
    spacePointers.set(event.pointerId,spacePoint(event));
    const points=[...spacePointers.values()];
    const mid=points.length===2?[(points[0][0]+points[1][0])/2,(points[0][1]+points[1][1])/2]:points[0];
    const dx=mid[0]-spaceGesture.point[0],dy=mid[1]-spaceGesture.point[1];
    if(Math.hypot(dx,dy)>4)spaceMoved=true;
    space=points.length===2?zoomSpace(spaceGesture.camera,Math.log10(Math.max(1,Math.hypot(points[0][0]-points[1][0],points[0][1]-points[1][1]))/Math.max(1,spaceGesture.span))):
      rotateSpace(spaceGesture.camera,dx,-dy);
    invalidate();
  });
  for(const eventName of ['pointerup','pointercancel','lostpointercapture'])listen(canvas,eventName,event=>{
    if(view!=='3d'||!spacePointers.has(event.pointerId))return;
    if(eventName==='pointerup'&&!spaceMoved&&spacePointers.size===1){
      const [x,y]=spacePoint(event);
      const hit=[...markers].sort((a,b)=>a.depth-b.depth).find(m=>Math.hypot(m.x-x,m.y-y)<=Math.max(13,m.radius+3));
      if(hit)select(hit.body.id,false);
    }
    spacePointers.delete(event.pointerId);resetSpaceGesture();
    if(!spacePointers.size)canvas.dataset.interacting='false';
  });
  listen(canvas,'wheel',event=>{
    if(view!=='3d'||document.activeElement!==canvas)return;
    event.preventDefault();
    space=zoomSpace(space,-Math.max(-.4,Math.min(.4,event.deltaY*.001)));
    invalidate();
  },{passive:false});
  listen(canvas,'keydown',event=>{
    if(view!=='3d')return;
    const arrows={ArrowLeft:[-25,0],ArrowRight:[25,0],ArrowUp:[0,25],ArrowDown:[0,-25]};
    if(Object.hasOwn(arrows,event.key)){event.preventDefault();space=rotateSpace(space,...arrows[event.key]);invalidate();}
    else if(['+','=','-','Home','Escape'].includes(event.key)){
      event.preventDefault();
      if(event.key==='Home')fitView();
      else if(event.key==='Escape')$('solFit').focus();
      else zoomBy(event.key==='-'?-.25:.25);
    }
  });
  function switchView(next){
    if(view===next)return;
    if(next==='3d')gestures.cancel();else cancelSpace();
    view=next;
    $('sol2d').setAttribute('aria-pressed',String(view==='2d'));
    $('sol3d').setAttribute('aria-pressed',String(view==='3d'));
    $('sol3dControls').hidden=view!=='3d';
    $('solScene3d').hidden=view!=='3d';
    if(follow)center();
    localize();invalidate();
  }
  listen($('sol2d'),'click',()=>switchView('2d'));
  listen($('sol3d'),'click',()=>switchView('3d'));
  listen($('solSun'),'click',()=>select('sun',true));
  for(const [id,pose] of [['solTop','top'],['solAngle','angle'],['solSide','side']])
    listen($(id),'click',()=>{space={...space,...ORBIT_POSES[pose]};invalidate();});
  listen($('solTrails'),'click',()=>{
    trails=!trails;$('solTrails').setAttribute('aria-pressed',String(trails));
    $('solTrails').textContent=t(trails?'trailsOn':'trailsOff');invalidate();
  });
  listen($('solTarget'),'change',()=>select($('solTarget').value,false));
  listen($('solReference'),'change',()=>{reference=$('solReference').value;updateInspector();invalidate();});
  listen($('solJump'),'click',center);
  listen($('solFollow'),'click',()=>{
    follow=!follow;$('solFollow').setAttribute('aria-pressed',String(follow));
    if(follow)center();invalidate();
  });
  listen($('solSymbols'),'change',()=>{
    enlarged=$('solSymbols').checked;$('solScaleNote').textContent=t(enlarged?'schematic':'scale');invalidate();
  });
  listen($('solPlay'),'click',()=>{if (clock) changeDay(day);else beginClock();});
  listen($('solRate'),'change',()=>{if (clock) beginClock();});
  listen($('solPrev'),'click',()=>changeDay(advanceModelDay(day,1,-1)));
  listen($('solNext'),'click',()=>changeDay(advanceModelDay(day,1,1)));
  listen($('solEpoch'),'click',()=>changeDay(J2000));
  listen($('solDate'),'change',()=>{
    const field=$('solDate'), next=parseModelDate(field.value);
    if (next !== null) changeDay(next);else updateClock(true);
  });
  listen(reduced,'change',()=>{if (reduced.matches) suspend();updateClock();invalidate();});
  listen(document,'visibilitychange',()=>{if (document.hidden) suspend();else invalidate();});
  const resizeObserver = new ResizeObserver(resize);resizeObserver.observe(canvas);
  const visibilityObserver = new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if (visible) invalidate();else suspend();
  });
  visibilityObserver.observe(canvas);
  const unsubscribe = onLanguageChange(localize);
  localize();
  return {
    setActive(value) {
      if (value === active) return;
      active=value;
      if (active) resize(); else suspend();
    },
    inspect:()=>({active,day,camera:{...camera},view,space:{...space,focus:[...space.focus]},trails,trailPoints:[...trailCache.values()].reduce((n,v)=>n+v.samples.length,0),trailDay:trailCache.get('mercury')?.day??null,selected,reference,follow,pair:selected!==reference?solarComparison(day,selected,reference):null,enlarged,playing:clock!==null,scheduled:raf!==null,draws,drawMs,
      markers:markers.map(({body,x,y,radius,depth})=>({id:body.id,x,y,radius,depth}))}),
    dispose() {active=false;suspend();abort.abort();unsubscribe();resizeObserver.disconnect();visibilityObserver.disconnect();root.replaceChildren();},
  };
}
