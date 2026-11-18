import {language,onLanguageChange} from '../i18n.mjs';
import {searchKey} from './foundation/access.mjs';
import {neighborhoodName,neighborhoodAnnotation,NEIGHBORHOOD_KNOWN_IDS,GAIA_NAMES_SOURCE} from './neighborhood-names.mjs';
import {loadNeighborhood,neighborhoodLoader,neighborhoodDetails,NEIGHBORHOOD_URL} from './neighborhood-data.mjs';
import {NEIGHBORHOOD_EPOCH,NEIGHBORHOOD_RADIUS,NEIGHBORHOOD_MAX_G,PC_TO_LY,neighborhoodIndex} from './foundation/neighborhood-format.mjs';
import {paintNeighborhood} from './neighborhood-paint.mjs';
import {distanceDisplay,neighborhoodDirection,neighborhoodFocus,neighborhoodHit,neighborhoodHome,
  neighborhoodRotate,neighborhoodZoom,NEIGHBORHOOD_MAX_ZOOM} from './neighborhood-space.mjs';
const valueOf=(el,value)=>{if(el.textContent!==value)el.textContent=value;};
const formatter=['de-DE','en-GB'].map(locale=>new Intl.NumberFormat(locale,{maximumSignificantDigits:8}));
const copy={
  title:['Sonnenumgebung','Stellar Neighborhood'],
  origin:['Sonne im Ursprung','Sun at the origin'],
  intro:['Geschätzte Positionen um die Sonne · statische 3D-Karte · Gaia J2016.0','Estimated positions around the Sun · static 3D map · Gaia J2016.0'],
  in:['Hineinzoomen','Zoom in'],
  out:['Herauszoomen','Zoom out'],
  fit:['Übersicht','Overview'],
  center:['Auswahl zentrieren','Centre selection'],
  solarFocus:['Zur Sonne','To the Sun'],
  zoom:['Zoom','Zoom'],
  units:['Einheit','Units'],
  connection:['Linie zur Sonne','Line to the Sun'],
  looking:['Blickrichtung','Looking toward'],
  pivot:['Kamerafokus','Camera pivot'],
  outside:['Sonne außerhalb des Bilds','Sun outside the view'],
  scale:['am Kamerafokus','at camera focus'],
  axes:['+X zum galaktischen Zentrum, +Y zur galaktischen Länge 90°, +Z zum galaktischen Nordpol.','+X toward the Galactic centre, +Y toward Galactic longitude 90°, +Z toward the north Galactic pole.'],
  overlap:['überlagert','overlap'],
  limited:['wegen Markerbudget ausgeblendet','hidden by marker budget'],
  groups:['Quellen am gewählten Punkt','Sources at the selected point'],
  aliases:['Auch bekannt als','Also known as'],
  spectral:['Veröffentlichter Spektraltyp','Published spectral type'],
  spectralUnknown:['Spektraltyp hier unbekannt','Spectral type unavailable here'],
  pc:['Parsec (pc)','Parsecs (pc)'],
  ly:['Lichtjahre (Lj)','Light-years (ly)'],
  lyShort:['Lj','ly'],
  help:['Ziehen oder Pfeiltasten drehen und neigen. Zoom mit +/−, zwei Fingern oder Mausrad auf der fokussierten Karte. Home zeigt die Übersicht.','Drag or use the arrow keys to orbit and tilt. Zoom with +/−, two fingers or the wheel when the map is focused. Home resets the view.'],
  scope:['Die Stichprobe enthält 2.753 Gaia-Quellen mit Median bis 25 pc, G ≤ 14 und weiteren Qualitätsfiltern. Ein Mehrfachsystem kann mehrere Quellen enthalten. Manche Sterne fehlen wegen dieser Auswahl oder weil Gaia sie nicht getrennt auflöst.','The sample contains 2,753 Gaia sources with median distance up to 25 pc, G ≤ 14 and additional quality cuts. A multiple system can contain several sources. Some stars are missing due to those cuts or because Gaia does not resolve them separately.'],
  about:['Wie liest man diese Karte?','How do I read this map?'],
  science:['Gaia misst Parallaxe über die scheinbare jährliche Verschiebung einer Quelle. Bailer-Jones kombiniert Parallaxe, Messfehler und ein Modell der räumlichen Verteilung zu einer Entfernungsschätzung. Das asymmetrische Intervall steht unter den Quelldetails.','Gaia measures parallax from a source’s apparent annual shift. Bailer-Jones combines parallax, measurement uncertainty and a spatial model to estimate distance. The asymmetric interval is in the source details.'],
  epoch:['J2016.0 ist die Referenzepoche der ICRS-Richtungen. Die Karte verwendet diese Richtungen im galaktischen Koordinatensystem und schreibt keine Eigenbewegung fort.','J2016.0 is the reference epoch of the ICRS directions. The map uses those directions in Galactic coordinates and does not propagate proper motion.'],
  how:['Punkte nebeneinander können räumlich weit getrennt sein. Drehe die Karte und wähle eine Quelle, um ihren Abstand zur Sonne zu sehen.','Points that appear next to each other can be far apart in space. Rotate the map and select a source to see its distance from the Sun.'],
  markers:['Die Marker sind symbolisch, ohne maßstabsgetreue Sternradien. Gaia G beschreibt gemessene Helligkeit im G-Band. Die Linie zur Sonne ist eine Orientierungshilfe.','Markers are symbolic and omit true-scale stellar radii. Gaia G measures apparent brightness in the G band. The line to the Sun is a guide.'],
  loading:['Gaia-Katalog wird geladen …','Loading the Gaia catalogue …'],
  failure:['Katalogdaten fehlen oder konnten nicht verifiziert werden.','Catalogue data are missing or did not pass verification.'],
  detailLoading:['Quellenkarte wird geladen …','Loading the source details …'],
  detailFailure:['Diese Quellenkarte konnte nicht verifiziert werden.','These source details did not pass verification.'],
  retry:['Erneut laden','Try again'],
  count:['Quellen im Katalog','catalogue sources'],
  visible:['im Ausschnitt','in view'],
  drawn:['Punkte angezeigt','points drawn'],
  search:['Gaia-ID oder bekannter Sternname','Gaia ID or known star name'],
  searchHint:['Zum Beispiel „Lalande 21185“. Alle Katalogquellen sind per vollständiger ID erreichbar.','Try “Lalande 21185”. A full ID can select any catalogue source.'],
  close:['Ausgewählte Nachbarn','Selected neighbors'],
  shown:['Punkte in der Ansicht','Points in view'],
  hits:['Treffer','matches'],
  missing:['Kein Treffer in diesem Raumkatalog.','No match in this local catalogue.'],
  empty:['Im Ausschnitt liegen keine Quellen dieser Auswahl.','There are no sources from this selection in this view.'],
  inspect:['Quellenkarte','Source details'],
  choose:['Wähle einen Punkt oder einen Listeneintrag.','Choose a point or a list entry.'],
  source:['Gaia-Quelle · Klasse offen','Gaia source · unclassified'],
  verified:['Verifizierter Sternname','Verified star name'],
  distance:['Geschätzter Abstand zur Sonne (3D)','Estimated distance from the Sun (3D)'],
  interval:['Geometrisches 68,27-%-Posteriorintervall','Geometric 68.27% posterior interval'],
  range:['Untergrenze · Median · Obergrenze','Lower bound · median · upper bound'],
  direction:['Gemessene Richtung (ICRS)','Measured direction (ICRS)'],
  derived:['Abgeleitete galaktische Koordinaten','Derived Galactic coordinates'],
  quality:['Astrometrie und Herkunft','Astrometry and provenance'],
  go:['Richtung auf der Himmelskarte','Show direction on the sky map'],
  credits:['Quellen und Lizenzen','Sources and licences'],
  sun:['Sonne','Sun'],
};

export function mountNeighborhood(root,{onSky}) {
  const lang=()=>language()==='en'?1:0;
  const t=key=>copy[key][lang()];
  const n=value=>formatter[lang()].format(value);
  const $=id=>root.querySelector('#'+id);
  const el=(tag,content,className)=>{
    const item=document.createElement(tag);
    if(content!==undefined)item.textContent=content;
    if(className)item.className=className;
    return item;
  };
  root.innerHTML=`
    <div class="ex-neighborhood" aria-labelledby="snTitle">
      <header class="sn-head"><div><p class="sn-origin" data-sn="origin"></p><h2 id="snTitle" data-sn="title"></h2><p data-sn="intro"></p></div>
      </header>
      <div class="ex-layout sn-layout"><div class="ex-left">
        <div class="sn-toolbar"><div class="ex-controls"><button id="snOut" type="button">−</button><button id="snIn" type="button">+</button>
          <button id="snHome" type="button" data-sn="fit"></button><button id="snSun" type="button" data-sn="solarFocus"></button><button id="snCenter" type="button" data-sn="center" disabled></button></div>
          <div class="sn-options"><label><span data-sn="units"></span><select id="snUnit"><option value="pc" data-sn="pc"></option><option value="ly" data-sn="ly" selected></option></select></label>
          <label><input id="snConnection" type="checkbox" checked><span data-sn="connection"></span></label></div></div>
        <div class="ex-map sn-map"><canvas id="snCanvas" tabindex="0" aria-describedby="snAxes snHelp snHow"></canvas></div>
        <div class="sn-caption"><p id="snAxes"></p><p id="snHow" data-sn="how"></p><p id="snCount"></p><p id="snHidden"></p><p id="snStatus" role="status"></p>
          <button type="button" id="snRetry" data-sn="retry" hidden></button></div>
        <div class="ex-zoom"><label for="snZoom" data-sn="zoom"></label><input id="snZoom" type="range" min="0" max="${NEIGHBORHOOD_MAX_ZOOM}" step=".01" value="0"></div>
        <div class="ex-notes"><p id="snHelp" data-sn="help"></p><details><summary data-sn="about"></summary><p id="snCut"></p><p data-sn="scope"></p><p data-sn="science"></p><p data-sn="epoch"></p><p data-sn="axes"></p><p data-sn="markers"></p>
          <a id="snCredits" data-sn="credits" target="_blank" rel="noopener"></a></details></div>
      </div><aside class="ex-aside sn-aside">
        <label for="snSearch" data-sn="search"></label><input id="snSearch" type="search" autocomplete="off" aria-describedby="snHint">
        <p id="snHint" class="ex-small" data-sn="searchHint"></p><p id="snResults" class="ex-small" aria-live="polite"></p><div id="snList" class="ex-list"></div>
        <section class="ex-inspector" aria-labelledby="snInspectorTitle"><h2 id="snInspectorTitle" data-sn="inspect"></h2><div id="snInspector"></div></section>
      </aside></div>
    </div>`;
  $('snCredits').href=new URL('CREDITS.md',NEIGHBORHOOD_URL);
  const canvas=$('snCanvas'),ctx=canvas.getContext('2d'),list=$('snList'),search=$('snSearch'),inspector=$('snInspector');
  const controller=new AbortController();
  const listen=(target,type,callback,options={})=>target.addEventListener(type,callback,{...options,signal:controller.signal});
  let active=false,disposed=false,seen=true,job=null,loader=null,data=null,status='loading',frame=null,detailRev=0;
  let width=1,height=1,camera=neighborhoodHome(),unit='ly',selected=-1,pivot=-1,detail=null,detailState='idle';
  let visible=0,overlap=0,limited=0,marks=[],origin=null,sunVisible=false,draws=0,duration=0,shown=[],listKey=null;
  let names=new Map(),groupRows=[];

  const known=(id)=>neighborhoodName(id,language());
  const unitName=()=>unit==='ly'?t('lyShort'):'pc';
  const idAt=row=>String(data.ids[row]);
  const nameAt=row=>known(idAt(row))??'Gaia DR3 '+idAt(row);
  function refreshNames(){
    names=new Map();
    if(data)for(const id of NEIGHBORHOOD_KNOWN_IDS){
      const row=neighborhoodIndex(data.ids,id);
      if(row>=0)names.set(row,known(id));
    }
  }
  const vector=row=>data.xyz.subarray(3*row,3*row+3);
  function roundedDistance(row){
    const median=detail?.median??Math.hypot(...vector(row));
    return distanceDisplay(median,detail?.lo??median,detail?.hi??median,unit);
  }
  const approximate=row=>`≈ ${n(roundedDistance(row).value)} ${unitName()}`;
  const labelDistance=d=>`${n(d)} pc · ${n(d*PC_TO_LY)} ${t('lyShort')}`;
  function rowsFor(value) {
    if(!data)return [];
    const key=searchKey(value);
    if(!key) {
      if(groupRows.length>1)return groupRows;
      const near=[...marks].sort((a,b)=>((a.x-width/2)**2+(a.y-height/2)**2)-((b.x-width/2)**2+(b.y-height/2)**2));
      return [...new Set([...names.keys(),...near.slice(0,8).map(m=>m.row)])].slice(0,10);
    }
    const id=/^(?:gaia(?: dr3)?\s+)?([1-9]\d{0,18})$/.exec(key)?.[1];
    if(id) {
      const row=neighborhoodIndex(data.ids,id);
      return row>=0?[row]:[];
    }
    return [...names.keys()].filter(i=>{
      const id=idAt(i);
      const variants=[neighborhoodName(id,'de'),neighborhoodName(id,'en'),...(neighborhoodAnnotation(id)?.aliases??[])];
      return variants.some(value=>value&&searchKey(value).startsWith(key));
    });
  }
  function showList() {
    shown=rowsFor(search.value);
    const focused=list.contains(document.activeElement)?document.activeElement.dataset.snRow:null;
    if(status==='ready')valueOf($('snResults'),search.value.trim()?(shown.length?`${n(shown.length)} ${t('hits')}`:t('missing')):
      groupRows.length>1?`${n(groupRows.length)} · ${t('groups')}`:names.size?t('close'):visible?t('shown'):t('empty'));
    else valueOf($('snResults'),'');
    const key=language()+'|'+selected+'|'+unit+'|'+shown.join(',');
    if(key===listKey)return;
    listKey=key;
    list.replaceChildren(...shown.map(i=>{
      const button=el('button',nameAt(i));
      button.type='button';button.dataset.snRow=String(i);
      button.setAttribute('aria-pressed',String(i===selected));
      return button;
    }));
    if(focused!==null)Array.from(list.children).find(b=>b.dataset.snRow===focused)?.focus({preventScroll:true});
  }
  function showDetail() {
    inspector.replaceChildren();
    $('snCenter').disabled=!data||selected<0;
    if(!data||selected<0) {inspector.append(el('p',t('choose'),'ex-small'));return;}
    const verified=known(idAt(selected));
    const annotation=neighborhoodAnnotation(idAt(selected));
    const estimate=el('p',approximate(selected),'sn-estimate');estimate.id='snDistance';
    inspector.append(el('p',nameAt(selected),'ex-selected'),el('p',t(verified?'verified':'source'),'ex-small'),
      el('p',t('distance'),'ex-small'),estimate);
    const {interval}=roundedDistance(selected);
    if(interval)inspector.append(el('p',`≈ ${interval.map(n).join('–')} ${unitName()}`,'ex-small'));
    inspector.append(el('p',annotation?.spectral?`${t('spectral')} · ${annotation.spectral}`:t('spectralUnknown'),'ex-small'));
    if(!detail) {
      inspector.append(el('p',t(detailState==='error'?'detailFailure':'detailLoading'),'ex-small'));
      if(detailState==='error') {
        const retry=el('button',t('retry'));retry.type='button';retry.dataset.snRetry='';inspector.append(retry);
      }
      return;
    }
    const values=el('dl'), add=(k,v)=>values.append(el('dt',t(k)),el('dd',v));
    add('distance',labelDistance(detail.median));
    const triplet=[detail.lo,detail.median,detail.hi];
    add('interval',triplet.map(n).join(' · ')+' pc');
    const chart=el('div',undefined,'sn-interval');chart.setAttribute('aria-hidden','true');
    const tick=el('span');
    tick.style.left=((detail.median-detail.lo)/(detail.hi-detail.lo||1)*100)+'%';chart.append(tick);
    const chartLabel=el('p',t('range'),'ex-small');
    const details=el('details');
    details.append(el('summary',t('quality')),values,chart,chartLabel,el('p',`Gaia DR3 ${detail.id}`,'ex-small'));
    const facts=el('dl');
    facts.append(el('dt',t('direction')),el('dd',`RA ${n(detail.ra)}° · Dec ${n(detail.dec)}° · J${NEIGHBORHOOD_EPOCH}.0 (TCB)`),
      el('dt',t('derived')),el('dd',detail.xyz.map((v,i)=>'XYZ'[i]+' '+n(v)).join(' · ')+' pc'));
    details.append(facts,el('p',`π ${n(detail.parallax)} ± ${n(detail.parallaxError)} mas · RUWE ${n(detail.ruwe)} · G ${n(detail.g)} mag`,'ex-small'));
    const source=el('a',t('credits'));source.href=new URL('CREDITS.md',NEIGHBORHOOD_URL);source.target='_blank';source.rel='noopener';
    details.append(source);
    if(verified) {
      const star=el('a','ESA Gaia');star.href=GAIA_NAMES_SOURCE;star.target='_blank';star.rel='noopener';details.append(' · ',star);
      if(annotation?.aliases)details.append(el('p',`${t('aliases')} · ${annotation.aliases.join(' · ')}`,'ex-small'));
      if(annotation?.reference) {
        const ref=el('a',t('spectral'));ref.href=annotation.reference;ref.target='_blank';ref.rel='noopener';details.append(' · ',ref);
      }
    }
    const go=el('button',t('go'));go.type='button';go.dataset.snSky='';
    inspector.append(go,details);
  }
  function summary() {
    const line=data?`${n(data.ids.length)} ${t('count')} · r50 ≤ ${n(NEIGHBORHOOD_RADIUS)} pc · ${n(visible)} ${t('visible')} · ${n(marks.length)} ${t('drawn')}`:'';
    valueOf($('snCount'),line);
    valueOf($('snStatus'),status==='loading'?t('loading'):status==='error'?t('failure'):'');
    valueOf($('snHidden'),data&&(overlap||limited)?`${n(overlap)} ${t('overlap')} · ${n(limited)} ${t('limited')}`:'');
    $('snRetry').hidden=status!=='error';
  }
  function localize() {
    for(const item of root.querySelectorAll('[data-sn]')) item.textContent=t(item.dataset.sn);
    $('snIn').setAttribute('aria-label',t('in'));$('snOut').setAttribute('aria-label',t('out'));
    canvas.setAttribute('aria-label',t('title')+' · 3D');
    refreshNames();
    valueOf($('snCut'),`r₅₀ ≤ ${n(NEIGHBORHOOD_RADIUS)} pc · Gaia G ≤ ${n(NEIGHBORHOOD_MAX_G)} mag`);
    showList();showDetail();summary();invalidate();
  }
  function invalidate() {
    if(active&&seen&&!document.hidden&&frame===null)frame=requestAnimationFrame(draw);
  }
  function draw() {
    frame=null;
    if(!active||!seen||document.hidden||!ctx)return;
    const began=performance.now();
    const drawn=paintNeighborhood(ctx,{width,height,camera,unit,data,selected,names,connection:$('snConnection').checked,
      labels:{sun:t('sun'),number:n,unit:unitName(),scale:t('scale'),selected:selected>=0?nameAt(selected):'',
        connection:selected>=0?approximate(selected):''}});
    ({marks,visible,overlap,limited,origin,inView:sunVisible}=drawn);
    const {longitude,latitude}=neighborhoodDirection(camera);
    valueOf($('snAxes'),`${t('pivot')} · ${pivot>=0?nameAt(pivot):t('sun')}  |  ${t('looking')} l ${n(Math.round(longitude)%360)}°, b ${n(Math.round(latitude)||0)}°${sunVisible?'':' · '+t('outside')}`);
    $('snZoom').value=String(camera.zoom);
    $('snOut').disabled=camera.zoom<=0;
    $('snIn').disabled=camera.zoom>=NEIGHBORHOOD_MAX_ZOOM;
    summary();showList();draws++;duration=performance.now()-began;
  }
  function resize() {
    const rect=canvas.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    width=rect.width;height=rect.height;
    const dpr=Math.min(devicePixelRatio||1,1.65),w=Math.round(width*dpr),h=Math.round(height*dpr);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    ctx?.setTransform(w/width,0,0,h/height,0,0);invalidate();
  }
  function center() {
    if(!data||selected<0)return;
    pivot=selected;camera=neighborhoodFocus(camera,vector(selected));invalidate();
  }
  async function choose(row,focusMap=true) {
    if(!data||!active||!loader)return;
    const rev=++detailRev;
    loader.changeView();selected=row;detail=null;detailState='loading';
    if(focusMap)center();
    showDetail();showList();invalidate();
    try {
      const found=await neighborhoodDetails(data,loader,row);
      if(rev!==detailRev||!active)return;
      detail=found;detailState='ready';
    } catch {
      if(rev!==detailRev||!active)return;
      detailState='error';
    }
    showDetail();invalidate();
  }
  async function start() {
    if(!active||job)return;
    const own=new AbortController();job=own;status='loading';summary();
    try {
      const loaded=data??await loadNeighborhood(own.signal);
      if(own.signal.aborted)return;
      data=loaded;loader=neighborhoodLoader(data.manifest);status='ready';refreshNames();
      if(selected>=0&&!detail)void choose(selected,false);
      summary();showList();showDetail();invalidate();
    } catch {
      if(own.signal.aborted)return;
      status='error';job=null;summary();
    }
  }
  function stop() {
    job?.abort();job=null;
    detailRev++;loader?.dispose();loader=null;
    if(frame!==null)cancelAnimationFrame(frame);
    frame=null;cancelOrbit();
  }
  function setActive(value) {
    if(disposed||active===value)return;
    active=value;
    if(value) {resize();void start();} else stop();
  }
  const setCamera=next=>{camera=next;invalidate();};
  const fit=()=>{pivot=-1;setCamera(neighborhoodHome());};
  const centerSun=()=>{pivot=-1;setCamera({...camera,focus:[0,0,0]});};
  const zoomTo=zoom=>setCamera(neighborhoodZoom(camera,zoom));
  const zoomBy=delta=>zoomTo(camera.zoom+delta);
  const pointers=new Map();
  let moved=false,gesture=null;
  function resetOrbit(){
    const [a,b]=pointers.values();
    gesture=a?{camera,point:a,separation:b?Math.hypot(a[0]-b[0],a[1]-b[1]):0}:null;
  }
  function cancelOrbit(){
    const captured=[...pointers.keys()];
    pointers.clear();resetOrbit();canvas.dataset.interacting='false';
    for(const id of captured)if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
  }
  listen(canvas,'pointerdown',event=>{
    if(event.button!==0||pointers.size>=2)return;
    canvas.focus({preventScroll:true});canvas.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId,[event.clientX,event.clientY]);moved=pointers.size>1;
    resetOrbit();canvas.dataset.interacting='true';
  });
  listen(canvas,'pointermove',event=>{
    if(!pointers.has(event.pointerId)||!gesture)return;
    pointers.set(event.pointerId,[event.clientX,event.clientY]);
    const [a,b]=pointers.values();
    if(b){
      const separation=Math.hypot(a[0]-b[0],a[1]-b[1]);
      setCamera(neighborhoodZoom(gesture.camera,gesture.camera.zoom+Math.log10(Math.max(1,separation)/Math.max(1,gesture.separation))));
    }else{
      const dx=a[0]-gesture.point[0],dy=a[1]-gesture.point[1];
      moved ||= Math.hypot(dx,dy)>4;
      if(moved)setCamera(neighborhoodRotate(gesture.camera,dx,dy));
    }
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture'])listen(canvas,type,event=>{
    if(!pointers.has(event.pointerId))return;
    if(type==='pointerup'&&!moved&&pointers.size===1){
      const {left,top}=canvas.getBoundingClientRect(),x=event.clientX-left,y=event.clientY-top;
      if(sunVisible&&Math.hypot(x-origin[0],y-origin[1])<=8)centerSun();
      else {
        const mark=neighborhoodHit(marks,x,y);
        if(mark){groupRows=mark.members;search.value='';void choose(mark.row,false);}
      }
    }
    pointers.delete(event.pointerId);resetOrbit();
    if(!pointers.size)canvas.dataset.interacting='false';
  });
  listen(canvas,'wheel',event=>{
    if(document.activeElement!==canvas)return;
    event.preventDefault();
    const scale=event.deltaMode===1?16:event.deltaMode===2?height:1;
    zoomBy(-Math.max(-.4,Math.min(.4,event.deltaY*scale*.001)));
  },{passive:false});
  const arrows={ArrowLeft:[-36,0],ArrowRight:[36,0],ArrowUp:[0,-36],ArrowDown:[0,36]};
  listen(canvas,'keydown',event=>{
    if(Object.hasOwn(arrows,event.key)){
      event.preventDefault();setCamera(neighborhoodRotate(camera,...arrows[event.key]));
    }else if(['+','=','-','Home','Escape'].includes(event.key)){
      event.preventDefault();
      if(event.key==='Home')fit();
      else if(event.key==='Escape')$('snHome').focus();
      else zoomBy(event.key==='-'?-.25:.25);
    }
  });
  listen($('snIn'),'click',()=>zoomBy(.25));listen($('snOut'),'click',()=>zoomBy(-.25));
  listen($('snZoom'),'input',()=>zoomTo(Number($('snZoom').value)));
  listen($('snHome'),'click',fit);listen($('snCenter'),'click',center);listen($('snRetry'),'click',()=>void start());
  listen($('snSun'),'click',centerSun);
  listen($('snUnit'),'change',()=>{unit=$('snUnit').value;showDetail();showList();invalidate();});
  listen($('snConnection'),'change',invalidate);
  listen(search,'input',()=>{groupRows=[];showList();});
  listen(search,'keydown',event=>{if(event.key==='Enter'&&shown.length===1){event.preventDefault();void choose(shown[0]);}});
  listen(list,'click',event=>{const row=event.target.closest('[data-sn-row]')?.dataset.snRow;if(row!==undefined)void choose(Number(row),groupRows.length<2);});
  listen(inspector,'click',event=>{
    if(event.target.closest('[data-sn-retry]'))void choose(selected,false);
    if(event.target.closest('[data-sn-sky]')&&detail)onSky(detail);
  });
  listen(document,'visibilitychange',()=>{
    if(document.hidden&&frame!==null){cancelAnimationFrame(frame);frame=null;}
    else invalidate();
  });
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);
  const intersection=new IntersectionObserver(entries=>{
    seen=entries[0].isIntersecting;
    if(seen)invalidate();else if(frame!==null){cancelAnimationFrame(frame);frame=null;}
  });
  intersection.observe(canvas);
  const unsubscribe=onLanguageChange(localize);
  localize();
  return {setActive,inspect:()=>({active,status,unit,origin,sunVisible,pivot,camera:{...camera,focus:[...camera.focus]},total:data?.ids.length??0,visible,overlap,limited,markers:marks.length,
    sample:data?marks.slice(0,12).map(({row,x,y,depth,members})=>({id:idAt(row),x,y,depth,members:members.map(idAt)})):[],
    overlapSample:data?marks.filter(m=>m.members.length>1&&m.x>20&&m.x<width-20&&m.y>50&&m.y<height-40&&
      (!sunVisible||Math.hypot(m.x-origin[0],m.y-origin[1])>8)).slice(0,4)
      .map(({row,x,y})=>({id:idAt(row),x,y,members:neighborhoodHit(marks,x,y).members.map(idAt)})):[],
    selected:selected>=0?idAt(selected):null,detailState,
    positionBytes:data?data.xyz.byteLength+data.ids.byteLength+data.magnitude.byteLength+data.order.byteLength:0,canvasBytes:canvas.width*canvas.height*4,
    draws,duration,scheduled:frame!==null,requests:loader?.active??0,cacheBytes:loader?.cache.byteLength??0}),
    dispose(){if(disposed)return;setActive(false);disposed=true;controller.abort();resizeObserver.disconnect();intersection.disconnect();unsubscribe();data=null;marks=[];root.replaceChildren();},
  };
}
