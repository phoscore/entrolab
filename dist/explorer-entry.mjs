// Load the Explorer's viewer and styles only when its tab is opened.
const panel = document.getElementById('explorer');
const content = document.getElementById('exContent');
let viewer = null, pending = false, failed = false, styleLink = null;
let retryCount = 0;
const stylesheetTimeoutMs = 15000;
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
  return status;
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
    void sync(retry);
  }, {once: true});
  box.append(message, retry);
  content.replaceChildren(box);
  localizeState();
  return retry;
}

function hasExplorerRules(link) {
  try { return Boolean(link?.sheet && link.sheet.cssRules.length > 0); }
  catch { return false; }
}

function loadStylesheet(retry) {
  if (hasExplorerRules(styleLink)) return Promise.resolve();
  if (styleLink) {
    styleLink.remove();
    styleLink = null;
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  const url = new URL('./explorer.css', import.meta.url);
  if (retry) url.searchParams.set('retry', `${Date.now()}-${++retryCount}`);
  link.href = url.href;
  link.dataset.explorerStyle = '';
  styleLink = link;
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      link.removeEventListener('load', loaded);
      link.removeEventListener('error', fail);
    };
    const fail = () => {
      cleanup();
      link.remove();
      if (styleLink === link) styleLink = null;
      reject(new Error('Explorer stylesheet did not load.'));
    };
    const loaded = () => {
      if (!hasExplorerRules(link)) { fail(); return; }
      cleanup();
      link.dataset.explorerLoaded = 'true';
      resolve();
    };
    const timer = setTimeout(fail, stylesheetTimeoutMs);
    link.addEventListener('load', loaded);
    link.addEventListener('error', fail);
    document.head.append(link);
  });
}

async function sync(retry = null) {
  const active = panel.classList.contains('active');
  if (viewer) { viewer.setActive(active); return; }
  if (!active || pending || failed) return;
  pending = true;
  const restoreFocus = retry && document.activeElement === retry;
  const status = loadingState();
  if (restoreFocus) {
    status.tabIndex = -1;
    status.focus({preventScroll: true});
  }
  const ownsFocus = () => panel.classList.contains('active') && document.activeElement === status;
  try {
    await loadStylesheet(retry);
    const {mountExplorer} = await import('./explorer/viewer.mjs');
    const focusOnSuccess = ownsFocus();
    const mounted = mountExplorer(content);
    if (!mounted || typeof mounted.setActive !== 'function') {
      mounted?.dispose?.();
      throw new Error('Explorer viewer did not return a controller.');
    }
    viewer = mounted;
    window.entrolabExplorer = viewer;
    viewer.setActive(panel.classList.contains('active'));
    if (focusOnSuccess) document.getElementById('heading-explorer').focus();
  } catch {
    failed = true;
    const focusOnError = ownsFocus();
    const button = errorState();
    if (focusOnError) button.focus();
  } finally {
    pending = false;
  }
}

const observer = new MutationObserver(() => { localizeState(); void sync(); });
observer.observe(panel, {attributes: true, attributeFilter: ['class']});
observer.observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
void sync();
