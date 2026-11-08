// Each actual execution gets an isolated worker and releases it on completion.
// Dependency injection supports deterministic controller/failure tests, not a second physics model.
export function createSelfChecks({onUpdate=()=>{},createWorker=()=>new Worker('./checks-worker.mjs',{type:'module'}),timeoutMs=10000}={}){
 let state={runs:0,running:false,results:[],error:false},pending=null;
 const snapshot=()=>structuredClone(state);
 function run(){
  if(pending)return pending;
  state={...state,running:true,error:false};onUpdate(snapshot());
  // Promise.resolve also makes the pending guard effective before a worker can respond.
  pending=Promise.resolve().then(()=>new Promise(resolve=>{
   let worker,timer,done=false;
   const finish=(results,error)=>{if(done)return;done=true;clearTimeout(timer);worker?.terminate();state={runs:state.runs+1,running:false,results,error};onUpdate(snapshot());resolve(snapshot())};
   try{worker=createWorker();worker.onmessage=e=>{const rs=e.data?.results;const valid=Array.isArray(rs)&&rs.length===10&&rs.every(r=>typeof r.name==='string'&&typeof r.ok==='boolean');finish(valid?rs:[],!valid)};worker.onerror=e=>{e.preventDefault?.();finish([],true)};timer=setTimeout(()=>finish([],true),timeoutMs);worker.postMessage('run')}
   catch{finish([],true)}
  })).finally(()=>{pending=null});
  return pending;
 }
 return {run,snapshot};
}
