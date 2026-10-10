import { ROLES } from '../config.js';
import { header, button, card, section, esc } from '../ui.js';

const mine = (st) => st.data.notifications.filter((n) => n.roles.includes(st.role) || n.roles.includes('all'));

export function render(st) {
  const list = mine(st);
  const unread = list.filter((n) => n.unread).length;
  const roleLabel = ROLES.find((r) => r.key === st.role).label;
  return `
    ${header('Home', `${roleLabel} · ${unread} new`, button('Lock', 'lock', { kind: 'ghost', small: true }))}
    ${section('Needs your attention')}
    ${list.map((n) => card(`
      <div class="row-between">
        <div class="h2 ${n.unread ? '' : 'light'}">${esc(n.title)}</div>
        <div class="muted">${esc(n.time)}</div>
      </div>
      <div class="muted mt4">${esc(n.body)}</div>`, { act: 'markRead', args: { id: n.id }, cls: n.unread ? 'flag' : '' })).join('')}
    <p class="muted center">Tap a notification to mark it read</p>
    <div class="pad">${button('Switch role (demo)', 'switchRole', { kind: 'ghost' })}</div>
    <div style="height:16px"></div>`;
}

export const actions = {
  markRead(st, el) {
    const n = st.data.notifications.find((x) => x.id === el.dataset.id);
    if (n) n.unread = false;
  },
};
