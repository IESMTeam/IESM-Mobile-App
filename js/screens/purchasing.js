import { header, button, badge, check, card, esc } from '../ui.js';

// Line states, in order: Needs purchasing → RFQ sent → Purchased → Received → Kitted
const TONE = { 'Needs purchasing': 'red', 'RFQ sent': 'amber', Purchased: 'blue', Received: 'green', Kitted: 'green' };
const OPEN = ['Needs purchasing', 'RFQ sent'];

const view = (st) => (st.view.purch ??= { selected: [], filter: 'Open' });

export function render(st) {
  const v = view(st);
  const all = st.data.purchasing.flatMap((g) => g.lines);
  const needs = all.filter((l) => l.state === 'Needs purchasing').length;
  const rfq = all.filter((l) => l.state === 'RFQ sent').length;
  const visible = (l) => v.filter === 'All' || OPEN.includes(l.state);

  const groups = st.data.purchasing.map((g) => {
    const lines = g.lines.filter(visible);
    if (!lines.length) return '';
    const allOn = lines.every((l) => v.selected.includes(l.id));
    return `
      <div class="section-row">
        <div class="section">${esc(g.item)}</div>
        <button class="link" data-act="selectGroup" data-id="${esc(g.item)}">${allOn ? 'Clear' : 'Select all'}</button>
      </div>
      ${card(lines.map((l) => check({
        done: v.selected.includes(l.id),
        title: `${l.part}  ×${l.qty}`,
        detail: `${l.desc} · ${l.vendor}`,
        act: 'toggleLine',
        args: { id: l.id },
        right: badge(l.state, TONE[l.state]),
        select: true,
      })).join(''))}`;
  }).join('');

  const bar = v.selected.length
    ? `<div class="spacer"></div>
       <div class="actionbar">
         <div class="muted" style="margin-bottom:8px">${v.selected.length} selected — set to:</div>
         <div class="btn-row">
           ${button('RFQ sent', 'setState', { kind: 'ghost', small: true, args: { value: 'RFQ sent' } })}
           ${button('Purchased', 'setState', { small: true, args: { value: 'Purchased' } })}
           ${button('Reset', 'setState', { kind: 'ghost', small: true, args: { value: 'Needs purchasing' } })}
         </div>
       </div>`
    : '';

  return `
    ${header('Purchasing', `${needs} need purchasing · ${rfq} waiting on RFQ`)}
    <div class="chips pad" style="margin:0 0 8px">
      ${['Open', 'All'].map((f) => `<button class="chip ${v.filter === f ? 'on' : ''}" data-act="filter" data-value="${f}">${f}</button>`).join('')}
    </div>
    ${groups || card('<div class="muted">Nothing open — switch to All to see everything.</div>')}
    ${bar}`;
}

export const actions = {
  filter: (st, el) => { view(st).filter = el.dataset.value; },
  toggleLine(st, el) {
    const v = view(st);
    const id = el.dataset.id;
    v.selected = v.selected.includes(id) ? v.selected.filter((x) => x !== id) : [...v.selected, id];
  },
  selectGroup(st, el) {
    const v = view(st);
    const g = st.data.purchasing.find((x) => x.item === el.dataset.id);
    const ids = g.lines.filter((l) => v.filter === 'All' || OPEN.includes(l.state)).map((l) => l.id);
    const allOn = ids.every((id) => v.selected.includes(id));
    v.selected = allOn ? v.selected.filter((x) => !ids.includes(x)) : [...new Set([...v.selected, ...ids])];
  },
  setState(st, el) {
    const v = view(st);
    st.data.purchasing.forEach((g) => g.lines.forEach((l) => { if (v.selected.includes(l.id)) l.state = el.dataset.value; }));
    v.selected = [];
  },
};
