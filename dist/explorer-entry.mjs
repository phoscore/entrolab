// Load the Explorer's viewer and styles only when its tab is opened.
const panel = document.getElementById('explorer');
const content = document.getElementById('exContent');
let viewer = null, pending = false, failed = false, styleLink = null;
const english = () => document.documentElement.lang === 'en';

function localizeState() {
  const status = content.querySelector('.explorer-load-state');
  if (status) status.textContent = english() ? 'Loading the Cosmic Explorer…' : 'Cosmic Explorer wird geladen…';
  const error = content.querySelector('.explorer-load-error');
  if (error) {
    error.querySelector('p').textContent = english() ? 'Explorer resources could not be loaded.' : 'Explorer-Ressourcen konnten nicht geladen werden.';
    error.querySelector('button').textContent = english() ? 'Retry' : 'Erneut versuchen';
  }
}

function loadingState() {
  const status = document.createElement('p');
  status.className = 'explorer-load-state';
  status.setAttribute('role', 'status');
  status.textContent = english() ? 'Loading the Cosmic Explorer…' : 'Cosmic Explorer wird geladen…';
  content.replaceChildren(status);
}

function errorState() {
  const box = document.createElement('div');
  box.className = 'explorer-load-error';
  box.setAttribute('role', 'alert');
  const message = document.createElement('p');
  const retry = document.createElement('button');
  retry.id = 'explorerRetry';
  retry.type = 'button';
  retry.addEventListener('click', () => {
    failed = false;
    void sync();
  }, {once: true});
  box.append(message, retry);
  content.replaceChildren(box);
  localizeState();
}

function hasExplorerRules(link) {
  try { return Boolean(link?.sheet && link.sheet.cssRules.length > 0); }
  catch { return false; }
}

function loadStylesheet() {
  if (hasExplorerRules(styleLink)) return Promise.resolve();
  if (styleLink) {
    styleLink.remove();
    styleLink = null;
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('./explorer.css', import.meta.url).href;
  link.dataset.explorerStyle = '';
  styleLink = link;
  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = () => {
      if (settled) return;
      settled = true;
      link.remove();
      if (styleLink === link) styleLink = null;
      reject(new Error('Explorer stylesheet did not load.'));
    };
    link.addEventListener('load', () => {
      if (!hasExplorerRules(link)) { fail(); return; }
      settled = true;
      link.dataset.explorerLoaded = 'true';
      resolve();
    }, {once: true});
    link.addEventListener('error', fail, {once: true});
    document.head.append(link);
  });
}

async function sync() {
  const active = panel.classList.contains('active');
  if (viewer) { viewer.setActive(active); return; }
  if (!active || pending || failed) return;
  pending = true;
  loadingState();
  const retry = content.querySelector('#explorerRetry');
  if (retry) retry.disabled = true;
  try {
    await loadStylesheet();
    const {mountExplorer} = await import('./explorer/viewer.mjs');
    const mounted = mountExplorer(content);
    if (!mounted || typeof mounted.setActive !== 'function') {
      mounted?.dispose?.();
      throw new Error('Explorer viewer did not return a controller.');
    }
    viewer = mounted;
    window.entrolabExplorer = viewer;
    viewer.setActive(panel.classList.contains('active'));
  } catch {
    failed = true;
    errorState();
  } finally {
    pending = false;
  }
}

const observer = new MutationObserver(() => { localizeState(); void sync(); });
observer.observe(panel, {attributes: true, attributeFilter: ['class']});
observer.observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
void sync();
