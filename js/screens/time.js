import { header, button, card, section, chips, esc } from '../ui.js';

let timer = null;

const view = (st) => (st.view.time ??= { item: null, task: null, startedAt: null });

function clockText(startedAt) {
  const s = Math.floor((Date.now() - startedAt) / 1000);
  return `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function render(st) {
  const v = view(st);
  const items = st.data.jobs.flatMap((j) => j.items);
  v.item ??= items[0];
  v.task ??= st.data.timeTasks[0];
  const total = st.data.timeEntries.reduce((a, e) => a + e.hours, 0);

  const clockCard = v.startedAt
    ? `<div class="center">
         <div class="muted">On the clock</div>
         <div class="clock" data-clock>${clockText(v.startedAt)}</div>
         <div class="h2">${esc(v.item)}</div>
         <div class="muted" style="margin-bottom:14px">${esc(v.task)}</div>
         ${button('Clock out', 'clockOut', { kind: 'accent' })}
       </div>`
    : `<div class="h2">Project item</div>
       ${chips(items, v.item, 'pickItem')}
       <div class="h2 mt16">Task</div>
       ${chips(st.data.timeTasks, v.task, 'pickTask')}
       <div class="mt16">${button('Clock in', 'clockIn')}</div>`;

  const entries = st.data.timeEntries.length
    ? st.data.timeEntries.map((e) => `
        <div class="entry">
          <div class="grow"><div style="font-weight:500">${esc(e.item)}</div><div class="muted">${esc(e.task)}</div></div>
          <div class="h2">${e.hours.toFixed(2)} h</div>
        </div>`).join('')
    : '<div class="muted">Nothing yet</div>';

  return `
    ${header('Time', `Today · ${total.toFixed(2)} hrs logged`)}
    ${card(clockCard)}
    ${section("Today's entries")}
    ${card(entries)}`;
}

// Keep the running clock ticking without redrawing the whole screen.
export function mount(st, root) {
  clearInterval(timer);
  const v = view(st);
  if (!v.startedAt) return;
  timer = setInterval(() => {
    const el = root.querySelector('[data-clock]');
    if (!el) return clearInterval(timer);
    el.textContent = clockText(v.startedAt);
  }, 1000);
}

export const actions = {
  pickItem: (st, el) => { view(st).item = el.dataset.value; },
  pickTask: (st, el) => { view(st).task = el.dataset.value; },
  clockIn: (st) => { view(st).startedAt = Date.now(); },
  clockOut(st) {
    const v = view(st);
    // Round to the nearest 0.25 hr, minimum 0.25, so the demo shows something.
    const hrs = (Date.now() - v.startedAt) / 3600000;
    const hours = Math.max(0.25, Math.round(hrs * 4) / 4);
    st.data.timeEntries.push({ id: `t${Date.now()}`, item: v.item, task: v.task, hours });
    v.startedAt = null;
  },
};
