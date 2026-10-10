// IESM mobile demo — plain JS, no frameworks.
// All data is fake and lives in memory; a page reload starts fresh.
import { PASSCODE, ROLES, TAB_LABELS } from './config.js';
import { initialData } from './data.js';
import { esc } from './ui.js';

import * as home from './screens/home.js';
import * as time from './screens/time.js';
import * as receiving from './screens/receiving.js';
import * as kitting from './screens/kitting.js';
import * as projects from './screens/projects.js';
import * as changeOrders from './screens/changeOrders.js';
import * as fabrication from './screens/fabrication.js';
import * as shipping from './screens/shipping.js';
import * as purchasing from './screens/purchasing.js';

const SCREENS = { home, time, receiving, kitting, projects, changeOrders, fabrication, shipping, purchasing };

const st = {
  unlocked: false,
  code: '',
  codeBad: false,
  role: null,
  tab: 'home',
  data: structuredClone(initialData),
  view: {}, // per-screen UI state (which PO is open, etc.)
};

const root = document.getElementById('app');

// ---------- Passcode ----------
function renderLock() {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
  return `
    <div class="lock">
      <div class="logo">IESM</div>
      <div class="prompt">${st.codeBad ? 'Wrong passcode, try again' : 'Enter passcode'}</div>
      <div class="dots ${st.codeBad ? 'bad' : ''}">
        ${[...PASSCODE].map((_, i) => `<div class="dot ${i < st.code.length ? 'on' : ''}"></div>`).join('')}
      </div>
      <div class="keys">
        ${keys.map((k) => `<button class="key ${k ? '' : 'blank'}" data-act="key" data-value="${k}">${k}</button>`).join('')}
      </div>
      <div class="demo">Demo build · sample data only</div>
    </div>`;
}

function pressKey(k) {
  if (!k) return;
  st.codeBad = false;
  if (k === '⌫') { st.code = st.code.slice(0, -1); return; }
  st.code += k;
  if (st.code.length < PASSCODE.length) return;
  if (st.code === PASSCODE) st.unlocked = true;
  else { st.codeBad = true; navigator.vibrate?.(200); }
  st.code = '';
}

// ---------- Role picker (demo only — later the role comes from the login) ----------
function renderRoles() {
  return `
    <div class="roles">
      <h1>Who's using the app?</h1>
      <p class="muted">Pick a role to see its screens. You can switch any time from Home.</p>
      ${ROLES.map((r) => `
        <button class="role" data-act="pickRole" data-value="${r.key}">
          <div class="name">${esc(r.label)}</div>
          <div class="muted mt4">Home · Time · ${r.tabs.map((t) => TAB_LABELS[t]).join(' · ')}</div>
        </button>`).join('')}
    </div>`;
}

// ---------- Main render ----------
function tabsFor(role) {
  return ['home', ...ROLES.find((r) => r.key === role).tabs, 'time'];
}

function render() {
  if (!st.unlocked) { root.innerHTML = renderLock(); return; }
  if (!st.role) { root.innerHTML = renderRoles(); return; }

  const screen = SCREENS[st.tab];
  root.innerHTML = `
    ${screen.render(st)}
    <nav class="tabbar">
      ${tabsFor(st.role).map((t) => `<button class="${t === st.tab ? 'on' : ''}" data-act="tab" data-value="${t}">${TAB_LABELS[t]}</button>`).join('')}
    </nav>`;
  screen.mount?.(st, root, render);
}

// Built-in actions shared by every screen
const appActions = {
  key: (el) => pressKey(el.dataset.value),
  pickRole: (el) => { st.role = el.dataset.value; st.tab = 'home'; st.view = {}; window.scrollTo(0, 0); },
  tab: (el) => { st.tab = el.dataset.value; window.scrollTo(0, 0); },
  switchRole: () => { st.role = null; },
  lock: () => { st.unlocked = false; st.role = null; },
};

// One click handler for the whole app: find the nearest [data-act] and run it.
root.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el || el.disabled) return;
  // Let taps on inner buttons (like − / +) win over the row they sit in.
  ev.stopPropagation();
  const name = el.dataset.act;
  const fn = appActions[name] || SCREENS[st.tab]?.actions?.[name];
  if (!fn) return;
  if (fn === appActions[name]) fn(el, ev);
  else fn(st, el, ev);
  render();
});

// Text inputs / file pickers: screens handle these without a full re-render.
root.addEventListener('input', (ev) => SCREENS[st.tab]?.onInput?.(st, ev.target, render));
root.addEventListener('change', (ev) => SCREENS[st.tab]?.onChange?.(st, ev.target, render));

render();
