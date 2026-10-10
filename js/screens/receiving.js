import { header, back, button, badge, progress, check, card, esc } from '../ui.js';

const openPo = (st) => st.data.receiving.find((p) => p.po === st.view.po);
const fullCount = (po) => po.lines.filter((l) => l.got === l.qty).length;

function stepper(l) {
  return `
    <div class="stepper">
      <button data-act="step" data-id="${l.id}" data-delta="-1">−</button>
      <span>${l.got}/${l.qty}</span>
      <button data-act="step" data-id="${l.id}" data-delta="1">+</button>
    </div>`;
}

export function render(st) {
  const po = openPo(st);

  if (po) {
    const full = fullCount(po);
    return `
      ${header(`PO ${po.po}`, `${po.vendor} · Job ${po.job}`, back('closePo'))}
      ${card(`
        ${progress(full, po.lines.length)}
        <div class="muted mt8" style="margin-bottom:4px">Tap a line to receive all, or use − / + for partial quantities.</div>
        ${po.lines.map((l) => check({ done: l.got === l.qty, title: l.part, detail: l.desc, act: 'toggleLine', args: { id: l.id }, right: stepper(l) })).join('')}
      `)}
      <div class="pad">${button(full === po.lines.length ? 'Done — back to list' : 'Save and back', 'closePo')}</div>
      <div style="height:16px"></div>`;
  }

  return `
    ${header('Receiving', 'Incoming purchase orders')}
    ${st.data.receiving.map((p) => {
      const full = fullCount(p);
      const started = p.lines.some((l) => l.got > 0);
      const [label, tone] = full === p.lines.length ? ['Received', 'green'] : started ? ['Partial', 'amber'] : [`Due ${p.due}`, 'blue'];
      return card(`
        <div class="row-between"><div class="h2">PO ${esc(p.po)}</div>${badge(label, tone)}</div>
        <div class="muted mt4">${esc(p.vendor)} · Job ${esc(p.job)} · ${p.lines.length} lines</div>
        ${progress(full, p.lines.length)}`, { act: 'openPo', args: { id: p.po } });
    }).join('')}`;
}

const line = (st, id) => openPo(st).lines.find((l) => l.id === id);

export const actions = {
  openPo: (st, el) => { st.view.po = el.dataset.id; window.scrollTo(0, 0); },
  closePo: (st) => { st.view.po = null; },
  toggleLine(st, el) {
    const l = line(st, el.dataset.id);
    l.got = l.got === l.qty ? 0 : l.qty;
  },
  step(st, el) {
    const l = line(st, el.dataset.id);
    l.got = Math.min(l.qty, Math.max(0, l.got + Number(el.dataset.delta)));
  },
};
