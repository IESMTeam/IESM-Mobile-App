import { header, back, badge, progress, check, card, esc } from '../ui.js';

const openWo = (st) => st.data.fabrication.find((w) => w.item === st.view.wo);

export function render(st) {
  const wo = openWo(st);

  if (wo) {
    const done = wo.ops.filter((o) => o.done).length;
    const next = wo.ops.find((o) => !o.done);
    return `
      ${header(wo.item, `${wo.desc} · due ${wo.due}`, back('closeWo'))}
      ${card(`
        ${progress(done, wo.ops.length)}
        ${wo.ops.map((o) => check({ done: o.done, title: o.op, detail: o === next ? 'Up next' : '', act: 'toggleOp', args: { id: o.id } })).join('')}`)}`;
  }

  return `
    ${header('Fabrication', 'Work in the shop')}
    ${st.data.fabrication.map((w) => {
      const done = w.ops.filter((o) => o.done).length;
      const next = w.ops.find((o) => !o.done);
      const tone = next ? (w.due === 'Today' ? 'amber' : 'blue') : 'green';
      return card(`
        <div class="row-between"><div class="h2">${esc(w.item)}</div>${badge(next ? next.op : 'Complete', tone)}</div>
        <div class="muted mt4">${esc(w.desc)} · due ${esc(w.due)}</div>
        ${progress(done, w.ops.length)}`, { act: 'openWo', args: { id: w.item } });
    }).join('')}`;
}

export const actions = {
  openWo: (st, el) => { st.view.wo = el.dataset.id; window.scrollTo(0, 0); },
  closeWo: (st) => { st.view.wo = null; },
  toggleOp(st, el) {
    const o = openWo(st).ops.find((x) => x.id === el.dataset.id);
    o.done = !o.done;
  },
};
