import {language, onLanguageChange} from '../i18n.mjs';
import {cameraScale, screenPoint, worldPoint, niceStep, MAX_ZOOM} from './camera.mjs';
import {mapGestures} from './gestures.mjs';
import {placeLabels, drawLabels} from './labels.mjs';
import {AU_KM, J2000, MIN_DAY, MAX_DAY, ORBIT_SOURCE, RADIUS_SOURCE, SUN_SOURCE, bodies, solarState, vectorOnOrbit, eclipticToMap, radiusAU, parseModelDate, formatModelDay, advanceModelDay} from './solar-model.mjs';
import {solarComparison} from './solar-motion.mjs';
import {ORBIT_POSES,spaceCamera,rotateSpace,zoomSpace,spaceProjector,trailSamples} from './solar-space.mjs';
import {GALACTIC_FRAME_SOURCE,GALACTIC_MIN_DATE,GALACTIC_MAX_DATE,GALACTIC_MIN_DAY,GALACTIC_MAX_DAY,
  TRAIL_DAYS,flightTrails,galacticPosition,sunDisplacement,supportsGalacticDay} from './solar-galactic.mjs';
import {FLIGHT_POSES,fitFlight,flightDisplayPoint,paintFlights} from './solar-flight-view.mjs';
import {START,SYSTEMS} from './new-worlds-spec.mjs';
import {loadEphemeris,supportsEpoch} from './new-worlds-ephemeris.mjs';
import {localOrbitPath,pluto,systemBodies,worldComparison,worldNotes,worldTrail,worldVector} from './new-worlds.mjs';

import {loadVoyager,END as VOY_END,START as VOY_START} from './voyager-data.mjs';
import {probes,voyagerText,latestEpoch,voyagerEntries,paintVoyager,updateVoyagerPanel,updateVoyagerTimeline} from './voyager-view.mjs';

export const SOLAR_FRAME = [-32, -32, 32, 32];
const fit = () => ({x:0, y:0, zoom:0});
const copy = {
  ...voyagerText,
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
  frameChoice:['Bezugssystem der 3D-Ansicht','3D reference frame'],
  heliocentric:['Sonnenzentriert','Sun-centred'],
  galactic:['Galaktische Bewegung','Galactic motion'],
  galacticFrame:['Galaktozentrische Achsen · lokale Tangente bei J2000.0','Galactocentric axes · local tangent at J2000.0'],
  galacticScene:['≈ 246 km/s relativ zum galaktozentrischen Rahmen · 1970 bis 01.01.2030 TDB','≈ 246 km/s in the Galactocentric frame · 1970 to 1 January 2030 TDB'],
  galacticModel:['Lokale Sonnenbewegung + JPL-Planetenmodell','Local solar motion + JPL planet model'],
  galacticStar:['Zentralstern · bewegt sich im gewählten Rahmen','Central star · moves in the selected frame'],
  galacticBounds:['Galaktischer Modus am 1. Januar 2000 (12:00 TDB) geöffnet. Das vorige Datum lag außerhalb des Modellfensters.','Galactic mode opened at 1 January 2000 (12:00 TDB). The previous date was outside the model window.'],
  galacticLimit:['Der Ursprung ist die Sonnenposition bei J2000.0. Die Achsen zeigen ungefähr zum galaktischen Zentrum (+X), in Rotationsrichtung (+Y) und nach galaktisch Nord (+Z).','The origin is the Sun’s position at J2000.0. The axes point approximately towards the Galactic centre (+X), along rotation (+Y) and towards Galactic north (+Z).'],
  galacticWhy:['Die Schwerkraft der Milchstraße krümmt die Bahn der Sonne um das galaktische Zentrum. Für 1970–2030 setzen wir die Sonne auf die lokale Tangente mit dem festen Geschwindigkeitsvektor aus Astropy v4.0. Der geschätzte Krümmungsbeitrag am Rand beträgt rund 100.000 km. Hinzu kommen die Unsicherheit des Sonnenvektors und die JPL-Bahnfehler. Die Bewegung der Sonne um den Sonnensystem-Schwerpunkt ist hier nicht modelliert.','The Milky Way’s gravity curves the Sun’s orbit around the Galactic centre. For 1970–2030 we use a local tangent at the fixed Astropy v4.0 solar velocity. The estimated curvature contribution at the edge is about 100,000 km. Solar velocity uncertainty and JPL orbit errors are additional. The Sun’s motion around the Solar System barycentre is omitted.'],
  galacticGeometry:['Jeder Trail zeigt frühere Modellpositionen im gewählten Rahmen. Die Sonne legt pro Erdjahr rund 52 AU zurück. Deshalb sind die maßstäblichen Erdspuren langgezogen. Jede Bahn gehört zu einem Bezugssystem. Dieselbe Planetenbewegung ergibt im Sonnenrahmen wieder die vertrauten Bahnen. Abstände und Geschwindigkeiten zwischen Körpern hängen hier von ihrer Relativbewegung ab.','Each trail shows earlier model positions in the chosen frame. The Sun travels about 52 AU in one Earth year, stretching Earth’s track. Every path belongs to a reference frame. The same planetary motion gives the familiar orbits in the Sun-centred frame. Distances and speeds between bodies here depend on their relative motion.'],
  galacticSymbols:['Vergrößerte Körpersymbole · Farben und Saturnring illustrativ','Enlarged body symbols · colours and Saturn ring illustrative'],
  schematicRadii:['Körperradien in AU · Planetenabstände zur Sonne überhöht','Body radii in AU · planet offsets from the Sun enlarged'],
  galacticScope:['Sonne und acht Planeten. Die Mondsysteme und Pluto öffnen in ihren bisherigen Ansichten. Die Erdposition ist der Erde–Mond-Schwerpunkt.','The Sun and eight planets. Moon systems and Pluto open in their existing views. Earth’s position is the Earth–Moon barycentre.'],
  galacticSource:['Astropy: galaktozentrischer Rahmen','Astropy: Galactocentric frame'],
  flightGroup:['Kamera und Flugspuren','Camera and flight trails'],
  flightAngle:['Schrägblick','Oblique view'],
  flightAcross:['Quer zur Bewegung','Across motion'],
  flightAlong:['Entlang der Bewegung','Along motion'],
  flightFit:['Flugspuren einpassen','Fit flight trails'],
  followSun:['Sonne verfolgen','Follow Sun'],
  flightWindow:['Spurlänge','Trail length'],
  flightDay:['Modelltage','model days'],
  flightScaleLabel:['Darstellung der Flugspuren','Trajectory scale'],
  physical:['Maßstäbliche Flugspuren','Trajectories to scale'],
  flightSchematic:['Schematisch · Planetenauslenkung ×3','Schematic · planetary displacement ×3'],
  schematicScale:['Schematische Ansicht · Planetenabstände zur Sonne im Bild ×3, Sonnenweg maßstäblich. Messwerte nutzen das Originalmodell.','Schematic view · displayed planet offsets from the Sun ×3, Sun’s path to scale. Measurements use the original model.'],
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
  focusScaleKm:['km am Kamerazentrum','km at camera focus'],
  systems:['Mondsysteme','Moon systems'],
  overview:['Zur Sonnensystemübersicht','Back to Solar System overview'],
  localFit:['System einpassen','Fit system'],
  baryFrame:['Koordinatenursprung: gemeinsamer Schwerpunkt · J2000-Ekliptik','Origin: system barycentre · J2000 ecliptic'],
  localScene:['JPL Horizons · feine Linien zeigen ein Bahnfenster, leuchtende Spuren den zurückgelegten Abschnitt.','JPL Horizons · faint lines show an orbital window and bright trails show past motion.'],
  localLimit:['Die Achsen schneiden sich im Systemschwerpunkt. Der Linienabschnitt im Bild ist eine Projektion.','The axes meet at the system barycentre. The line drawn on screen is a projection.'],
  moon:['Mond','Moon'],
  dwarf:['Zwergplanet','Dwarf planet'],
  horizons:['NASA/JPL Horizons · numerische Ephemeride','NASA/JPL Horizons · numerical ephemeris'],
  hybrid:['Hybridmodell · Sonnenbezug mit JPL-Näherung','Hybrid model · solar reference uses JPL approximation'],
  hybridNote:['Bei Sonnenbezug nutzt das Erd- oder Jupitersystem den bisherigen Näherungsanker. Die größte geprüfte Positionsabweichung lag bei rund 15.500 km für die Erde und 618.000 km für Jupiter.','Sun-relative values for the Earth and Jupiter systems use the existing approximate anchor. The largest sampled position differences were about 15,500 km for Earth and 618,000 km for Jupiter.'],
  unavailable:['Ephemeriden verfügbar vom 01.01.2025 bis 01.01.2030 (00:00 TDB).','Ephemeris available from 1 Jan 2025 through 1 Jan 2030 (00:00 TDB).'],
  startRange:['Zum Start der Ephemeride','Go to start of ephemeris'],
  loading:['Ephemeride wird geladen …','Loading ephemeris …'],
  loadError:['Ephemeridendaten konnten nicht geladen oder geprüft werden. Bitte erneut versuchen.','Ephemeris data could not be loaded or verified. Please try again.'],
  retry:['Erneut laden','Retry'],
  invalidPair:['Für dieses Körperpaar ist kein gemeinsames geprüftes Modell verfügbar.','No common validated model is available for this pair.'],
  unavailableValue:['Nicht verfügbar','Unavailable'],
  geometryUnavailable:['Zustandsvektoren sind gerade nicht verfügbar.','State vectors are currently unavailable.'],
  bodySource:['NASA-Quelle','NASA source'],
  localBodies:['Körper im System','System bodies'],
  overviewBodies:['Körper im Sonnensystem','Solar System bodies'],
  ephemHelp:['Lokale Zustände verwenden denselben Systemschwerpunkt. Bei Sonnenbezug wird der heliozentrische Schwerpunktzustand addiert.','Local states use the same barycentre. Sun-relative states add the heliocentric barycentre state.'],
  pairProjection3d:['Abstand in der J2000-Ekliptikebene (X/Y), nicht im Bild','J2000 ecliptic-plane separation (X/Y), not on screen'],
  whyBody3d:['Geschwindigkeit braucht einen Bezugskörper: Wir ziehen seine Modellgeschwindigkeit von der des Ziels ab. Drehen und Zoomen verändern nur das Bild. Der X/Y-Wert gehört zur Ekliptikebene, der 3D-Abstand enthält auch Z. Die projizierte Linie ist keine maßstäbliche Distanzangabe. Lichtlaufzeit ist Abstand durch c bei festgehaltener Geometrie.','Speed needs a reference body: subtract its model velocity from the target’s. Rotating and zooming change only the image. X/Y belongs to the ecliptic plane; 3D separation also includes Z. The projected line is not a distance scale. Light time is distance divided by c for frozen geometry.'],
};

export function mountSolar(root) {
  const lang = () => language() === 'en' ? 1 : 0;
  const t = key => copy[key][lang()];
  const name = body => body.names[lang()];
  const comparisonName=body=>body.id==='earth'&&!system?t('earthBary'):name(body);
  const format = [new Intl.NumberFormat('de-DE',{maximumSignificantDigits:4}),new Intl.NumberFormat('en-GB',{maximumSignificantDigits:4})];
  const n = value => format[lang()].format(value);
  const coarse = [new Intl.NumberFormat('de-DE',{maximumSignificantDigits:3}),new Intl.NumberFormat('en-GB',{maximumSignificantDigits:3})];
  const rough = value => coarse[lang()].format(value);
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
        <div class="ex-solar-viewbar" role="group" aria-label="" id="solViewBar"><button type="button" id="sol2d" data-solar="view2d" aria-pressed="true"></button><button type="button" id="sol3d" data-solar="view3d" aria-pressed="false"></button><button type="button" id="solSun" data-solar="sunHome"></button><button type="button" id="solVoyager" data-solar="voyager" aria-pressed="false"></button><span id="sol3dControls" hidden><span class="ex-solar-pose-buttons" id="solOrbitPoses"><button type="button" id="solTop" data-solar="topView" aria-pressed="false"></button><button type="button" id="solAngle" data-solar="angleView" aria-pressed="true"></button><button type="button" id="solSide" data-solar="sideView" aria-pressed="false"></button></span><button type="button" id="solTrails" aria-pressed="true"></button></span>
        <span class="ex-flight-frames" role="group" id="solFrames" hidden>
          <button type="button" id="solHelio" data-solar="heliocentric" aria-pressed="true"></button>
          <button type="button" id="solGalactic" data-solar="galactic" aria-pressed="false"></button>
        </span></div>
        <p id="solScene3d" class="ex-solar-caption" data-solar="scene3d" hidden></p>
        <p id="solGalacticScale" class="ex-solar-caption" data-solar="schematicScale" hidden></p>
        <p id="solGalacticStatus" class="ex-solar-caption" role="status" hidden></p>
        <div class="ex-solar-viewbar" role="group" id="solSystems"><button type="button" id="solGlobal" data-solar="overview" hidden></button></div>
        <div class="ex-solar-caption" id="solWorldState" hidden><span id="solWorldMessage" role="status"></span> <button type="button" id="solFirstWorldDay" data-solar="startRange" hidden></button> <button type="button" id="solWorldRetry" data-solar="retry" hidden></button></div>
        <div id="voyStatus" class="ex-solar-viewbar" hidden>
          <span id="voyMessage" role="status"></span><button type="button" id="voyRetry" data-solar="retry" hidden></button>
        </div>
        <div class="ex-solar-quick" id="solQuick">
          <label><span data-solar="target"></span><select id="solTarget"></select></label>
          <label><span data-solar="reference"></span><select id="solReference"></select></label>
          <button type="button" id="solJump" data-solar="jump"></button>
          <button type="button" id="solFollow" data-solar="follow" aria-pressed="false"></button>
        </div>
        <div class="ex-map ex-solar-map"><canvas id="solCanvas" tabindex="0" aria-describedby="solHelp solLimit"></canvas></div>
        <div class="ex-map-foot"><span data-solar="model"></span><span id="solScaleNote"></span><strong id="solPairSummary" hidden></strong></div>
        <div class="ex-zoom"><label for="solZoom" data-solar="zoom"></label><input id="solZoom" type="range" min="0" max="${MAX_ZOOM}" step="0.01" value="0"><output id="solZoomValue"></output></div>
        <div class="ex-solar-viewbar ex-flight-controls" role="group" id="solFlightControls" hidden>
          <button type="button" id="solFlightAngle" data-solar="flightAngle" aria-pressed="true"></button>
          <button type="button" id="solAcross" data-solar="flightAcross" aria-pressed="false"></button>
          <button type="button" id="solAlong" data-solar="flightAlong" aria-pressed="false"></button>
          <button type="button" id="solFollowSun" data-solar="followSun" aria-pressed="true"></button>
          <label><span data-solar="flightWindow"></span><select id="solFlightWindow">${TRAIL_DAYS.map(d=>`<option value="${d}"${d===180?' selected':''}></option>`).join('')}</select></label>
          <label><select id="solFlightScale"><option value="scale" data-solar="physical"></option><option value="schematic" data-solar="flightSchematic"></option></select></label>
        </div>
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
          <p id="solLimit" data-solar="limit"></p><p id="voyBounds" data-solar="voyagerBounds" hidden></p><p data-solar="scienceNote"></p><p data-solar="earth"></p>
          <div id="solGalacticScience" hidden><p data-solar="galacticWhy"></p><p data-solar="galacticGeometry"></p><p data-solar="galacticScope"></p><p><a href="${GALACTIC_FRAME_SOURCE}" data-solar="galacticSource"></a></p></div>
          <ul><li><a href="${ORBIT_SOURCE}" data-solar="elements"></a></li><li><a href="${RADIUS_SOURCE}" data-solar="radii"></a></li><li><a href="${SUN_SOURCE}" data-solar="iau"></a></li></ul>
        </details></div>
      </div>
      <aside class="ex-aside"><h2 id="solBodiesTitle" data-solar="bodies"></h2><div id="solList" class="ex-body-list"></div>
        <label class="ex-symbol-option"><input type="checkbox" id="solSymbols" checked><span data-solar="symbols"></span></label>
        <div class="ex-inspector" id="voyPanel" hidden>
          <h2 id="voyName"></h2><p id="voyEpoch" class="ex-small"></p>
          <dl><dt data-solar="voyagerSun"></dt><dd id="voySunAU"></dd>
          <dt data-solar="voyagerEarth"></dt><dd id="voyEarthAU"></dd>
          <dt data-solar="voyagerSpeed"></dt><dd id="voySpeedKmS"></dd>
          <dt data-solar="voyagerLight"></dt><dd id="voyLightHours"></dd></dl>
          <p class="ex-small" data-solar="voyagerSignal"></p>
          <details id="voyMission" open><summary data-solar="voyagerTimeline"></summary>
            <ul id="voyEvents" class="ex-voyager-events"></ul>
            <p><a id="voySource" data-solar="voyagerSources"></a> · <a id="voyDataLink" data-solar="voyagerHorizons"></a></p>
            <p data-solar="voyagerAssist"></p><p data-solar="voyagerHelio"></p>
          </details>
        </div>
        <div class="ex-inspector" id="solPlanetInspector"><h2 data-solar="selected"></h2><p id="solName" class="ex-selected" aria-live="polite"></p><p id="solKind" class="ex-small"></p>
          <dl><dt data-solar="distance"></dt><dd id="solDistance"></dd>
            <dt id="solRadiusLabel"></dt><dd id="solRadius"></dd>
            <dt id="solAxisLabel" data-solar="axis" hidden></dt><dd id="solAxis" hidden></dd></dl>
          <p id="solEarth" class="ex-small" data-solar="earth" hidden></p>
          <p id="solWorldNote" class="ex-small" hidden></p><a id="solWorldSource" data-solar="bodySource" hidden></a>
        </div>
        <section class="ex-compare" id="solCompare" aria-labelledby="solCompareTitle">
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
          <details><summary data-solar="why"></summary><p data-solar="whyBody"></p><p id="solPairMethod" data-solar="method"></p></details>
        </section>
      </aside>
    </div>`;
  const $ = id => root.querySelector('#'+id);
  const canvas = $('solCanvas'), ctx = canvas.getContext('2d');
  const abort = new AbortController();
  const listen = (el,type,fn,opts={}) => el.addEventListener(type,fn,{...opts,signal:abort.signal});
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false, visible = false, raf = null, clock = null;
  let day = J2000, camera = fit(), space=spaceCamera(), view='2d', trails=true, pose='angle', selected = 'sun', reference = 'sun', follow = false, enlarged = true;
  let system = null, overview = null, galactic = null, buttons = [];
  let voyager=null,voyData=null,voyPending=false,voyError=false,voyTracks=null;
  const voyEarth={...bodies.find(body=>body.id==='earth'),names:['Erdmittelpunkt','Earth centre']};
  const landmarks=[bodies[0],voyEarth,...probes];
  const ephemerides = new Map(), pending = new Set(), failures = new Set();
  const globalBodies = [...bodies, pluto];
  const listedBodies = () => voyager ? landmarks : system ? systemBodies(system) : galactic ? bodies : globalBodies;
  const relevantSystem = () => system ?? (selected === 'pluto' || reference === 'pluto' ? 'pluto' : null);
  const distance = () => voyager ? voyager.distance : system ? 3.1 * SYSTEMS[system].scaleKm / AU_KM : galactic?.distance ?? 85;
  const minDay = () => voyager ? VOY_START : galactic ? GALACTIC_MIN_DAY : MIN_DAY;
  const maxDay = () => voyager ? VOY_END : galactic ? GALACTIC_MAX_DAY : MAX_DAY;
  const clampDay = value => Math.max(minDay(),Math.min(maxDay(),value));
  const trailCache=new Map(),pathCache=new Map(),spacePointers=new Map();
  let spaceGesture=null,spaceMoved=false;
  let stateDay = null, state = [], markers = [], width = 1, height = 1;
  let draws = 0, drawMs = 0, lastReadout = null;
  const systemButtons = Object.entries(SYSTEMS).map(([id, info]) => {
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.system = id;
    $('solSystems').append(button);
    listen(button,'click',()=>enterSystem(id));
    return {id, info, button};
  });
  listen($('solList'),'click',event=>{
    const button = event.target.closest('button[data-body]');
    if(button)select(button.dataset.body,true);
  });
  function rebuildBodies() {
    const list = listedBodies();
    buttons = list.map(body => {
      const button = document.createElement('button');
      button.type = 'button'; button.dataset.body = body.id;
      button.style.setProperty('--body-color',body.color);
      return {body,button};
    });
    $('solList').replaceChildren(...buttons.map(({button})=>button));
    for(const id of ['solTarget','solReference']) {
      const allowed = system && id === 'solReference' ? [bodies[0], ...list] : list;
      $(id).replaceChildren(...allowed.map(body=>new Option(name(body), body.id)));
    }
  }

  function loadSystem(id, retry = false) {
    if (!supportsEpoch(day) || ephemerides.has(id) || pending.has(id) || (!retry && failures.has(id))) return;
    failures.delete(id); pending.add(id);
    loadEphemeris(id, abort.signal).then(data => {
      ephemerides.set(id, data);
      stateDay = null;
    }).catch(error => {
      if (error.name !== 'AbortError') failures.add(id);
    }).finally(() => {
      pending.delete(id);
      if (!abort.signal.aborted) {updateInspector(); invalidate();}
    });
  }

  function loadVisibleData() {
    if (active && voyager) loadProbes();
    else if (active && !galactic) loadSystem(system ?? 'pluto');
  }

  function loadProbes(retry=false){
    if(voyData||voyPending||(voyError&&!retry))return;
    voyError=false;voyPending=true;
    loadVoyager(abort.signal).then(data=>{
      voyData=data;
      if(voyager){stateDay=null;voyTracks=null;fitView();}
    }).catch(error=>{if(error.name!=='AbortError')voyError=true;}).finally(()=>{
      voyPending=false;
      if(voyager&&!abort.signal.aborted){updateInspector();invalidate();}
    });
    updateInspector();
  }
  function enterVoyager(){
    if(voyager)return;
    suspend();
    const original={day,camera,view,space,pose,selected,reference,follow,system,overview,galactic,trails};
    // Keep the entire prior view, including lunar and galactic state, intact.
    voyager={original,distance:220};
    system=null;overview=null;galactic=null;follow=false;selected='v1';reference='sun';
    day=latestEpoch();stateDay=null;markers=[];
    space=spaceCamera('angle');markPose('angle');
    rebuildBodies();switchView('3d');fitView();loadVisibleData();localize();
  }
  function exitVoyager(){
    if(!voyager)return;
    suspend();
    const previous=voyager.original;
    voyager=null;voyTracks=null;stateDay=null;markers=[];
    ({day,camera,space,pose,selected,reference,follow,system,overview,galactic,trails}=previous);
    rebuildBodies();switchView(previous.view);markPose(previous.pose);
    $('solFollow').setAttribute('aria-pressed',String(follow));
    loadVisibleData();localize();updateClock(true);
  }
  function tracksVoyager(){
    if(voyTracks?.day!==day)voyTracks={day,tracks:probes.map(body=>({body,points:voyData?.[body.id].trail(day)??[]}))};
    return voyTracks.tracks;
  }

  function enterSystem(id) {
    if (system === id) return;
    if (galactic) changeFrame(false);
    if (!system) overview = {selected,reference,follow,space,pose,view};
    system = id;
    const [parent, moon] = systemBodies(id);
    selected = moon.id; reference = parent.id;
    markers = [];
    stateDay = null;
    trailCache.clear();
    rebuildBodies();
    fitView();
    switchView('3d');
    loadVisibleData();
    localize();
  }

  function exitSystem(next = overview?.view) {
    if (!system) return;
    ({selected,reference,follow,space,pose} = overview);
    system = null;
    overview = null;
    markers = [];
    stateDay = null;
    trailCache.clear();
    rebuildBodies();
    markPose(pose);
    $('solFollow').setAttribute('aria-pressed',String(follow));
    switchView(next);
    loadVisibleData();
    localize();
  }

  function current() {
    if (stateDay !== day) {
      if(voyager){
        state=voyagerEntries(voyData,day,...landmarks);
        stateDay=day;
        return state;
      }
      state = system ? [] : solarState(day);
      const id = system ?? 'pluto';
      const visibleBodies = system ? systemBodies(system) : galactic ? [] : [pluto];
      const data = ephemerides.get(id);
      for (const body of visibleBodies) {
        const vector = worldVector(data,id,body.id,day,Boolean(system));
        if (vector) state.push({body,vector,orbit:null,distanceAU:Math.hypot(...vector)});
      }
      stateDay = day;
    }
    return state;
  }
  function selectedBody() { return current().find(entry=>entry.body.id === selected); }
  function comparison() {
    if (voyager || selected === reference) return null;
    const id = relevantSystem();
    return id ? worldComparison(ephemerides.get(id),id,day,selected,reference) : solarComparison(day,selected,reference);
  }
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
    const previousWidth=width,previousHeight=height;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    width = rect.width; height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1,1.75);
    const w = Math.round(width*dpr), h = Math.round(height*dpr);
    if (canvas.width !== w || canvas.height !== h) {canvas.width=w;canvas.height=h;}
    ctx?.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);
    if(voyager?.fitted&&(width!==previousWidth||height!==previousHeight))fitView();
    invalidate();
  }
  function displayedVector(vector) {
    return galactic ? flightDisplayPoint(galacticPosition(day,vector),day,galactic.schematic) : vector;
  }
  function center() {
    const vector=selectedBody()?.vector;
    if (!vector) return;
    if (galactic) {
      setSunFollow(false);
      galactic.fitted = false;
    }
    if(voyager)voyager.fitted=false;
    if(view==='3d')space={...space,focus:[...displayedVector(vector)],...(voyager?{zoom:.55}:{})};
    else {const [x,y]=eclipticToMap(vector);camera={...camera,x,y};}
    invalidate();
  }
  function select(id, recenter) {
    selected = id;
    $('solTarget').value=id;
    if(voyager)updateVoyagerTimeline(root,selected,lang());
    if (recenter || follow) center();
    updateInspector();
    invalidate();
  }
  function updateInspector() {
    const entry = selectedBody();
    if(voyager){
      $('solWorldState').hidden=$('solPairSummary').hidden=true;
      updateVoyagerPanel(root,{id:selected,day,data:voyData,lang:lang(),n:rough,formatDistance:n});
      $('solCenter').disabled=!entry;
      for(const {body,button} of buttons)button.setAttribute('aria-pressed',String(body.id===selected));
      const key=voyError?'loadError':!voyData?'loading':!entry?'geometryUnavailable':null;
      $('voyStatus').hidden=!key;
      $('voyMessage').textContent=key?t(key):'';
      $('voyRetry').hidden=!voyError;
      return;
    }
    const body = listedBodies().find(item=>item.id===selected);
    const orbit = entry?.orbit;
    const notes = worldNotes[selected];
    const id = relevantSystem();
    const pair = comparison();
    const formatValue = pair?.source ? rough : n;
    const solar = system ? worldComparison(ephemerides.get(system),system,day,selected,'sun') : null;
    const distanceAU = system ? solar?.distanceAU : entry?.distanceAU;
    const fmtDistance = id ? rough : n;
    $('solName').textContent = name(body);
    $('solKind').textContent = t(body.id === 'sun' ? (galactic?'galacticStar':'star') : body.id === 'pluto' ? 'dwarf' : notes ? 'moon' : 'planet');
    $('solDistance').textContent = distanceAU === undefined ? t('unavailableValue') :
      `${body.id === 'sun' ? '' : '~ '}${fmtDistance(distanceAU)} AU · ${fmtDistance(distanceAU*AU_KM)} km${solar?.source === 'hybrid' ? ' · '+t('hybrid') : ''}`;
    $('solRadiusLabel').textContent = t(body.id === 'sun' ? 'sunRadius' : 'radius');
    $('solRadius').textContent = n(body.radiusKm)+' km';
    $('solAxis').hidden = $('solAxisLabel').hidden = !orbit;
    $('solAxis').textContent = orbit ? n(orbit.a)+' AU' : '';
    $('solEarth').hidden = body.id !== 'earth' || Boolean(system);
    $('solWorldNote').hidden = $('solWorldSource').hidden = !notes;
    if (notes) {
      $('solWorldNote').textContent = notes[0][lang()];
      $('solWorldSource').href = notes[1];
    }
    const status = !id ? null : !supportsEpoch(day) ? 'unavailable' : failures.has(id) ? 'loadError' :
      !ephemerides.has(id) ? 'loading' : null;
    $('solWorldState').hidden = !status;
    $('solWorldMessage').textContent = status ? t(status) : '';
    $('solWorldRetry').hidden = status !== 'loadError';
    $('solFirstWorldDay').hidden = status !== 'unavailable';
    $('solCenter').disabled = $('solJump').disabled = $('solFollow').disabled = !entry;
    for (const {body,button} of buttons) {
      button.setAttribute('aria-pressed',String(body.id===selected));
      button.dataset.reference=String(body.id===reference&&reference!==selected);
    }
    $('solReference').value=reference;
    $('solPairEmpty').hidden=Boolean(pair);
    $('solPairValues').hidden=!pair;
    $('solPairEmpty').textContent=t(status ? 'geometryUnavailable' : id&&selected!==reference?'invalidPair':'choosePair');
    $('solPairTitle').textContent=pair?`${comparisonName(body)} ↔ ${comparisonName(listedBodies().find(b=>b.id===reference)??bodies[0])}`:'';
    $('solPairSummary').hidden=!pair;
    $('solPairProjectionLabel').textContent=t(view==='3d'?'pairProjection3d':'pairProjection');
    const source = pair?.source ?? (id ? 'horizons' : 'model');
    $('solPairEpoch').textContent=`${t('comparisonEpoch')}: ${formatModelDay(day).replace('T',' ')} TDB · ${t(source)}`;
    $('solPairMethod').textContent = t(id ? 'ephemHelp' : 'method') + (system && system !== 'pluto' ? ' '+t('hybridNote') : '');
    if(pair) {
      const localPair = system && reference !== 'sun';
      const sep = localPair ? formatValue(pair.distanceKm)+' km' : formatValue(pair.distanceAU)+' AU';
      $('solPairSummary').textContent=`${$('solPairTitle').textContent} · ~ ${sep} · ~ ${formatValue(pair.speedKmS)} km/s`;
      $('solPairDistance').textContent=`~ ${localPair?'':formatValue(pair.distanceAU)+' AU · '}${formatValue(pair.distanceKm)} km`;
      $('solPairProjection').textContent=`~ ${localPair?formatValue(pair.projectedAU*AU_KM)+' km':formatValue(pair.projectedAU)+' AU'}`;
      const light=pair.lightSeconds<120?`${formatValue(pair.lightSeconds)} s`:
        pair.lightSeconds<7200?`${formatValue(pair.lightSeconds/60)} min`:`${formatValue(pair.lightSeconds/3600)} h`;
      $('solPairLight').textContent=`~ ${light} (d/c)`;
      $('solPairSpeed').textContent=`~ ${formatValue(pair.speedKmS)} km/s`;
      $('solPairRadial').textContent=pair.radialKmS===null||pair.source==='hybrid'?t('unavailableValue'):
        `${pair.radialKmS>=0?'+':''}${formatValue(pair.radialKmS)} km/s · ${t(pair.radialKmS>0?'receding':pair.radialKmS<0?'approaching':'steady')}`;
    }
  }
  function updateClock(force = false) {
    const time = formatModelDay(day);
    $('solTimestamp').textContent = time.replace('T',' ')+' TDB';
    if (force || document.activeElement !== $('solDate')) $('solDate').value = time.slice(0,10);
    $('solPrev').disabled = day<=minDay();
    $('solNext').disabled = day>=maxDay();
    $('solPlay').disabled = reduced.matches || day>=maxDay();
    $('solPlay').textContent = t(clock ? 'pause':'play');
    $('solMotion').hidden = !reduced.matches;
  }
  function updateSymbolNote() {
    $('solScaleNote').textContent = t(voyager?'voyagerSymbols':enlarged ? (galactic?'galacticSymbols':'schematic') :
      galactic?.schematic ? 'schematicRadii' : 'scale');
  }
  function localize() {
    for (const el of root.querySelectorAll('[data-solar]')) el.textContent = t(el.dataset.solar);
    for (const {body,button} of buttons) button.textContent = name(body);
    for(const id of ['solTarget','solReference'])for(const option of $(id).options) option.textContent=name(listedBodies().find(body=>body.id===option.value)??bodies[0]);
    for(const {id,info,button} of systemButtons) {
      button.textContent = name(info);
      button.setAttribute('aria-pressed',String(system===id));
    }
    $('solTarget').value=selected;$('solReference').value=reference;
    for (const [id,key] of [['solIn','zoomIn'],['solOut','zoomOut'],['solPrev','prev'],['solNext','next']]) {
      $(id).setAttribute('aria-label',t(key)); $(id).title=t(key);
    }
    canvas.setAttribute('aria-label',voyager?t('voyager'):system?name(SYSTEMS[system]):t(galactic?'galactic':view==='3d'?'view3d':'title'));
    $('solViewBar').setAttribute('aria-label',t('viewGroup'));
    $('solSystems').setAttribute('aria-label',t('systems'));
    for(const id of ['solPlanetInspector','solQuick','solCompare','solSystems','solInner','sol2d','sol3d'])$(id).hidden=Boolean(voyager);
    $('solSymbols').parentElement.hidden=Boolean(voyager);
    $('solVoyager').textContent=t(voyager?'voyagerBack':'voyager');
    $('solVoyager').setAttribute('aria-pressed',String(Boolean(voyager)));
    $('voyPanel').hidden=!voyager;
    if(voyager)updateVoyagerTimeline(root,selected,lang());
    else $('voyStatus').hidden=true;
    $('solEpoch').textContent=voyager?t(latestEpoch()===VOY_END?'voyagerLast':'voyagerCurrent'):'J2000.0';
    $('solGlobal').hidden = !system;
    $('solInner').hidden = Boolean(system||voyager);
    $('solFrames').hidden = view!=='3d'||Boolean(system||voyager);
    $('solOrbitPoses').hidden = Boolean(galactic);
    $('solHelio').setAttribute('aria-pressed',String(!galactic));
    $('solGalactic').setAttribute('aria-pressed',String(Boolean(galactic)));
    $('solFlightControls').hidden = $('solGalacticScience').hidden = Boolean(!galactic);
    $('solGalacticScale').hidden = !galactic?.schematic;
    $('solGalacticStatus').hidden = !galactic?.restoredDate;
    $('solGalacticStatus').textContent = galactic?.restoredDate ? t('galacticBounds') : '';
    $('solFrames').setAttribute('aria-label',t('frameChoice'));
    $('solFlightControls').setAttribute('aria-label',t('flightGroup'));
    $('solFlightScale').setAttribute('aria-label',t('flightScaleLabel'));
    for (const option of $('solFlightWindow').options) option.textContent = option.value+' '+t('flightDay');
    $('solDate').min = voyager ? '1977-08-21' : galactic ? GALACTIC_MIN_DATE : '1800-01-01';
    $('solDate').max = voyager ? '2026-11-26' : galactic ? GALACTIC_MAX_DATE : '2050-01-01';
    $('solFit').textContent=t(voyager?'voyagerFit':system?'localFit':galactic?'flightFit':'fit');
    $('solBodiesTitle').textContent=t(voyager?'voyagerBodies':system?'localBodies':'overviewBodies');
    root.querySelector('[data-solar="title"]').textContent=voyager?t('voyager'):system?name(SYSTEMS[system]):t('title');
    root.querySelector('[data-solar="frame"]').textContent=t(voyager?'voyagerFrame':system?'baryFrame':galactic?'galacticFrame':view==='3d'?'frame3d':'frame');
    root.querySelector('[data-solar="model"]').textContent=t(voyager?'voyagerData':system?'horizons':galactic?'galacticModel':'model');
    $('solScene3d').textContent=t(voyager?'voyagerScene':system?'localScene':galactic?'galacticScene':'scene3d');
    $('solHelp').textContent=t(voyager?'voyagerNav':view==='3d'?'help3d':'help');
    $('solLimit').textContent=t(voyager?'voyagerLimit':system?'localLimit':galactic?'galacticLimit':view==='3d'?'limit3d':'limit');
    for(const key of ['scienceNote','earth'])for(const el of root.querySelectorAll('[data-solar="'+key+'"]'))el.hidden=Boolean(voyager);
    $('voyBounds').hidden=!voyager;
    root.querySelector('[data-solar="whyBody"]').textContent=t(view==='3d'?'whyBody3d':'whyBody');
    $('solTrails').textContent=t(trails?'trailsOn':'trailsOff');
    $('solTrails').setAttribute('aria-pressed',String(trails));
    updateSymbolNote();
    updateClock();updateInspector();invalidate();
  }

  function draw(time) {
    raf = null;
    if (!active || !visible || document.hidden) return;
    const started = performance.now();
    if (clock) {
      day = clampDay(advanceModelDay(clock.day,Math.max(0,time-clock.start)/1000,clock.rate));
      if (day === maxDay()) clock = null;
    }
    loadVisibleData();
    const vector = follow ? selectedBody()?.vector : null;
    if(galactic?.followSun) space={...space,focus:sunDisplacement(day)};
    else if(vector) {
      if(view==='3d')space={...space,focus:[...displayedVector(vector)]};
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
      if (!orbit) {
        if(body.id==='pluto'&&trails) {
          const points = ephemerisTrail(body).samples;
          ctx.beginPath();
          points.forEach(({vector},i)=>{const p=screen(eclipticToMap(vector));if(i)ctx.lineTo(...p);else ctx.moveTo(...p);});
          ctx.strokeStyle=body.color+'99';ctx.lineWidth=1.4;ctx.stroke();
        }
        continue;
      }
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

  function ephemerisTrail(body) {
    let cached = trailCache.get(body.id);
    if (!cached || cached.day!==day) {
      const id = system ?? 'pluto';
      const points = worldTrail(ephemerides.get(id),id,body,day,Boolean(system));
      cached={day,samples:points.filter(Boolean).map(vector=>({vector}))};
      trailCache.set(body.id,cached);
    }
    return cached;
  }

  function getFlightTracks() {
    if (!galactic || !trails) return [];
    const {duration,schematic,cache} = galactic;
    if (cache?.day === day && cache.duration === duration && cache.schematic === schematic) return cache.tracks;
    const model = cache?.day === day && cache.duration === duration ? cache.model :
      flightTrails(day,duration,cache?.model);
    const tracks = schematic ? model.map(({body,samples})=>({
      body, samples:samples.map(sample=>({...sample,vector:flightDisplayPoint(sample.vector,sample.day,true)})),
    })) : model;
    galactic.cache = {day,duration,schematic,model,tracks};
    return tracks;
  }

  function paintSolarOrbits(screen, entries) {
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
    const extent = system ? SYSTEMS[system].scaleKm/AU_KM : 32;
    const rings = system ? [.25,.5,1].map(r=>r*extent) : [1,5,10,20,30];
    for(const radius of rings){
      const ring=Array.from({length:97},(_,i)=>{
        const a=2*Math.PI*i/96;return [radius*Math.cos(a),radius*Math.sin(a),0];
      });
      strokePath(ring,'#7093a724');
    }
    strokePath([[-extent,0,0],[extent,0,0]],'#88afba40',1);
    strokePath([[0,-extent,0],[0,extent,0]],'#88afba40',1);
    for(const {body,orbit} of entries){
      let vectors;
      if (orbit) vectors = Array.from({length:145},(_,i)=>vectorOnOrbit(orbit,2*Math.PI*i/144));
      else if (system && body.period) {
        // The display path changes only when the model crosses a TDB hour. Markers and trails use the exact model epoch.
        const epoch = Math.floor(day*24)/24;
        let cached = pathCache.get(body.id);
        if (!cached || cached.epoch!==epoch) {
          cached = {epoch, vectors:localOrbitPath(ephemerides.get(system),system,body,epoch)};
          pathCache.set(body.id,cached);
        }
        vectors = cached.vectors;
      }
      if (vectors) strokePath(vectors,body.color+(selected===body.id?'77':'35'),selected===body.id?1.5:1);
    }
    if(trails)for(const {body,orbit} of entries){
      if(!orbit&&!body.period)continue;
      let cached=orbit?trailCache.get(body.id):ephemerisTrail(body);
      if(orbit&&(!cached||cached.day!==day)){
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
  }

  function renderSpace() {
    ctx.clearRect(0,0,width,height);
    const baseDistance=distance();
    const screen=spaceProjector(space,width,height,baseDistance);
    const entries=current();
    if(voyager){if(trails)paintVoyager(ctx,screen,tracksVoyager());}
    else if (!galactic) paintSolarOrbits(screen,entries);
    markers=entries.map(({body,vector})=>{
      const p=screen(displayedVector(vector));if(!p)return null;
      const radius=voyager?body.size:enlarged?Math.min(galactic?body.size:system?28:52,Math.max(2,body.size*baseDistance/p.depth)):
        radiusAU(body)*p.pixelsPerAU;
      const chosen=selected===body.id;
      return {body,x:p.x,y:p.y,depth:p.depth,radius,selected:chosen,
        reference:reference===body.id&&reference!==selected,
        priority:chosen?20:body.id===reference?15:body.id==='sun'?10:1,label:name(body)};
    }).filter(m=>m&&m.x+m.radius>=0&&m.x-m.radius<=width&&m.y+m.radius>=0&&m.y-m.radius<=height);
    if(!voyager&&selected!==reference){
      const a=markers.find(m=>m.body.id===selected),b=markers.find(m=>m.body.id===reference);
      if(a&&b){
        ctx.strokeStyle='#9de4dd88';ctx.lineWidth=1.2;ctx.setLineDash([4,5]);
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);
      }
    }
    // Painter's order: far bodies first. Hit testing below reverses this order.
    markers.sort((a,b)=>b.depth-a.depth);
    if (galactic) paintFlights(ctx,screen,getFlightTracks(),markers,width,height,selected,drawBody,galactic.schematic);
    else for(const marker of markers)drawBody(marker);
    ctx.font='12px "DM Sans", sans-serif';
    drawLabels(ctx,placeLabels(markers,label=>ctx.measureText(label).width,width,height,{bottom:height-52}));
    const pixelsAtFocus=height*.9/(baseDistance/10**space.zoom);
    const bar=niceStep(46/pixelsAtFocus);
    ctx.strokeStyle=ctx.fillStyle='#cde4e5';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(17,height-25);ctx.lineTo(17+bar*pixelsAtFocus,height-25);
    ctx.moveTo(17,height-28);ctx.lineTo(17,height-22);
    ctx.moveTo(17+bar*pixelsAtFocus,height-28);ctx.lineTo(17+bar*pixelsAtFocus,height-22);
    if (!galactic?.schematic) ctx.stroke();
    if (!galactic?.schematic) ctx.fillText(`${n(system?bar*AU_KM:bar)} ${t(system?'focusScaleKm':'focusScale')}`,17,height-34);
    $('solZoom').value=String(space.zoom);
    $('solZoomValue').textContent=n(10**space.zoom)+'×';
    $('solIn').disabled=space.zoom===MAX_ZOOM;
    $('solOut').disabled=space.zoom===0;
  }

  function drawBody({body,x,y,radius,selected:chosen,reference:isReference}) {
    if(voyager&&(body.id==='v1'||body.id==='v2')){
      ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);
      ctx.fillStyle=body.color;ctx.fillRect(-radius*.75,-radius*.75,radius*1.5,radius*1.5);
      if(chosen){ctx.strokeStyle='#fff3df';ctx.lineWidth=1.2;ctx.strokeRect(-radius-2,-radius-2,2*radius+4,2*radius+4);}
      ctx.restore();return;
    }
    if (enlarged && body.id === 'saturn') {
      ctx.strokeStyle = '#e8d6a1a8';ctx.lineWidth=2;
      ctx.beginPath();ctx.ellipse(x,y,radius*1.85,radius*.55,-.43,0,Math.PI*2);ctx.stroke();
    }
    if (enlarged&&!voyager) {
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
  function changeDay(value, reframe = false) {
    const next = clampDay(value);
    if (galactic && reframe) {
      const before = sunDisplacement(day), after = sunDisplacement(next);
      space = {...space,focus:space.focus.map((v,i)=>v+(after[i]-before[i]))};
    }
    clock = null;day = next;lastReadout = null;
    if(voyager&&reframe)fitView();
    loadVisibleData();updateClock(true);updateInspector();invalidate();
  }
  function beginClock() {
    if (!active || !visible || document.hidden || reduced.matches || day>=maxDay()) return;
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
  const markPose=value=>{
    pose=value;
    for(const [id,kind] of [['solTop','top'],['solAngle','angle'],['solSide','side'],
      ['solFlightAngle','angle'],['solAcross','across'],['solAlong','along']]) {
      $(id).setAttribute('aria-pressed',String(pose===kind));
    }
  };
  function setSpace(next) {
    if(voyager) voyager.fitted=false;
    space=next;
  }
  const zoomBy=delta=>{if(view==='3d'){setSpace(zoomSpace(space,delta));invalidate();}
    else gestures.zoomBy(delta);};
  function setSunFollow(value) {
    galactic.followSun = value;
    $('solFollowSun').setAttribute('aria-pressed',String(value));
    if (value) {
      galactic.fitted = false;
      follow = false;
      $('solFollow').setAttribute('aria-pressed','false');
      space = {...space,focus:sunDisplacement(day)};
    }
  }

  const fitView=()=>{
    follow=false;$('solFollow').setAttribute('aria-pressed','false');
    if(voyager){
      voyager.fitted=true;
      const points=current().map(({vector})=>vector);
      if(trails)for(const track of tracksVoyager())points.push(...track.points.filter(Boolean));
      space=spaceCamera();
      if(points.length){
        const fitted=fitFlight(points,space,width,height);
        voyager.distance=fitted.distance;space.focus=fitted.focus;
      }
      markPose('angle');invalidate();
    }else if(galactic){
      setSunFollow(false);
      const points = current().map(({vector})=>displayedVector(vector));
      for (const {samples} of getFlightTracks()) for (const {vector} of samples) points.push(vector);
      const fitted = fitFlight(points,space,width,height);
      galactic.fitted = true;
      galactic.distance = fitted.distance;
      space = {...space,focus:fitted.focus,zoom:0};
      invalidate();
    } else if(view==='3d'){space=spaceCamera();markPose('angle');invalidate();}
    else setCamera(fit());
  };

  function changeFrame(next) {
    if (voyager || system || view!=='3d' || Boolean(galactic)===next) return;
    cancelSpace();
    clock = null;
    lastReadout = stateDay = null;
    markers = [];
    if (next) {
      galactic = {
        previous:{space,pose,follow,selected,reference},
        restoredDate:supportsGalacticDay(day)?null:day,
        duration:Number($('solFlightWindow').value),
        schematic:$('solFlightScale').value==='schematic',
        followSun:false,
        distance:85,
      };
      if (galactic.restoredDate !== null) day = J2000;
      if (selected==='pluto') selected='sun';
      if (reference==='pluto') reference='sun';
      space = {...spaceCamera(),...FLIGHT_POSES.angle};
      markPose('angle');
      fitView();
    } else {
      const {previous,restoredDate} = galactic;
      galactic = null;
      if (restoredDate !== null && day===J2000) day=restoredDate;
      ({space,pose,follow} = previous);
      if (previous.selected==='pluto'&&selected==='sun') selected='pluto';
      if (previous.reference==='pluto'&&reference==='sun') reference='pluto';
      markPose(pose);
      $('solFollow').setAttribute('aria-pressed',String(follow));
    }
    rebuildBodies();loadVisibleData();
    localize();updateClock(true);
  }
  listen($('solIn'),'click',()=>zoomBy(.25));
  listen($('solOut'),'click',()=>zoomBy(-.25));
  listen($('solZoom'),'input',()=>{
    const value=Number($('solZoom').value);
    if(view==='3d'){setSpace(zoomSpace(space,value-space.zoom));invalidate();}
    else gestures.zoomTo(value);
  });
  listen($('solFit'),'click',fitView);
  listen($('solInner'),'click',()=>{
    if(galactic){
      galactic.distance = galactic.schematic ? 18 : 6;
      space={...space,zoom:0};
      setSunFollow(true);
      invalidate();
    } else if(view==='3d'){space={...spaceCamera(),zoom:1.2};markPose('angle');invalidate();}
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
    if(points.length===1&&Math.hypot(dx,dy)>4)markPose(null);
    setSpace(points.length===2?zoomSpace(spaceGesture.camera,Math.log10(Math.max(1,Math.hypot(points[0][0]-points[1][0],points[0][1]-points[1][1]))/Math.max(1,spaceGesture.span))):
      rotateSpace(spaceGesture.camera,dx,-dy));
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
    setSpace(zoomSpace(space,-Math.max(-.4,Math.min(.4,event.deltaY*.001))));
    invalidate();
  },{passive:false});
  listen(canvas,'keydown',event=>{
    if(view!=='3d')return;
    const arrows={ArrowLeft:[-25,0],ArrowRight:[25,0],ArrowUp:[0,25],ArrowDown:[0,-25]};
    if(Object.hasOwn(arrows,event.key)){event.preventDefault();setSpace(rotateSpace(space,...arrows[event.key]));markPose(null);invalidate();}
    else if(['+','=','-','Home','Escape'].includes(event.key)){
      event.preventDefault();
      if(event.key==='Home')fitView();
      else if(event.key==='Escape')$('solFit').focus();
      else zoomBy(event.key==='-'?-.25:.25);
    }
  });
  function switchView(next){
    if(view===next)return;
    if (galactic && next==='2d') changeFrame(false);
    if(next==='3d')gestures.cancel();else cancelSpace();
    view=next;
    $('sol2d').setAttribute('aria-pressed',String(view==='2d'));
    $('sol3d').setAttribute('aria-pressed',String(view==='3d'));
    $('sol3dControls').hidden=view!=='3d';
    $('solScene3d').hidden=view!=='3d';
    if(follow)center();
    localize();invalidate();
  }
  listen($('sol2d'),'click',()=>{if(system)exitSystem('2d');else switchView('2d');});
  listen($('sol3d'),'click',()=>switchView('3d'));
  listen($('solSun'),'click',()=>{if(!voyager)exitSystem();select('sun',true);});
  listen($('solVoyager'),'click',()=>{if(voyager)exitVoyager();else enterVoyager();});
  listen($('voyRetry'),'click',()=>loadProbes(true));
  listen($('voyEvents'),'click',event=>{
    const button=event.target.closest('button[data-voy-date]');
    if(button)changeDay(parseModelDate(button.dataset.voyDate),true);
  });
  listen($('solHelio'),'click',()=>changeFrame(false));
  listen($('solGalactic'),'click',()=>changeFrame(true));
  for(const [id,next] of [['solFlightAngle','angle'],['solAcross','across'],['solAlong','along']]) {
    listen($(id),'click',()=>{
      space={...space,...FLIGHT_POSES[next]};markPose(next);
      if (galactic.fitted && !space.zoom) fitView();
      else invalidate();
    });
  }
  listen($('solFollowSun'),'click',()=>{setSunFollow(!galactic.followSun);invalidate();});
  listen($('solFlightWindow'),'change',()=>{
    galactic.duration=Number($('solFlightWindow').value);
    invalidate();
  });
  listen($('solFlightScale'),'change',()=>{
    galactic.schematic=$('solFlightScale').value==='schematic';
    fitView();
    localize();
  });
  listen($('solGlobal'),'click',()=>{const previous=system;exitSystem();systemButtons.find(item=>item.id===previous)?.button.focus();});
  listen($('solFirstWorldDay'),'click',()=>{changeDay(START);$('solDate').focus({preventScroll:true});});
  listen($('solWorldRetry'),'click',()=>{const id=relevantSystem();if(id)loadSystem(id,true);updateInspector();});
  for(const [id,pose] of [['solTop','top'],['solAngle','angle'],['solSide','side']])
    listen($(id),'click',()=>{setSpace({...space,...ORBIT_POSES[pose]});markPose(pose);invalidate();});
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
    enlarged=$('solSymbols').checked;updateSymbolNote();invalidate();
  });
  listen($('solPlay'),'click',()=>{if (clock) changeDay(day);else beginClock();});
  listen($('solRate'),'change',()=>{if (clock) beginClock();});
  listen($('solPrev'),'click',()=>changeDay(advanceModelDay(day,1,-1)));
  listen($('solNext'),'click',()=>changeDay(advanceModelDay(day,1,1)));
  listen($('solEpoch'),'click',()=>changeDay(voyager?latestEpoch():J2000,true));
  listen($('solDate'),'change',()=>{
    const field=$('solDate'), next=parseModelDate(field.value);
    if (next !== null && next>=minDay() && next<=maxDay()) changeDay(next,true);else updateClock(true);
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
  rebuildBodies();
  localize();
  return {
    setActive(value) {
      if (value === active) return;
      active=value;
      if (active) {loadVisibleData();resize();} else suspend();
    },
    inspect:()=>({active,day,camera:{...camera},view,space:{...space,focus:[...space.focus]},pose,trails,system,
      voyager:voyager?{loaded:!!voyData,error:voyError,tracks:trails?tracksVoyager().map(track=>track.points.length):[]}:null,
      galactic:galactic?{duration:galactic.duration,schematic:galactic.schematic,followSun:galactic.followSun,distance:galactic.distance,
        samples:trails?(galactic.cache?.tracks.reduce((count,{samples})=>count+samples.length,0)??0):0}:null,loadedWorlds:[...ephemerides.keys()],trailPoints:[...trailCache.values()].filter(v=>v.day===day).reduce((n,v)=>n+v.samples.length,0),trailDay:trailCache.get('mercury')?.day??null,selected,reference,follow,pair:comparison(),enlarged,playing:clock!==null,scheduled:raf!==null,draws,drawMs,
      markers:markers.map(({body,x,y,radius,depth})=>({id:body.id,x,y,radius,depth}))}),
    dispose() {active=false;suspend();abort.abort();unsubscribe();resizeObserver.disconnect();visibilityObserver.disconnect();root.replaceChildren();},
  };
}
