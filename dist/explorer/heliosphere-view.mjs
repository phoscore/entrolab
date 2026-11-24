import {crossingPosition,crossings,observedRegion,nose,regionPoint} from './heliosphere-model.mjs';

export const heliosphereText = {
  helioOpen:['Heliosphäre · 3D','Heliosphere · 3D'],
  helioClose:['Heliosphäre ausblenden','Hide heliosphere'],
  helioCaption:['Wissenschaftlich orientiertes, schematisches 3D-Modell','Science-informed schematic 3D model'],
  helioLegendShock:['Termination Shock','Termination shock'],
  helioLegendPause:['Heliopause','Heliopause'],
  helioLegendCross:['Historische Überquerungen','Historical crossings'],
  helioMarkerEpoch:['Markierungen · Horizons um 00:00 TDB am jeweiligen Kalendertag','Markers · Horizons at 00:00 TDB on each calendar date'],
  helioBodies:['Sonden und Planeten','Probes and planets'],
  helioData:['Voyager: Horizons · Planeten: JPL-Näherung','Voyager: Horizons · Planets: JPL approximation'],
  helioFit:['Heliosphäre einpassen','Fit heliosphere'],
  helioMode:['Heliosphäre im lokalen, sonnenzentrierten Bezug.','Heliosphere in the local, Sun-centred frame.'],
  helioScience:['Warum diese Form?','Why this shape?'],
  helioWhy:[
    'Der Sonnenwind ist ausströmendes Plasma. Sein Druck nimmt mit der Entfernung ab. Interstellares Plasma strömt relativ zur Sonne, und Magnetfelder sowie Änderungen des Sonnenwinds verformen die Grenzregionen. Voyager misst entlang zweier Flugbahnen. IBEX und IMAP erschließen die entfernten Regionen indirekt über energiereiche neutrale Atome. Die globale Form und besonders der Schweif bleiben modellabhängig.',
    'The solar wind is an outflow of plasma. Its pressure decreases with distance. Interstellar plasma flows relative to the Sun, and magnetic fields and solar-wind changes shape the boundaries. Voyager measures along two trajectories. IBEX and IMAP probe distant regions indirectly using energetic neutral atoms. The global shape, especially the tail, remains model-dependent.',
  ],
  helioHome:[
    'Das Planetensystem umfasst die Planeten und ihre Bahnen. Der Kuipergürtel jenseits von Neptun enthält eisige Kleinkörper. Die Heliosphäre beschreibt den Einfluss des Sonnenwinds. Die viel weiter entfernte Oortsche Wolke ist ein vermutetes Kometenreservoir. Die Gravitation der Sonne wirkt über die Heliopause hinaus.',
    'The planetary system includes the planets and their orbits. The Kuiper Belt beyond Neptune contains icy small bodies. The heliosphere traces the influence of the solar wind. The much more distant Oort Cloud is an inferred comet reservoir. The Sun’s gravity continues beyond the heliopause.',
  ],
  helioRegions:['Region oder Grenze','Region or boundary'],
  helioEvents:['Beobachtete Voyager-Überquerungen','Observed Voyager crossings'],
  helioEventNote:[
    'Die Markierungen verwenden Horizons-Positionen um 00:00 TDB am angegebenen Kalendertag. Abstände aus den Beobachtungen sind gerundet. Die Modellflächen zeigen eine mögliche räumliche Anordnung.',
    'Markers use Horizons positions at 00:00 TDB on the stated calendar date. Published distances are approximate. The surfaces illustrate one possible spatial arrangement.',
  ],
  helioRegionAtEpoch:['Missionsphase aus den beobachteten Daten','Mission phase from observed crossing dates'],
  helioMissing:['Position zu diesem Zeitpunkt fehlt','Position unavailable at this epoch'],
  helioSource:['Fachpublikation','Research paper'],
  helioProbe1:['Zu Voyager 1','Go to Voyager 1'],
  helioProbe2:['Zu Voyager 2','Go to Voyager 2'],
  helioSymbols:['Körpersymbole sind vergrößert. Positionen und Maßstab in AU.','Body symbols are enlarged. Positions and scale are in AU.'],
};

const descriptions = {
  wind:[['Sonnenwind','Solar wind'],
    ['Die Sonne sendet Plasma in alle Richtungen aus. Seine Wechselwirkung mit dem lokalen interstellaren Medium bildet die Heliosphäre.',
     'The Sun sends plasma out in all directions. Its interaction with the local interstellar medium forms the heliosphere.']],
  shock:[['Termination Shock','Termination shock'],
    ['An dieser Stoßfront wird der Sonnenwind abrupt abgebremst und verdichtet. Wellen, Felder und Teilchen tragen die dabei umverteilte Energie.',
     'At this shock, the solar wind abruptly slows and compresses. Waves, fields and particles carry the redistributed energy.']],
  sheath:[['Heliosheath','Heliosheath'],
    ['In der Heliosheath strömt abgebremstes Sonnenwindplasma zwischen Stoßfront und Heliopause, unter anderem seitlich um die Nase herum.',
     'Between the shock and heliopause, slowed solar-wind plasma flows through the heliosheath, including sideways around the nose.']],
  heliopause:[['Heliopause','Heliopause'],
    ['Hier grenzt Sonnenwindplasma an interstellares Plasma. Lage und Form variieren mit den Plasmabedingungen. Neutrale Atome können die Grenze passieren.',
     'Solar-wind plasma meets interstellar plasma here. The shape and position vary with plasma conditions. Neutral atoms can pass through.']],
  interstellar:[['Lokales interstellares Medium','Local interstellar medium'],
    ['Jenseits der Heliopause dominiert interstellares Plasma. Voyager misst dort das Medium in der direkten Umgebung der Sonne.',
     'Interstellar plasma dominates beyond the heliopause. Voyager samples that medium in the Sun’s immediate neighbourhood.']],
  tail:[['Heliotail','Heliotail'],
    ['Stromabwärts wird der Sonnenwind abgelenkt. Die hier gezeigte Ausdehnung dient der Orientierung. Länge, Struktur und Zahl möglicher Ausläufer hängen vom Modell ab.',
     'The solar wind is diverted downstream. The extension shown here gives directional context. Its length, structure and number of possible lobes depend on the model.']],
};
const phaseNames = {
  wind:descriptions.wind[0], sheath:descriptions.sheath[0],
  interstellar:descriptions.interstellar[0],
  shockCrossing:['Überquerung der Stoßfront','Shock crossing'],
  pauseCrossing:['Überquerung der Heliopause','Heliopause crossing'],
};

export function localizeHeliosphere(root,lang) {
  const select = root.querySelector('#helioRegion');
  const previous = select.value;
  select.replaceChildren(...Object.entries(descriptions).map(([id,[names]])=>new Option(names[lang],id)));
  select.value=previous||'heliopause';
  const dates = new Intl.NumberFormat(lang?'en-GB':'de-DE',{maximumFractionDigits:1});
  root.querySelector('#helioEventList').replaceChildren(...crossings.map(event=>{
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type='button';
    button.dataset.crossing=event.id;
    const number=event.probe==='v1'?1:2;
    const date=event.start===event.end?event.start:`${event.start} – ${event.end}`;
    button.textContent=`Voyager ${number} · ${descriptions[event.boundary][0][lang]} · ${date} · ≈ ${dates.format(event.au)} AU`;
    const source=document.createElement('a');
    source.href=event.source;
    source.textContent=heliosphereText.helioSource[lang];
    li.append(button,source);
    return li;
  }));
}

export function updateHeliospherePanel(root,{region,event,probe,day,data,lang}) {
  root.querySelector('#helioRegion').value=region;
  root.querySelector('#helioDescription').textContent=descriptions[region][1][lang];
  const phase = root.querySelector('#helioPhase');
  const isProbe=probe==='v1'||probe==='v2';
  const regionName=data?.[probe]?.sample(day)?phaseNames[observedRegion(probe,day)]?.[lang]:null;
  phase.hidden=!isProbe;
  phase.textContent=regionName
    ? heliosphereText.helioRegionAtEpoch[lang]+' · '+regionName
    : heliosphereText.helioMissing[lang];
  for (const button of root.querySelectorAll('[data-crossing]')) {
    button.setAttribute('aria-pressed',String(button.dataset.crossing===event?.id));
    button.disabled=!data;
  }
}

// A nonzero-winding union fills the projected surface once, including the
// clipped near-plane edge. Grid strokes sit above the translucent fills.
function addFace(path,screen,vertices) {
  const points=[];
  for (let i=0;i<vertices.length;i++) {
    const a=vertices[i], b=vertices[(i+1)%vertices.length];
    const edge=screen.segment(a,b);
    if (edge) points.push(...edge);
  }
  if(points.length<3)return;
  let area=0;
  for(let i=0;i<points.length;i++){
    const a=points[i], b=points[(i+1)%points.length];
    area+=a.x*b.y-b.x*a.y;
  }
  if(area<0)points.reverse();
  path.moveTo(points[0].x,points[0].y);
  for(const p of points.slice(1))path.lineTo(p.x,p.y);
  path.closePath();
}

export function paintHeliosphere(ctx,screen,shells,region) {
  ctx.save();
  for(const {id,rings} of shells){
    const outer=id==='heliopause';
    const selected=region===id||(outer&&region==='tail');
    const volume=outer?region==='sheath':region==='wind';
    const area=new Path2D(), grid=new Path2D(), tailGrid=new Path2D();
    for(let j=0;j<rings.length;j++){
      const ring=rings[j], next=rings[j+1];
      for(let i=0;i<ring.length;i++){
        const k=(i+1)%ring.length;
        if(next)addFace(area,screen,[ring[i],next[i],next[k],ring[k]]);
        const gridPath=outer&&region==='tail'&&j>=10?tailGrid:grid;
        if(j%4===0&&j!==0&&j!==rings.length-1)addLine(gridPath,screen,ring[i],ring[k]);
        if(next&&i%5===0)addLine(gridPath,screen,ring[i],next[i]);
      }
    }
    ctx.fillStyle=outer?(volume?'#68bdfa43':selected?'#68bdfa23':'#68bdfa12'):
      (volume?'#f9c98742':selected?'#ffb87b28':'#ffb87b14');
    ctx.fill(area);
    ctx.strokeStyle=outer?(selected?'#8ed5f44e':'#8ed5f425'):(selected?'#ffd09e65':'#ffd09e45');
    ctx.lineWidth=.85;ctx.stroke(grid);
    ctx.strokeStyle='#b3dcfa99';ctx.stroke(tailGrid);
  }
  ctx.restore();
}
function addLine(path,screen,a,b){
  const line=screen.segment(a,b);
  if(!line)return;
  path.moveTo(line[0].x,line[0].y);
  path.lineTo(line[1].x,line[1].y);
}

export function paintCrossings(ctx,screen,positions,selected) {
  ctx.save();
  for(const {event,vector} of positions){
    const p=screen(vector);
    if(!p)continue;
    ctx.strokeStyle=event.probe==='v1'?'#ffe0be':'#b2faf5';
    ctx.lineWidth=event===selected?2:1.15;
    const radius=event===selected?10:5;
    ctx.beginPath();
    ctx.arc(p.x,p.y,radius,0,Math.PI*2);
    ctx.stroke();
    if(event===selected){
      ctx.beginPath();
      ctx.arc(p.x,p.y,2,0,Math.PI*2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export const resolveCrossings = data => crossings.flatMap(event=>{
  const vector=crossingPosition(event,data);
  return vector?[{event,vector}]:[];
});

export function paintRegionAnchor(ctx,screen,basis,region,lang,width,height) {
  const [right,up]=basis;
  const reverse=vector=>vector.map(value=>-value);
  const directions=region==='tail'?[reverse(nose)]:[right,reverse(right),up,reverse(up)];
  for(const direction of directions){
    const point=screen(regionPoint(region,direction));
    if(!point||point.x<12||point.x>width-12||point.y<12||point.y>height-59)continue;
    const {x,y}=point;
    ctx.save();
    ctx.strokeStyle='#dbeaf7';ctx.lineWidth=1.25;
    ctx.beginPath();
    ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);
    ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);
    ctx.stroke();
    ctx.restore();
    return {x,y,radius:4,priority:19,label:descriptions[region][0][lang]};
  }
  return null;
}
