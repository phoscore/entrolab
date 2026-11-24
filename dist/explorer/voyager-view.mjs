import {AU_KM,parseModelDate,formatModelDay} from './solar-model.mjs';
import {voyagerMetrics,END,START,RELEASE} from './voyager-data.mjs';

export const probes=[
  {id:'v1',names:['Voyager 1','Voyager 1'],color:'#f6bd83',size:5,mission:'voyager-1'},
  {id:'v2',names:['Voyager 2','Voyager 2'],color:'#80ddd9',size:5,mission:'voyager-2'},
];
export const events={
  v1:[
    ['1977-09-05','Start','Launch'],
    ['1979-03-05','Jupiter · Swing-by','Jupiter · gravity assist'],
    ['1980-11-12','Saturn und Titan · Swing-by','Saturn and Titan · gravity assist'],
    ['2004-12-16','Durchquerung der Sonnenwind-Stoßfront','Termination shock crossing'],
    ['2012-08-25','Durchquerung der Heliopause','Heliopause crossing'],
  ],
  v2:[
    ['1977-08-20','Start','Launch'],
    ['1979-07-09','Jupiter · Swing-by','Jupiter · gravity assist'],
    ['1981-08-26','Saturn · Swing-by','Saturn · gravity assist'],
    ['1986-01-24','Uranus · Swing-by','Uranus · gravity assist'],
    ['1989-08-25','Neptun und Triton · Swing-by','Neptune and Triton · gravity assist'],
    ['2007-08-30','Durchquerung der Sonnenwind-Stoßfront','Termination shock crossing'],
    ['2018-11-05','Durchquerung der Heliopause','Heliopause crossing'],
  ],
};
export const voyagerText={
  voyager:['Voyager · 3D','Voyager · 3D'],
  voyagerBack:['Zu den Planeten','Back to the planets'],
  voyagerFit:['Beide Flugbahnen einpassen','Fit both missions'],
  voyagerFrame:['Sonnenzentriert · J2000-Ekliptik · geometrische Vektoren','Sun-centred · J2000 ecliptic · geometric vectors'],
  voyagerScene:['Zwei Missionen, ein räumlicher Maßstab in AU. Sonne und Erdmittelpunkt dienen als Orientierung.','Two missions, one spatial scale in AU. The Sun and Earth’s centre give context.'],
  voyagerBodies:['Sonden und Orientierungspunkte','Probes and landmarks'],
  voyagerSymbols:['Sondensymbole und Orientierungspunkte sind vergrößert.','Probe markers and landmarks are enlarged.'],
  voyagerLimit:['Die Spuren zeigen vergangene berechnete Positionen im gewählten Datensatz. Die Heliopause ist keine feste Kugel und keine Grenze der Sonnengravitation.','Trails show past computed positions in the selected release. The heliopause is neither a fixed sphere nor the limit of the Sun’s gravity.'],
  voyagerData:['Berechnete Horizons-Ephemeride · keine Live-Telemetrie','Computed Horizons ephemeris · no live telemetry'],
  voyagerCurrent:['Heute · 00:00 TDB','Today · 00:00 TDB'],
  voyagerLast:['Letzte Ephemeridenposition','Last ephemeris position'],
  voyagerBounds:['Die früheste verfügbare Sondenposition liegt nach dem Start. Die Abdeckung endet am 26.11.2026, 00:00 TDB. Bei Voyager 2 bleibt am 29.08.1989 zwischen 08:00 und 08:05 TDB eine kurze Datenlücke.','First probe states are after launch. Coverage ends on 26 Nov 2026, 00:00 TDB. Voyager 2 has a short gap on 29 Aug 1989 between 08:00 and 08:05 TDB.'],
  voyagerSun:['Entfernung zur Sonne','Distance from the Sun'],
  voyagerEarth:['Entfernung zum Erdmittelpunkt','Distance from Earth’s centre'],
  voyagerSpeed:['Geschwindigkeit relativ zur Sonne','Speed relative to the Sun'],
  voyagerLight:['Signallaufzeit einfach · d/c','One-way signal time · d/c'],
  voyagerTimeline:['Missionsereignisse · UTC-Daten','Mission events · UTC dates'],
  voyagerSources:['NASA-Missionschronik','NASA mission chronology'],
  voyagerHorizons:['Horizons-Datenstand und Prüfsummen','Horizons release and checksums'],
  voyagerHelio:['Die Heliosphäre ist der vom Sonnenwind geprägte Raum. An der Heliopause trifft er auf das interstellare Medium. Beide Sonden haben diese Grenze passiert. Die weiter gefasste Sonnenumgebung mit der Oortschen Wolke reicht viel weiter.','The heliosphere is the region shaped by the solar wind. At the heliopause it meets the interstellar medium. Both probes have crossed this boundary. The wider Solar System, including the Oort Cloud, extends much farther.'],
  voyagerAssist:['Ein Swing-by lenkt die Sonde durch die Gravitation eines Planeten um. Im Sonnenbezug kann er dabei auch ihr Tempo ändern. Die gezeigte Flugbahn bleibt auf Sonnensystemmaßstab.','A gravity assist uses a planet’s gravity to redirect a probe. It can also change its speed relative to the Sun. The trajectory is shown on Solar System scales.'],
  voyagerSignal:['Erdabstand bei gleichem Zeitpunkt, geteilt durch Lichtgeschwindigkeit. Er ersetzt keine Signalrechnung mit bewegten Endpunkten.','Simultaneous Earth separation divided by light speed. This is an approximation to signal time with moving endpoints.'],
  voyagerNav:['Ziehen dreht die 3D-Kamera. Pinch, + und − ändern den Zoom. Home passt die Ansicht ein. Die Messwerte bleiben gleich.','Drag to orbit, pinch or use + and − to zoom. Home fits the view. Measurements are independent of the camera.'],
};

export const latestEpoch=()=>Math.min(END,Math.max(START,parseModelDate(new Date().toISOString().slice(0,10))??END));
const aus=position=>position.map(km=>km/AU_KM);
export function voyagerEntries(data,day,sun,earth){
  if(!data)return [];
  const entries=[{body:sun,vector:[0,0,0]}];
  const earthState=data.earth.sample(day);
  if(earthState)entries.push({body:earth,vector:aus(earthState.position)});
  for(const body of probes){
    const state=data[body.id].sample(day);
    if(state)entries.push({body,vector:aus(state.position)});
  }
  return entries;
}
export function paintVoyager(ctx,screen,tracks){
  for(const {body,points} of tracks){
    ctx.strokeStyle=body.color+'aa';ctx.lineWidth=1.35;
    ctx.beginPath();
    for(let i=1;i<points.length;i++){
      if(!points[i-1]||!points[i])continue;
      const segment=screen.segment(points[i-1],points[i]);
      if(!segment)continue;
      const [a,b]=segment;ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
    }
    ctx.stroke();
  }
}

export function updateVoyagerPanel(root,{id,day,data,lang,n,formatDistance}){
  const $=key=>root.querySelector('#'+key);
  const probe=probes.find(probe=>probe.id===id);
  const values=probe?voyagerMetrics(data,id,day):null;
  $('voyName').textContent=probe?.names[lang]??(id==='earth'?['Erdmittelpunkt','Earth centre'][lang]:['Sonne','Sun'][lang]);
  $('voyEpoch').textContent=formatModelDay(day).replace('T',' ')+' TDB';
  for(const [field,key,unit] of [['voySunAU','sunAU','AU'],['voyEarthAU','earthAU','AU'],['voySpeedKmS','speedKmS','km/s'],['voyLightHours','lightHours','h']])
    $(field).textContent=values?'≈ '+(unit==='AU'?formatDistance:n)(values[key])+' '+unit:'—';
}
export function updateVoyagerTimeline(root,id,lang){
  const links=root.querySelector('#voyEvents');
  const probe=probes.find(probe=>probe.id===id);
  root.querySelector('#voyMission').hidden=!probe;
  if(!probe){links.replaceChildren();return;}
  root.querySelector('#voySource').href='https://science.nasa.gov/mission/voyager/'+probe.mission+'/';
  root.querySelector('#voyDataLink').href=new URL(`./data/${RELEASE}/manifest.json`,import.meta.url);
  links.replaceChildren(...events[id].map(([date,...names])=>{
    const item=document.createElement('li');
    const label=`${date} · ${names[lang]}`;
    if(!['1977-08-20','1977-09-05'].includes(date)){
      const button=document.createElement('button');button.type='button';button.textContent=label;
      button.dataset.voyDate=date;item.append(button);
    }else item.textContent=label;
    return item;
  }));
}
