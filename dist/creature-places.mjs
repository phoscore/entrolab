// Heading bands already have vertical space. A visit can use only the free
// rectangles inside one of them. The returned offsets are relative to the band.
const inset=5;
const sizes=[
 ['hero',166,84],
 ['full',93,70],
 ['peek',60,42],
 ['peek',46,31],
];
const fits=(box,bounds)=>box.left>=bounds.left&&box.right<=bounds.right&&
 box.top>=bounds.top&&box.bottom<=bounds.bottom;
const overlaps=(a,b)=>a.left<b.right+inset&&a.right>b.left-inset&&
 a.top<b.bottom+inset&&a.bottom>b.top-inset;

export function freeCreatureSpace(bounds,blockers,viewport,compact=false,accept=()=>true){
 const frame={
  left:Math.max(bounds.left,viewport.left),right:Math.min(bounds.right,viewport.right),
  top:Math.max(bounds.top,viewport.top),bottom:Math.min(bounds.bottom,viewport.bottom),
 };
 for(const [pose,width,height] of sizes){
  if(compact&&pose!=='peek')continue;
  if(frame.right-frame.left<width||frame.bottom-frame.top<height)continue;
  const xs=[frame.right-width,frame.left,(frame.right+frame.left-width)/2,...blockers.flatMap(rect=>[rect.left-width-inset,rect.right+inset])];
  const ys=[frame.top,frame.bottom-height,...blockers.flatMap(rect=>[rect.bottom+inset,rect.top-height-inset])];
  for(const left of xs)for(const top of ys){
   const box={left,right:left+width,top,bottom:top+height};
   if(fits(box,frame)&&!blockers.some(rect=>overlaps(box,rect))){
    const space={x:left-bounds.left,y:top-bounds.top,width,height,pose};
    if(accept(space))return space;
   }
  }
 }
 return null;
}

export function headingSpace(doc,element,viewport,compact,accept){
 const bounds=element.getBoundingClientRect();
 if(!bounds.width||!bounds.height)return null;
 const blockers=[];
 for(const child of element.children){
  if(child.classList.contains('null-slot'))continue;
  // Use the actual line/inline-box rectangles in the title column; the other
  // direct children (badges) reserve their whole box, including their border.
  if(child.matches('div')){
   const range=doc.createRange();
   range.selectNodeContents(child);
   for(const item of child.children){
    if(!item.getClientRects().length)continue;
    range.selectNodeContents(item);
    blockers.push(...range.getClientRects());
   }
  }else{
   const rect=child.getBoundingClientRect();
   if(rect.width&&rect.height)blockers.push(rect);
  }
 }
 return freeCreatureSpace(bounds,blockers,viewport,compact,accept);
}
