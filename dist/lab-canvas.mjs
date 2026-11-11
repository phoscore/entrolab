// Canvas box is CSS-sized. The backing store is capped independently.
export function prepareLabCanvas(canvas, dpr) {
 const {width, height} = canvas.getBoundingClientRect();
 if (width < 1 || height < 1) return null;
 const w = Math.round(width * dpr), h = Math.round(height * dpr);
 if (canvas.width !== w || canvas.height !== h) {
  canvas.width = w;
  canvas.height = h;
 }
 const ctx = canvas.getContext('2d');
 if (!ctx) return null;
 ctx.setTransform(w / width, 0, 0, h / height, 0, 0);
 return {ctx, width, height};
}
