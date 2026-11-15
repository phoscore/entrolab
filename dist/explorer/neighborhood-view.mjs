import {language,onLanguageChange} from '../i18n.mjs';
import {mapGestures} from './gestures.mjs';
import {searchKey} from './foundation/access.mjs';
import {gaiaKnownStarName,GAIA_KNOWN_STAR_IDS,GAIA_NAMES_SOURCE} from './identities.mjs';
import {loadNeighborhood,neighborhoodLoader,neighborhoodDetails,NEIGHBORHOOD_URL} from './neighborhood-data.mjs';
import {NEIGHBORHOOD_EPOCH,NEIGHBORHOOD_RADIUS,NEIGHBORHOOD_MAX_G,PC_TO_LY,neighborhoodIndex,projectNeighborhood} from './foundation/neighborhood-format.mjs';
import {NEIGHBORHOOD_FRAME,paintNeighborhood} from './neighborhood-paint.mjs';

export const NEIGHBORHOOD_MAX_ZOOM=2.4;
const home=()=>({x:0,y:0,zoom:0});
const valueOf=(el,value)=>{if(el.textContent!==value)el.textContent=value;};
const formatter=['de-DE','en-GB'].map(locale=>new Intl.NumberFormat(locale,{maximumSignificantDigits:8}));
const copy={
  title:['Sonnenumgebung','Stellar Neighborhood'],
  origin:['Sonne im Ursprung','Sun at the origin'],
  intro:['2D-Projektion geschätzter Positionen um die Sonne in galaktischen 3D-Koordinaten.','2D projection of estimated positions around the Sun in Galactic 3D coordinates.'],
  xy:['Galaktische Ebene (X/Y)','Galactic plane (X/Y)'],
  xz:['Seitenansicht (X/Z)','Side view (X/Z)'],
  axesXy:['Rechts zum galaktischen Zentrum (+X) · oben Richtung l = 90° (+Y)','Right toward the Galactic centre (+X) · up toward l = 90° (+Y)'],
  axesXz:['Rechts zum galaktischen Zentrum (+X) · oben zum galaktischen Nordpol (+Z)','Right toward the Galactic centre (+X) · up toward the north Galactic pole (+Z)'],
  axesHidden:['Die dritte Achse bleibt im Inspector sichtbar.','The third axis is available in the inspector.'],
  in:['Hineinzoomen','Zoom in'],
  out:['Herauszoomen','Zoom out'],
  fit:['Zur Sonne','Back to the Sun'],
  center:['Auswahl zentrieren','Centre selection'],
  zoom:['Zoom','Zoom'],
  projection:['Projektion','Projection'],
  units:['Ringmaße','Ring units'],
  pc:['Parsec (pc)','Parsecs (pc)'],
  ly:['Lichtjahre (Lj)','Light-years (ly)'],
  lyShort:['Lj','ly'],
  help:['Ziehen oder Pfeiltasten verschieben. +/- oder zwei Finger zoomen. Fokussiere die Karte für das Mausrad. Home setzt zurück, Escape führt zur Steuerung.','Drag or use the arrow keys to pan. Use +/- or two fingers to zoom. Focus the map for wheel zoom. Home resets, Escape returns to the controls.'],
  scope:['Die Auswahl folgt dem geschätzten Abstand und Qualitätsfiltern. Die Umgebung enthält weitere Sterne. Punktsymbole sind vergrößert.','Estimated distance and quality filters define the selection. Other stars are present in the neighborhood. Point symbols are enlarged.'],
  about:['Was steckt in dieser Karte?','What is in this map?'],
  science:['Gaia-DR3-Winkel von J2016.0 (TCB). Richtungsvektoren sind in galaktische Achsen gedreht und mit geometrischen Bailer-Jones-Entfernungen skaliert. Die Karte ist statisch. Winkelunsicherheiten und systematische Distanzfehler sind in der Linie nicht enthalten.','Gaia DR3 directions at J2016.0 (TCB). Direction vectors are rotated to Galactic axes and scaled by Bailer-Jones geometric distances. The map is static. The line excludes angular uncertainty and systematic distance errors.'],
  how:['Die Ringe zeigen den Abstand in der gewählten Ebene. Der Inspector nennt den geschätzten 3D-Abstand und beide Grenzen des 68,27-%-Posteriorintervalls.','Rings show separation in the chosen plane. The inspector gives estimated 3D distance and both bounds of the 68.27% posterior interval.'],
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
  projected:['Abstand in der gewählten Ebene','Distance in the chosen plane'],
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
        <div class="ex-controls sn-planes" role="group"><button id="snXY" type="button" data-sn="xy" aria-pressed="true"></button>
          <button id="snXZ" type="button" data-sn="xz" aria-pressed="false"></button></div>
      </header>
      <div class="ex-layout sn-layout"><div class="ex-left">
        <div class="sn-toolbar"><div class="ex-controls"><button id="snOut" type="button">−</button><button id="snIn" type="button">+</button>
          <button id="snHome" type="button" data-sn="fit"></button><button id="snCenter" type="button" data-sn="center" disabled></button></div>
          <label><span data-sn="units"></span><select id="snUnit"><option value="pc" data-sn="pc"></option><option value="ly" data-sn="ly"></option></select></label></div>
        <div class="ex-map sn-map"><canvas id="snCanvas" tabindex="0" aria-describedby="snAxes snHelp snHow"></canvas></div>
        <div class="sn-caption"><p id="snAxes"></p><p id="snHow" data-sn="how"></p><p id="snCount"></p><p id="snStatus" role="status"></p>
          <button type="button" id="snRetry" data-sn="retry" hidden></button></div>
        <div class="ex-zoom"><label for="snZoom" data-sn="zoom"></label><input id="snZoom" type="range" min="0" max="${NEIGHBORHOOD_MAX_ZOOM}" step=".01" value="0"></div>
        <div class="ex-notes"><p id="snHelp" data-sn="help"></p><details><summary data-sn="about"></summary><p id="snCut"></p><p data-sn="scope"></p><p data-sn="science"></p>
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
  let width=1,height=1,camera=home(),plane='xy',unit='pc',selected=-1,detail=null,detailState='idle';
  let visible=0,marks=[],origin=[0,0],draws=0,duration=0,shown=[],listKey=null;

  const known=(id)=>gaiaKnownStarName(id,language());
  const unitName=()=>unit==='ly'?t('lyShort'):'pc';
  const idAt=row=>String(data.ids[row]);
  const nameAt=row=>known(idAt(row))??'Gaia DR3 '+idAt(row);
  const namedRows=()=>GAIA_KNOWN_STAR_IDS.map(id=>neighborhoodIndex(data.ids,id)).filter(i=>i>=0);
  const labelDistance=d=>`${n(d)} pc · ${n(d*PC_TO_LY)} ${t('lyShort')}`;
  function rowsFor(value) {
    if(!data)return [];
    const key=searchKey(value);
    if(!key) {
      const near=[...marks].sort((a,b)=>((a.x-width/2)**2+(a.y-height/2)**2)-((b.x-width/2)**2+(b.y-height/2)**2));
      return [...new Set([...namedRows(),...near.slice(0,8).map(m=>m.row)])].slice(0,10);
    }
    const id=/^(?:gaia(?: dr3)?\s+)?([1-9]\d{0,18})$/.exec(key)?.[1];
    if(id) {
      const row=neighborhoodIndex(data.ids,id);
      return row>=0?[row]:[];
    }
    return namedRows().filter(i=>['de','en'].some(l=>searchKey(gaiaKnownStarName(idAt(i),l)).startsWith(key)));
  }
  function showList() {
    shown=rowsFor(search.value);
    const focused=list.contains(document.activeElement)?document.activeElement.dataset.snRow:null;
    if(status==='ready')valueOf($('snResults'),search.value.trim()?(shown.length?`${n(shown.length)} ${t('hits')}`:t('missing')):
      visible?(namedRows().length?t('close'):t('shown')):t('empty'));
    else valueOf($('snResults'),'');
    const key=language()+'|'+selected+'|'+shown.join(',');
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
    inspector.append(el('p',nameAt(selected),'ex-selected'),el('p',t(verified?'verified':'source'),'ex-small'));
    if(!detail) {
      inspector.append(el('p',t(detailState==='error'?'detailFailure':'detailLoading'),'ex-small'));
      if(detailState==='error') {
        const retry=el('button',t('retry'));retry.type='button';retry.dataset.snRetry='';inspector.append(retry);
      }
      return;
    }
    const values=el('dl'), add=(k,v)=>values.append(el('dt',t(k)),el('dd',v));
    add('distance',labelDistance(detail.median));
    add('projected',labelDistance(projectNeighborhood(detail.xyz,plane).radius));
    const triplet=[detail.lo,detail.median,detail.hi];
    add('interval',triplet.map(n).join(' · ')+' pc');
    const chart=el('div',undefined,'sn-interval');chart.setAttribute('aria-hidden','true');
    const tick=el('span');
    tick.style.left=((detail.median-detail.lo)/(detail.hi-detail.lo||1)*100)+'%';chart.append(tick);
    const chartLabel=el('p',t('range'),'ex-small');
    const details=el('details');
    details.append(el('summary',t('quality')),el('p',`Gaia DR3 ${detail.id}`,'ex-small'));
    const facts=el('dl');
    facts.append(el('dt',t('direction')),el('dd',`RA ${n(detail.ra)}° · Dec ${n(detail.dec)}° · J${NEIGHBORHOOD_EPOCH}.0 (TCB)`),
      el('dt',t('derived')),el('dd',detail.xyz.map((v,i)=>'XYZ'[i]+' '+n(v)).join(' · ')+' pc'));
    details.append(facts,el('p',`π ${n(detail.parallax)} ± ${n(detail.parallaxError)} mas · RUWE ${n(detail.ruwe)} · G ${n(detail.g)} mag`,'ex-small'));
    const source=el('a',t('credits'));source.href=new URL('CREDITS.md',NEIGHBORHOOD_URL);source.target='_blank';source.rel='noopener';
    details.append(source);
    if(verified) {
      const star=el('a','ESA Gaia');star.href=GAIA_NAMES_SOURCE;star.target='_blank';star.rel='noopener';details.append(' · ',star);
    }
    const go=el('button',t('go'));go.type='button';go.dataset.snSky='';
    inspector.append(values,chart,chartLabel,go,details);
  }
  function summary() {
    const line=data?`${n(data.ids.length)} ${t('count')} · r50 ≤ ${n(NEIGHBORHOOD_RADIUS)} pc · ${n(visible)} ${t('visible')} · ${n(marks.length)} ${t('drawn')}`:'';
    valueOf($('snCount'),line);
    valueOf($('snStatus'),status==='loading'?t('loading'):status==='error'?t('failure'):'');
    $('snRetry').hidden=status!=='error';
  }
  function localize() {
    for(const item of root.querySelectorAll('[data-sn]')) item.textContent=t(item.dataset.sn);
    root.querySelector('.sn-planes').setAttribute('aria-label',t('projection'));
    $('snIn').setAttribute('aria-label',t('in'));$('snOut').setAttribute('aria-label',t('out'));
    canvas.setAttribute('aria-label',t('title')+' · '+t(plane));
    valueOf($('snAxes'),t(plane==='xz'?'axesXz':'axesXy')+' '+t('axesHidden'));
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
    const drawn=paintNeighborhood(ctx,{width,height,camera,plane,unit,data,detail,labels:{sun:t('sun'),number:n,unit:unitName()}});
    ({marks,visible,origin}=drawn);
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
    const position=detail?.xyz??data.xyz.subarray(selected*3,selected*3+3);
    const [x,y]=projectNeighborhood(position,plane).point;
    camera={x,y,zoom:Math.max(camera.zoom,.75)};invalidate();
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
      data=loaded;loader=neighborhoodLoader(data.manifest);status='ready';
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
    frame=null;gestures.cancel();
  }
  function setActive(value) {
    if(disposed||active===value)return;
    active=value;
    if(value) {resize();void start();} else stop();
  }
  function switchPlane(next) {
    if(plane===next)return;
    plane=next;
    $('snXY').setAttribute('aria-pressed',String(next==='xy'));$('snXZ').setAttribute('aria-pressed',String(next==='xz'));
    if(selected>=0)center();else camera=home();
    localize();
  }
  const fit=()=>{camera=home();invalidate();};
  const gestures=mapGestures(canvas,listen,{
    getCamera:()=>camera,setCamera(next){camera=next;invalidate();},size:()=>[width,height],frame:NEIGHBORHOOD_FRAME,maxZoom:NEIGHBORHOOD_MAX_ZOOM,
    fit,exit(){$('snHome').focus();},
    tap(x,y){
      let closest=null,delta=12**2;
      for(const mark of marks) {
        const distance=(mark.x-x)**2+(mark.y-y)**2;
        if(distance<delta){delta=distance;closest=mark;}
      }
      if(closest)void choose(closest.row);
    },
  });
  listen($('snIn'),'click',()=>gestures.zoomBy(.25));listen($('snOut'),'click',()=>gestures.zoomBy(-.25));
  listen($('snZoom'),'input',()=>gestures.zoomTo(Number($('snZoom').value)));
  listen($('snHome'),'click',fit);listen($('snCenter'),'click',center);listen($('snRetry'),'click',()=>void start());
  listen($('snXY'),'click',()=>switchPlane('xy'));listen($('snXZ'),'click',()=>switchPlane('xz'));
  listen($('snUnit'),'change',()=>{unit=$('snUnit').value;invalidate();});
  listen(search,'input',showList);
  listen(search,'keydown',event=>{if(event.key==='Enter'&&shown.length===1){event.preventDefault();void choose(shown[0]);}});
  listen(list,'click',event=>{const row=event.target.closest('[data-sn-row]')?.dataset.snRow;if(row!==undefined)void choose(Number(row));});
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
  return {setActive,inspect:()=>({active,status,plane,unit,origin,camera:{...camera},total:data?.ids.length??0,visible,markers:marks.length,
    sample:data?marks.slice(0,12).map(({row,x,y})=>({id:idAt(row),x,y})):[],selected:selected>=0?idAt(selected):null,detailState,
    draws,duration,scheduled:frame!==null,requests:loader?.active??0,cacheBytes:loader?.cache.byteLength??0}),
    dispose(){if(disposed)return;setActive(false);disposed=true;controller.abort();resizeObserver.disconnect();intersection.disconnect();unsubscribe();data=null;marks=[];root.replaceChildren();},
  };
}
