import { header, back, button, badge, progress, check, card, esc } from '../ui.js';

const openKit = (st) => st.data.kits.find((k) => k.item === st.view.kit);
const doneCount = (k) => k.parts.filter((p) => p.done).length;

export function render(st) {
  const kit = openKit(st);

  if (kit) {
    const done = doneCount(kit);
    const left = kit.parts.length - done;
    return `
      ${header(kit.item, `${kit.desc} · ${kit.area}`, back('closeKit'))}
      ${card(`
        ${progress(done, kit.parts.length)}
        ${kit.parts.map((p) => check({ done: p.done, title: `${p.part}  ×${p.qty}`, detail: p.desc, act: 'togglePart', args: { id: p.id } })).join('')}
      `)}
      <div class="pad">${button(left ? `${left} parts left` : 'Mark kit complete', 'closeKit', { kind: left ? '' : 'accent', disabled: left > 0 })}</div>
      <div style="height:16px"></div>`;
  }

  return `
    ${header('Kitting', 'Project items ready to pull')}
    ${st.data.kits.map((k) => {
      const done = doneCount(k);
      const [label, tone] = done === k.parts.length ? ['Kitted', 'green'] : done ? ['In progress', 'amber'] : ['Ready', 'blue'];
      return card(`
        <div class="row-between"><div class="h2">${esc(k.item)}</div>${badge(label, tone)}</div>
        <div class="muted mt4">${esc(k.desc)} · ${esc(k.area)}</div>
        ${progress(done, k.parts.length)}`, { act: 'openKit', args: { id: k.item } });
    }).join('')}`;
}

export const actions = {
  openKit: (st, el) => { st.view.kit = el.dataset.id; window.scrollTo(0, 0); },
  closeKit: (st) => { st.view.kit = null; },
  togglePart(st, el) {
    const p = openKit(st).parts.find((x) => x.id === el.dataset.id);
    p.done = !p.done;
  },
};
