import {ByteLru} from './foundation/access.mjs';
import {ATLAS_RELEASE,MASKS,DENSITY_SIDE,acceptsMask} from './foundation/atlas-format.mjs';
import {ATLAS_URL,RESULT_LIMIT,atlasPrefix,loadAtlasManifest,makeAtlasLoader,loadDensity,planAtlas,loadAtlasTiles,searchAtlas,atlasDetail} from './atlas-data.mjs';
import {densityIndex,densityCounts,densityBitmap,paintPoints,paintSelected} from './atlas-paint.mjs';

export const atlasControls = `
  <div class="ex-atlas-controls">
    <label><input type="checkbox" id="exAtlasEnabled" checked><span data-ex="atlasLayer"></span></label>
    <label class="ex-atlas-filter"><span data-ex="atlasFilter"></span><select id="exAtlasFilter">
      <option value="all" data-ex="atlasAll"></option>
      <option value="position" data-ex="atlasPositionOnly"></option>
      <option value="parallax" data-ex="atlasParallax"></option>
    </select></label>
  </div>`;

export const atlasSummary = `
  <div class="ex-atlas-summary">
    <div id="exAtlasCounts"></div>
    <div id="exAtlasStatus" role="status"></div>
    <button type="button" id="exAtlasRetry" data-ex="atlasRetry" hidden></button>
  </div>`;

export const atlasBrowse = `
  <section id="exAtlasBrowse" class="ex-atlas-browse" aria-labelledby="exAtlasBrowseTitle" hidden>
    <h3 id="exAtlasBrowseTitle"></h3><p id="exAtlasBrowseStatus" class="ex-small" aria-live="polite"></p>
    <div id="exAtlasResults" class="ex-list"></div>
  </section>`;

const CACHE = {
  tiles:[768*1024,96], search:[128*1024,12], detail:[320*1024,20],
};
const labelFor = id => 'Gaia DR3 '+id;
const setText = (el,text) => {if (el.textContent!==text) el.textContent=text;};

export function mountAtlas(root,{listen,t,n,invalidate,onSelect,onInspector,onCenter,project,curatedIds}) {
  const $ = id => root.querySelector('#'+id);
  const checkbox=$('exAtlasEnabled'), filterInput=$('exAtlasFilter'), browse=$('exAtlasBrowse');
  const browseList=$('exAtlasResults'), retry=$('exAtlasRetry');
  $('exAtlasCredits').href=new URL('CREDITS.md',ATLAS_URL);
  $('exAtlasManifest').href=new URL('manifest.json',ATLAS_URL);
  let active=false, session=null, manifest=null, loaders=null, view=null;
  let index=null, bitmap=null, density=null, plan=null, tiles=[], markers=[], counts=null, status='loading';
  let regionTimer=null, searchTimer=null, regionRev=0, searchRev=0, detailRev=0;
  let query='', matches=[], matchTotal=0, searchState='idle', displayed=[], listKey='';
  let selection=null;
  const filter=()=>filterInput.value;
  const current=()=>active&&checkbox.checked&&session&&!session.signal.aborted;
  const draw=()=>invalidate();

  function rebuildDensity() {
    index=density?densityIndex(density,filter()):null;
    bitmap=index?densityBitmap(index):null;
  }

  function stop() {
    session?.abort();session=null;
    clearTimeout(regionTimer);clearTimeout(searchTimer);regionTimer=searchTimer=null;
    regionRev++;searchRev++;detailRev++;
    if (loaders) for (const loader of Object.values(loaders)) loader.dispose();
    loaders=null;index=bitmap=density=null;plan=null;tiles=[];markers=[];counts=null;
    matches=[];matchTotal=0;searchState='idle';displayed=[];listKey='';
    browseList.replaceChildren();browse.hidden=true;
    status=checkbox.checked?'loading':'disabled';
  }

  async function start() {
    if (!active||!checkbox.checked) return;
    const own=new AbortController();session=own;status='loading';draw();
    try {
      const ready=manifest??await loadAtlasManifest(own.signal);
      if (own.signal.aborted) return;
      manifest=ready;
      loaders=Object.fromEntries(Object.entries(CACHE).map(([channel,[bytes,entries]])=>[channel,makeAtlasLoader(manifest,{
        cache:new ByteLru(bytes,entries),parallel:channel==='tiles'?2:1,maxQueued:channel==='tiles'?14:3,
      })]));
      const loaded=await loadDensity(manifest,loaders.tiles);
      if (own.signal.aborted) return;
      density=loaded;rebuildDensity();
      refresh(); search(query);
      if (selection?.state==='loading') void select(selection.ref);
    } catch {
      if (own.signal.aborted) return;
      status='error';
      if (atlasPrefix(query)) searchState='error';
      updateBrowse();summary();draw();
    }
  }

  function refresh() {
    if (!current()||!density||!view) return;
    const next=planAtlas(manifest,view.viewport,view.zoom,view.width);
    if (plan?.key===next.key) return;
    const rev=++regionRev;
    clearTimeout(regionTimer);regionTimer=null;
    loaders.tiles.changeView();
    plan=next;tiles=[];markers=[];counts=null;
    status=next.mode==='density'?'density':'loading';
    if (next.mode==='points') {
      // Request a new tile set once the camera settles on its footprint.
      regionTimer=setTimeout(async()=>{
        regionTimer=null;
        try {
          const result=await loadAtlasTiles(manifest,loaders.tiles,next);
          if (rev!==regionRev||!current()) return;
          tiles=result;status='points';draw();
        } catch {
          if (rev!==regionRev||!current()) return;
          status='error';draw();
        }
      },55);
    }
    draw();
  }

  function search(value) {
    query=value;
    const rev=++searchRev;
    clearTimeout(searchTimer);searchTimer=null;
    loaders?.search.changeView();
    const prefix=atlasPrefix(value);
    matches=[];matchTotal=0;
    searchState=prefix&&current()?'loading':'idle';
    updateBrowse();
    if (!prefix||!current()||!loaders) return;
    searchTimer=setTimeout(async()=>{
      searchTimer=null;
      try {
        const result=await searchAtlas(manifest,loaders.search,value,filter());
        if (rev!==searchRev||!current()) return;
        matches=result.matches;matchTotal=result.total;searchState='ready';
      } catch {
        if (rev!==searchRev||!current()) return;
        searchState='error';
      }
      updateBrowse();summary();
    },85);
  }

  async function select(ref) {
    const rev=++detailRev;
    loaders?.detail.changeView();
    selection={ref,state:'loading',detail:null};
    onInspector();updateBrowse();draw();
    if (!current()||!loaders) return;
    const signal=session.signal;
    try {
      const detail=await atlasDetail(manifest,loaders.detail,ref,signal);
      if (rev!==detailRev||!current()) return;
      selection={ref,state:'ready',detail};
      onInspector();onCenter(detail);draw();
    } catch {
      if (rev!==detailRev||!current()) return;
      selection={ref,state:'error',detail:null};
      onInspector();draw();
    }
  }

  function clearSelection() {
    if (!selection) return;
    detailRev++;loaders?.detail.changeView();selection=null;updateBrowse();
  }

  function updateBrowse() {
    const numeric=Boolean(atlasPrefix(query));
    const near=!query.trim()&&status==='points'&&markers.length>0;
    browse.hidden=!checkbox.checked||!active||!(numeric||near);
    if (browse.hidden) {
      displayed=[];listKey='';
      if (browseList.childElementCount) browseList.replaceChildren();
      return;
    }
    setText($('exAtlasBrowseTitle'),t(numeric?'atlasSearchTitle':'atlasNearby'));
    if (numeric) {
      const key=searchState==='loading'?'loadingSearch':searchState==='error'?'atlasError':matchTotal?'atlasMatches':'atlasNoMatches';
      setText($('exAtlasBrowseStatus'),matchTotal?`${n(matchTotal)} ${t(key)}${matchTotal>RESULT_LIMIT?' · '+t('atlasPrefixLimit'):''}`:t(key));
      displayed=matches;
    } else {
      const {width,height}=view;
      displayed=[...markers].sort((a,b)=>((a.x-width/2)**2+(a.y-height/2)**2)-((b.x-width/2)**2+(b.y-height/2)**2)).slice(0,12);
      setText($('exAtlasBrowseStatus'),t('atlasNearbyHelp'));
    }
    const key=displayed.map(p=>p.id+Number(p.id===selection?.ref.id)).join(',');
    if (key===listKey) return;
    const focused=browseList.contains(document.activeElement)?document.activeElement.dataset.gaia:null;
    listKey=key;
    browseList.replaceChildren(...displayed.map(p=>{
      const button=document.createElement('button');
      button.type='button';button.dataset.gaia=p.id;button.textContent=labelFor(p.id);
      button.setAttribute('aria-pressed',String(selection?.ref.id===p.id));return button;
    }));
    if (focused) Array.from(browseList.children).find(el=>el.dataset.gaia===focused)?.focus({preventScroll:true});
  }

  function summary() {
    const all=manifest?.counts.sources, byMask=manifest?.counts.byMask;
    const filtered=byMask?MASKS.filter(m=>acceptsMask(filter(),m)).reduce((sum,m)=>sum+byMask[m],0):0;
    const shown=!checkbox.checked?0:filtered;
    const total=all===undefined?'':`${n(all)} ${t('atlasTotal')} · ${n(shown)} ${t('atlasSelected')}`;
    const displayedStats=status==='density'&&counts?` · ${n(counts.cells)} ${t('atlasCellCount')} (${n(counts.visible)} ${t('atlasCellSources')})`:
      status==='points'&&counts?` · ${n(counts.visible)} ${t('atlasVisible')} · ${n(markers.length)} ${t('atlasDrawn')}`:'';
    setText($('exAtlasCounts'),total+displayedStats);
    const state=status==='error'?'atlasError':status==='loading'?'atlasLoading':status==='disabled'?'atlasDisabled':
      counts?.catalog===0?'atlasEmpty':counts?.visible===0?'atlasFiltered':status==='density'?'atlasDensity':'atlasPoints';
    setText($('exAtlasStatus'),t(state));
    retry.hidden=status!=='error'&&searchState!=='error'&&selection?.state!=='error';
    filterInput.disabled=!checkbox.checked;
  }

  function paint(ctx,frame) {
    markers=[];counts=null;
    if (checkbox.checked && status==='points') {
      const result=paintPoints(ctx,tiles,frame,filter(),curatedIds());
      markers=result.markers;counts=result;
    } else if (checkbox.checked && bitmap && view && (status==='density'||status==='loading')) {
      const {left,top,right,bottom}=frame;
      ctx.imageSmoothingEnabled=true;
      ctx.globalAlpha=status==='loading'?.58:1;
      ctx.drawImage(bitmap,left,top,right-left,bottom-top);
      ctx.globalAlpha=1;
      counts=densityCounts(index,view.viewport);
    }
    summary();updateBrowse();
  }

  function renderDetail(inspector) {
    if (!selection) return;
    const {ref,detail,state}=selection;
    const el=(tag,value,cls)=>{
      const node=document.createElement(tag);
      node.textContent=value;if (cls) node.className=cls;
      return node;
    };
    inspector.append(el('p',labelFor(ref.id),'ex-selected'),el('p',`${t('source')} · ${ATLAS_RELEASE}`,'ex-small'));
    if (!detail) {
      inspector.append(el('p',t(state==='error'?'atlasError':'atlasDetailLoading')));
      if (state==='error') {
        const button=el('button',t('atlasRetry'));
        button.type='button';button.dataset.atlasRetryDetail='';inspector.append(button);
      }
      return;
    }
    const dl=document.createElement('dl');
    const add=(label,value)=>dl.append(el('dt',label),el('dd',value));
    const format=(val,unit)=>val===null?t('unknown'):n(val)+(unit?' '+unit:'');
    add(t('direction'),`RA ${n(detail.ra)}° · Dec ${n(detail.dec)}°`);
    add(t('frame'),'ICRS · J2016.0 (TCB)');
    add(t('atlasMagnitude'),format(detail.g,'mag'));
    const parallax=format(detail.parallax,'mas');
    add(t('parallax'),detail.parallaxError===null?parallax:`${parallax} · σ ${format(detail.parallaxError,'mas')}`);
    add(t('atlasRaError'),format(detail.raError,'mas'));
    add(t('atlasDecError'),format(detail.decError,'mas'));
    add(t('quality'),`astrometric_params_solved ${detail.mask} · RUWE ${format(detail.ruwe,'')}`);
    add(t('distance'),t('noDistance'));
    inspector.append(dl);
    const refs=document.createElement('details');
    refs.append(el('summary',t('provenance')),el('p',`ESA/Gaia/DPAC · gaia.dr3lite (GAVO) · ${manifest?.source.capturedAt??''}`,'ex-small'),
      el('p',`source_id ${ref.id}`,'ex-small'));
    const a=el('a',t('atlasCredits'));a.href=new URL('CREDITS.md',ATLAS_URL);refs.append(a);
    inspector.append(refs);
  }

  listen(checkbox,'change',()=>{stop();if (checkbox.checked) void start();summary();draw();});
  listen(filterInput,'change',()=>{rebuildDensity();search(query);draw();});
  listen(retry,'click',()=>{
    if (selection?.state==='error') selection={...selection,state:'loading'};
    stop();void start();onInspector();
  });
  listen(browseList,'click',event=>{
    const id=event.target.closest('button')?.dataset.gaia;
    const item=displayed.find(p=>p.id===id);
    if (item) onSelect(item);
  });
  listen($('exInspector'),'click',event=>{
    if (selection&&event.target.closest('[data-atlas-retry-detail]')) void select(selection.ref);
  });

  return {
    setActive(value) {if (active===value) return;active=value;if (active) void start();else stop();},
    setView(next) {view=next;refresh();},
    get selection() {return selection;},
    select,clearSelection,search,paint,renderDetail,
    localize() {summary();updateBrowse();},
    hasContent:()=>Boolean(counts?.visible),
    selectedLabel:(ctx,frame)=>checkbox.checked&&selection?.detail&&acceptsMask(filter(),selection.detail.mask)?paintSelected(ctx,selection,frame,project):null,
    hit(x,y,frame) {
      let closest=null, distance=11;
      for (const p of markers) {
        const d=Math.hypot(p.x-x,p.y-y);
        if (d<distance) {closest=p;distance=d;}
      }
      if (closest) return {ref:closest};
      if (status!=='density'||!index||!checkbox.checked) return null;
      const u=(x-frame.left)/(frame.right-frame.left),v=(frame.bottom-y)/(frame.bottom-frame.top);
      if (u<0||u>=1||v<0||v>=1) return null;
      return index.values[Math.floor(v*DENSITY_SIDE)*DENSITY_SIDE+Math.floor(u*DENSITY_SIDE)]?{zoom:true}:null;
    },
    inspect:()=>({enabled:checkbox.checked,active:!!current(),status,release:manifest?.release??null,
      total:manifest?.counts.sources??0,visible:counts?.visible??0,cells:counts?.cells??0,markers:markers.length,
      sample:markers.slice(0,12).map(p=>({id:p.id,x:p.x,y:p.y})),selected:selection?.ref.id??null,
      detailState:selection?.state??null,requests:loaders?Object.values(loaders).reduce((sum,l)=>sum+l.active,0):0,
      cacheBytes:loaders?Object.values(loaders).reduce((sum,l)=>sum+l.cache.byteLength,0):0,queued:loaders?Object.values(loaders).reduce((sum,l)=>sum+l.queued,0):0,
    }),
    dispose() {active=false;stop();selection=null;manifest=null;},
  };
}
