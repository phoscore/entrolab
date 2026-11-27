const motionKeys={KeyA:[-1,0,0],KeyD:[1,0,0],KeyQ:[0,-1,0],KeyE:[0,1,0],KeyW:[0,0,1],KeyS:[0,0,-1]};
// The camera looks opposite its outward basis vector. Keyboard aim follows the screen axes.
const lookKeys={ArrowLeft:[25,0],ArrowRight:[-25,0],ArrowUp:[0,-25],ArrowDown:[0,25]};

export const freeCopy={
  freeOrbit:['Orbit','Orbit'],freeMode:['Freie Kamera','Free camera'],
  freeSpeed:['Bewegungstempo','Movement speed'],
  freeLeft:['Links','Left'],freeRight:['Rechts','Right'],
  freeUp:['Aufwärts','Up'],freeDown:['Abwärts','Down'],
  freeForward:['Vorwärts','Forward'],freeBack:['Rückwärts','Back'],
  freeHelp:['Karte ziehen oder Pfeiltasten zum Umsehen. Bei Kartenfokus bewegen WASD und Q/E die Kamera. Bewegungstasten gedrückt halten.','Drag the map or use arrow keys to look. With the map focused, move with WASD and Q/E. Hold a direction to move.'],
  freeControls:['Freie Kamerasteuerung','Free camera controls'],
};

export function freeControlsMarkup(prefix,localize){
  return `<section class="ex-free" id="${prefix}FreeControls" hidden>
    <div class="ex-free-speed">
      <label for="${prefix}FreeSpeed" ${localize}="freeSpeed"></label>
      <input id="${prefix}FreeSpeed" type="range" min="-8" max="8" step="1" value="0">
      <output id="${prefix}FreeSpeedText" for="${prefix}FreeSpeed"></output>
    </div>
    <div class="ex-free-axis">
      ${[['KeyA','freeLeft'],['KeyD','freeRight'],['KeyQ','freeDown'],['KeyE','freeUp'],['KeyW','freeForward'],['KeyS','freeBack']]
        .map(([code,key])=>`<button type="button" data-free-direction="${code}" ${localize}="${key}"></button>`).join('')}
    </div>
  </section>`;
}

export function bindFreeControls({canvas,controls,listen,enabled,look,move,wake}){
  const keys=new Set(), pointers=new Map();
  let last=null;
  const release=()=>{
    keys.clear();
    const captured=[...pointers];
    pointers.clear();
    for(const [id,{button}] of captured)if(button.hasPointerCapture(id))button.releasePointerCapture(id);
    last=null;
  };
  function onMapKey(event){
    if(!enabled()||event.altKey||event.ctrlKey||event.metaKey)return false;
    const motion=motionKeys[event.code];
    if(motion){
      event.preventDefault();keys.add(event.code);wake();return true;
    }
    const angles=lookKeys[event.key];
    if(!angles)return false;
    event.preventDefault();look(...angles);return true;
  }
  listen(canvas,'keyup',event=>{
    if(keys.delete(event.code))event.preventDefault();
  });
  listen(canvas,'blur',()=>{
    keys.clear();
    if(!pointers.size)last=null;
  });
  listen(window,'blur',release);
  listen(controls,'focusout',event=>{if(!controls.contains(event.relatedTarget))release();});
  for(const button of controls.querySelectorAll('[data-free-direction]')){
    const axis=motionKeys[button.dataset.freeDirection];
    listen(button,'pointerdown',event=>{
      if(!enabled()||event.button!==0)return;
      event.preventDefault();
      button.focus({preventScroll:true});
      pointers.set(event.pointerId,{axis,button});
      button.setPointerCapture(event.pointerId);
      wake();
    });
    for(const type of ['pointerup','pointercancel','lostpointercapture'])
      listen(button,type,event=>{
        pointers.delete(event.pointerId);
        if(!keys.size&&!pointers.size)last=null;
      });
    listen(button,'click',event=>{
      if(enabled()&&event.detail===0){move(axis,.2);wake();}
    });
  }
  const moving=()=>keys.size>0||pointers.size>0;
  return {release,onMapKey,moving,tick(time){
    if(!enabled()||!moving()){last=null;return;}
    const seconds=last===null?0:Math.min(.08,Math.max(0,time-last)/1000);
    last=time;
    const combined=[0,0,0];
    const add=axis=>axis.forEach((value,i)=>{combined[i]+=value;});
    for(const key of keys)add(motionKeys[key]);
    for(const {axis} of pointers.values())add(axis);
    if(seconds&&combined.some(Boolean))move(combined,seconds);
  }};
}
