// This entry point loads the viewer and its styles only when its tab is opened.
const panel = document.getElementById('explorer');
const content = document.getElementById('exContent');
let viewer = null, pending = false;
async function sync() {
  const active = panel.classList.contains('active');
  if (viewer) {viewer.setActive(active);return;}
  if (!active || pending) return;
  pending = true;
  try {
    if (!document.querySelector('link[data-explorer-style]')) {
      const link = document.createElement('link');link.rel='stylesheet';link.href='explorer.css';link.dataset.explorerStyle='';document.head.append(link);
    }
    const {mountExplorer} = await import('./explorer/viewer.mjs');
    viewer = mountExplorer(content);
    window.entrolabExplorer = viewer;
    viewer.setActive(panel.classList.contains('active'));
  } catch (error) {
    const en = document.documentElement.lang === 'en';
    content.replaceChildren();
    const message = document.createElement('p');message.textContent=en?'Explorer could not be loaded.':'Explorer konnte nicht geladen werden.';
    const retry = document.createElement('button');retry.textContent=en?'Retry':'Erneut versuchen';retry.onclick=sync;
    content.append(message,retry);
  } finally {pending=false;}
}
new MutationObserver(sync).observe(panel,{attributes:true,attributeFilter:['class']});
sync();
