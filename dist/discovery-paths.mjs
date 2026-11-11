// Presentation-only route definitions; existing controls are observed, never applied.
const config={gravity:['gravity','#scenario','change'],blackhole:['blackhole','#bhMass','change'],objects:['extreme','#comparisonMode','change'],temperature:['extreme','#kelvinInput','input'],markers:['entropy','#entropyStep','click'],science:['science','#model-gravity summary','click']};
export const scienceActions=Object.freeze({
 chapter:'#science .knowledge-model > .knowledge-advanced > summary',
 term:'#science .knowledge-term-links [data-explain]'
});
export const pathIds=Object.freeze(['gravity','blackhole','objects','temperature','markers','thermal','science']);
export function pathSteps(id,quick=false){
 if(!pathIds.includes(id))throw new RangeError('Unknown discovery path');
 if(id==='thermal'&&!quick)return [
  {text:'Wähle oben „Entropy Lab“. Die anderen Labore bleiben unabhängig nutzbar.',navigation:'entropy'},
  {text:'Wähle „Wärme & Entropie“. Vergleiche die Starttemperaturen 350 K und 290 K.',navigation:'entropy',view:'thermal'},
  {text:'Drücke „＋ 10 Modellsekunden“. Beobachte: A kühlt, B erwärmt sich, U bleibt erhalten. Bei eigenen Startwerten gilt die entsprechende Flussrichtung.',target:'#thermalStep',event:'thermal-stepped'},
  {text:'Ändere eine Anfangstemperatur und bestätige „Übernehmen“. Erst dieser Klick setzt das Experiment neu. Erkunde danach ⓘ oder Advanced nach Wunsch.',target:'#thermalA',event:'thermal-applied'}
 ];
 const [navigation,target,event]=config[id]??['entropy','#thermalStep','thermal-stepped'];
 return [
  {text:'v85.tour.goto',navigation,view:id==='markers'?'particles':id==='thermal'?'thermal':undefined},
  {text:id==='thermal'?'Drücke „＋ 10 Modellsekunden“. Beobachte: A kühlt, B erwärmt sich, U bleibt erhalten. Bei eigenen Startwerten gilt die entsprechende Flussrichtung.':'v85.tour.'+id+'.action',target,event},
  {text:'v85.tour.'+(id==='thermal'?'temperature':id)+'.explain',target:id==='science'?'#model-gravity summary':'#why-'+id+' > summary',reading:true}
 ];
}
