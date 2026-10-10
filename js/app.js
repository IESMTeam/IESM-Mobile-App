// IESM mobile demo — plain JavaScript, no frameworks.
// Flow: launch animation → passcode → choose your view → the app.
import { PASSCODE, SPLASH_MS } from './config.js';
import { VIEWS, VIEW_ORDER, PEOPLE, QUEUES, POS, KITS, LOADS } from './data.js';
import { ICON, mark, splashMark } from './icons.js';
import { esc, avatar, ico } from './ui.js';
import { st, back, root, siteOk, viewInfo, poGot, openBuyCount } from './store.js';
import * as home from './views/home.js';
import * as warehouse from './views/warehouse.js';
import * as field from './views/field.js';
import * as shop from './views/shop.js';
import * as purchasing from './views/purchasing.js';
import * as common from './views/common.js';
import * as steps from './views/steps.js';
import { seg } from './ui.js';

const SCREENS = { ...home.screens, ...warehouse.screens, ...field.screens, ...shop.screens, ...purchasing.screens, ...common.screens };
const VIEW_ACTIONS = { ...steps.actions, ...home.actions, ...warehouse.actions, ...field.actions, ...shop.actions, ...purchasing.actions, ...common.actions };
const app = document.getElementById('app');

// ---------- tabs ----------
const TAB = {
  home: { label: 'Home', icon: 'home', screen: 'home' },
  recv: { label: 'Receiving', icon: 'recv', screen: 'recv' },
  kit: { label: 'Kitting', icon: 'kit', screen: 'kit' },
  proj: { label: 'Projects', icon: 'proj', screen: 'projects' },
  co: { label: 'Changes', icon: 'co', screen: 'co' },
  fab: { label: 'Shop', icon: 'fab', screen: 'fab' },
  ship: { label: 'Shipping', icon: 'ship', screen: 'ship' },
  models: { label: '3D', icon: 'models', screen: 'models' },
  buy: { label: 'Purchasing', icon: 'buy', screen: 'buy' },
  time: { label: 'Time', icon: 'time', screen: 'time' },
};
function badge(k) {
  if (k === 'home') return QUEUES[st.view].filter((q) => siteOk(q.site) && !st.doneQ[q.id]).length;
  if (k === 'recv') return POS.filter((p) => siteOk(p.site) && poGot(p) < p.lines.length && (p.due < 0 || p.backorder)).length;
  if (k === 'kit') return KITS.filter((x) => siteOk(x.site) && x.short && !st.kitDone[x.item]).length;
  if (k === 'co') return st.cos.filter((c) => c.status === 'pending').length;
  if (k === 'buy') return openBuyCount();
  if (k === 'ship') return LOADS.filter((l) => siteOk(l.site) && !st.shipped[l.id] && l.ship <= 2).length;
  return 0;
}

// ---------- splash / lock / views ----------
function renderSplash() {
  return `<button type="button" class="splash" data-act="skipSplash" aria-label="Open">${splashMark()}<span class="splash-tag">IESM Mobile</span></button>`;
}
function renderLock() {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
  return `
    <div class="lock ${st.lockEnter ? 'enter' : ''}">
      ${mark('lock-mark')}
      <div class="prompt ${st.codeBad ? 'bad' : ''}">${st.codeBad ? 'Wrong passcode' : 'Enter passcode'}</div>
      <div class="pin-dots ${st.codeBad ? 'shake' : ''}">${[...PASSCODE].map((_, i) => `<span class="${i < st.code.length ? 'on' : ''}"></span>`).join('')}</div>
      <div class="keys">${keys.map((k) => k === 'del'
        ? `<button type="button" class="pin-key del" data-act="key" data-k="del" aria-label="Delete">${ICON.del}</button>`
        : `<button type="button" class="pin-key ${k ? '' : 'blank'}" data-act="key" data-k="${k}"${k ? '' : ' tabindex="-1" aria-hidden="true"'}>${k}</button>`).join('')}</div>
    </div>`;
}
const VIEW_LOOK = { warehouse: ['recv', 'blue'], field: ['proj', 'violet'], shop: ['fab', 'amber'], purchasing: ['buy', 'green'] };
function renderViews() {
  return `
    <div class="shell">
      <header class="hdr">${mark()}<div class="titles"><div class="eyebrow">IESM Mobile</div><div class="hdr-title">Choose your view</div></div>
        <button type="button" class="hdr-btn" data-act="lock" aria-label="Lock">${ICON.lock}</button></header>
      <main>
        <div class="muted" style="padding:0 4px">Everyone gets Home, Search and Time. Pick the work you do — you can switch any time from Me.</div>
        <div class="list views anim">
          ${VIEW_ORDER.map((k) => {
            const v = VIEWS[k];
            const [icon, tone] = VIEW_LOOK[k];
            return `
              <button type="button" class="row" data-act="pickView" data-k="${k}">
                ${ico(icon, tone)}
                <span class="row-main"><span class="row-title" style="font-size:17px">${esc(v.label)}</span>
                  <span class="row-sub">${v.tabs.map((t) => TAB[t].label).join(' · ')}</span></span>
                <span class="row-right" style="flex-direction:row;align-items:center;gap:8px"><span class="small">${esc(v.user.split(' ')[0])}</span>${avatar(v.user)}</span>
              </button>`;
          }).join('')}
        </div>
        <div class="small" style="text-align:center">Demo · sample data from the dashboard's Pipeline page</div>
      </main>
    </div>`;
}

// ---------- the app shell ----------
function renderApp() {
  const sc = SCREENS[st.screen] || SCREENS.home;
  const v = viewInfo();
  const tabs = ['home', ...v.tabs, 'time'];
  const activeTab = sc.tab || st.activeTab;
  const showSearch = st.screen !== 'search';
  const showMe = st.screen !== 'me';
  return `
    <div class="shell">
      <header class="hdr">
        ${sc.back ? `<button type="button" class="hdr-btn hdr-back" data-act="back" aria-label="Back">${ICON.back}</button>` : mark()}
        <button type="button" class="titles hdr-switch" data-act="openViews" aria-label="Switch view">
          <span class="eyebrow">${esc(v.label)} ${ICON.down}</span><span class="hdr-title">${esc(sc.title())}</span></button>
        ${showSearch ? `<button type="button" class="hdr-btn" data-act="goSearch" aria-label="Search">${ICON.search}</button>` : ''}
        ${showMe ? `<button type="button" class="hdr-btn" style="width:auto" data-act="goMe" aria-label="Me">${avatar(v.user)}</button>` : ''}
      </header>
      <main id="main">
        ${st.banner ? `<div class="banner" role="status">${ICON.check}<span>${esc(st.banner)}</span></div>` : ''}
        ${SITE_PAGES.includes(st.screen) ? `<div class="site-seg">${seg([['nampa', 'Nampa'], ['rupert', 'Rupert'], ['both', 'Both sites']], st.site, 'setSite')}</div>` : ''}
        ${sc.render()}
      </main>
      <nav class="tabs" aria-label="Main" style="grid-template-columns:repeat(${tabs.length},minmax(0,1fr))">
        ${tabs.map((k) => {
          const n = badge(k);
          return `<button type="button" class="tab ${k === activeTab ? 'on' : ''}" data-act="tab" data-k="${k}">${ICON[TAB[k].icon]}${n ? `<span class="badge">${n}</span>` : ''}<span>${TAB[k].label}</span></button>`;
        }).join('')}
      </nav>
      ${common.renderSheet()}
      ${renderViewSheet()}
    </div>`;
}

const SITE_PAGES = ['home', 'recv', 'kit', 'projects', 'fab', 'ship', 'buy', 'models'];
function renderViewSheet() {
  if (st.sheet !== 'views') return '';
  return `
    <div class="sheet-bg" data-act="closeSheet"></div>
    <div class="sheet" role="dialog" aria-label="Switch view">
      <div class="sheet-grip"></div>
      <div class="sheet-head"><h3>Switch view</h3><button type="button" class="pill" data-act="closeSheet">Done</button></div>
      <div class="list views">${VIEW_ORDER.map((k) => {
        const v = VIEWS[k]; const [icon, tone] = VIEW_LOOK[k];
        return `<button type="button" class="row" data-act="pickView" data-k="${k}">${ico(icon, tone)}
          <span class="row-main"><span class="row-title">${esc(v.label)}</span><span class="row-sub">${esc(v.user)} · ${v.tabs.map((t) => TAB[t].label).join(' · ')}</span></span>
          ${k === st.view ? `<span class="st blue">Current</span>` : avatar(v.user)}</button>`;
      }).join('')}</div>
      <button type="button" class="btn soft" style="margin-top:12px" data-act="lock">${ICON.lock} Lock</button>
    </div>`;
}

// ---------- render ----------
let splashTimers = [];
function render() {
  const main = document.getElementById('main');
  const keep = st.keepScroll && main ? main.scrollTop : 0;
  st.lockEnter = st.phase === 'lock' && st.lastPhase !== 'lock';
  st.lastPhase = st.phase;
  app.innerHTML = { splash: renderSplash, lock: renderLock, views: renderViews, app: renderApp }[st.phase]();
  if (st.phase === 'app') {
    const m = document.getElementById('main');
    if (m) m.scrollTop = st.scrollTop ? 0 : keep;
    SCREENS[st.screen]?.mount?.(render);
    if (st.sheet) common.mountSheet();
  }
  st.keepScroll = false;
  st.scrollTop = false;
}
function startSplash() {
  splashTimers = [
    setTimeout(() => app.querySelector('.splash')?.classList.add('iesm-out'), SPLASH_MS),
    setTimeout(() => { if (st.phase === 'splash') { st.phase = 'lock'; render(); } }, SPLASH_MS + 330),
  ];
}
function pressKey(k) {
  st.codeBad = false;
  if (k === 'del') { st.code = st.code.slice(0, -1); return; }
  st.code += k;
  if (st.code.length < PASSCODE.length) return;
  if (st.code === PASSCODE) st.phase = 'views';
  else { st.codeBad = true; navigator.vibrate?.(200); }
  st.code = '';
}

const ACTIONS = {
  ...VIEW_ACTIONS,
  skipSplash() { splashTimers.forEach(clearTimeout); st.phase = 'lock'; },
  key: (el) => pressKey(el.dataset.k),
  pickView(el) {
    const k = el.dataset.k;
    Object.assign(st, { sheet: null, homeWho: 'mine', phase: 'app', view: k, site: VIEWS[k].site, screen: 'home', params: {}, hist: [], banner: '', activeTab: 'home', queueTab: 'open', buySel: [] });
    st.clock.jobIdx = 0;
    st.scrollTop = true;
  },
  switchView() { st.sheet = 'views'; common.stopCam(); st.keepScroll = true; },
  openViews() { st.sheet = 'views'; common.stopCam(); st.keepScroll = true; },
  lock() { Object.assign(st, { phase: 'lock', code: '', codeBad: false, sheet: null }); common.stopCam(); },
  back,
  tab(el) { st.activeTab = el.dataset.k; root(TAB[el.dataset.k].screen); },
};

app.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.act];
  if (!fn) return;
  const before = st.screen;
  fn(el, ev);
  // remember which tab a detail screen was opened from
  const sc = SCREENS[st.screen];
  if (sc && sc.tab) st.activeTab = sc.tab;
  else if (before !== st.screen && SCREENS[before]?.tab) st.activeTab = SCREENS[before].tab;
  render();
});
app.addEventListener('keydown', (ev) => {
  // checklist rows are divs: let Enter / Space work like a tap
  if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('.check[data-act]')) { ev.preventDefault(); ev.target.click(); }
});

// Typing: update state without redrawing the field (keeps the keyboard open)
app.addEventListener('input', (ev) => {
  const el = ev.target;
  if (el.dataset.input === 'q') {
    st.q = el.value;
    const box = document.getElementById('results');
    if (box) {
      const tmp = document.createElement('div');
      tmp.innerHTML = SCREENS.search.render();
      box.innerHTML = tmp.querySelector('#results').innerHTML;
    }
  } else if (el.dataset.input) field.onInput(el);
});

// Photos from the camera or library
app.addEventListener('change', (ev) => {
  const el = ev.target;
  if (!el.dataset.photo || !el.files?.[0]) return;
  const url = URL.createObjectURL(el.files[0]);
  const id = el.dataset.id;
  if (el.dataset.photo === 'item') (st.itemPhotos[id] ||= []).push(url);
  if (el.dataset.photo === 'load') { (st.loadPhotos[id] ||= []).push(url); }
  if (el.dataset.photo === 'co' && st.draft) st.draft = { ...st.draft, photos: [...st.draft.photos, url] };
  st.banner = 'Photo added';
  st.keepScroll = true;
  render();
});

render();
startSplash();
