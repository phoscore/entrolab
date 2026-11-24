export function creaturePolicy({reduced=false,hidden=false,seen=true,editing=false,focus=false,guide=false}={}){
 const available=!hidden&&seen&&!editing&&!focus&&!guide;
 const moving=available&&!reduced;
 return {moving,still:available&&!moving};
}

// Private state. The creature never consumes the simulation's random source.
export function creatureRandom(seed){
 let state=(seed>>>0)||0x91e10da5;
 return ()=>{
  state^=state<<13;
  state^=state>>>17;
  state^=state<<5;
  return (state>>>0)/0x100000000;
 };
}

export const CREATURE_COOLDOWN=8000;

export function restDelay(random,first=false){
 return Math.round(first?6000+random()*6000:13000+random()*19000);
}

const reactions=Object.freeze({
 gravity:'observer', blackhole:'suspicious', extreme:'curiosity', temperature:'suspicious',
 entropy:'satisfied', explorer:'curiosity', science:'observer', scale:'disturbed',
});

export function planAppearance(random,{reason,room=false}={}){
 const roll=random();
 if(roll<.10)return null;
 let sequence;
 if(room&&roll>=.996)sequence='gamma';
 else if(reason&&roll>=.40&&roll<.83)sequence=reactions[reason];
 if(!sequence){
  sequence=roll<.175?'peek':roll<.215?'mischief':roll<.335?'glitch':
   roll<.53?'curiosity':roll<.64?'suspicious':roll<.73?'satisfied':
   roll<.79?'disturbed':roll<.91?'observer':'peek';
 }
 const length=random();
 const duration=sequence==='gamma'?4300:sequence==='peek'?Math.round(2300+length*1100):
  ['suspicious','satisfied','disturbed'].includes(sequence)?Math.round(3250+length*1100):
   Math.min(7900,Math.round(4900+length*3000));
 return {sequence,duration};
}
