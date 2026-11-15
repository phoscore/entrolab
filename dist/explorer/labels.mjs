function overlaps(a,b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

// Reserve every marker, then give selected and named objects the first choice of label slots.
export function placeLabels(markers, measure, width, height, {top=8,bottom=height-8,limit=12}={}) {
  const occupied = markers.map(({x,y,radius}) => ({
    left:x-radius-3,right:x+radius+3,top:y-radius-3,bottom:y+radius+3,
  }));
  const placed = [];
  for (const marker of markers.filter(m=>m.label).sort((a,b)=>b.priority-a.priority)) {
    if (placed.length >= limit) break;
    const {x,y,radius,label} = marker, gap = radius+9, w = Math.ceil(measure(label))+12, h = 21;
    for (const [left,upper] of [[x+gap,y-h/2],[x-w-gap,y-h/2],[x-w/2,y-gap-h],[x-w/2,y+gap]]) {
      const rect = {left,right:left+w,top:upper,bottom:upper+h};
      if (left < 6 || rect.right > width-6 || upper < top || rect.bottom > bottom) continue;
      if (occupied.some(other=>overlaps(rect,other))) continue;
      occupied.push(rect);
      placed.push({marker,...rect});
      break;
    }
  }
  return placed;
}

export function drawLabels(ctx, labels) {
  ctx.textBaseline = 'middle';
  for (const {marker,left,right,top,bottom} of labels) {
    ctx.fillStyle = marker.selected ? '#223747' : '#0a1526eb';
    ctx.beginPath(); ctx.roundRect(left,top,right-left,bottom-top,5); ctx.fill();
    if (marker.selected) {ctx.strokeStyle = '#b6f1e8';ctx.stroke();}
    ctx.fillStyle = '#edf6fa';
    ctx.fillText(marker.label,left+6,(top+bottom)/2);
  }
  ctx.textBaseline = 'alphabetic';
}
