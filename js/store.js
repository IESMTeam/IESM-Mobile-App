// App state and the small helpers every screen shares.
// Everything lives in memory: reloading the app starts the demo fresh.
import { POS, KITS, LOADS, BUY, COS, ITEMS, STAGES, VIEWS, stageIndex, itemByKey } from './data.js';

export const st = {
  phase: 'splash',              // splash | lock | views | app
  code: '', codeBad: false, lastPhase: null,
  view: null, site: 'both',
  screen: 'home', params: {}, hist: [],
  banner: '',
  sheet: null,                  // 'scan' when the scan sheet is open
  queueTab: 'open', doneQ: {}, lastDoneQ: null,
  recvGot: Object.fromEntries(POS.flatMap((p) => p.lines.map((l) => [l.id, l.got || 0]))),
  kitPulled: {}, kitDone: {},
  stageAt: {}, stageChecks: {}, itemPhotos: {},
  loadChecks: {}, loadPhotos: {}, shipped: {},
  buyState: Object.fromEntries(BUY.flatMap((g) => g.lines.map((l) => [l.id, l.state]))),
  buySel: [], buyTab: 'jobs',
  cos: COS.map((c) => ({ ...c })), draft: null,
  clock: { in: true, jobIdx: 0, picking: false, submitted: false },
  q: '',
  holds: {}, signed: {}, issueFor: null, homeWho: 'mine',
  weather: {},
  keepScroll: false,
};

export const viewInfo = () => VIEWS[st.view];
export const siteOk = (site) => !site || st.site === 'both' || st.site === site;

// ---- navigation ----
export function go(screen, params = {}) {
  st.hist.push({ screen: st.screen, params: st.params });
  Object.assign(st, { screen, params, banner: '' });
  st.scrollTop = true;
}
export function back() {
  const prev = st.hist.pop() || { screen: 'home', params: {} };
  Object.assign(st, { screen: prev.screen, params: prev.params, banner: '' });
}
export function root(screen, params = {}) {
  Object.assign(st, { screen, params, hist: [], banner: '' });
  st.scrollTop = true;
}

// ---- project items: where each one is, and its checklist ----
export const stageKeyOf = (it) => st.stageAt[it.key] || it.at;
export const stageOfItem = (it) => STAGES[stageIndex(stageKeyOf(it))];
export function checksOf(it) {
  const s = stageOfItem(it);
  const id = it.key + ':' + s.key;
  if (!st.stageChecks[id]) {
    // Seed from the sample's percent so items start part-way through
    const n = st.stageAt[it.key] ? 0 : Math.floor(((it.pct || 0) / 100) * s.checks.length);
    st.stageChecks[id] = Object.fromEntries(s.checks.map((_, i) => [i, i < n]));
  }
  return st.stageChecks[id];
}
export const checksDone = (it) => Object.values(checksOf(it)).filter(Boolean).length;
export const itemPct = (it) => Math.round((checksDone(it) / stageOfItem(it).checks.length) * 100);
export const isHeld = (it) => (it.key in st.holds ? !!st.holds[it.key] : !!it.held && !st.stageAt[it.key]);

// ---- POs / kits / loads ----
export const poOf = (n) => POS.find((p) => p.po === n);
export const poGot = (p) => p.lines.filter((l) => st.recvGot[l.id] >= l.qty).length;
export function poStatus(p) {
  const full = poGot(p) === p.lines.length;
  const some = p.lines.some((l) => st.recvGot[l.id] > 0);
  if (full) return ['Received', 'green'];
  if (p.backorder || p.due < 0) return ['Late', 'red'];
  if (some) return ['Partial', 'amber'];
  return [p.due === 0 ? 'Due today' : null, 'blue'];
}
export const kitOf = (k) => KITS.find((x) => x.item === k);
export const kitPulledCount = (k) => k.lines.filter((l) => (st.kitPulled[k.item] || {})[l.id]).length;
export const loadOf = (id) => LOADS.find((l) => l.id === id);

// ---- purchasing ----
export const buyLines = () => BUY.flatMap((g) => g.lines.map((l) => ({ ...l, item: g.item, site: g.site, state: st.buyState[l.id] })));
export const openBuyCount = () => buyLines().filter((l) => siteOk(l.site) && (l.state === 'Needs purchasing' || l.state === 'RFQ sent')).length;

// ---- search ----
export function searchAll(q) {
  q = q.trim().toLowerCase();
  if (!q) return [];
  const hit = (...v) => v.some((x) => String(x || '').toLowerCase().includes(q));
  const out = [];
  ITEMS.forEach((it) => hit(it.key, it.desc, it.customer, it.project) && out.push({ kind: 'item', it }));
  POS.forEach((p) => hit('po ' + p.po, p.po, p.vendor, p.item) && out.push({ kind: 'po', p }));
  KITS.forEach((k) => hit('kit ' + k.item) && out.push({ kind: 'kit', k }));
  const parts = new Map();
  [...POS.flatMap((p) => p.lines.map((l) => ({ l, where: 'PO ' + p.po, to: { screen: 'po', po: p.po } }))),
   ...KITS.flatMap((k) => k.lines.map((l) => ({ l, where: 'Kit ' + k.item, to: { screen: 'kitDetail', kit: k.item } })))]
    .forEach((x) => { if (hit(x.l.part, x.l.desc) && !parts.has(x.l.part + x.where)) parts.set(x.l.part + x.where, x); });
  parts.forEach((x) => out.push({ kind: 'part', ...x }));
  return out.slice(0, 30);
}

export { itemByKey };
