// Screens every view gets: Time, Search, Me, and the Scan sheet
import { st, go, root, viewInfo, searchAll, poOf } from '../store.js';
import { TIME_TASKS, VIEWS, SITES, PEOPLE, itemByKey } from '../data.js';
import { ICON } from '../icons.js';
import { esc, row, list, group, seg, status, avatar, sec } from '../ui.js';

const HRS = (inNow) => [8.5, 9, 8, 8.5, inNow ? 4.9 : 4.5, 0, 0];

export const screens = {
  time: {
    tab: 'time',
    title: () => 'Time card',
    eyebrow: () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    render() {
      const c = st.clock;
      const jobs = TIME_TASKS[st.view];
      const j = jobs[c.jobIdx];
      const entries = [
        { ...jobs[0], span: '6:58 – 9:40 AM', h: '2.7 h' },
        { ...jobs[1], span: '9:40 – 11:30 AM', h: '1.8 h' },
      ];
      if (c.jobIdx > 1) entries.push({ ...j, span: '11:30 AM – now', h: '0.4 h' });
      const hrs = HRS(c.in);
      const todayIdx = (new Date().getDay() + 6) % 7;
      return `
        <section class="panel" style="display:flex;flex-direction:column;gap:14px">
          <div style="display:flex;align-items:center;gap:10px">
            ${status(c.in ? 'Clocked in since 6:58 AM' : 'Clocked out', c.in ? 'green' : 'grey')}
            <span style="flex:1"></span>
            <span class="clock-big">${c.in ? '4.9' : '4.5'} h</span>
          </div>
          ${c.in ? `<div class="card pad" style="background:#f7f8fa;border:none">
            <div class="label">Working on</div>
            <div class="row-title" style="font-size:17px;margin-top:2px"><span class="key">${esc(j.item)}</span></div>
            <div class="row-sub">${esc(j.task)} · since ${c.jobIdx === 0 ? '6:58 AM' : '11:30 AM'}</div></div>` : ''}
          <div class="btn-row">
            ${c.in ? '<button type="button" class="btn soft" data-act="clockPick">Switch job</button>' : ''}
            <button type="button" class="btn ${c.in ? 'soft' : 'green'}" style="${c.in ? 'color:#d70015' : ''}" data-act="clockToggle">${c.in ? 'Clock out' : 'Clock in'}</button>
          </div>
          ${c.picking ? list(jobs.map((x, i) => row({ icon: 'time', tone: i === c.jobIdx ? 'blue' : 'grey', title: `<span class="key">${esc(x.item)}</span>`, sub: esc(x.task), act: 'clockJob', d: { i } }))) : ''}
        </section>
        ${sec('Today')}
        ${list(entries.map((e) => row({ title: `<span class="key">${esc(e.item)}</span>`, sub: `${esc(e.task)} · ${e.span}`, right: `<b>${e.h}</b>` })), 'no-icons')}
        ${sec('This week')}
        <div class="card pad" style="display:flex;flex-direction:column;gap:12px">
          <div class="week-bars">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) =>
            `<div class="week-day"><span class="${i === todayIdx ? 'today' : hrs[i] ? 'has' : ''}" style="height:${Math.max(4, Math.round((hrs[i] / 10) * 70))}px"></span><small>${d}</small></div>`).join('')}</div>
          <div style="display:flex;align-items:center;gap:10px">
            <span style="flex:1;font-size:15px"><b>${hrs.reduce((a, b) => a + b, 0).toFixed(1)} h</b> this week</span>
            <button type="button" class="pill ${c.submitted ? 'soft' : 'fill'}" data-act="clockSubmit">${c.submitted ? 'Submitted' : 'Submit week'}</button>
          </div>
        </div>`;
    },
  },

  search: {
    back: true,
    title: () => 'Search',
    eyebrow: () => 'Jobs · items · POs · kits · parts',
    render() {
      const res = searchAll(st.q);
      const kinds = { item: 'Project items', po: 'Purchase orders', kit: 'Kits', part: 'Parts' };
      const rowOf = (r) => {
        if (r.kind === 'item') return row({ icon: 'cube', tone: 'blue', title: `<span class="key">${esc(r.it.key)}</span> ${esc(r.it.desc)}`, sub: `${esc(r.it.customer)} · ${SITES[r.it.site].name}`, act: 'openItem', d: { key: r.it.key } });
        if (r.kind === 'po') return row({ icon: 'recv', tone: 'blue', title: `PO ${esc(r.p.po)} · ${esc(r.p.vendor)}`, sub: esc(r.p.item), act: 'openPo', d: { po: r.p.po } });
        if (r.kind === 'kit') return row({ icon: 'kit', tone: 'violet', title: `Kit <span class="key">${esc(r.k.item)}</span>`, sub: `${r.k.lines.length} parts · ${SITES[r.k.site].name}`, act: 'openKit', d: { kit: r.k.item } });
        return row({ icon: 'clip', tone: 'grey', title: esc(r.l.part), sub: `${esc(r.l.desc)} · ${esc(r.where)}`, act: 'searchGo', d: { to: JSON.stringify(r.to) } });
      };
      const body = st.q.trim()
        ? (res.length
          ? Object.keys(kinds).map((k) => { const rs = res.filter((r) => r.kind === k); return rs.length ? group(kinds[k], rs.length) + list(rs.map(rowOf)) : ''; }).join('')
          : `<div class="card pad" style="text-align:center"><div class="row-title">No matches</div><div class="small">Try a job number, PO, vendor or part number.</div></div>`)
        : `${group('Try')}<div class="chips">${['19204', 'PO 24118', 'Parker', '4484K9', 'Tote dump', 'BrucePac'].map((t) => `<button type="button" class="chip" data-act="searchTry" data-q="${esc(t)}">${esc(t)}</button>`).join('')}</div>`;
      return `
        <label class="search">${ICON.search}<input type="search" id="q" data-input="q" value="${esc(st.q)}" placeholder="Search" autocomplete="off" enterkeyhint="search"></label>
        <div id="results">${body}</div>`;
    },
    mount() { const q = document.getElementById('q'); if (q && !st.q) q.focus(); },
  },

  me: {
    back: true,
    title: () => 'Me',
    eyebrow: () => viewInfo().label,
    render() {
      const v = viewInfo();
      const p = PEOPLE[v.user];
      return `
        <section class="panel me-head">
          ${avatar(v.user)}
          <div><div class="me-name">${esc(v.user)}</div><div class="muted">${esc(p.job)} · ${esc(v.label)} view</div></div>
        </section>
        ${sec('This week')}
        <div class="card pad" style="display:flex;flex-direction:column;gap:12px">
          <div class="week-bars">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) =>
            `<div class="week-day"><span class="${i === todayIdx ? 'today' : hrs[i] ? 'has' : ''}" style="height:${Math.max(4, Math.round((hrs[i] / 10) * 70))}px"></span><small>${d}</small></div>`).join('')}</div>
          <div style="display:flex;align-items:center;gap:10px">
            <span style="flex:1;font-size:15px"><b>${hrs.reduce((a, b) => a + b, 0).toFixed(1)} h</b> this week</span>
            <button type="button" class="pill ${c.submitted ? 'soft' : 'fill'}" data-act="clockSubmit">${c.submitted ? 'Submitted' : 'Submit week'}</button>
          </div>
        </div>`;
    },
  },

  search: {
    back: true,
    title: () => 'Search',
    eyebrow: () => 'Jobs · items · POs · kits · parts',
    render() {
      const res = searchAll(st.q);
      const kinds = { item: 'Project items', po: 'Purchase orders', kit: 'Kits', part: 'Parts' };
      const rowOf = (r) => {
        if (r.kind === 'item') return row({ icon: 'cube', tone: 'blue', title: `<span class="key">${esc(r.it.key)}</span> ${esc(r.it.desc)}`, sub: `${esc(r.it.customer)} · ${SITES[r.it.site].name}`, act: 'openItem', d: { key: r.it.key } });
        if (r.kind === 'po') return row({ icon: 'recv', tone: 'blue', title: `PO ${esc(r.p.po)} · ${esc(r.p.vendor)}`, sub: esc(r.p.item), act: 'openPo', d: { po: r.p.po } });
        if (r.kind === 'kit') return row({ icon: 'kit', tone: 'violet', title: `Kit <span class="key">${esc(r.k.item)}</span>`, sub: `${r.k.lines.length} parts · ${SITES[r.k.site].name}`, act: 'openKit', d: { kit: r.k.item } });
        return row({ icon: 'clip', tone: 'grey', title: esc(r.l.part), sub: `${esc(r.l.desc)} · ${esc(r.where)}`, act: 'searchGo', d: { to: JSON.stringify(r.to) } });
      };
      const body = st.q.trim()
        ? (res.length
          ? Object.keys(kinds).map((k) => { const rs = res.filter((r) => r.kind === k); return rs.length ? group(kinds[k], rs.length) + list(rs.map(rowOf)) : ''; }).join('')
          : `<div class="card pad" style="text-align:center"><div class="row-title">No matches</div><div class="small">Try a job number, PO, vendor or part number.</div></div>`)
        : `${group('Try')}<div class="chips">${['19204', 'PO 24118', 'Parker', '4484K9', 'Tote dump', 'BrucePac'].map((t) => `<button type="button" class="chip" data-act="searchTry" data-q="${esc(t)}">${esc(t)}</button>`).join('')}</div>`;
      return `
        <label class="search">${ICON.search}<input type="search" id="q" data-input="q" value="${esc(st.q)}" placeholder="Search" autocomplete="off" enterkeyhint="search"></label>
        <div id="results">${body}</div>`;
    },
    mount() { const q = document.getElementById('q'); if (q && !st.q) q.focus(); },
  },

  me: {
    back: true,
    title: () => 'Me',
    eyebrow: () => viewInfo().label,
    render() {
      const v = viewInfo();
      const p = PEOPLE[v.user];
      return `
        <section class="panel me-head">
          ${avatar(v.user)}
          <div><div class="me-name">${esc(v.user)}</div><div class="muted">${esc(p.job)} · ${esc(v.label)} view</div></div>
        </section>
        ${sec('Site')}
        ${seg([['nampa', 'Nampa'], ['rupert', 'Rupert'], ['both', 'Both']], st.site, 'setSite')}
        <div class="small" style="padding:6px 4px 0">${st.site === 'both' ? 'Showing work from both shops.' : esc(SITES[st.site].role) + '. Only ' + esc(SITES[st.site].name) + ' work shows.'}</div>
        ${sec('This week')}
        ${list([
          row({ icon: 'time', tone: 'blue', title: '38.9 h logged', sub: st.clock.submitted ? 'Submitted for approval' : 'Not submitted yet', act: 'tabTime' }),
          row({ icon: 'bell', tone: 'amber', title: 'Notifications', sub: 'Dashboard bell, plus email for anything late', right: status('On', 'green') }),
        ])}
        ${sec('App')}
        ${list([
          row({ icon: 'swap', tone: 'violet', title: 'Switch view', sub: 'Warehouse, Projects & field, Shop, Purchasing', act: 'switchView' }),
          row({ icon: 'lock', tone: 'grey', title: 'Lock', sub: 'Back to the passcode', act: 'lock' }),
        ])}
        <div class="small" style="text-align:center;margin-top:18px">IESM Mobile · V 0.2 demo · <span class="sample-tag">Sample data</span></div>`;
    },
  },
};

// ---- Scan sheet (drawn over any screen) ----
const SCANS = {
  recv: [['PO 24131 packing slip', 'Baldor · arriving today', { screen: 'po', po: '24131' }], ['PO 24126 packing slip', 'Dodge', { screen: 'po', po: '24126' }]],
  kit: [['Kit tag 19204-BC002', 'Ready to pull', { screen: 'kitDetail', kit: '19204-BC002' }], ['Kit tag 19312-TD001', 'Short 2 parts', { screen: 'kitDetail', kit: '19312-TD001' }]],
  any: [['Part label MMC 4484K9', 'Clamping hanger, 304 SS', { screen: 'kitDetail', kit: '19204-BC002' }], ['Crate tag 19160-BC001', 'Load for BrucePac', { screen: 'load', load: 'L-19160' }]],
};
let stream = null;
export function renderSheet() {
  if (st.sheet !== 'scan') return '';
  const ctx = st.screen === 'kit' || st.screen === 'kitDetail' ? 'kit' : 'recv';
  const opts = [...SCANS[ctx], ...SCANS.any];
  return `
    <div class="sheet-bg" data-act="closeSheet"></div>
    <div class="sheet" role="dialog" aria-label="Scan a label">
      <div class="sheet-grip"></div>
      <div class="sheet-head"><h3>Scan a label</h3><button type="button" class="pill" data-act="closeSheet">Done</button></div>
      <div class="viewfinder"><video id="cam" playsinline muted></video><div class="frame"></div><div class="laser"></div><div class="vf-note" id="camNote">Point at a packing slip, kit tag or part label</div></div>
      ${group('Demo · tap what you scanned')}
      ${list(opts.map(([t, s, to]) => row({ icon: 'scan', tone: 'blue', title: esc(t), sub: esc(s), act: 'scanPick', d: { to: JSON.stringify(to) } })))}
      <div class="small" style="text-align:center;margin-top:10px">Reading the barcode is simulated in the demo.</div>
    </div>`;
}
export async function mountSheet() {
  const v = document.getElementById('cam');
  if (!v) return;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    if (st.sheet !== 'scan') return stopCam();
    v.srcObject = stream;
    await v.play();
  } catch {
    const n = document.getElementById('camNote');
    if (n) n.textContent = 'Camera not available — pick a label below';
  }
}
export function stopCam() { if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; } }

export const actions = {
  clockToggle() { st.banner = st.clock.in ? 'Clocked out at ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Clocked in'; st.clock.in = !st.clock.in; st.clock.picking = false; },
  clockPick() { st.clock.picking = !st.clock.picking; st.keepScroll = true; },
  clockJob(el) { const i = Number(el.dataset.i); const j = TIME_TASKS[st.view][i]; Object.assign(st.clock, { jobIdx: i, picking: false }); st.banner = 'Now on ' + j.item + ' · ' + j.task; },
  clockSubmit() { st.clock.submitted = true; st.banner = 'Week submitted for approval'; },
  goSearch: () => go('search'),
  searchTry(el) { st.q = el.dataset.q; },
  searchGo(el) { const to = JSON.parse(el.dataset.to); go(to.screen, to); },
  goMe: () => go('me'),
  setSite(el) { st.site = el.dataset.v; st.keepScroll = true; },
  tabTime: () => root('time'),
  openScan() { st.sheet = 'scan'; st.keepScroll = true; },
  closeSheet() { st.sheet = null; stopCam(); st.keepScroll = true; },
  scanPick(el) { const to = JSON.parse(el.dataset.to); st.sheet = null; stopCam(); go(to.screen, to); st.banner = 'Scanned — opened ' + (to.po ? 'PO ' + to.po : to.kit ? 'kit ' + to.kit : 'load ' + (to.load || '').replace('L-', '')); },
};

// Typing in search: redraw only the results, so the keyboard stays up
export function onSearchInput(el, rerenderResults) {
  st.q = el.value;
  rerenderResults();
}

export { VIEWS, itemByKey, poOf };
