import {DESI_RELEASE,DESI_SIDE} from './foundation/desi-format.mjs';
import {DESI_URL,loadDesiManifest,loadDesiOverview,makeDesiLoader,planDesi,loadDesiTiles,desiQuery,findDesi,desiDetail} from './desi-data.mjs';
import {coverageRaster,densityRaster,viewDesiCounts,paintDesiPoints,paintDesiSelection} from './desi-paint.mjs';

export const desiControls = `
  <div class="ex-atlas-controls ex-desi-controls">
    <label><input type="checkbox" id="exDesiEnabled" aria-controls="exDesiSummary"><span data-ex="desiLayer"></span></label>
    <label class="ex-atlas-filter" id="exDesiFilterWrap" hidden><span data-ex="redshift"></span><select id="exDesiFilter">
      <option value="all" data-ex="desiAll"></option><option value="low" data-ex="desiLow"></option><option value="high" data-ex="desiHigh"></option>
    </select></label>
  </div>`;
export const desiSummary = `
  <section id="exDesiSummary" class="ex-atlas-summary ex-desi-summary" aria-label="DESI DR1" hidden>
    <div id="exDesiCounts"></div>
    <div id="exDesiStatus" role="status"></div>
    <div class="ex-desi-key">
      <span><i class="ex-desi-dot" aria-hidden="true"></i><span data-ex="desiGlyph"></span></span>
      <span><i class="ex-desi-patch" aria-hidden="true"></i><span data-ex="desiFootprint"></span></span>
    </div>
    <details><summary data-ex="desiAbout"></summary><p data-ex="desiScope"></p>
      <a id="exDesiCredits" data-ex="credits" target="_blank" rel="noopener"></a>
    </details>
    <button type="button" id="exDesiRetry" data-ex="retry" hidden></button>
  </section>`;
export const desiBrowse = `
  <section id="exDesiBrowse" class="ex-atlas-browse" aria-labelledby="exDesiBrowseTitle" hidden>
    <h3 id="exDesiBrowseTitle" data-ex="desiBrowse"></h3>
    <p id="exDesiSearch" class="ex-small" aria-live="polite"></p>
    <div id="exDesiResults" class="ex-list"></div>
  </section>`;

const setText = (element,value)=>{if (element.textContent !== value) element.textContent = value;};
const desiLabel = id => 'DESI DR1 '+id;

export function mountDesi(root,{listen,t,n,invalidate,project,onSelect,onInspector,onCenter}) {
  const $ = id=>root.querySelector('#'+id);
  const toggle = $('exDesiEnabled'), filterInput = $('exDesiFilter'), retry = $('exDesiRetry');
  const browse = $('exDesiBrowse'), list = $('exDesiResults');
  $('exDesiCredits').href = new URL('CREDITS.md',DESI_URL);
  let active=false,session=null,manifest=null,loaders=null,view=null,grid=null,footprint=null,density=null;
  let plan=null,tiles=[],markers=[],counts=null,drawn=0,status='idle',selection=null;
  let query='',match=null,searchState='idle',display=[],listKey='';
  let tileTimer=null,searchTimer=null,regionRevision=0,searchRevision=0,detailRevision=0;
  const filter = ()=>filterInput.value;
  const running = ()=>Boolean(active && toggle.checked && session && !session.signal.aborted);

  function statusText() {
    if (status === 'error') return t('desiError');
    if (!grid) return t('desiLoading');
    if (!counts?.covered && !counts?.total) return t('desiOutside');
    if (!counts?.total) return t('desiNoRows');
    if (!counts?.selected) return t('desiNoFilter');
    return t(status==='points'?'desiPoints':status==='loading'?'desiLoadingPoints':'desiDensity');
  }

  function summarize() {
    $('exDesiSummary').hidden = !toggle.checked;
    $('exDesiFilterWrap').hidden = !toggle.checked;
    if (!toggle.checked) return;
    const f = filter();
    const title = manifest ? `${n(manifest.counts.sources)} ${t('desiTotal')}` : '';
    const chosen = manifest && f !== 'all' ? ` · ${n(manifest.counts[f])} ${t('atlasSelected')}` : '';
    const shown = counts ? status==='points' ? ` · ${n(counts.selected)} ${t('atlasVisible')} · ${n(drawn)} ${t('atlasDrawn')}` :
      ` · ${n(counts.selected)} ${t('desiCellCount')}` : '';
    setText($('exDesiCounts'),title+chosen+shown);
    setText($('exDesiStatus'),statusText());
    retry.hidden = status!=='error' && searchState!=='error' && selection?.state!=='error';
  }

  function showBrowse() {
    const searchId = desiQuery(query);
    browse.hidden = !running() || !(searchId || (!query.trim() && markers.length));
    display = browse.hidden ? [] : searchId ? (match?[match]:[]) :
      [...markers].sort((a,b)=>((a.x-view.width/2)**2+(a.y-view.height/2)**2)-((b.x-view.width/2)**2+(b.y-view.height/2)**2)).slice(0,12);
    if (!browse.hidden) setText($('exDesiSearch'),t(!searchId?'desiNearby':
      searchState==='error'?'desiError':searchState==='loading'?'loadingSearch':match?'desiFound':'desiMissing'));
    const nextKey = display.map(ref=>ref.id+(selection?.ref.id===ref.id?'*':'')).join(',');
    if (nextKey === listKey) return;
    const focus = list.contains(document.activeElement) ? document.activeElement.dataset.desi : null;
    listKey = nextKey;
    list.replaceChildren(...display.map(ref=>{
      const button = document.createElement('button');
      button.type='button'; button.dataset.desi=ref.id;
      button.textContent=desiLabel(ref.id);
      button.setAttribute('aria-pressed',String(selection?.ref.id===ref.id));
      return button;
    }));
    if (focus) Array.from(list.children).find(b=>b.dataset.desi===focus)?.focus({preventScroll:true});
  }

  function clearSelection() {
    detailRevision++;
    loaders?.detail.changeView();
    selection=null;
    showBrowse();
  }

  function stop() {
    session?.abort();session=null;
    clearTimeout(tileTimer);clearTimeout(searchTimer);tileTimer=searchTimer=null;
    regionRevision++;searchRevision++;detailRevision++;
    if (loaders) for (const loader of Object.values(loaders)) loader.dispose();
    loaders=null;grid=footprint=density=plan=counts=null;
    tiles=[];markers=[];match=null;drawn=0;status='idle';searchState='idle';
    showBrowse();summarize();
  }

  function refreshView(force=false) {
    if (!grid || !view || !running()) return;
    const next = planDesi(manifest,view);
    if (!force && plan?.key === next.key) return;
    const revision=++regionRevision;
    clearTimeout(tileTimer);tileTimer=null;
    loaders.tiles.changeView();
    plan=next;tiles=[];markers=[];
    status=next.tiles===null?'overview':'loading';
    if (next.tiles!==null) tileTimer=setTimeout(async()=>{
      tileTimer=null;
      try {
        const results=await loadDesiTiles(loaders.tiles,next);
        if (!running() || revision!==regionRevision) return;
        tiles=results;status='points';
      } catch {
        if (!running() || revision!==regionRevision) return;
        status='error';
      }
      invalidate();
    },55);
    invalidate();
  }

  function search(value) {
    query=value;
    const id = desiQuery(query), revision=++searchRevision;
    clearTimeout(searchTimer);searchTimer=null;loaders?.search.changeView();
    match=null;searchState=id && running() ? 'loading' : 'idle';
    showBrowse();
    if (!id || !running() || !loaders) return;
    searchTimer=setTimeout(async()=>{
      searchTimer=null;
      try {
        const found=await findDesi(loaders.search,id,filter());
        if (!running() || revision!==searchRevision) return;
        match=found;searchState='done';
      } catch {
        if (!running() || revision!==searchRevision) return;
        searchState='error';
      }
      showBrowse();summarize();
    },85);
  }

  async function start() {
    if (!active || !toggle.checked || session) return;
    const own=new AbortController();
    session=own;status='loading';summarize();invalidate();
    try {
      const loaded=manifest??await loadDesiManifest(own.signal);
      if (own.signal.aborted) return;
      manifest=loaded;
      loaders={tiles:makeDesiLoader(manifest),search:makeDesiLoader(manifest,{parallel:1,bytes:128*1024}),
        detail:makeDesiLoader(manifest,{parallel:1,bytes:256*1024})};
      const values=await loadDesiOverview(manifest,loaders.tiles);
      if (own.signal.aborted) return;
      grid=values;footprint=coverageRaster(grid.coverage);density=densityRaster(grid,filter());
      refreshView();search(query);
      if (selection?.state==='loading') void select(selection.ref);
    } catch {
      if (own.signal.aborted) return;
      status='error';if (desiQuery(query)) searchState='error';
      showBrowse();summarize();invalidate();
    }
  }

  async function select(ref) {
    const revision=++detailRevision;
    loaders?.detail.changeView();
    selection={ref,detail:null,state:'loading'};
    onInspector();showBrowse();invalidate();
    if (!running() || !loaders) return;
    try {
      const detail=await desiDetail(manifest,loaders.detail,ref,session.signal);
      if (!running() || revision!==detailRevision) return;
      selection={ref,detail,state:'ready'};onCenter(detail);
    } catch {
      if (!running() || revision!==detailRevision) return;
      selection={ref,detail:null,state:'error'};
    }
    onInspector();showBrowse();invalidate();
  }

  function paint(ctx,frame) {
    if (!toggle.checked) return;
    markers=[];drawn=0;
    if (grid && view) {
      counts=viewDesiCounts(grid,view.viewport,filter());
      if (status==='points') {
        const points=paintDesiPoints(ctx,tiles,frame,filter());
        markers=points.markers;
        counts={covered:counts.covered,total:points.total,selected:points.selected};
        drawn=markers.length;
      } else if (status!=='error') {
        ctx.imageSmoothingEnabled=false;
        ctx.drawImage(density,frame.left,frame.top,frame.right-frame.left,frame.bottom-frame.top);
      }
    }
    summarize();showBrowse();
  }

  function renderDetail(inspector) {
    if (!selection) return;
    const {ref,detail,state}=selection;
    const el=(tag,value,cls)=>{
      const node=document.createElement(tag);node.textContent=value;if (cls) node.className=cls;return node;
    };
    inspector.append(el('p',detail?.name??desiLabel(ref.id),'ex-selected'),el('p',t('desiGalaxy'),'ex-small'));
    if (!detail) {
      inspector.append(el('p',t(state==='error'?'desiError':'desiLoadingDetail')));
      return;
    }
    const fields=document.createElement('dl');
    const add=(label,value)=>fields.append(el('dt',label),el('dd',value));
    add(t('direction'),`RA ${n(detail.ra)}° · Dec ${n(detail.dec)}°`);
    add(t('redshift'),`z = ${n(detail.z)} · σ ${n(detail.zerr)}`);
    add(t('distance'),t('desiNoDistance'));
    add(t('quality'),`ZWARN ${detail.zwarn} · Δχ² ${n(detail.deltachi2)}`);
    inspector.append(fields);
    const details=el('details','');
    const a=el('a','DESI DR1'); a.href='https://data.desi.lbl.gov/doc/releases/dr1/';a.target='_blank';a.rel='noopener';
    details.append(el('summary',t('provenance')),el('p',t('desiDirection'),'ex-small'),
      el('p',`TARGETID ${ref.id} · HEALPix ${detail.healpix} · Redrock · ${DESI_RELEASE}`,'ex-small'),a);
    inspector.append(details);
  }

  listen(toggle,'change',()=>{
    if (toggle.checked) void start();else {clearSelection();stop();onInspector();}
    summarize();invalidate();
  });
  listen(filterInput,'change',()=>{
    clearSelection();
    if (grid) density=densityRaster(grid,filter());
    onInspector();refreshView(true);search(query);invalidate();
  });
  listen(retry,'click',()=>{
    if (selection?.state==='error') selection={...selection,state:'loading'};
    stop();void start();onInspector();
  });
  listen(list,'click',event=>{
    const id=event.target.closest('button')?.dataset.desi;
    const ref=display.find(item=>item.id===id);
    if (ref) onSelect(ref);
  });

  return {
    get selection() {return selection;},
    select,clearSelection,search,paint,renderDetail,
    setActive(value) {if (active===value) return;active=value;if (value) void start();else stop();},
    setView(value) {view=value;refreshView();},
    localize() {summarize();showBrowse();},
    hasContent:()=>Boolean(counts?.selected || counts?.covered),
    paintFootprint(ctx,{left,top,right,bottom}) {
      if (footprint) {ctx.imageSmoothingEnabled=false;ctx.drawImage(footprint,left,top,right-left,bottom-top);}
    },
    selectedLabel:(ctx,frame)=>selection?.detail && toggle.checked ? paintDesiSelection(ctx,selection.detail,frame,project):null,
    hit(x,y,frame) {
      let ref=null,radius=11;
      for (const marker of markers) {
        const d=Math.hypot(marker.x-x,marker.y-y);
        if (d<radius) {radius=d;ref=marker;}
      }
      if (ref) return {ref};
      if (!grid || status!=='overview') return null;
      const u=(x-frame.left)/(frame.right-frame.left),v=(frame.bottom-y)/(frame.bottom-frame.top);
      if (u<0 || u>=1 || v<0 || v>=1) return null;
      const i=Math.floor(v*DESI_SIDE)*DESI_SIDE+Math.floor(u*DESI_SIDE),f=filter();
      return (f!=='high' && grid.low[i]) || (f!=='low' && grid.high[i]) ? {zoom:true}:null;
    },
    inspect:()=>({enabled:toggle.checked,status,release:manifest?.release??null,total:manifest?.counts.sources??0,
      markers:markers.length,sample:markers.slice(0,12).map(({id,x,y})=>({id,x,y})),counts,
      selected:selection?.ref.id??null,detailState:selection?.state??null,
      requests:loaders?Object.values(loaders).reduce((sum,l)=>sum+l.active,0):0,
      cacheBytes:loaders?Object.values(loaders).reduce((sum,l)=>sum+l.cache.byteLength,0):0}),
    dispose() {active=false;stop();selection=null;manifest=null;},
  };
}
