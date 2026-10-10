// Purchasing: every line still to buy across jobs, and the open POs.
// States match the dashboard: Needs purchasing → RFQ sent → Purchased → Received → Kitted
import { st, siteOk, go, buyLines, openBuyCount, poGot, poStatus } from '../store.js';
import { BUY, POS, SITES, dayWord, shortDate, itemByKey } from '../data.js';
import { ICON } from '../icons.js';
import { esc, row, list, check, status, group, seg, plural } from '../ui.js';

const TONE = { 'Needs purchasing': 'red', 'RFQ sent': 'amber', Purchased: 'blue', Received: 'green', Kitted: 'green' };

export const screens = {
  buy: {
    tab: 'buy',
    title: () => 'Purchasing',
    eyebrow: () => openBuyCount() + ' lines open',
    render() {
      const tabs = seg([['jobs', 'Jobs', openBuyCount()], ['pos', 'Purchase orders', POS.filter((p) => siteOk(p.site) && poGot(p) < p.lines.length).length]], st.buyTab, 'buyTab');
      if (st.buyTab === 'pos') {
        const pos = POS.filter((p) => siteOk(p.site) && poGot(p) < p.lines.length).sort((a, b) => a.due - b.due);
        return tabs + group('Open POs', pos.length) + list(pos.map((p) => {
          const [label, tone] = poStatus(p);
          return row({
            icon: 'recv', tone: tone === 'red' ? 'red' : 'blue', title: `PO ${esc(p.po)} · ${esc(p.vendor)}`,
            sub: `${esc(p.item)} · ${SITES[p.site].name} · ${plural(p.lines.length, 'line')}`,
            right: status(label || 'Due ' + dayWord(p.due), tone), act: 'openPo', d: { po: p.po },
          });
        }));
      }
      const lines = buyLines();
      const groups = BUY.filter((g) => siteOk(g.site)).sort((a, b) => a.needed - b.needed);
      const body = groups.map((g) => {
        const ls = lines.filter((l) => l.item === g.item);
        const open = ls.filter((l) => l.state === 'Needs purchasing' || l.state === 'RFQ sent');
        const ids = open.map((l) => l.id);
        const allOn = ids.length && ids.every((id) => st.buySel.includes(id));
        const it = itemByKey(g.item);
        return `
          <div class="h-group" style="justify-content:space-between">
            <span style="color:var(--ap-tx2);font-weight:600"><span class="key">${esc(g.item)}</span> · needed ${dayWord(g.needed)}</span>
            ${ids.length ? `<button type="button" class="pill" style="height:26px;padding:0 6px" data-act="buyGroup" data-item="${esc(g.item)}">${allOn ? 'Clear' : 'Select all'}</button>` : ''}
          </div>
          <div class="list">
            ${ls.map((l) => {
              const sel = st.buySel.includes(l.id);
              const closed = !(l.state === 'Needs purchasing' || l.state === 'RFQ sent');
              return closed
                ? row({ icon: 'check', tone: 'green', title: esc(l.part) + ` <span class="small">× ${l.qty}</span>`, sub: `${esc(l.desc)} · ${esc(l.vendor)}${l.po ? ' · PO ' + l.po : ''}${l.note ? ' · ' + esc(l.note) : ''}`, right: status(l.state, TONE[l.state]) })
                : check({ done: sel, act: 'buyToggle', d: { id: l.id }, cls: 'select', title: esc(l.part) + ` <span class="small">× ${l.qty}</span>`, sub: `${esc(l.desc)} · ${esc(l.vendor)}${l.note ? ' · ' + esc(l.note) : ''}`, right: status(l.state, TONE[l.state]) });
            }).join('')}
          </div>`;
      }).join('');
      const n = st.buySel.length;
      return `
        ${tabs}
        ${body}
        ${n ? `<div style="height:96px"></div>
          <div class="sheet" style="animation:none;border-radius:16px 16px 0 0;box-shadow:0 -6px 24px rgba(0,0,0,.12);bottom:calc(64px + env(safe-area-inset-bottom));padding-bottom:12px;position:fixed;z-index:9">
            <div class="small" style="margin-bottom:8px">${n} selected — set to:</div>
            <div class="btn-row">
              <button type="button" class="btn soft" style="height:42px" data-act="buySet" data-v="RFQ sent">${ICON.mail} RFQ sent</button>
              <button type="button" class="btn fill" style="height:42px" data-act="buySet" data-v="Purchased">Purchased</button>
            </div>
          </div>` : ''}`;
    },
  },
};

export const actions = {
  buyTab: (el) => { st.buyTab = el.dataset.v; st.buySel = []; },
  buyToggle(el) { const id = el.dataset.id; st.buySel = st.buySel.includes(id) ? st.buySel.filter((x) => x !== id) : [...st.buySel, id]; st.keepScroll = true; },
  buyGroup(el) {
    const ids = buyLines().filter((l) => l.item === el.dataset.item && (l.state === 'Needs purchasing' || l.state === 'RFQ sent')).map((l) => l.id);
    const allOn = ids.every((id) => st.buySel.includes(id));
    st.buySel = allOn ? st.buySel.filter((x) => !ids.includes(x)) : [...new Set([...st.buySel, ...ids])];
    st.keepScroll = true;
  },
  buySet(el) {
    const n = st.buySel.length;
    st.buySel.forEach((id) => (st.buyState[id] = el.dataset.v));
    st.buySel = [];
    st.banner = `${plural(n, 'line')} marked ${el.dataset.v}` + (el.dataset.v === 'RFQ sent' ? ' — drafts are in the dashboard' : '');
    st.keepScroll = true;
  },
};
