import {arrangement,distribution,macrostate,randomStep,sampleArrangement,MAX_MARKERS} from './entropy.mjs';
import {t,locale,onLanguageChange} from './i18n.mjs';
export function initEntropy(doc=globalThis.document,{setTimer=globalThis.setTimeout,clearTimer=globalThis.clearTimeout,rng=Math.random}={}){
 const $=id=>doc.getElementById(id),root=$('entropy');
 let state=arrangement(12),steps=0,playing=false,seen=true,timer=null,invalid=false;
 let rows=distribution(12),markers=[];
 const format=(v,digits=4)=>new Intl.NumberFormat(locale(),{maximumFractionDigits:digits}).format(v);
 const percent=p=>new Intl.NumberFormat(locale(),{style:'percent',maximumSignificantDigits:5}).format(p);
 const active=()=>root.classList.contains('active')&&!doc.hidden&&seen;
 const inspect=()=>({state:[...state],steps,playing,n:state.length,k:macrostate(state),scheduled:timer!==null});
 function schedule(){if(timer===null&&playing&&active())timer=setTimer(()=>{timer=null;if(playing&&active()){state=randomStep(state,rng);steps++;render()}schedule();flags()},500);flags()}
 function flags(){root.dataset.playing=String(playing);root.dataset.scheduled=String(timer!==null);root.dataset.step=String(steps);root.dataset.n=String(state.length);root.dataset.k=String(macrostate(state))}
 function sync(){if(timer!==null){clearTimer(timer);timer=null}schedule();renderStatus()}
 function renderStatus(){const key=playing?(active()?'Mischt · Schritt {step}':'Ausgeblendet · Schritt {step}'):'Pausiert · Schritt {step}';$('entropyStatus').textContent=t(key,{step:format(steps,0)});$('entropyPlay').textContent=t(playing?'Mischen pausieren':'Automatisch mischen');$('entropyPlay').setAttribute('aria-pressed',String(playing));flags()}
 function svg(tag,attributes={},text){const node=doc.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attributes))node.setAttribute(k,String(v));if(text!==undefined)node.textContent=text;return node}
 function build(){
  rows=distribution(state.length);markers=state.map((_,i)=>{const marker=doc.createElement('span');marker.className='entropy-marker';marker.textContent=i+1;return marker});$('entropyMarkers').replaceChildren(...markers);
  const peak=Math.max(...rows.map(r=>r.probability)),n=state.length;
  const bars=rows.map(r=>svg('rect',{x:32+r.k*600/(n+1),y:180-145*r.probability/peak,width:Math.max(2,600/(n+1)-4),height:145*r.probability/peak,class:'entropy-bar','data-k':r.k}));
  $('entropyChart').replaceChildren(...bars,svg('path',{'data-current-marker':'',fill:'#fff','aria-hidden':'true'}),svg('path',{d:'M30 25V182H635',fill:'none',stroke:'#73617e'}),svg('text',{x:5,y:19},percent(peak)),...[...new Set([0,Math.floor(n/2),n])].map(k=>svg('text',{x:32+(k+.5)*600/(n+1),y:212,'text-anchor':'middle'},format(k,0))));
  $('entropyTable').replaceChildren(...rows.map(r=>{const tr=doc.createElement('tr');tr.dataset.k=r.k;for(const value of [r.k,format(r.omega,0),percent(r.probability)]){const td=doc.createElement('td');td.textContent=value;tr.append(td)}return tr}));
 }
 function render(){
  const n=state.length,k=macrostate(state),row=rows[k],positions=[0,0];
  markers.forEach((marker,i)=>{const side=state[i]?0:1,slot=positions[side]++;marker.classList.toggle('right',side===1);marker.style.left=(side*50+(slot%4+.5)*12.5)+'%';marker.style.top=(58+Math.floor(slot/4)*30)+'px'});
  $('entropyLeft').textContent=format(k,0);$('entropyRight').textContent=format(n-k,0);$('entropyChambers').setAttribute('aria-label',t('Links {left}, rechts {right}; {n} unterscheidbare Marker.',{left:k,right:n-k,n}));
  $('entropyMicrostate').textContent=state.map(v=>t(v?'L':'R')).join(' ');$('entropyK').max=n;$('entropyK').value=k;
  $('entropyOmega').textContent=format(row.omega,0);$('entropyTotal').textContent=format(row.total,0);$('entropyProbability').textContent=percent(row.probability);$('entropyValue').textContent=format(row.entropy);
  $('entropyResample').disabled=k===0||k===n;
  $('entropyChart').setAttribute('aria-label',t('Gleichgewichtsverteilung für {n} Marker; aktuelles k = {k}.',{n,k}));
  const arrowX=32+(k+.5)*600/(n+1);$('entropyChart').querySelector('[data-current-marker]').setAttribute('d',`M${arrowX-5} 193L${arrowX+5} 193L${arrowX} 183Z`);
  for(const bar of $('entropyChart').querySelectorAll('[data-k]'))bar.classList.toggle('current',Number(bar.dataset.k)===k);
  for(const tr of $('entropyTable').children)tr.setAttribute('aria-current',String(Number(tr.dataset.k)===k));
  $('entropyChartNote').textContent=t('k = {k}: {probability} im Gleichgewicht. {n} Marker; keine nächste Schrittverteilung.',{k,n,probability:percent(row.probability)});
  const message=invalid?t('N muss eine ganze Zahl von 1 bis 32 sein. Bisheriger Zustand bleibt erhalten.'):'';$('entropyError').textContent=message;$('entropyN').setCustomValidity(message);$('entropyN').setAttribute('aria-invalid',String(invalid));renderStatus();
 }
 function pause(){playing=false;sync()}
 $('entropyPlay').onclick=()=>{playing=!playing;sync()};
 $('entropyStep').onclick=()=>{pause();state=randomStep(state,rng);steps++;render()};
 $('entropyReset').onclick=()=>{pause();state=arrangement(state.length);steps=0;invalid=false;$('entropyN').value=state.length;render()};
 $('entropyN').oninput=()=>{const text=$('entropyN').value.trim(),n=Number(text);invalid=text===''||!Number.isInteger(n)||n<1||n>MAX_MARKERS;if(invalid){render();return}pause();state=arrangement(n);steps=0;build();render()};
 $('entropyK').oninput=()=>{pause();state=arrangement(state.length,Number($('entropyK').value));render()};
 $('entropyResample').onclick=()=>{pause();state=sampleArrangement(state.length,macrostate(state),rng);render()};
 for(const b of doc.querySelectorAll('[data-tab]'))b.addEventListener('click',sync);
 doc.addEventListener('visibilitychange',sync);
 const motion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');motion?.addEventListener('change',e=>{if(e.matches){pause();render()}});
 let observer;if(typeof IntersectionObserver==='function'){observer=new IntersectionObserver(entries=>{seen=entries[0].isIntersecting;sync()});observer.observe($('entropyChambers'))}
 const unsubscribe=onLanguageChange(()=>{build();render()});build();render();
 return {inspect,dispose(){pause();observer?.disconnect();unsubscribe()}};
}
if(globalThis.document){const lab=initEntropy();globalThis.entrolabEntropy={inspect:lab.inspect}}
