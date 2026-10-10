// Receiving (POs coming in) and Kitting (pulling parts for project items)
import { st, siteOk, go, back, poOf, poGot, poStatus, kitOf, kitPulledCount } from '../store.js';
import { POS, KITS, SITES, shortDate, dayWord, itemByKey } from '../data.js';
import { ICON } from '../icons.js';
import { esc, row, list, check, status, plural, group, bar } from '../ui.js';

const scanBtn = `<button type="button" class="btn soft" data-act="openScan">${ICON.scan} Scan a label</button>`;
const siteTag = (s) => (st.site === 'both' ? ' · ' + SITES[s].name : '');

function poRow(p) {
  const [label, tone] = poStatus(p);
  const n = poGot(p);
  const when = p.due < 0 ? 'was due ' + shortDate(p.due) : 'due ' + dayWord(p.due);
  return row({
    icon: 'recv', tone: tone === 'red' ? 'red' : tone === 'green' ? 'green' : 'blue',
    title: `PO ${esc(p.po)} · ${esc(p.vendor)}`,
    sub: `${esc(p.item)}${siteTag(p.site)} · ${n} of ${plural(p.lines.length, 'line')}`,
    right: status(label || when, tone),
    act: 'openPo', d: { po: p.po },
  });
}

function kitRow(k) {
  const n = kitPulledCount(k);
  const done = st.kitDone[k.item];
  const it = itemByKey(k.item);
  return row({
    icon: 'kit', tone: done ? 'green' : k.short ? 'amber' : 'violet',
    title: `<span class="key">${esc(k.item)}</span>`,
    sub: `${esc(it ? it.desc : '')}${siteTag(k.site)} · needed ${dayWord(k.need)}`,
    right: status(done ? 'Staged' : n ? `${n} of ${k.lines.length}` : k.stage, done ? 'green' : k.short ? 'amber' : 'blue'),
    act: 'openKit', d: { kit: k.item },
  });
}

export const screens = {
  recv: {
    tab: 'recv',
    title: () => 'Receiving',
    eyebrow: () => POS.filter((p) => siteOk(p.site) && poGot(p) < p.lines.length).length + ' open POs',
    render() {
      const pos = POS.filter((p) => siteOk(p.site));
      const open = pos.filter((p) => poGot(p) < p.lines.length);
      const late = open.filter((p) => p.due < 0 || p.backorder);
      const soon = open.filter((p) => !(p.due < 0 || p.backorder) && p.due <= 1);
      const later = open.filter((p) => !(p.due < 0 || p.backorder) && p.due > 1);
      const done = pos.filter((p) => poGot(p) === p.lines.length);
      const block = (t, ps) => (ps.length ? group(t, ps.length) + list(ps.map(poRow)) : '');
      return `
        ${scanBtn}
        ${block('Late', late)}
        ${block('Today and tomorrow', soon)}
        ${block('Later this week', later)}
        ${block('Received', done)}`;
    },
  },

  po: {
    back: true,
    title: () => 'PO ' + st.params.po,
    eyebrow: () => { const p = poOf(st.params.po); return p.vendor + ' · ' + p.item; },
    render() {
      const p = poOf(st.params.po);
      const n = poGot(p);
      const [label, tone] = poStatus(p);
      const all = n === p.lines.length;
      return `
        <div class="card pad">
          <div class="facts">
            <div class="fact"><small>Vendor</small><b>${esc(p.vendor)}</b></div>
            <div class="fact"><small>For</small><b class="key">${esc(p.item)}</b></div>
            <div class="fact"><small>Due</small><b>${p.due < 0 ? shortDate(p.due) : dayWord(p.due)}</b></div>
            <div class="fact"><small>Dock</small><b>${esc(SITES[p.site].name)}</b></div>
          </div>
          <div class="bar-line" style="margin-top:14px">${bar((n / p.lines.length) * 100)}<span class="small">${n} of ${p.lines.length}</span></div>
        </div>
        ${p.backorder ? `<div class="hold">${ICON.warn}<span>The pump is back ordered at Parker. Receive what came in and purchasing will chase a new date.</span></div>` : ''}
        ${group('Lines · tap to receive all, or use − / +')}
        <div class="list">
          ${p.lines.map((l) => {
            const got = st.recvGot[l.id];
            return check({
              done: got >= l.qty, act: 'recvToggle', d: { id: l.id },
              title: esc(l.part), sub: `${esc(l.desc)} · bin ${esc(l.bin)}${l.backorder ? ' · <b style="color:#b3261e">back ordered</b>' : ''}`,
              right: `<span class="stepper"><button type="button" data-act="recvStep" data-id="${l.id}" data-d="-1" aria-label="One less">−</button><span>${got}/${l.qty}</span><button type="button" data-act="recvStep" data-id="${l.id}" data-d="1" aria-label="One more">+</button></span>`,
            });
          }).join('')}
        </div>
        <div class="btn-row">
          <button type="button" class="btn ${all ? 'green' : 'fill'}" data-act="recvAll">${all ? ICON.check + ' Received' : 'Receive all'}</button>
          <button type="button" class="btn soft" data-act="recvShort">Report shortage</button>
        </div>
        <div class="small" style="text-align:center">${label ? esc(label) + ' · ' : ''}Received lines post to FileMaker and tell purchasing.</div>`;
    },
  },

  kit: {
    tab: 'kit',
    title: () => 'Kitting',
    eyebrow: () => KITS.filter((k) => siteOk(k.site) && !st.kitDone[k.item]).length + ' kits to pull',
    render() {
      const kits = KITS.filter((k) => siteOk(k.site));
      const todo = kits.filter((k) => !st.kitDone[k.item]).sort((a, b) => a.need - b.need);
      const done = kits.filter((k) => st.kitDone[k.item]);
      return `
        ${scanBtn}
        ${todo.length ? group('To pull', todo.length) + list(todo.map(kitRow)) : ''}
        ${done.length ? group('Staged for assembly', done.length) + list(done.map(kitRow)) : ''}`;
    },
  },

  kitDetail: {
    back: true,
    title: () => 'Kit ' + st.params.kit,
    eyebrow: () => { const it = itemByKey(st.params.kit); return it ? it.desc : 'Kit'; },
    render() {
      const k = kitOf(st.params.kit);
      const it = itemByKey(k.item);
      const n = kitPulledCount(k);
      const all = n === k.lines.length;
      const staged = st.kitDone[k.item];
      return `
        <div class="card pad">
          <div class="facts">
            <div class="fact"><small>Project item</small><b class="key">${esc(k.item)}</b></div>
            <div class="fact"><small>Customer</small><b>${esc(it ? it.customer : '')}</b></div>
            <div class="fact"><small>Needed</small><b>${dayWord(k.need)}</b></div>
            <div class="fact"><small>Goes to</small><b>${esc(it && it.bay ? it.bay : SITES[k.site].name)}</b></div>
          </div>
          <div class="bar-line" style="margin-top:14px">${bar((n / k.lines.length) * 100)}<span class="small">${n} of ${k.lines.length} pulled</span></div>
        </div>
        ${group('Pull list · sorted by bin')}
        <div class="list">
          ${k.lines.slice().sort((a, b) => a.bin.localeCompare(b.bin)).map((l) => check({
            done: (st.kitPulled[k.item] || {})[l.id], act: 'kitToggle', d: { id: l.id },
            title: `${esc(l.part)} <span class="small">× ${l.qty}</span>`,
            sub: `${esc(l.desc)} · bin <b>${esc(l.bin)}</b>${l.missing ? ` · <span style="color:#9a5b00">not in yet — ${esc(l.missing)}</span>` : ''}`,
            cls: l.missing ? 'missing' : '',
          })).join('')}
        </div>
        <button type="button" class="btn ${staged ? 'green' : all ? 'fill' : 'off'}" data-act="kitStage">${staged ? ICON.check + ' Staged for assembly' : all ? 'Mark kit staged' : `${k.lines.length - n} left to pull`}</button>
        <button type="button" class="btn soft" data-act="openItem" data-key="${esc(k.item)}">${ICON.cube} See ${esc(k.item)} in 3D</button>`;
    },
  },
};

export const actions = {
  openPo: (el) => go('po', { po: el.dataset.po }),
  openKit: (el) => go('kitDetail', { kit: el.dataset.kit }),
  recvToggle(el) { const l = POS.flatMap((p) => p.lines).find((x) => x.id === el.dataset.id); st.recvGot[l.id] = st.recvGot[l.id] >= l.qty ? 0 : l.qty; st.keepScroll = true; },
  recvStep(el) { const l = POS.flatMap((p) => p.lines).find((x) => x.id === el.dataset.id); st.recvGot[l.id] = Math.max(0, Math.min(l.qty, st.recvGot[l.id] + Number(el.dataset.d))); st.keepScroll = true; },
  recvAll() {
    const p = poOf(st.params.po);
    p.lines.forEach((l) => { if (!l.backorder) st.recvGot[l.id] = l.qty; });
    back();
    st.banner = `PO ${p.po} received` + (p.lines.some((l) => l.backorder) ? ' — back-ordered line left open' : ' — purchasing has been told');
  },
  recvShort() { st.banner = 'Shortage reported to Amanda Pratt in purchasing'; st.keepScroll = true; },
  kitToggle(el) { const k = st.params.kit; const m = (st.kitPulled[k] ||= {}); m[el.dataset.id] = !m[el.dataset.id]; delete st.kitDone[k]; st.keepScroll = true; },
  kitStage() {
    const k = kitOf(st.params.kit);
    if (kitPulledCount(k) < k.lines.length || st.kitDone[k.item]) { st.keepScroll = true; return; }
    st.kitDone[k.item] = true;
    back();
    st.banner = `Kit ${k.item} staged — Brandon Browser has been told`;
  },
};
