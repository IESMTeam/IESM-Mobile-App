// Shop: work on the floor (by stage and bay), outgoing loads, and the 3D models
import { st, siteOk, go, back, stageOfItem, itemPct, isHeld, loadOf } from '../store.js';
import { ITEMS, LOADS, MODELS, SITES, shortDate, dayWord } from '../data.js';
import { ICON } from '../icons.js';
import { esc, row, list, check, status, plural, group, bar, photos, model } from '../ui.js';

const SHOP_STAGES = ['prefab', 'mach', 'fab', 'finish', 'asm', 'qc', 'fat'];
const shipWord = (d) => (d <= 6 ? dayWord(d) : shortDate(d));
const loadDone = (l) => l.items.filter((i) => (st.loadChecks[l.id] || {})[i.id]).length;

export const screens = {
  fab: {
    tab: 'fab',
    title: () => 'Shop floor',
    eyebrow: () => ITEMS.filter((i) => siteOk(i.site) && SHOP_STAGES.includes(stageOfItem(i).key)).length + ' items in the shop',
    render() {
      const items = ITEMS.filter((i) => siteOk(i.site) && SHOP_STAGES.includes(stageOfItem(i).key)).sort((a, b) => a.ship - b.ship);
      const byStage = {};
      items.forEach((i) => (byStage[stageOfItem(i).label] ||= []).push(i));
      return Object.entries(byStage).map(([label, its]) => group(label, its.length) + list(its.map((it) => {
        const pct = itemPct(it);
        return row({
          icon: it.type === 'SC' ? 'models' : 'fab', tone: isHeld(it) ? 'red' : pct >= 100 ? 'green' : 'amber',
          title: `<span class="key">${esc(it.key)}</span>`,
          sub: `${esc(it.desc)} · ${esc(it.bay || SITES[it.site].name)}${st.site === 'both' ? ' · ' + SITES[it.site].name : ''}<div class="bar-line" style="margin-top:6px">${bar(pct)}<span class="small">${pct}%</span></div>`,
          right: status('Ships ' + shipWord(it.ship), it.ship <= 5 ? 'amber' : 'blue'),
          act: 'openItem', d: { key: it.key },
        });
      }))).join('') || '<div class="card pad small">Nothing in the shop at this site.</div>';
    },
  },

  ship: {
    tab: 'ship',
    title: () => 'Shipping',
    eyebrow: () => LOADS.filter((l) => siteOk(l.site) && !st.shipped[l.id]).length + ' loads going out',
    render() {
      const loads = LOADS.filter((l) => siteOk(l.site)).sort((a, b) => a.ship - b.ship);
      const rowFor = (l) => {
        const n = loadDone(l);
        const pics = (st.loadPhotos[l.id] || []).length;
        const done = st.shipped[l.id];
        return row({
          icon: 'ship', tone: done ? 'green' : l.ship <= 2 ? 'amber' : 'teal',
          title: `${esc(l.job)} · ${esc(l.customer)}`,
          sub: `${esc(l.carrier)} · ${SITES[l.site].name} dock<br>${n} of ${l.items.length} loaded · ${pics ? plural(pics, 'photo') : 'no photos yet'}`,
          right: status(done ? 'Shipped' : 'Ships ' + shipWord(l.ship), done ? 'green' : l.ship <= 2 ? 'amber' : 'blue'),
          act: 'openLoad', d: { load: l.id },
        });
      };
      const open = loads.filter((l) => !st.shipped[l.id]);
      const gone = loads.filter((l) => st.shipped[l.id]);
      return `
        ${open.length ? group('Going out', open.length) + list(open.map(rowFor)) : ''}
        ${gone.length ? group('Shipped today', gone.length) + list(gone.map(rowFor)) : ''}`;
    },
  },

  load: {
    back: true,
    title: () => 'Load ' + loadOf(st.params.load).job,
    eyebrow: () => { const l = loadOf(st.params.load); return l.customer + ' · ships ' + shipWord(l.ship); },
    render() {
      const l = loadOf(st.params.load);
      const n = loadDone(l);
      const pics = st.loadPhotos[l.id] || [];
      const ready = n === l.items.length && pics.length > 0;
      const done = st.shipped[l.id];
      return `
        <div class="card pad"><div class="facts">
          <div class="fact"><small>Ships</small><b>${shortDate(l.ship)}</b></div>
          <div class="fact"><small>Carrier</small><b>${esc(l.carrier)}</b></div>
          <div class="fact"><small>Dock</small><b>${SITES[l.site].name}</b></div>
          <div class="fact"><small>Customer</small><b>${esc(l.customer)}</b></div>
        </div>
        <div class="bar-line" style="margin-top:14px">${bar((n / l.items.length) * 100)}<span class="small">${n} of ${l.items.length} loaded</span></div></div>
        ${group('On the truck')}
        <div class="list">${l.items.map((i) => check({ done: (st.loadChecks[l.id] || {})[i.id], title: esc(i.text), sub: esc(i.sub), act: 'loadToggle', d: { id: i.id } })).join('')}</div>
        ${group('Load photos', pics.length || 'at least 1 needed')}
        <div class="card pad" style="display:flex;flex-direction:column;gap:10px">${photos(pics, 'load', l.id)}</div>
        <button type="button" class="btn ${done ? 'green' : ready ? 'fill' : 'off'}" data-act="markShipped">${done ? ICON.check + ' Shipped' : ready ? 'Mark shipped' : n < l.items.length ? `${l.items.length - n} left to load` : 'Add a photo of the load'}</button>`;
    },
  },

  models: {
    tab: 'models',
    title: () => '3D models',
    eyebrow: () => 'What we build',
    render() {
      return `
        <div class="small" style="padding:0 4px">Spin, zoom, and on iPhone tap <b>View in your space</b> to place it on the floor with the camera.</div>
        ${list(Object.entries(MODELS).map(([type, m]) => {
          const jobs = ITEMS.filter((i) => i.type === type && siteOk(i.site));
          return row({
            lead: `<span class="model-thumb">${ICON.cube}</span>`,
            title: esc(m.name),
            sub: jobs.length ? 'In the shop: ' + jobs.map((j) => j.key).join(', ') : 'No open jobs at this site',
            act: 'openModel', d: { type },
          });
        }))}`;
    },
  },

  model: {
    back: true,
    title: () => MODELS[st.params.type].name,
    eyebrow: () => '3D model',
    render() {
      const m = MODELS[st.params.type];
      const jobs = ITEMS.filter((i) => i.type === st.params.type);
      return `
        ${model(m.file, m.name, { tall: true })}
        <div class="small" style="text-align:center">Drag to turn · pinch to zoom</div>
        ${jobs.length ? group('Jobs with this equipment', jobs.length) + list(jobs.map((it) => row({
          icon: 'cube', tone: 'blue', title: `<span class="key">${esc(it.key)}</span> ${esc(it.desc)}`,
          sub: `${esc(it.customer)} · ${SITES[it.site].name}${it.bay ? ' · ' + esc(it.bay) : ''}`,
          right: status(stageOfItem(it).label, 'blue'), act: 'openItem', d: { key: it.key },
        }))) : ''}`;
    },
  },
};

export const actions = {
  openLoad: (el) => go('load', { load: el.dataset.load }),
  openModel: (el) => go('model', { type: el.dataset.type }),
  loadToggle(el) { const m = (st.loadChecks[st.params.load] ||= {}); m[el.dataset.id] = !m[el.dataset.id]; delete st.shipped[st.params.load]; st.keepScroll = true; },
  markShipped() {
    const l = loadOf(st.params.load);
    const ready = loadDone(l) === l.items.length && (st.loadPhotos[l.id] || []).length > 0;
    if (!ready || st.shipped[l.id]) { st.keepScroll = true; return; }
    st.shipped[l.id] = true;
    back();
    st.banner = `Load ${l.job} shipped — Shane Kloer and ${l.customer} have been told`;
  },
};
