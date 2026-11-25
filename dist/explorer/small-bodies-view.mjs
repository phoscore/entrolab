import {AU_KM} from './solar-model.mjs';
import {GROUPS,catalog,parseSmallDate,formatSmallDate} from './small-bodies-spec.mjs';
import {METADATA} from './small-bodies-release.mjs';

const bilingual=(de,en)=>[de,en];
export const smallBodyCopy={
  beyondOpen:bilingual('Kleinkörper · 3D','Small bodies · 3D'),
  beyondClose:bilingual('Zur Planetenansicht','Back to planets'),
  beyondScene:bilingual('JPL Horizons · Sonnenzentrum · J2000-Ekliptik · TDB','JPL Horizons · Sun centre · J2000 ecliptic · TDB'),
  beyondData:bilingual('Kleinkörper: Horizons · Planeten: JPL-Näherung','Small bodies: Horizons · Planets: JPL approximation'),
  beyondSymbols:bilingual('Kleinkörpermarker sind Symbole. Abstände in AU.','Small-body markers are symbolic. Distances in AU.'),
  beyondGroups:bilingual('Objektgruppen','Object groups'),
  beyondTarget:bilingual('Objekt wählen','Choose object'),
  beyondPathOn:bilingual('Bahnabschnitt an','Orbital arc on'),
  beyondPathOff:bilingual('Bahnabschnitt aus','Orbital arc off'),
  beyondGuides:bilingual('Schematische Gürtel','Schematic belts'),
  beyondLoading:bilingual('Ephemeriden werden geladen …','Loading ephemerides …'),
  beyondUnavailable:bilingual('Für dieses Datum fehlt eine Position.','No position is available for this date.'),
  beyondEpoch:bilingual('Heute · TDB-Kalendertag','Today · TDB calendar date'),
  beyondArcFit:bilingual('Bahnabschnitt einpassen','Fit orbital arc'),
  beyondBeltFit:bilingual('Asteroidengürtel einpassen','Fit asteroid belt'),
  beyondSBDB:bilingual('JPL Small-Body Database','JPL Small-Body Database'),
  beyondRange:bilingual('Zum ersten verfügbaren Datum','Go to first available date'),
  beyondScience:bilingual('Was zeigen Gürtel und Bahnen?','What do the belts and orbits show?'),
  beyondLimit:bilingual('Bahnlinien zeigen verfügbare Abschnitte der Ephemeriden. Für den ausgewählten Körper kann ein Abschnitt deshalb offen bleiben.','Orbit lines show the available ephemeris arcs. The selected body’s arc can therefore remain open.'),
  beyondDefinitions:bilingual(
    'Ein Zwergplanet umkreist die Sonne, ist annähernd rund und hat seine Bahnumgebung nicht freigeräumt und ist kein Mond. Transneptunische Objekte haben eine große Halbachse jenseits von Neptun. Der Kuipergürtel ist ein Teil dieser Population.',
    'A dwarf planet orbits the Sun, is nearly round and has not cleared its orbital neighbourhood and is not a moon. Trans-Neptunian objects have semimajor axes beyond Neptune. The Kuiper Belt is one part of that population.'),
  beyondBelts:bilingual(
    'Der Asteroidengürtel liegt vor allem zwischen Mars und Jupiter. Der Kuipergürtel ist eine Region jenseits von Neptun. Die transparenten Bänder zeigen eine vereinfachte räumliche Orientierung. Einzelmarker stehen für ausgewählte reale Objekte.',
    'The main asteroid belt lies mostly between Mars and Jupiter. The Kuiper Belt is a region beyond Neptune. The translucent bands offer simplified spatial context. Individual markers represent selected real objects.'),
  beyondComets:bilingual(
    'Kometeneis kann sich bei Annäherung an die Sonne in Gas verwandeln und Staub freisetzen. Manche Asteroiden zeigen ebenfalls Aktivität. Begegnungen und gravitative Streuung können Bahnen stark strecken oder neigen.',
    'Comet ice can turn into gas and release dust near the Sun. Some asteroids also show activity. Encounters and gravitational scattering can make orbits highly elongated or inclined.'),
  beyondEdges:bilingual(
    'Die Heliosphäre ist ein Plasmagebiet des Sonnenwinds. Gürtel und die vermutete Oortsche Wolke beschreiben Körperpopulationen. Je nach Definition liegt der Rand des Sonnensystems daher anders.',
    'The heliosphere is a plasma region shaped by the solar wind. The belts and the inferred Oort Cloud describe populations of objects. Different definitions therefore place the edge of the Solar System differently.'),
  beyondClass:bilingual('Einordnung','Classification'),
  beyondDiameter:bilingual('Geschätzter Durchmesser','Estimated diameter'),
  beyondCatalog:bilingual('SBDB-Bahnparameter (oskulierend, J2000-Ekliptik)','SBDB orbital elements (osculating, J2000 ecliptic)'),
  beyondOrbitEpoch:bilingual('Katalogepoche','Catalogue epoch'),
  beyondPeriod:bilingual('Umlaufzeit','Orbital period'),
  beyondEcc:bilingual('Exzentrizität','Eccentricity'),
  beyondInc:bilingual('Bahnneigung','Inclination'),
  beyondCoverage:bilingual('Abdeckung · 00:00 TDB','Coverage · 00:00 TDB'),
  beyondSun:bilingual('Sonnenentfernung zur gewählten Epoche','Distance from Sun at selected epoch'),
  beyondSpeed:bilingual('Geschwindigkeit relativ zur Sonne','Speed relative to Sun'),
  beyondPlanetWindow:bilingual('Die Planeten-Näherung deckt dieses Datum nicht ab.','The approximate planet model does not cover this date.'),
  beyondClassUnknown:bilingual('Nicht verfügbar','Unavailable'),
};
export const groupNames={
  dwarf:bilingual('Zwergplaneten','Dwarf planets'),asteroid:bilingual('Asteroiden','Asteroids'),
  tno:bilingual('Transneptunische Objekte','Trans-Neptunian objects'),comet:bilingual('Kometen','Comets'),
};
export const beltNames={asteroid:bilingual('Asteroidengürtel','Main asteroid belt'),tno:bilingual('Kuipergürtel','Kuiper Belt')};
const colors={dwarf:'#ffc58c',asteroid:'#f3b27f',tno:'#8bdde6',comet:'#c8afff'};
const notes={
  ceres:bilingual('Dawn untersuchte Ceres’ helle Salzablagerungen im Occator-Krater.','Dawn studied bright salt deposits in Ceres’s Occator crater.'),
  haumea:bilingual('Die schnelle Rotation trägt zu seiner länglichen Form bei.','Rapid rotation contributes to its elongated shape.'),
  makemake:bilingual('In Spektren seiner Oberfläche zeigt sich gefrorenes Methan.','Its surface spectra show frozen methane.'),
  eris:bilingual('Eris’ Entdeckung trug zur Debatte über die Planetendefinition bei.','The discovery of Eris helped spark the debate over the definition of a planet.'),
  vesta:bilingual('Dawn kartierte Vestas Südpolbecken und seine differenzierte Kruste.','Dawn mapped Vesta’s southern basins and differentiated crust.'),
  pallas:bilingual('Pallas kreuzt den Hauptgürtel auf einer stark geneigten Bahn.','Pallas crosses the main belt on a highly inclined orbit.'),
  hygiea:bilingual('Hygiea ist ein großer Hauptgürtelasteroid mit annähernd runder Gestalt.','Hygiea is a large, nearly round main-belt asteroid.'),
  bennu:bilingual('OSIRIS-REx brachte Material von Bennu zur Erde.','OSIRIS-REx returned material from Bennu to Earth.'),
  ryugu:bilingual('Hayabusa2 brachte Proben von Ryugu zur Erde.','Hayabusa2 returned samples from Ryugu to Earth.'),
  apophis:bilingual('Am 13. April 2029 passiert Apophis die Erde in geringer Entfernung.','Apophis makes a close Earth flyby on 13 April 2029.'),
  eros:bilingual('NEAR Shoemaker umkreiste Eros und setzte auf seiner Oberfläche auf.','NEAR Shoemaker orbited Eros and touched down on its surface.'),
  sedna:bilingual('Sedna bleibt selbst am sonnennächsten Punkt weit jenseits von Neptun.','Sedna stays far beyond Neptune even at its closest approach to the Sun.'),
  quaoar:bilingual('Sternbedeckungen lieferten Hinweise auf Ringe um Quaoar.','Stellar occultations revealed rings around Quaoar.'),
  orcus:bilingual('Orcus und Pluto stehen beide in einer 3:2-Bahnresonanz mit Neptun.','Orcus and Pluto both inhabit Neptune’s 3:2 mean-motion resonance.'),
  gonggong:bilingual('Gonggong besitzt den Mond Xiangliu.','Gonggong has a moon named Xiangliu.'),
  salacia:bilingual('Salacia bildet mit Actaea ein transneptunisches Doppelsystem.','Salacia and Actaea form a trans-Neptunian binary.'),
  arrokoth:bilingual('New Horizons fotografierte Arrokoths zwei zusammengewachsene Lappen.','New Horizons imaged Arrokoth’s two joined lobes.'),
  halley:bilingual('Halley umläuft die Sonne gegenläufig zu den Planeten.','Halley orbits the Sun in the opposite direction to the planets.'),
  churyumov:bilingual('Rosetta begleitete 67P. Philae landete auf dem Kern.','Rosetta escorted 67P. Philae landed on its nucleus.'),
  encke:bilingual('Encke kehrt ungefähr alle 3,3 Jahre zur Sonne zurück.','Encke returns to the Sun roughly every 3.3 years.'),
  swift:bilingual('Swift–Tuttle ist der Mutterkörper der Perseiden.','Swift–Tuttle is the parent body of the Perseids.'),
  halebopp:bilingual('Hale–Bopp war bei seiner Sonnenpassage 1997 mit bloßem Auge sichtbar.','Hale–Bopp was visible to the unaided eye around its 1997 perihelion.'),
};
export const smallBodies=catalog.map(entry=>({...entry,small:true,color:colors[entry.group],size:5,
  names:[entry.name,entry.name],notes:notes[entry.id]}));
export const smallBodyById=new Map(smallBodies.map(body=>[body.id,body]));
export const SMALL_MIN=Math.min(...catalog.map(x=>x.start)),SMALL_MAX=Math.max(...catalog.map(x=>x.end));
export const currentSmallDay=()=>parseSmallDate(new Date().toISOString().slice(0,10));

export function rebuildSmallTargets(select,active,lang,selected){
  const groups=Object.keys(GROUPS).filter(g=>active.has(g)).map(group=>{
    const opt=document.createElement('optgroup');
    opt.label=groupNames[group][lang];
    opt.append(...smallBodies.filter(x=>x.group===group)
      .map(body=>new Option(`${body.name} · ${body.designation}`,body.id)));
    if(group==='dwarf')opt.append(new Option('Pluto · 134340','pluto'));
    return opt;
  });
  select.replaceChildren(new Option('—','sun'),...groups);
  select.value=(smallBodyById.has(selected)||selected==='pluto')?selected:'sun';
}

export function updateSmallPanel(get,body,entry,day,lang,n,end=body.end){
  const meta=METADATA[body.id];
  get('smallName').textContent=`${body.name} · ${body.designation}`;
  const kind={dwarf:bilingual('Zwergplanet','Dwarf planet'), asteroid:bilingual('Asteroid','Asteroid'),
    tno:bilingual('Transneptunisches Objekt','Trans-Neptunian object'),comet:bilingual('Komet','Comet')};
  const candidate=body.group==='tno'&&body.id!=='arrokoth';
  get('smallClass').textContent=kind[body.group][lang]+
    (candidate?bilingual(' · Zwergplanetenkandidat',' · Dwarf-planet candidate')[lang]:'')+
    (meta?.orbitClass?' · '+meta.orbitClass:'');
  get('smallNote').textContent=body.notes[lang];
  get('smallSource').href='https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr='+encodeURIComponent(body.designation);
  const date=value=>formatSmallDate(value).slice(0,10);
  get('smallCoverage').textContent=date(body.start)+' – '+date(end);
  get('smallEpoch').textContent=formatSmallDate(day).replace('T',' ')+' TDB';
  get('smallOrbitEpoch').textContent=meta?.orbitEpoch?'JD '+String(meta.orbitEpoch)+' TDB':'—';
  get('smallDistance').textContent=entry?n(Math.hypot(...entry.vector))+' AU':'—';
  get('smallSpeed').textContent=entry?n(Math.hypot(...entry.velocity))+' km/s':'—';
  get('smallSize').textContent=meta?.diameterKm?'≈ '+n(meta.diameterKm)+(meta.diameterSigmaKm?' ± '+n(meta.diameterSigmaKm):'')+' km':'—';
  get('smallPeriod').textContent=meta?.periodDays?'≈ '+n(meta.periodDays/365.25)+' '+bilingual('Jahre','yr')[lang]:'—';
  get('smallEcc').textContent=Number.isFinite(meta?.eccentricity)?n(meta.eccentricity):'—';
  get('smallInc').textContent=Number.isFinite(meta?.inclination)?n(meta.inclination)+'°':'—';
}

const belts={asteroid:[2.1,3.3,.24,'#e1ac77'],tno:[30,50,5,'#7ac4da']};
const polar=(r,z,a)=>[r*Math.cos(a),r*Math.sin(a),z];
export function beltFitPoints(visible){
  return [...visible].flatMap(key=>{
    const [,r,z]=belts[key];
    return Array.from({length:24},(_,i)=>polar(r,i%2?z:-z,i*Math.PI/12));
  });
}

export function paintBelts(ctx,screen,visible){
  for(const key of visible){
    const [min,max,height,color]=belts[key];
    ctx.fillStyle=color+'09';
    for(const z of [-height,0,height]){
      const bands=new Path2D();
      for(let i=0;i<80;i++){
        const a=i*Math.PI/40,b=(i+1)*Math.PI/40;
        const q=[polar(min,z,a),polar(max,z,a),polar(max,z,b),polar(min,z,b)].map(screen);
        if(q.some(p=>!p))continue;
        bands.moveTo(q[0].x,q[0].y);
        for(const p of q.slice(1))bands.lineTo(p.x,p.y);
        bands.closePath();
      }
      ctx.fill(bands);
    }
  }
}

export function orbitalArc(series,body){
  if(!series)return [];
  const points=[];
  const count=Math.ceil((body.end-body.start)/body.step);
  // Keep a dense turn near the Sun and simplify using angular displacement.
  let previous, lastAngle=0;
  for(let i=0;i<=count;i++){
    const day=Math.min(body.end,body.start+i*body.step);
    const position=series.sample(day).position.map(km=>km/AU_KM);
    const length=Math.hypot(...position);
    const unit=position.map(value=>value/length);
    if(previous){
      lastAngle+=Math.hypot(...unit.map((v,k)=>v-previous[k]));
      if(lastAngle<.035&&Math.hypot(...position.map((value,k)=>value-points.at(-1)[k]))<.5&&i!==count){previous=unit;continue;}
    }
    points.push(position);
    previous=unit;lastAngle=0;
  }
  if(points.length<=640)return points;
  return Array.from({length:640},(_,i)=>points[Math.round(i*(points.length-1)/639)]);
}

export function paintSmallArc(ctx,screen,points,color){
  ctx.strokeStyle=color+'98';ctx.lineWidth=1.2;ctx.beginPath();
  for(let i=1;i<points.length;i++){
    const line=screen.segment(points[i-1],points[i]);
    if(!line)continue;
    const [a,b]=line;
    ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
  }
  ctx.stroke();
}

export function paintSmallMarker(ctx,{body,x,y,radius,selected}){
  ctx.save();
  ctx.translate(x,y);
  ctx.fillStyle=body.color;ctx.strokeStyle=body.color;
  ctx.beginPath();
  if(body.group==='asteroid')ctx.rect(-radius*.68,-radius*.68,radius*1.36,radius*1.36);
  else if(body.group==='tno'){
    ctx.moveTo(0,-radius);ctx.lineTo(radius,0);ctx.lineTo(0,radius);ctx.lineTo(-radius,0);ctx.closePath();
  }else if(body.group==='comet'){
    ctx.moveTo(0,-radius);ctx.lineTo(radius,radius*.78);ctx.lineTo(-radius,radius*.78);ctx.closePath();
  }else ctx.arc(0,0,radius,0,Math.PI*2);
  ctx.fill();
  if(selected){
    ctx.beginPath();ctx.arc(0,0,radius+4,0,Math.PI*2);ctx.lineWidth=1.4;ctx.stroke();
  }
  ctx.restore();
}
