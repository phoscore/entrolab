import {panBy, zoomAt, MAX_ZOOM} from './camera.mjs';

// Both maps use the same CSS-pixel pan, zoom anchors and keyboard controls.
export function mapGestures(canvas, listen, {getCamera, setCamera, size, frame, maxZoom=MAX_ZOOM, fit, exit, tap}) {
  const pointers = new Map();
  let gesture = null;
  let moved = false;
  function point(event) {
    const rect = canvas.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
  }
  function geometry() {
    const [a,b] = pointers.values();
    if (!a) return null;
    if (!b) return {midpoint:a, span:0};
    return {midpoint:[(a[0]+b[0])/2,(a[1]+b[1])/2], span:Math.hypot(a[0]-b[0],a[1]-b[1])};
  }
  function reset() {
    const shape = geometry();
    gesture = shape && {...shape, camera:getCamera()};
  }
  function zoomTo(zoom, anchor) {
    const [w,h] = size();
    setCamera(zoomAt(getCamera(), Math.min(maxZoom,zoom), anchor ?? [w/2,h/2], w, h, frame));
  }
  function zoomBy(amount) { zoomTo(getCamera().zoom + amount); }
  function cancel() {
    const captured = [...pointers.keys()];
    pointers.clear();
    gesture = null;
    canvas.dataset.interacting = 'false';
    for (const id of captured) if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
  }

  listen(canvas, 'pointerdown', event => {
    if (event.button !== 0 || pointers.size >= 2) return;
    canvas.focus({preventScroll:true});
    canvas.setPointerCapture(event.pointerId);
    canvas.dataset.interacting = 'true';
    pointers.set(event.pointerId, point(event));
    moved = pointers.size > 1;
    reset();
  });
  listen(canvas, 'pointermove', event => {
    if (!pointers.has(event.pointerId) || !gesture) return;
    pointers.set(event.pointerId, point(event));
    const {midpoint,span} = geometry();
    const dx = midpoint[0] - gesture.midpoint[0], dy = midpoint[1] - gesture.midpoint[1];
    if (Math.hypot(dx,dy) > 4) moved = true;
    const [w,h] = size();
    let next = gesture.camera;
    if (span && gesture.span) {
      next = zoomAt(next, Math.min(maxZoom,next.zoom + Math.log10(Math.max(1,span) / gesture.span)), gesture.midpoint, w, h, frame);
    }
    setCamera(panBy(next, dx, dy, w, h, frame));
  });
  function release(event) {
    if (!pointers.has(event.pointerId)) return;
    if (event.type === 'pointerup' && !moved && pointers.size === 1) tap(...point(event));
    pointers.delete(event.pointerId);
    reset();
    if (!pointers.size) canvas.dataset.interacting = 'false';
  }
  for (const type of ['pointerup','pointercancel','lostpointercapture']) listen(canvas,type,release);
  listen(canvas, 'wheel', event => {
    if (document.activeElement !== canvas) return;
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? size()[1] : 1);
    zoomTo(getCamera().zoom - Math.max(-.4,Math.min(.4,delta*.001)),point(event));
  }, {passive:false});
  const arrows = {ArrowLeft:[48,0],ArrowRight:[-48,0],ArrowUp:[0,48],ArrowDown:[0,-48]};
  listen(canvas, 'keydown', event => {
    if (Object.hasOwn(arrows,event.key)) {
      event.preventDefault();
      const [w,h] = size(), [dx,dy] = arrows[event.key];
      setCamera(panBy(getCamera(),dx,dy,w,h,frame));
    } else if (['+','=','-','Home','Escape'].includes(event.key)) {
      event.preventDefault();
      if (event.key === 'Home') fit();
      else if (event.key === 'Escape') exit();
      else zoomBy(event.key === '-' ? -.25 : .25);
    }
  });
  return {zoomBy,zoomTo,cancel};
}
