// Home: the dashboard's Home, phone-sized — greeting + weather, what needs
// you (Open / Done), and the team's activity.
import { st, siteOk, viewInfo, go } from '../store.js';
import { QUEUES, ACTIVITY, SITES, PEOPLE, VIEWS } from '../data.js';
import { ICON, WX } from '../icons.js';
import { esc, seg, status, ico, avatar, sec, plural, group } from '../ui.js';
import { stepCard, stepsFor, isSigned, checksLeft } from './steps.js';

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
const firstName = () => viewInfo().user.split(' ')[0];
const siteName = () => (st.site === 'both' ? 'Nampa and Rupert' : SITES[st.site].name);
const queue = () => QUEUES[st.view].filter((q) => siteOk(q.site));
const openQ = () => queue().filter((q) => !st.doneQ[q.id]);
const doneQ = () => queue().filter((q) => st.doneQ[q.id]);

function weatherHtml() {
  const key = st.site === 'rupert' ? 'rupert' : 'nampa';
  const w = st.weather[key];
  if (!w || typeof w !== 'object') return '';
  return `
    <aside class="weather">
      <div class="weather-city">${esc(SITES[key].name)}</div>
      <div class="weather-row"><span class="weather-temp">${w.temp}°</span><svg class="weather-icon" viewBox="0 0 24 24" aria-hidden="true">${WX[w.icon]}</svg></div>
      <div class="weather-text">${esc(w.text)}<br>H:${w.hi}° L:${w.lo}°</div>
    </aside>`;
}

function queueRow(q, done) {
  return `
    <div class="row qrow">
      ${ico(q.icon, done ? 'green' : q.tone === 'red' ? 'red' : q.tone === 'amber' ? 'amber' : 'blue')}
      <span class="row-main">
        <span class="row-title">${esc(q.title)}</span>
        <span class="row-sub">${esc(q.sub)} · ${esc(done ? 'done just now' : q.ago)}</span>
      </span>
      <div class="qacts">
        ${done ? status('Done', 'green') : status(q.status, q.tone)}
        ${done
          ? `<button type="button" class="pill" data-act="qUndo" data-id="${q.id}">Undo</button>`
          : `<button type="button" class="pill fill" data-act="qOpen" data-id="${q.id}">Open</button>
             <button type="button" class="pill" data-act="qDone" data-id="${q.id}">Done</button>`}
      </div>
    </div>`;
}

export const screens = {
  home: {
    tab: 'home',
    title: () => 'Home',
    eyebrow: () => viewInfo().label + ' · ' + (st.site === 'both' ? 'All sites' : SITES[st.site].name),
    render() {
      const open = openQ();
      const done = doneQ();
      const steps = stepsFor(st.homeWho);
      const todo = steps.filter((x) => !isSigned(x));
      const signed = steps.filter(isSigned);
      const left = checksLeft(todo);
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      const feed = ACTIVITY.filter((a) => siteOk(a.site));
      return `
        <section class="panel hello">
          <div class="hello-text">
            <div class="hello-date">${esc(today)}</div>
            <h1 class="hello-title">${greeting()}, ${esc(firstName())}</h1>
            <div class="hello-sub">${left ? `<b><span id="checksLeft">${left}</span> checks</b> left on ${plural(todo.length, 'step')}.` : 'Everything is checked off.'}</div>
          </div>
          ${weatherHtml()}
        </section>

        ${sec('Checklists')}
        ${seg([['mine', 'Mine', stepsFor('mine').filter((x) => !isSigned(x)).length], ['all', 'Everyone']], st.homeWho, 'homeWho')}
        ${todo.map((x) => stepCard(x)).join('') || '<div class="card pad small" style="text-align:center">Nothing left to check off here.</div>'}
        ${signed.length ? group('Signed off today', signed.length) + signed.map((x) => stepCard(x)).join('') : ''}

        ${open.length || done.length ? sec('Needs attention') + `<div class="list">${open.map((q) => queueRow(q, false)).join('')}${done.map((q) => queueRow(q, true)).join('')}</div>` : ''}

        ${sec('Team activity')}
        <div class="list feed">
          ${feed.map((a) => `
            <div class="fe">
              ${avatar(a.who)}
              <span><b>${esc(a.who)}</b> ${esc(a.text)}<small>${esc(a.ago)} · ${esc(a.where)}${a.warn ? ' · <span style="color:#b3261e">needs a look</span>' : ''}</small></span>
            </div>`).join('')}
        </div>`;
    },
    mount(render) { loadWeather(render); },
  },
};

export const actions = {
  qTab: (el) => { st.queueTab = el.dataset.v; st.keepScroll = true; },
  homeWho: (el) => { st.homeWho = el.dataset.v; st.keepScroll = true; },
  qOpen(el) { const q = QUEUES[st.view].find((x) => x.id === el.dataset.id); if (q) go(q.to.screen, q.to); },
  qDone(el) { st.doneQ[el.dataset.id] = true; st.keepScroll = true; },
  qUndo(el) { delete st.doneQ[el.dataset.id]; st.keepScroll = true; },
};

// Weather where you are: Open-Meteo, the same source the dashboard uses.
const CODES = (c, day) => {
  if (c === 0) return { text: day ? 'Sunny' : 'Clear', icon: day ? 'sun' : 'moon' };
  if (c <= 2) return { text: 'Partly cloudy', icon: day ? 'sunCloud' : 'cloud' };
  if (c === 3) return { text: 'Cloudy', icon: 'cloud' };
  if (c === 45 || c === 48) return { text: 'Fog', icon: 'fog' };
  if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return { text: 'Rain', icon: 'rain' };
  if ((c >= 71 && c <= 77) || c === 85 || c === 86) return { text: 'Snow', icon: 'snow' };
  if (c >= 95) return { text: 'Storms', icon: 'storm' };
  return { text: '—', icon: 'cloud' };
};
async function loadWeather(render) {
  const key = st.site === 'rupert' ? 'rupert' : 'nampa';
  if (st.weather[key]) return;
  st.weather[key] = 'loading';
  try {
    const s = SITES[key];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${s.lat}&longitude=${s.lon}&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto&forecast_days=1`;
    const r = await fetch(url);
    const d = await r.json();
    const look = CODES(d.current.weather_code, d.current.is_day);
    st.weather[key] = { temp: Math.round(d.current.temperature_2m), hi: Math.round(d.daily.temperature_2m_max[0]), lo: Math.round(d.daily.temperature_2m_min[0]), ...look };
    if (st.phase === 'app' && st.screen === 'home') { st.keepScroll = true; render(); }
  } catch {
    st.weather[key] = 'err'; // no weather tile; the greeting stands on its own
  }
}

export { PEOPLE, ICON };
