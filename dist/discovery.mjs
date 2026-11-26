import {openLabChoices} from './lab-navigation.mjs';
import {t,onLanguageChange} from './i18n.mjs';
import {pathIds,pathSteps,scienceActions} from './discovery-paths.mjs';
const $=id=>document.getElementById(id),box=$('quickStart');
let route=null,quick=false,step=0,done=false,edited=false,highlight=null,menu=true;
// Mount once. Changing language updates text, never replaces fields or focus.
const node=(tag,id,key)=>{const e=document.createElement(tag);if(id)e.id=id;if(key){e.dataset.i18n=key;e.textContent=t(key)}return e};
const chooser=node('div','discoveryChooser'),heading=node('h3',null,'v85.tour.menu');chooser.append(heading);
for(const [mode,ids,key]of [['quick',['gravity','blackhole','markers'],'v85.tour.quick'],['deep',pathIds,'v85.tour.deep']]){
 const row=node('div',null);row.className='discovery-choice';const label=node('label',null,key);label.htmlFor='discovery-'+mode;
 const select=node('select','discovery-'+mode);for(const id of ids){const option=node('option',null,'v85.tour.'+id);option.value=id;select.append(option)}
 const start=node('button','discoveryStart-'+mode,'v85.tour.start');start.className='secondary';start.type='button';start.onclick=()=>begin(select.value,mode==='quick');row.append(label,select,start);chooser.append(row);
}
$('discoveryProgress').before(chooser);
for(const [id,key,fn]of [['discoveryBack','v85.tour.back',()=>move(-1)],['discoverySkip','v85.tour.skip',()=>move(1)],['discoveryMenu','v85.tour.menuButton',()=>{menu=true;render();$('discovery-deep').focus()}]]){
 const b=node('button',id,key);b.type='button';b.className='secondary';b.onclick=fn;$('discoveryNext').after(b);
}
const title=box.querySelector('h2');title.dataset.i18n='v85.tour.title';
function begin(id,isQuick=false){route=id;quick=isQuick;step=0;done=false;edited=false;menu=false;render();$('discoveryLocate').focus()}
function steps(){return route?pathSteps(route,quick):[]}
function current(){return steps()[step]}
function navigationTarget(s){const nav=document.querySelector('[data-tab="'+s.navigation+'"]');if(!nav?.classList.contains('active'))return nav;if(s.view&&$('thermalExperiment').hidden!==(s.view!=='thermal'))return document.querySelector('[data-entropy-view="'+s.view+'"]');return s.view?document.querySelector('[data-entropy-view="'+s.view+'"]'):nav}
function target(){const s=current();if(!s)return null;
 const nav=route==='objects'?'extreme':route==='markers'||route==='thermal'?'entropy':route;
 if(!$(nav)?.classList.contains('active'))return document.querySelector('[data-tab="'+nav+'"]');
 if((route==='markers'||route==='thermal')&&$('thermalExperiment').hidden!==(route!=='thermal'))return document.querySelector('[data-entropy-view="'+(route==='thermal'?'thermal':'particles')+'"]');
 return s.navigation?navigationTarget(s):document.querySelector(s.target);
}
function visible(el){return el?.isConnected&&el.getClientRects().length&&!el.disabled}
const put=(id,value)=>{const el=$(id);if(el.textContent!==value)el.textContent=value};
function render(){
 highlight?.classList.remove('discovery-highlight');highlight=null;
 chooser.hidden=!menu;for(const id of ['discoveryProgress','discoveryText','discoveryDone','discoveryLocate','discoveryNext','discoveryBack','discoverySkip','discoveryMenu','discoveryRestart'])$(id).hidden=menu;
 if(title.textContent!==t('v85.tour.title'))title.textContent=t('v85.tour.title');if(menu||box.hidden)return;
 const list=steps(),s=current();if(s.navigation){const nav=document.querySelector('[data-tab="'+s.navigation+'"]');if(nav?.classList.contains('active')&&(!s.view||$('thermalExperiment').hidden===(s.view!=='thermal')))done=true}
 if(s.reading)done=true;
 put('discoveryProgress',t('v85.tour.progress',{step:step+1,total:list.length}));put('discoveryText',t(s.text));put('discoveryDone',t(s.reading?'v85.tour.read':done?'v85.tour.done':'v85.tour.pending'));
 $('discoveryNext').disabled=!done;put('discoveryNext',t(step===list.length-1?'v85.tour.finish':'Weiter'));$('discoveryBack').disabled=step===0;
 put('discoveryLocate',t('v85.tour.locate'));highlight=target();if(visible(highlight))highlight.classList.add('discovery-highlight');box.dataset.step=String(step);box.dataset.done=String(done);box.dataset.route=route;
}
function move(delta){if(delta>0&&step===steps().length-1){$('helpClose').click();return}step=Math.max(0,Math.min(steps().length-1,step+delta));done=false;edited=false;render();$('discoveryLocate').focus()}
$('discoveryLocate').onclick=()=>{const el=target();if(!el)return;const menu=$('labMenu');if(el.matches('[data-tab]')&&!visible(el)&&visible(menu))openLabChoices();for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS'&&!(el.tagName==='SUMMARY'&&p===el.parentElement))p.open=true;if(visible(el)){el.focus();el.scrollIntoView({block:'center',behavior:'auto'})}};
$('discoveryNext').onclick=()=>{if(done)move(1)};
$('discoveryRestart').onclick=()=>{if(route)begin(route,quick)};
for(const id of ['helpToggle','helpClose'])$(id).addEventListener('click',()=>{if(id==='helpToggle'&&route)menu=false;render()});
function scienceAction(e){
 const chapter=e.target.closest?.(scienceActions.chapter);
 // Native click opens the disclosure after dispatch. Closing it is not the task.
 if(visible(chapter))return !e.defaultPrevented&&!chapter.parentElement.open;
 const term=e.target.closest?.(scienceActions.term);
 // guide.mjs handles the click first and focuses the actual definition.
 return visible(term)&&e.defaultPrevented&&$('physicsGuide').open&&document.activeElement===$(term.dataset.explain);
}
const observe=e=>{
 if(box.hidden||menu)return;
 const s=current();if(route==='thermal'&&!quick&&step===3&&e.type==='input'&&e.target.matches('#thermalA,#thermalB'))edited=true;
 if(s.event===e.type){const matching=route==='science'?scienceAction(e):s.event.startsWith('thermal-')?s.event!=='thermal-applied'||edited:e.target.closest?.(s.target);if(matching&&e.target.checkValidity?.()!==false&&!(route==='temperature'&&($('temperatureError').textContent||e.target.value.trim()===''))){done=true}}
 render();
};
for(const event of ['input','change','click','thermal-stepped','thermal-applied'])document.addEventListener(event,observe);
document.addEventListener('keydown',e=>{if(e.key==='Escape')render()});
new MutationObserver(()=>render()).observe(box,{attributes:true,attributeFilter:['hidden']});onLanguageChange(render);render();
globalThis.entrolabDiscovery={inspect:()=>({route,quick,step,done,menu,timers:0}),};
