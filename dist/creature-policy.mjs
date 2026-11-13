export const CREATURE_MODES=Object.freeze(['subtle','still','off']);
export const validMode=value=>CREATURE_MODES.includes(value);

export function creaturePolicy({mode='subtle',reduced=false,hidden=false,seen=true,editing=false,focus=false,guide=false}={}){
 const available=mode!=='off'&&!hidden&&seen&&!editing&&!focus&&!guide;
 const moving=available&&mode==='subtle'&&!reduced;
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

export function restDelay(random,first=false){
 return Math.round(first?6000+random()*6000:22000+random()*36000);
}

export function planAppearance(random,contextChanged=false){
 const roll=random();
 if(roll<.16)return null;
 const curiosityLimit=contextChanged ? .72 : .54;
 const sequence=roll<.23?'mischief':roll<.39?'glitch':roll<curiosityLimit?'curiosity':'observer';
 return {sequence,duration:Math.round(4900+random()*3000)};
}
