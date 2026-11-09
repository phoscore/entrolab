// Decorative policy only. No physical state, random source or scheduler.
export const CREATURE_MODES=Object.freeze(['subtle','still','off']);
export const CREATURE_CONTEXTS=Object.freeze(['gravity','blackhole','objects','temperature','markers','thermal','science','guide']);
export const REACTION_COOLDOWN=60000;
export function validMode(value){return CREATURE_MODES.includes(value)}
export function creaturePolicy({mode='subtle',reduced=false,hidden=false,seen=true,editing=false,focus=false}={}){
 if(!validMode(mode))throw new RangeError('Invalid creature mode');
 const visible=mode!=='off'&&!hidden&&seen&&!editing&&!focus;
 return {visible,moving:visible&&mode==='subtle'&&!reduced};
}
export function createCreatureMachine(clock=()=>globalThis.performance.now()){
 let context='gravity',mode='subtle',phase='hidden',visible=false,moving=false,lastReaction=null,reactions=0;
 function synchronize(next){
  next={mode,...next};
  if(!CREATURE_CONTEXTS.includes(next.context))throw new RangeError('Invalid creature context');
  const policy=creaturePolicy(next),changed=next.context!==context;
  context=next.context;mode=next.mode;visible=policy.visible;moving=policy.moving;
  if(!visible)phase='hidden';else if(changed||phase==='hidden'||!moving)phase='idle';
  return inspect();
 }
 function react(initial=false){
  const now=clock();if(!Number.isFinite(now))throw new RangeError('Finite monotonic time required');
  if(!moving||(lastReaction!==null&&now-lastReaction<REACTION_COOLDOWN))return false;
  lastReaction=now;reactions++;phase=initial?'peek':'react';return true;
 }
 function finish(){phase=visible?'idle':'hidden'}
 function inspect(){return {context,mode,phase,visible,moving,lastReaction,reactions}}
 return {synchronize,react,finish,inspect};
}
