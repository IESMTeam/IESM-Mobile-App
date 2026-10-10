// Projects, the project item page (shared by every view), and change orders
import { st, siteOk, go, back, root, stageOfItem, checksOf, checksDone, itemPct, isHeld, viewInfo } from '../store.js';
import { ITEMS, PROJECTS, STAGES, PHASES, MODELS, SITES, RATE, PEOPLE, shortDate, dayWord, stageIndex, itemByKey } from '../data.js';
import { ICON } from '../icons.js';
import { stepCard } from './steps.js';
import { esc, row, list, check, status, plural, group, bar, money, avatar, photos, model, sec } from '../ui.js';

const shipText = (d) => (d < 0 ? 'shipped ' + shortDate(d) : 'ships ' + (d <= 6 ? dayWord(d) : shortDate(d)));
const itemsOf = (num) => ITEMS.filter((i) => i.project === num);
const projectSites = (num) => [...new Set(itemsOf(num).map((i) => i.site))];

function itemStatus(it) {
  if (isHeld(it)) return status('On hold', 'red');
  const s = stageOfItem(it);
  return status(`${s.label} ${itemPct(it)}%`, s.key === 'install' || s.key === 'ship' ? 'green' : 'blue');
}

function itemRow(it, showProject = false) {
  return row({
    icon: 'cube', tone: isHeld(it) ? 'red' : 'blue',
    title: `<span class="key">${esc(showProject ? it.key : it.code)}</span> <span style="font-weight:500">${esc(it.desc)}</span>`,
    sub: `${esc(SITES[it.site].name)}${it.bay ? ' · ' + esc(it.bay) : ''} · ${shipText(it.ship)}`,
    right: itemStatus(it), act: 'openItem', d: { key: it.key },
  });
}

// ---- change order helpers ----
const coTotal = (c) => c.hours * RATE + c.mat;
const newDraft = (item) => ({ item, desc: '', hours: 4, mat: 200, photos: [], signer: '', signed: false, sig: null });
const draft = () => st.draft || newDraft('19160-SC001');
const canSign = (d) => d.desc.trim().length > 0;
const canSubmit = (d) => d.signed && d.signer.trim().length > 0;
const signLabel = (d) => (canSubmit(d) ? 'Approve ' + money(coTotal(d)) : d.signed ? 'Enter the customer’s name' : 'Waiting for signature');

export const screens = {
  projects: {
    tab: 'proj',
    title: () => 'Projects',
    eyebrow: () => Object.keys(PROJECTS).filter((n) => projectSites(n).some(siteOk)).length + ' open jobs',
    render() {
      const nums = Object.keys(PROJECTS).filter((n) => projectSites(n).some(siteOk));
      const rowFor = (n) => {
        const items = itemsOf(n);
        const held = items.some(isHeld);
        const ship = Math.min(...items.map((i) => i.ship));
        const p = PROJECTS[n];
        return row({
          lead: `<span class="ico ${held ? 'red' : 'blue'}" style="width:44px;font-family:var(--cond);font-weight:800;font-size:13px">${n}</span>`,
          title: esc(p.customer), sub: `${esc(p.desc)} · ${plural(items.length, 'item')} · ${shipText(ship)}`,
          right: held ? status('Hold', 'red') : status(ship < 0 ? 'Install' : ship <= 5 ? 'Shipping soon' : 'On track', ship < 0 ? 'green' : ship <= 5 ? 'amber' : 'blue'),
          act: 'openProject', d: { project: n },
        });
      };
      const soon = nums.filter((n) => Math.min(...itemsOf(n).map((i) => i.ship)) <= 10);
      const later = nums.filter((n) => !soon.includes(n));
      return `
        <button type="button" class="btn soft" data-act="goSearch">${ICON.search} Search jobs, items, POs, parts</button>
        ${soon.length ? group('Shipping in the next 10 days', soon.length) + list(soon.map(rowFor)) : ''}
        ${later.length ? group('Later', later.length) + list(later.map(rowFor)) : ''}`;
    },
  },

  project: {
    back: true,
    title: () => st.params.project + ' · ' + PROJECTS[st.params.project].customer,
    eyebrow: () => PROJECTS[st.params.project].desc,
    render() {
      const n = st.params.project;
      const p = PROJECTS[n];
      const items = itemsOf(n);
      const cos = st.cos.filter((c) => c.item.startsWith(n));
      return `
        <div class="card pad"><div class="facts">
          <div class="fact"><small>Customer</small><b>${esc(p.customer)}</b></div>
          <div class="fact"><small>PM</small><b>${esc(p.pm)}</b></div>
          <div class="fact"><small>Built at</small><b>${projectSites(n).map((s) => SITES[s].name).join(', ')}</b></div>
          <div class="fact"><small>First ship</small><b>${shortDate(Math.min(...items.map((i) => i.ship)))}</b></div>
        </div></div>
        ${group('Project items', items.length)}
        ${list(items.map((i) => itemRow(i)))}
        ${cos.length ? group('Change orders', cos.length) + list(cos.map((c) => row({ icon: 'co', tone: c.status === 'signed' ? 'green' : 'amber', title: esc(c.id + ' · ' + c.item), sub: esc(c.desc), right: `<b class="num" style="font-size:16px">${money(coTotal(c))}</b>`, act: 'tabCo' }))) : ''}`;
    },
  },

  item: {
    back: true,
    title: () => st.params.key,
    eyebrow: () => { const it = itemByKey(st.params.key); return it.customer + ' · ' + it.desc; },
    render() {
      const it = itemByKey(st.params.key);
      const s = stageOfItem(it);
      const si = stageIndex(s.key);
      const checks = checksOf(it);
      const n = checksDone(it);
      const all = n === s.checks.length;
      const held = isHeld(it);
      const m = MODELS[it.type];
      const pics = st.itemPhotos[it.key] || [];
      const next = STAGES[si + 1];
      return `
        ${m ? model(m.file, it.desc, { tag: m.name }) : ''}
        <div class="card pad">
          <div class="facts">
            <div class="fact"><small>Customer</small><b>${esc(it.customer)}</b></div>
            <div class="fact"><small>Where</small><b>${esc(SITES[it.site].name)}${it.bay ? ' · ' + esc(it.bay) : ''}</b></div>
            <div class="fact"><small>Ships</small><b>${shortDate(it.ship)}</b></div>
            <div class="fact"><small>PM</small><b>${esc(PROJECTS[it.project].pm)}</b></div>
          </div>
          <div style="margin-top:16px" class="track" aria-label="Stage ${si + 1} of ${STAGES.length}">
            ${STAGES.map((x, i) => `<span class="${i < si ? 'done' : i === si ? (held ? 'held' : 'cur') : ''}"></span>`).join('')}
          </div>
          <div class="phases">${PHASES.map((p) => `<span>${p}</span>`).join('')}</div>
        </div>

        ${sec('Now: ' + s.label)}
        ${stepCard({ key: it.key, stage: s.key }, { showItem: false })}

        ${sec('Photos')}
        <div class="card pad" style="display:flex;flex-direction:column;gap:10px">
          ${pics.length ? '' : '<div class="small">No photos yet. Add progress or site photos here.</div>'}
          ${photos(pics, 'item', it.key)}
        </div>
        ${st.view === 'field' ? `<button type="button" class="btn soft" data-act="itemNewCo">${ICON.co} New change order for this item</button>` : ''}`;
    },
  },

  co: {
    tab: 'co',
    title: () => 'Change orders',
    eyebrow: () => st.cos.filter((c) => c.status === 'pending').length + ' need a signature',
    render() {
      const pend = st.cos.filter((c) => c.status === 'pending');
      const signed = st.cos.filter((c) => c.status === 'signed');
      const coRow = (c) => `
        <div class="row qrow">
          ${c.sig ? `<img src="${c.sig}" alt="" style="flex:none;width:34px;height:34px;border-radius:9px;background:#f2f2f7;object-fit:contain">` : `<span class="ico ${c.status === 'signed' ? 'green' : 'amber'}">${ICON.co}</span>`}
          <span class="row-main"><span class="row-title">${esc(c.id)} · <span class="key">${esc(c.item)}</span></span><span class="row-sub">${esc(c.desc)}</span></span>
          <div class="qacts">
            ${c.status === 'signed' ? status('Signed by ' + c.who + ' · ' + c.when, 'green') : status('Written ' + c.when, 'amber')}
            <b class="num" style="font-size:17px">${money(coTotal(c))}</b>
            ${c.status === 'pending' ? `<button type="button" class="pill fill" data-act="coSignExisting" data-id="${c.id}">Get signature</button>` : ''}
          </div>
        </div>`;
      return `
        <button type="button" class="btn fill" data-act="newCo">${ICON.plus} New change order</button>
        <div class="small" style="padding:0 4px">Customer asked for extra work in the field? Write it up, price it, and get their signature before you start.</div>
        ${pend.length ? group('Needs a signature', pend.length) + `<div class="list">${pend.map(coRow).join('')}</div>` : ''}
        ${signed.length ? group('Signed', signed.length) + `<div class="list">${signed.map(coRow).join('')}</div>` : ''}`;
    },
  },

  conew: {
    back: true,
    title: () => 'New change order',
    eyebrow: () => 'Change order',
    render() {
      const d = draft();
      const items = ITEMS.filter((i) => siteOk(i.site)).map((i) => i.key);
      return `
        <div class="field"><span>Project item</span>
          <div class="chips">${[...new Set([d.item, ...items])].slice(0, 8).map((k) => `<button type="button" class="chip ${d.item === k ? 'on' : ''}" data-act="coItem" data-k="${k}">${k}</button>`).join('')}</div>
        </div>
        <label class="field"><span>What the customer asked for</span><textarea rows="3" data-input="desc" placeholder="e.g. Add a tail guard at the discharge end">${esc(d.desc)}</textarea></label>
        <div class="list">
          <div class="row"><span class="row-main"><span class="row-title">Labor</span><span class="row-sub">${d.hours} h at ${money(RATE)}/h (example rate)</span></span>
            <span class="stepper"><button type="button" data-act="coHours" data-d="-1" aria-label="Fewer hours">−</button><span>${d.hours} h</span><button type="button" data-act="coHours" data-d="1" aria-label="More hours">+</button></span></div>
          <div class="row"><span class="row-main"><span class="row-title">Material</span><span class="row-sub">Parts and stock for this work</span></span>
            <span class="stepper"><button type="button" data-act="coMat" data-d="-50" aria-label="Less material">−</button><span style="min-width:60px">${money(d.mat)}</span><button type="button" data-act="coMat" data-d="50" aria-label="More material">+</button></span></div>
          <div class="price-total"><span class="label" style="color:var(--blue)">Quoted price</span><span class="money">${money(coTotal(d))}</span></div>
        </div>
        ${d.photos.length ? `<div class="photos">${d.photos.map((u, i) => `<div class="ph" style="background-image:url('${u}')">Photo ${i + 1}</div>`).join('')}</div>` : ''}
        <label class="btn soft file-btn">${ICON.camera} ${d.photos.length ? plural(d.photos.length, 'photo') + ' · add another' : 'Add a photo of the area'}<input type="file" accept="image/*" capture="environment" data-photo="co" data-id="draft"></label>
        <button type="button" class="btn ${canSign(d) ? 'fill' : 'off'}" data-act="coToSign" id="toSignBtn">Get customer signature</button>
        <button type="button" class="btn soft" data-act="coSaveLater">Save and get it signed later</button>`;
    },
  },

  cosign: {
    back: true,
    title: () => 'Customer signature',
    eyebrow: () => 'Change order · ' + draft().item,
    render() {
      const d = draft();
      return `
        <div class="small" style="padding:0 4px">Hand the phone to the customer.</div>
        <div class="card pad" style="display:flex;flex-direction:column;gap:10px">
          <div class="label" style="color:var(--blue)">Additional work · ${esc(d.item)}</div>
          <div style="font-size:16px;line-height:1.45">${esc(d.desc)}</div>
          <div class="row-sub" style="display:flex;justify-content:space-between"><span>Labor, ${d.hours} h</span><span>${money(d.hours * RATE)}</span></div>
          <div class="row-sub" style="display:flex;justify-content:space-between"><span>Material</span><span>${money(d.mat)}</span></div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid var(--ap-line);padding-top:10px"><b>Price</b><span class="money">${money(coTotal(d))}</span></div>
          <div class="small">By signing, you approve IESM to do this work for the price above, added to the original order.</div>
        </div>
        <label class="field"><span>Customer name</span><input type="text" class="input" data-input="signer" value="${esc(d.signer)}" placeholder="Full name" autocomplete="off"></label>
        <div class="sig-wrap">
          <div class="sig-line"></div>
          <div class="sig-hint" id="sigHint" ${d.signed ? 'hidden' : ''}>Sign here with your finger</div>
          <canvas id="sig" aria-label="Signature box"></canvas>
          ${d.signed ? '<button type="button" class="sig-clear" data-act="coClearSig">Clear</button>' : ''}
        </div>
        <button type="button" class="btn ${canSubmit(d) ? 'green' : 'off'}" data-act="coSubmit" id="submitBtn">${signLabel(d)}</button>`;
    },
    mount(render) { mountSignature(render); },
  },
};

function saveCo(status) {
  const d = draft();
  const id = d.id || 'CO-' + String(11 + st.cos.length).padStart(4, '0');
  const co = { id, item: d.item, desc: d.desc.trim(), hours: d.hours, mat: d.mat, status, who: status === 'signed' ? d.signer.trim() : '', when: 'Today', sig: d.sig };
  const at = st.cos.findIndex((x) => x.id === id);
  if (at >= 0) st.cos[at] = co; else st.cos.unshift(co);
  st.draft = null;
  root('co');
  st.banner = status === 'signed' ? `${id} signed by ${d.signer.trim()} — ${money(coTotal(d))}. Shane and the office have it.` : `${id} saved — waiting for a signature`;
}

export const actions = {
  openProject: (el) => go('project', { project: el.dataset.project }),
  openItem: (el) => go('item', { key: el.dataset.key }),
  tabCo: () => root('co'),
  stageCheck(el) { const it = itemByKey(st.params.key); const c = checksOf(it); c[el.dataset.i] = !c[el.dataset.i]; st.keepScroll = true; },
  stageDone() {
    const it = itemByKey(st.params.key);
    const s = stageOfItem(it);
    const next = STAGES[stageIndex(s.key) + 1];
    if (!next || checksDone(it) < s.checks.length || isHeld(it)) { st.keepScroll = true; return; }
    st.stageAt[it.key] = next.key;
    st.banner = `${s.label} done — ${it.key} moved to ${next.label}. ${next.owner} has been told.`;
    st.scrollTop = true;
  },
  itemNewCo: () => { st.draft = newDraft(st.params.key); go('conew'); },
  newCo: () => { st.draft = newDraft('19160-SC001'); go('conew'); },
  coItem(el) { st.draft = { ...draft(), item: el.dataset.k }; st.keepScroll = true; },
  coHours(el) { const d = draft(); st.draft = { ...d, hours: Math.max(0, d.hours + Number(el.dataset.d)) }; st.keepScroll = true; },
  coMat(el) { const d = draft(); st.draft = { ...d, mat: Math.max(0, d.mat + Number(el.dataset.d)) }; st.keepScroll = true; },
  coToSign() { if (canSign(draft())) go('cosign'); else { st.banner = 'Describe the extra work first'; st.scrollTop = true; } },
  coSaveLater() { if (canSign(draft())) saveCo('pending'); else { st.banner = 'Describe the extra work first'; st.scrollTop = true; } },
  coSignExisting(el) {
    const c = st.cos.find((x) => x.id === el.dataset.id);
    st.draft = { ...newDraft(c.item), id: c.id, desc: c.desc, hours: c.hours, mat: c.mat };
    go('cosign');
  },
  coClearSig() { st.draft = { ...draft(), signed: false, sig: null }; st.keepScroll = true; },
  coSubmit() { if (canSubmit(draft())) saveCo('signed'); else st.keepScroll = true; },
};

// Typing in the change order: update without redrawing, then fix the one button
export function onInput(el) {
  const f = el.dataset.input;
  if (!f) return;
  st.draft = { ...draft(), [f]: el.value };
  const d = draft();
  const a = document.getElementById('toSignBtn');
  if (a) a.className = 'btn ' + (canSign(d) ? 'fill' : 'off');
  const b = document.getElementById('submitBtn');
  if (b) { b.className = 'btn ' + (canSubmit(d) ? 'green' : 'off'); b.textContent = signLabel(d); }
}

// Finger signature
function mountSignature(render) {
  const canvas = document.getElementById('sig');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  Object.assign(ctx, { lineWidth: 3, lineCap: 'round', lineJoin: 'round', strokeStyle: '#0f1c2e' });
  const d = draft();
  if (d.sig) { const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height); img.src = d.sig; }
  let drawing = false;
  const pos = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  canvas.addEventListener('pointerdown', (e) => { drawing = true; canvas.setPointerCapture(e.pointerId); document.getElementById('sigHint')?.setAttribute('hidden', ''); ctx.beginPath(); ctx.moveTo(...pos(e)); });
  canvas.addEventListener('pointermove', (e) => { if (drawing) { ctx.lineTo(...pos(e)); ctx.stroke(); } });
  const end = () => {
    if (!drawing) return;
    drawing = false;
    const first = !draft().signed;
    st.draft = { ...draft(), signed: true, sig: canvas.toDataURL('image/png') };
    if (first) { st.keepScroll = true; render(); } else onInput({ dataset: { input: 'signer' }, value: draft().signer });
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
}

export { viewInfo, back };
