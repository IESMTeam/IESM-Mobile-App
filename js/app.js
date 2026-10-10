// IESM mobile demo — plain JavaScript, no frameworks.
// Flow: launch animation → passcode → choose your view → app.
// All data is sample data kept in memory; reloading the page starts fresh.
import { PASSCODE, SPLASH_MS } from './config.js';
import { ROLES, ROLE_ORDER, DEPTS, PROJECTS, STEPS, RATE, CO_ITEMS, startingData } from './data.js';
import { ICON, mark, splashMark } from './icons.js';

const root = document.getElementById('app');
const BLUE = '#1e40af';

const st = {
  phase: 'splash',            // splash | lock | roles | app
  code: '', codeBad: false,
  roleKey: null,
  screen: 'home', hist: [], dept: null, jobId: null, projNum: '19204', itemKey: '19204-BC001',
  banner: '',
  notes: [], lastDone: null,
  clockedIn: true, picking: false, jobIdx: 0, submitted: false,
  draft: null,
  ...startingData(),
};

// ---------- helpers ----------
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
const role = () => ROLES[st.roleKey];
const deptOf = (key) => DEPTS.find((d) => d.key === key) || DEPTS[0];
const curDept = () => deptOf(st.dept);
const curJob = () => { const d = curDept(); return d.jobs.find((j) => j.id === st.jobId) || d.jobs[0]; };
const doneIn = (j) => j.lines.filter((l) => (st.checks[j.id] || {})[l.id]).length;
const openJobs = (d) => d.jobs.filter((j) => !st.finished[j.id]);
const allItems = () => PROJECTS.flatMap((p) => p.items.map((it) => ({ key: p.num + '-' + it.code, p, it })));
const curProj = () => PROJECTS.find((p) => p.num === st.projNum) || PROJECTS[0];
const curItem = () => { const all = allItems(); return all.find((x) => x.key === st.itemKey) || all[0]; };
const newDraft = (item) => ({ item, desc: '', hours: 4, mat: 200, photos: [], signer: '', signed: false, sig: null });
const draft = () => st.draft || newDraft('19204-BC001');
const coTotal = (d) => d.hours * RATE + d.mat;
const canSign = (d) => d.desc.trim().length > 0;
const canSubmit = (d) => d.signed && d.signer.trim().length > 0;

function go(screen, extra = {}) {
  st.hist.push({ screen: st.screen, dept: st.dept, jobId: st.jobId, projNum: st.projNum, itemKey: st.itemKey });
  Object.assign(st, { screen, banner: '' }, extra);
}
function back() {
  const prev = st.hist.pop() || { screen: 'home', dept: st.dept, jobId: null, projNum: st.projNum, itemKey: st.itemKey };
  Object.assign(st, prev, { banner: '' });
}

// ======================================================================
// Screens before the app: splash, passcode, view picker
// ======================================================================
function renderSplash() {
  return `<button type="button" class="splash" data-act="skipSplash" aria-label="Open">${splashMark()}</button>`;
}

function renderLock() {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
  return `
    <div class="lock ${st.lockEnter ? 'enter' : ''}">
      ${mark('lock-mark')}
      <div class="prompt ${st.codeBad ? 'bad' : ''}">${st.codeBad ? 'Wrong passcode' : 'Enter passcode'}</div>
      <div class="pin-dots ${st.codeBad ? 'shake' : ''}">
        ${[...PASSCODE].map((_, i) => `<span class="${i < st.code.length ? 'on' : ''}"></span>`).join('')}
      </div>
      <div class="keys">
        ${keys.map((k) => k === 'del'
          ? `<button type="button" class="key del" data-act="key" data-k="del" aria-label="Delete">${ICON.del}</button>`
          : `<button type="button" class="key ${k ? '' : 'blank'}" data-act="key" data-k="${k}"${k ? '' : ' tabindex="-1" aria-hidden="true"'}>${k}</button>`).join('')}
      </div>
    </div>`;
}

const ROLE_LOOK = {
  warehouse: { icon: 'recv', tint: 'background:#e0e7ff;color:#1e40af' },
  field: { icon: 'proj', tint: 'background:#ede9fe;color:#6d28d9' },
  shop: { icon: 'fab', tint: 'background:#ffedd5;color:#c2410c' },
  purchasing: { icon: 'buy', tint: 'background:#dcfce7;color:#15803d' },
};
const TAB_NAMES = { recv: 'Receiving', kit: 'Kitting', fab: 'Fabrication', ship: 'Shipping', buy: 'Purchasing', proj: 'Projects', co: 'Change orders' };

function renderRoles() {
  return `
    <div class="shell">
      <header class="hdr">
        ${mark()}
        <div class="titles">
          <div class="eyebrow">Good morning</div>
          <div class="hdr-title">Choose your view</div>
        </div>
        <button type="button" class="hdr-btn" data-act="lock" aria-label="Lock">${ICON.lock}</button>
      </header>
      <main>
        <div class="hint">Everyone gets Home and Time. Pick the work you do.</div>
        ${ROLE_ORDER.map((k) => {
          const r = ROLES[k];
          const look = ROLE_LOOK[k];
          return `
            <button type="button" class="rowbtn role" data-act="pickRole" data-k="${k}">
              <span class="role-icon" style="${look.tint}">${ICON[look.icon]}</span>
              <span class="role-txt">
                <b>${esc(r.label)}</b>
                <span>${r.tabs.map((t) => TAB_NAMES[t]).join(' · ')}</span>
              </span>
              <span class="chev">${ICON.chevron}</span>
            </button>`;
        }).join('')}
      </main>
    </div>`;
}

// ======================================================================
// The app
// ======================================================================
function renderApp() {
  const s = st;
  const screen = s.screen;
  const dept = curDept();
  const job = curJob();
  const proj = curProj();
  const ci = curItem();
  const r = role();

  const titles = { home: 'Good morning', dept: dept.name, job: job.name, co: 'Change orders', conew: 'New change order', cosign: 'Customer signature',
    time: 'Time card', projects: 'Projects', project: proj.num + ' · ' + proj.customer, item: ci.key };
  const eyebrows = { home: r.label + ' · Nampa', time: 'Friday, Oct 9', projects: PROJECTS.length + ' open', project: proj.desc, item: ci.p.customer,
    dept: openJobs(dept).length + ' open', job: dept.name, co: 'Extra work in the field', conew: 'Change order', cosign: 'Change order' };
  const showBack = ['job', 'conew', 'cosign', 'project', 'item'].includes(screen);

  const body = {
    home: viewHome, dept: viewDept, job: viewJob, co: viewCo, conew: viewCoNew, cosign: viewCoSign,
    time: viewTime, projects: viewProjects, project: viewProject, item: viewItem,
  }[screen] || viewHome;

  const tabs = ['home', ...r.tabs, 'time'];
  return `
    <div class="shell">
      <header class="hdr">
        ${showBack ? `<button type="button" class="hdr-btn" data-act="back" aria-label="Back">${ICON.back}</button>` : mark()}
        <div class="titles">
          <div class="eyebrow">${esc(eyebrows[screen] || '')}</div>
          <div class="hdr-title">${esc(titles[screen] || '')}</div>
        </div>
        ${showBack ? '' : `<button type="button" class="hdr-btn" data-act="switchView" aria-label="Switch view">${ICON.swap}</button>`}
      </header>
      <main id="main">
        ${s.banner ? `<div class="banner" role="status">${ICON.bannerCheck}<span>${esc(s.banner)}</span></div>` : ''}
        ${body()}
      </main>
      <nav class="tabs" aria-label="Main" style="grid-template-columns: repeat(${tabs.length}, minmax(0, 1fr))">
        ${tabs.map(renderTab).join('')}
      </nav>
    </div>`;
}

function renderTab(k) {
  const s = st;
  const screen = s.screen;
  const inCo = ['co', 'conew', 'cosign'].includes(screen);
  const labels = { home: 'Home', time: 'Time', proj: 'Projects', co: 'Changes' };
  const dd = DEPTS.find((x) => x.key === k);
  let active = false;
  let badge = '';
  if (k === 'home') { active = screen === 'home'; badge = s.notes.length || ''; }
  else if (k === 'time') active = screen === 'time';
  else if (k === 'proj') active = ['projects', 'project', 'item'].includes(screen);
  else if (k === 'co') { active = inCo; badge = s.cos.filter((c) => c.status === 'pending').length || ''; }
  else { active = (screen === 'dept' || screen === 'job') && s.dept === k; badge = openJobs(dd).some((j) => j.late) ? openJobs(dd).length : ''; }
  const label = dd ? dd.name : labels[k];
  return `
    <button type="button" class="tab ${active ? 'on' : ''}" data-act="tab" data-k="${k}" aria-label="${label}">
      ${ICON[k]}
      ${badge ? `<span class="badge">${badge}</span>` : ''}
      <span>${label}</span>
    </button>`;
}

// ---------- Home = notifications ----------
function viewHome() {
  const notes = st.notes;
  return `
    <div class="stack tight">
      <div class="lbl">${notes.length ? notes.length + ' new for you' : 'Notifications'}</div>
      ${notes.map((n) => `
        <div class="card note">
          <span class="dot ${n.kind === 'warn' ? 'warn' : ''}"></span>
          <button type="button" class="note-open" data-act="openNote" data-id="${n.id}">
            <b>${esc(n.title)}</b>
            <span>${esc(n.sub)}</span>
          </button>
          <button type="button" class="small-btn" data-act="noteDone" data-id="${n.id}">Done</button>
        </div>`).join('')}
      ${notes.length ? '' : '<div class="card empty">You\'re all caught up.</div>'}
      ${st.lastDone ? '<button type="button" class="link-btn" data-act="undoNote">Undo last Done</button>' : ''}
    </div>`;
}

// ---------- Area: list of jobs / POs ----------
function viewDept() {
  const dept = curDept();
  return `
    <div class="stack tight">
      <div class="hint">${esc(dept.hint)}</div>
      ${dept.jobs.map((j) => {
        const n = doneIn(j); const t = j.lines.length; const fin = !!st.finished[j.id];
        const tagColor = fin ? '#15803d' : j.late ? '#b91c1c' : '#5b6475';
        return `
          <button type="button" class="rowbtn" data-act="openJob" data-id="${esc(j.id)}">
            <span class="row-top">
              <span class="row-name">${esc(j.name)}</span>
              <span style="font-size:14px;font-weight:600;color:${tagColor}">${esc(fin ? 'Complete' : j.tag)}</span>
            </span>
            <span class="row-sub">${esc(j.sub)}</span>
            <span class="bar-row">
              <span class="bar"><span class="${n === t ? 'full' : ''}" style="width:${Math.round((n / t) * 100)}%"></span></span>
              <span class="bar-label">${n} of ${t}</span>
            </span>
          </button>`;
      }).join('')}
    </div>`;
}

// ---------- One job: the checklist ----------
function photoTiles(list, kind) {
  return `<div class="photos">${list.map((url, i) => url
    ? `<button type="button" class="ph img" style="background-image:url('${url}')" data-act="removePhoto" data-kind="${kind}" data-i="${i}" aria-label="Photo ${i + 1}, tap to remove">Photo ${i + 1}</button>`
    : `<div class="ph" style="background-color:${['#cfd9e6', '#d9e1ec', '#c5d1e0', '#e1e7ef'][i % 4]}">Photo ${i + 1}</div>`).join('')}</div>`;
}
function photoButtons(kind) {
  return `
    <div class="grid2">
      <label class="big btn-blue file-btn">${ICON.camera} Take photo<input type="file" accept="image/*" capture="environment" data-photo="${kind}" data-how="Camera"></label>
      <label class="big btn-white file-btn">${ICON.upload} Upload<input type="file" accept="image/*" data-photo="${kind}" data-how="Uploaded"></label>
    </div>`;
}

function viewJob() {
  const dept = curDept();
  const job = curJob();
  const checks = st.checks[job.id] || {};
  const total = job.lines.length;
  const done = doneIn(job);
  const allDone = done === total;
  const photos = st.photos[job.id] || [];
  const needPhoto = !!dept.photos && photos.length === 0;
  const fin = !!st.finished[job.id];
  const canFinish = allDone && !needPhoto && !fin;
  const label = fin ? 'Marked complete ✓' : allDone ? (needPhoto ? 'Add a photo to finish' : 'Mark complete') : (total - done) + ' left to check off';
  const verb = dept.verb.charAt(0).toUpperCase() + dept.verb.slice(1);
  return `
    <div class="stack">
      <div class="hint">${esc(job.sub)}</div>
      <div class="card" style="overflow:hidden">
        ${job.lines.map((l) => {
          const who = checks[l.id];
          return `
            <button type="button" class="check ${who ? 'done' : ''}" data-act="toggleLine" data-id="${l.id}" aria-pressed="${who ? 'true' : 'false'}">
              <span class="tick">${who ? ICON.check : ''}</span>
              <span class="txt">
                <span class="t1">${esc(l.text)}</span>
                <span class="t2">${esc(who ? verb + ' · ' + who : l.sub)}</span>
              </span>
            </button>`;
        }).join('')}
      </div>
      ${dept.photos ? `
        <div class="card photo-card">
          <div class="photo-head"><span class="lbl">Load photos</span><span>${photos.length ? plural(photos.length, 'photo') : 'At least 1 needed'}</span></div>
          ${photos.length ? photoTiles(photos, 'job') : ''}
          ${photoButtons('job')}
        </div>` : ''}
      <button type="button" class="big ${canFinish ? 'btn-green' : 'btn-off'}" data-act="finishJob">${label}</button>
    </div>`;
}

// ---------- Change orders ----------
function viewCo() {
  return `
    <div class="stack">
      <button type="button" class="new-co" data-act="newCo">${ICON.plus} New change order</button>
      <div class="small-hint">Customer asked for extra work in the field? Write it up, price it, and get their signature before you start.</div>
      <div class="section">Your change orders</div>
      ${st.cos.map((c) => {
        const signed = c.status === 'signed';
        return `
          <div class="box co">
            <div class="co-top"><b>${esc(c.id)} · ${esc(c.item)}</b><span class="pill ${signed ? 'ok' : 'wait'}">${signed ? 'Signed' : 'Needs signature'}</span></div>
            <div class="co-desc">${esc(c.desc)}</div>
            <div class="co-foot"><span>${esc(signed ? 'Signed by ' + c.who + ' · ' + c.when : 'Written ' + c.when)}</span><b>${money(c.hours * RATE + c.mat)}</b></div>
          </div>`;
      }).join('')}
    </div>`;
}

function viewCoNew() {
  const d = draft();
  const items = CO_ITEMS.includes(d.item) ? CO_ITEMS : [d.item, ...CO_ITEMS.slice(0, 3)];
  return `
    <div class="stack loose">
      <div class="stack" style="gap:8px">
        <span class="field-label">Project item</span>
        <div class="chips">
          ${items.map((k) => `<button type="button" class="chip ${d.item === k ? 'on' : ''}" data-act="coItem" data-k="${k}">${k}</button>`).join('')}
        </div>
      </div>
      <label class="field">
        <span class="field-label">What the customer asked for</span>
        <textarea rows="3" data-input="desc">${esc(d.desc)}</textarea>
      </label>
      <div class="box price">
        <div class="price-row">
          <span class="what"><b>Labor</b><span>${d.hours} h at ${money(RATE)}/h (example rate)</span></span>
          <button type="button" class="step" data-act="hours" data-d="-1" aria-label="Fewer hours">−</button>
          <span class="step-val">${d.hours} h</span>
          <button type="button" class="step" data-act="hours" data-d="1" aria-label="More hours">+</button>
        </div>
        <div class="price-row">
          <span class="what"><b>Material</b><span>Parts and stock for this work</span></span>
          <button type="button" class="step" data-act="mat" data-d="-50" aria-label="Less material">−</button>
          <span class="step-val" style="min-width:60px">${money(d.mat)}</span>
          <button type="button" class="step" data-act="mat" data-d="50" aria-label="More material">+</button>
        </div>
        <div class="price-total"><span class="section">Quoted price</span><span class="money-big">${money(coTotal(d))}</span></div>
      </div>
      ${d.photos.length ? photoTiles(d.photos, 'co') : ''}
      <label class="btn-outline file-btn">${ICON.camera} ${d.photos.length ? plural(d.photos.length, 'photo') + ' attached · add another' : 'Add a photo of the area'}<input type="file" accept="image/*" capture="environment" data-photo="co" data-how="Camera"></label>
      <button type="button" class="btn-tall ${canSign(d) ? 'btn-blue' : 'btn-off2'}" data-act="toSign" id="toSignBtn">Get customer signature</button>
      <button type="button" class="btn-outline" data-act="saveUnsigned">Save and get it signed later</button>
    </div>`;
}

function signLabel(d) {
  return canSubmit(d) ? 'Approve ' + money(coTotal(d)) : d.signed ? 'Enter the customer’s name' : 'Waiting for signature';
}

function viewCoSign() {
  const d = draft();
  return `
    <div class="stack loose">
      <div class="small-hint">Hand the phone to the customer.</div>
      <div class="box summary">
        <div class="section">Additional work · ${esc(d.item)}</div>
        <div class="desc">${esc(d.desc)}</div>
        <div class="sum-line"><span>Labor, ${d.hours} h</span><span>${money(d.hours * RATE)}</span></div>
        <div class="sum-line"><span>Material</span><span>${money(d.mat)}</span></div>
        <div class="sum-total"><b>Price</b><span class="money-big">${money(coTotal(d))}</span></div>
        <div class="fine">By signing, you approve IESM to do this work for the price above, added to the original order.</div>
      </div>
      <label class="field">
        <span class="field-label">Customer name</span>
        <input type="text" class="text-input" data-input="signer" value="${esc(d.signer)}" placeholder="Full name" autocomplete="off">
      </label>
      <div class="sig-wrap" aria-label="Signature box, sign with your finger">
        <div class="sig-line"></div>
        <div class="sig-hint" id="sigHint" ${d.signed ? 'hidden' : ''}>Sign here with your finger</div>
        <canvas id="sig"></canvas>
        ${d.signed ? '<button type="button" class="sig-clear" data-act="clearSig">Clear</button>' : ''}
      </div>
      <button type="button" class="btn-tall ${canSubmit(d) ? 'btn-dark-green' : 'btn-off2'}" data-act="submitSigned" id="submitBtn">${signLabel(d)}</button>
    </div>`;
}

// ---------- Time card ----------
function viewTime() {
  const jobs = role().jobs;
  const tj = jobs[st.jobIdx];
  const entries = [
    { item: jobs[0].item, task: jobs[0].task, span: '6:58 – 9:40 AM', hours: '2.7 h' },
    { item: jobs[1].item, task: jobs[1].task, span: '9:40 – 11:30 AM', hours: '1.8 h' },
  ];
  if (st.jobIdx > 1) entries.push({ item: tj.item, task: tj.task, span: '11:30 AM – now', hours: '0.4 h' });
  const hrs = [8.5, 9, 8, 8.5, st.clockedIn ? 4.9 : 4.5, 0, 0];
  return `
    <div class="stack loose">
      <div class="box clock-card">
        <div class="clock-top">
          <span class="dot ${st.clockedIn ? 'in' : 'out'}"></span>
          <b>${st.clockedIn ? 'Clocked in since 6:58 AM' : 'Clocked out'}</b>
          <span class="money-big">${st.clockedIn ? '4.9 h' : '4.5 h'}</span>
        </div>
        ${st.clockedIn ? `
          <div class="working">
            <small>Working on</small>
            <b>${esc(tj.item)}</b>
            <span>${esc(tj.task)} · since ${st.jobIdx === 0 ? '6:58 AM' : '11:30 AM'}</span>
          </div>` : ''}
        <div class="btn-row">
          ${st.clockedIn ? '<button type="button" class="btn-mid btn-white" data-act="togglePicker">Switch job</button>' : ''}
          <button type="button" class="btn-mid ${st.clockedIn ? 'btn-clock-out' : 'btn-dark-green'}" data-act="toggleClock">${st.clockedIn ? 'Clock out' : 'Clock in'}</button>
        </div>
        ${st.picking ? `
          <div class="stack" style="gap:8px">
            <span class="field-label">Switch to</span>
            ${jobs.map((c, i) => `<button type="button" class="choice" data-act="pickJob" data-i="${i}"><b>${esc(c.item)}</b><span>${esc(c.task)}</span></button>`).join('')}
          </div>` : ''}
      </div>
      <div class="section">Today</div>
      <div class="box" style="overflow:hidden">
        ${entries.map((e) => `<div class="entry"><span class="what"><b>${esc(e.item)}</b><span>${esc(e.task)} · ${e.span}</span></span><b>${e.hours}</b></div>`).join('')}
      </div>
      <div class="section">This week</div>
      <div class="box week">
        <div class="week-bars">
          ${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dy, i) => `
            <div class="week-day"><span class="${i === 4 ? 'today' : hrs[i] ? 'has' : ''}" style="height:${Math.max(4, Math.round((hrs[i] / 10) * 64))}px"></span><small>${dy}</small></div>`).join('')}
        </div>
        <div class="week-foot">
          <span><b>${hrs.reduce((a, b) => a + b, 0).toFixed(1)} h</b> this week</span>
          <button type="button" class="btn-submit ${st.submitted ? 'btn-submitted' : 'btn-blue'}" data-act="submitWeek">${st.submitted ? 'Submitted' : 'Submit week'}</button>
        </div>
      </div>
    </div>`;
}

// ---------- Projects ----------
function viewProjects() {
  return `
    <div class="stack tight">
      ${PROJECTS.map((p) => {
        const pct = Math.round(p.items.reduce((a, it) => a + it.stage, 0) / (p.items.length * 7) * 100);
        const pill = p.phase === 'Install' ? 'info' : p.phase === 'Production' ? 'ok' : 'violet';
        return `
          <button type="button" class="rowbtn" data-act="openProject" data-k="${p.num}" style="gap:8px">
            <span class="proj-top"><span class="proj-num">${p.num}</span><span class="proj-cust">${esc(p.customer)}</span><span class="pill ${pill}">${p.phase}</span></span>
            <span class="proj-desc">${esc(p.desc)} · ${plural(p.items.length, 'item')}</span>
            <span class="bar-row"><span class="bar"><span style="width:${pct}%"></span></span><span class="bar-label" style="font-size:13px;color:#5b6475;font-weight:400">${esc(p.ship)}</span></span>
          </button>`;
      }).join('')}
    </div>`;
}

function viewProject() {
  const proj = curProj();
  const facts = [['Customer', proj.customer], ['PM', proj.pm], ['Site', proj.site], ['Status', proj.ship]];
  return `
    <div class="stack">
      <div class="box facts">${facts.map(([k, v]) => `<div class="fact"><small>${k}</small><b>${esc(v)}</b></div>`).join('')}</div>
      <div class="section">Project items</div>
      ${proj.items.map((it) => `
        <button type="button" class="item-btn" data-act="openItem" data-k="${proj.num}-${it.code}">
          <span class="item-top"><b>${it.code}</b><span>${esc(it.desc)}</span></span>
          <span class="dots">${STEPS.map((_, i) => `<span class="${i < it.stage ? 'on' : ''}"></span>`).join('')}</span>
          <span class="item-stage">${it.stage >= 7 ? 'Shipped' : 'Next: ' + STEPS[it.stage]}</span>
        </button>`).join('')}
    </div>`;
}

function viewItem() {
  const ci = curItem();
  const photos = st.itemPhotos[ci.key] || [];
  return `
    <div class="stack">
      <div class="hint">${esc(ci.it.desc)} · ${esc(ci.p.ship)}</div>
      <div class="card steps">
        ${STEPS.map((label, i) => {
          const done = i < ci.it.stage; const cur = i === ci.it.stage;
          return `
            <div class="stage">
              <span class="circ ${done ? 'done' : cur ? 'cur' : ''}">${done ? ICON.checkSm : i + 1}</span>
              <b class="${done || cur ? '' : 'later'}">${label}</b>
              <span>${done ? 'Done' : cur ? 'Up next' : ''}</span>
            </div>`;
        }).join('')}
      </div>
      <div class="card photo-card">
        <div class="photo-head"><span class="lbl">Site photos</span><span>${photos.length ? plural(photos.length, 'photo') : 'None yet'}</span></div>
        ${photos.length ? photoTiles(photos, 'item') : ''}
        ${photoButtons('item')}
      </div>
      <button type="button" class="big btn-white" data-act="itemNewCo">New change order for this item</button>
    </div>`;
}

// ======================================================================
// Render + events
// ======================================================================
let splashTimers = [];

function render() {
  const keepScroll = st.phase === 'app' ? document.getElementById('main')?.scrollTop : 0;
  // Fade the passcode screen in only when arriving there, not on every key press
  st.lockEnter = st.phase === 'lock' && st.lastPhase !== 'lock';
  st.lastPhase = st.phase;
  const html = { splash: renderSplash, lock: renderLock, roles: renderRoles, app: renderApp }[st.phase]();
  root.innerHTML = html;
  if (st.phase === 'app') {
    const main = document.getElementById('main');
    if (main && st.keepScroll) main.scrollTop = keepScroll;
    st.keepScroll = false;
    if (st.screen === 'cosign') mountSignature();
  }
}

function startSplash() {
  splashTimers.forEach(clearTimeout);
  splashTimers = [
    // Fade out by adding the class to the existing element (re-rendering would restart the animation)
    setTimeout(() => root.querySelector('.splash')?.classList.add('iesm-out'), SPLASH_MS),
    setTimeout(() => { st.phase = 'lock'; render(); }, SPLASH_MS + 330),
  ];
}

function enterRole(k) {
  Object.assign(st, {
    phase: 'app', roleKey: k, screen: 'home', hist: [], dept: null, jobId: null, banner: '',
    notes: ROLES[k].notes.slice(), lastDone: null, jobIdx: 0, picking: false, draft: null,
  });
}

function pressKey(k) {
  st.codeBad = false;
  if (k === 'del') { st.code = st.code.slice(0, -1); return; }
  st.code += k;
  if (st.code.length < PASSCODE.length) return;
  if (st.code === PASSCODE) st.phase = 'roles';
  else { st.codeBad = true; navigator.vibrate?.(200); }
  st.code = '';
}

const ACTIONS = {
  skipSplash() { splashTimers.forEach(clearTimeout); st.phase = 'lock'; },
  key: (el) => pressKey(el.dataset.k),
  pickRole: (el) => enterRole(el.dataset.k),
  switchView() { st.phase = 'roles'; },
  lock() { Object.assign(st, { phase: 'lock', code: '', codeBad: false }); },
  back,
  tab(el) {
    const k = el.dataset.k;
    Object.assign(st, { hist: [], banner: '', jobId: null });
    if (k === 'home') st.screen = 'home';
    else if (k === 'time') st.screen = 'time';
    else if (k === 'proj') st.screen = 'projects';
    else if (k === 'co') st.screen = 'co';
    else Object.assign(st, { screen: 'dept', dept: k });
  },

  // home
  openNote(el) { const n = st.notes.find((x) => x.id === el.dataset.id); if (n) go(n.to.screen, n.to); },
  noteDone(el) { const n = st.notes.find((x) => x.id === el.dataset.id); st.notes = st.notes.filter((x) => x !== n); st.lastDone = n; st.keepScroll = true; },
  undoNote() { st.notes = st.notes.concat([st.lastDone]); st.lastDone = null; },

  // areas / checklists
  openJob: (el) => go('job', { jobId: el.dataset.id }),
  toggleLine(el) {
    const job = curJob();
    const c = st.checks[job.id] = Object.assign({}, st.checks[job.id]);
    if (c[el.dataset.id]) delete c[el.dataset.id]; else c[el.dataset.id] = 'Ronnie · just now';
    delete st.finished[job.id];
    st.banner = '';
    st.keepScroll = true;
  },
  finishJob() {
    const dept = curDept(); const job = curJob();
    const photos = st.photos[job.id] || [];
    const ok = doneIn(job) === job.lines.length && !(dept.photos && photos.length === 0) && !st.finished[job.id];
    if (!ok) { st.keepScroll = true; return; }
    st.finished[job.id] = true;
    back();
    st.banner = job.name + ' marked complete — the office has been notified';
  },
  removePhoto(el) {
    if (!window.confirm('Remove this photo?')) return;
    photoList(el.dataset.kind).splice(Number(el.dataset.i), 1);
    st.keepScroll = true;
  },

  // projects
  openProject: (el) => go('project', { projNum: el.dataset.k }),
  openItem: (el) => go('item', { itemKey: el.dataset.k }),
  itemNewCo: () => go('conew', { draft: newDraft(curItem().key) }),

  // change orders
  newCo: () => go('conew', { draft: newDraft('19204-BC001') }),
  coItem(el) { st.draft = { ...draft(), item: el.dataset.k }; st.keepScroll = true; },
  hours(el) { const d = draft(); st.draft = { ...d, hours: Math.max(0, d.hours + Number(el.dataset.d)) }; st.keepScroll = true; },
  mat(el) { const d = draft(); st.draft = { ...d, mat: Math.max(0, d.mat + Number(el.dataset.d)) }; st.keepScroll = true; },
  toSign() { const d = draft(); if (canSign(d)) go('cosign', { draft: d }); else st.banner = 'Describe the extra work first'; },
  saveUnsigned() { if (canSign(draft())) saveCo('pending'); else st.banner = 'Describe the extra work first'; },
  clearSig() { st.draft = { ...draft(), signed: false, sig: null }; st.keepScroll = true; },
  submitSigned() { if (canSubmit(draft())) saveCo('signed'); else st.keepScroll = true; },

  // time card
  toggleClock() { st.banner = st.clockedIn ? 'Clocked out at 11:51 AM' : 'Clocked in at 12:30 PM'; st.clockedIn = !st.clockedIn; st.picking = false; },
  togglePicker() { st.picking = !st.picking; st.keepScroll = true; },
  pickJob(el) { const i = Number(el.dataset.i); const c = role().jobs[i]; Object.assign(st, { jobIdx: i, picking: false, banner: 'Now on ' + c.item + ' · ' + c.task }); },
  submitWeek() { st.submitted = true; st.banner = 'Week submitted for approval'; },
};

function saveCo(status) {
  const d = draft();
  const id = 'CO-' + String(12 + st.cos.length).padStart(4, '0');
  st.cos = [{ id, item: d.item, desc: d.desc.trim() || 'Additional work', hours: d.hours, mat: d.mat, status, who: status === 'signed' ? d.signer.trim() : '', when: 'Today', sig: d.sig }].concat(st.cos);
  Object.assign(st, { draft: null, screen: 'co', hist: [], banner: status === 'signed' ? id + ' signed by ' + d.signer.trim() + ' — ' + money(coTotal(d)) : id + ' saved — waiting for signature' });
}

function photoList(kind) {
  if (kind === 'job') { const id = curJob().id; return (st.photos[id] ||= []); }
  if (kind === 'item') { const k = curItem().key; return (st.itemPhotos[k] ||= []); }
  st.draft = { ...draft(), photos: draft().photos.slice() };
  return st.draft.photos;
}

root.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.act];
  if (!fn) return;
  fn(el, ev);
  render();
});

// Typing: update the draft without redrawing (keeps the keyboard open), then refresh the one button that depends on it.
root.addEventListener('input', (ev) => {
  const field = ev.target.dataset.input;
  if (!field) return;
  st.draft = { ...draft(), [field]: ev.target.value };
  refreshButtons();
});

// Photo picked from camera or library
root.addEventListener('change', (ev) => {
  const input = ev.target;
  if (!input.dataset.photo || !input.files?.[0]) return;
  const list = photoList(input.dataset.photo);
  list.push(URL.createObjectURL(input.files[0]));
  const where = input.dataset.photo === 'job' ? curJob().name : input.dataset.photo === 'item' ? curItem().key : 'this change order';
  st.banner = input.dataset.how + ' · photo ' + list.length + ' added to ' + where;
  render();
});

function refreshButtons() {
  const d = draft();
  const toSign = document.getElementById('toSignBtn');
  if (toSign) toSign.className = 'btn-tall ' + (canSign(d) ? 'btn-blue' : 'btn-off2');
  const submit = document.getElementById('submitBtn');
  if (submit) { submit.className = 'btn-tall ' + (canSubmit(d) ? 'btn-dark-green' : 'btn-off2'); submit.textContent = signLabel(d); }
}

// Finger signature on a canvas
function mountSignature() {
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
  canvas.addEventListener('pointerdown', (e) => {
    drawing = true;
    canvas.setPointerCapture(e.pointerId);
    document.getElementById('sigHint')?.setAttribute('hidden', '');
    ctx.beginPath();
    ctx.moveTo(...pos(e));
  });
  canvas.addEventListener('pointermove', (e) => { if (!drawing) return; ctx.lineTo(...pos(e)); ctx.stroke(); });
  const end = () => {
    if (!drawing) return;
    drawing = false;
    const wasSigned = draft().signed;
    st.draft = { ...draft(), signed: true, sig: canvas.toDataURL('image/png') };
    if (!wasSigned) { st.keepScroll = true; render(); } else refreshButtons();
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
}

render();
startSplash();
