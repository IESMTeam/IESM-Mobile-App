import { header, back, badge, progress, check, card, section, esc, money } from '../ui.js';

const openJob = (st) => st.data.jobs.find((j) => j.number === st.view.job);
const checksFor = (st, job) => st.data.installChecks[job] || [];

export function render(st) {
  const job = openJob(st);

  if (job) {
    const checks = checksFor(st, job.number);
    const done = checks.filter((c) => c.done).length;
    const cos = st.data.changeOrders.filter((c) => c.job === job.number);
    return `
      ${header(`Job ${job.number}`, job.customer, back('closeJob'))}
      ${card(`
        <div class="muted">Site</div>
        <div class="h2" style="margin-bottom:8px">${esc(job.site)}</div>
        <div class="muted">PM · ${esc(job.pm)}</div>
        <div class="muted">Items · ${esc(job.items.join(', '))}</div>`)}
      ${section('Checklist')}
      ${card(`
        ${progress(done, checks.length)}
        ${checks.map((c) => check({ done: c.done, title: c.text, act: 'toggleCheck', args: { id: c.id } })).join('')}`)}
      ${section('Change orders')}
      ${cos.length ? '' : card('<div class="muted">None</div>')}
      ${cos.map((c) => card(`
        <div class="row-between"><div class="h2">${esc(c.title)}</div>${badge(c.status, c.status === 'Signed' ? 'green' : 'amber')}</div>
        <div class="muted mt4">${esc(c.id)} · ${money(c.amount)}</div>`, { act: 'goCo' })).join('')}`;
  }

  return `
    ${header('Projects', 'Your active jobs')}
    ${st.data.jobs.map((j) => {
      const checks = checksFor(st, j.number);
      return card(`
        <div class="row-between"><div class="h2">${esc(j.number)}</div>${badge(j.status)}</div>
        <div class="muted mt4">${esc(j.customer)} · ${esc(j.site)}</div>
        ${progress(checks.filter((c) => c.done).length, checks.length)}`, { act: 'openJob', args: { id: j.number } });
    }).join('')}`;
}

export const actions = {
  openJob: (st, el) => { st.view.job = el.dataset.id; window.scrollTo(0, 0); },
  closeJob: (st) => { st.view.job = null; },
  toggleCheck(st, el) {
    const c = checksFor(st, st.view.job).find((x) => x.id === el.dataset.id);
    c.done = !c.done;
  },
  goCo: (st) => { st.tab = 'changeOrders'; window.scrollTo(0, 0); },
};
