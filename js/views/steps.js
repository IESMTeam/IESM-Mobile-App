// Checklist steps — the dashboard Pipeline's step sheet, phone-sized:
// progress ring, the stage and who owns it, its checks, then Sign off / Report issue.
import { st, siteOk, viewInfo } from '../store.js';
import { ITEMS, STAGES, VIEWS, PEOPLE, stageIndex, itemByKey } from '../data.js';
import { ICON } from '../icons.js';
import { esc, avatar } from '../ui.js';

const id = (key, stage) => key + ':' + stage;

// Checks for one step, seeded from the sample so work starts part-way through
export function checks(key, stage, seedPct = null) {
  const k = id(key, stage);
  if (!st.stageChecks[k]) {
    const s = STAGES[stageIndex(stage)];
    const it = itemByKey(key);
    const cur = st.stageAt[key] || it.at;
    const before = stageIndex(stage) < stageIndex(cur);
    const pct = seedPct ?? (before ? 100 : stage === cur ? it.pct || 0 : 0);
    const n = Math.floor((pct / 100) * s.checks.length);
    st.stageChecks[k] = Object.fromEntries(s.checks.map((_, i) => [i, i < n]));
  }
  return st.stageChecks[k];
}
const doneCount = (key, stage) => Object.values(checks(key, stage)).filter(Boolean).length;
export const held = (key) => (key in st.holds ? st.holds[key] : st.stageAt[key] ? null : itemByKey(key).held || null);

// Steps for this view (Mine) or for every open item (Everyone)
export function stepsFor(who) {
  const mine = VIEWS[st.view].steps.map(([key, stage, pct]) => ({ key, stage, pct }));
  const list = who === 'mine' ? mine
    : [...mine, ...ITEMS.map((it) => ({ key: it.key, stage: st.stageAt[it.key] || it.at }))]
      .filter((s, i, a) => a.findIndex((x) => x.key === s.key && x.stage === s.stage) === i);
  return list.filter((s) => siteOk(itemByKey(s.key).site));
}
export const isSigned = (s) => !!st.signed[id(s.key, s.stage)];
export const checksLeft = (steps) => steps.filter((s) => !isSigned(s)).reduce((a, s) => a + STAGES[stageIndex(s.stage)].checks.length - doneCount(s.key, s.stage), 0);

function ring(pct, tone) {
  const r = 15, c = 2 * Math.PI * r;
  return `<svg class="ring ${tone}" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="${r}" class="ring-bg"/><circle cx="18" cy="18" r="${r}" class="ring-fg" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}"/></svg>`;
}

// One step card. showItem = put the project item in the title (Home), or the stage (item page).
export function stepCard({ key, stage, pct }, { showItem = true } = {}) {
  const it = itemByKey(key);
  const s = STAGES[stageIndex(stage)];
  const ck = checks(key, stage, pct);
  const n = doneCount(key, stage);
  const all = n === s.checks.length;
  const sid = id(key, stage);
  const signed = st.signed[sid];
  const hold = held(key);
  const writing = st.issueFor === sid;
  const tone = signed ? 'green' : hold ? 'red' : all ? 'green' : 'blue';
  const foot = signed
    ? `<div class="step-signed">${ICON.check}<span>Signed off by <b>${esc(signed)}</b> · just now</span><button type="button" class="pill" data-act="stepUnsign" data-k="${esc(key)}" data-s="${stage}">Undo</button></div>`
    : hold
      ? `<div class="hold">${ICON.warn}<span><b>On hold.</b> ${esc(hold)}</span></div>
         <div class="step-btns"><button type="button" class="pill fill" data-act="stepClearHold" data-k="${esc(key)}">Clear hold</button></div>`
      : writing
        ? `<textarea rows="2" id="issueText" placeholder="What's wrong? e.g. Pump back ordered until Oct 21"></textarea>
           <div class="step-btns"><button type="button" class="pill" data-act="stepIssueCancel">Cancel</button><button type="button" class="pill fill red" data-act="stepIssueSave" data-k="${esc(key)}">Put on hold</button></div>`
        : `<div class="step-btns">
             <button type="button" class="pill" style="color:#d70015" data-act="stepIssue" data-k="${esc(key)}" data-s="${stage}">${ICON.warn} Report issue</button>
             <button type="button" class="pill ${all ? 'fill' : 'soft'}" data-act="stepSign" data-k="${esc(key)}" data-s="${stage}" ${all ? '' : 'disabled'}>${ICON.check} ${all ? 'Sign off' : `Sign off · ${s.checks.length - n} left`}</button>
           </div>`;
  return `
    <section class="step ${signed ? 'is-signed' : ''}">
      <header class="step-head" ${showItem ? `data-act="openItem" data-key="${esc(key)}"` : ''}>
        <span class="step-ring">${ring(signed ? 1 : n / s.checks.length, tone)}<b>${n}</b></span>
        <span class="row-main">
          <span class="row-title">${showItem ? `<span class="key">${esc(key)}</span> · ${esc(s.label)}` : esc(s.label)}</span>
          <span class="row-sub">${showItem ? esc(it.desc) + ' · ' : ''}${n} of ${s.checks.length} checks · ${esc(it.bay || '')}</span>
        </span>
        ${avatar(s.owner)}
      </header>
      ${signed ? '' : `<div class="step-checks">${s.checks.map((c, i) => `
        <div class="check ${ck[i] ? 'done' : ''}" role="checkbox" tabindex="0" aria-checked="${ck[i] ? 'true' : 'false'}" data-act="stepCheck" data-k="${esc(key)}" data-s="${stage}" data-i="${i}">
          <span class="tick">${ck[i] ? ICON.check : ''}</span><span class="row-main"><span class="row-title">${esc(c)}</span></span>
        </div>`).join('')}</div>`}
      <footer class="step-foot">${foot}</footer>
    </section>`;
}

export const actions = {
  stepCheck(el) {
    const c = checks(el.dataset.k, el.dataset.s);
    c[el.dataset.i] = !c[el.dataset.i];
    st.keepScroll = true;
  },
  stepSign(el) {
    const { k, s } = el.dataset;
    const stage = STAGES[stageIndex(s)];
    if (doneCount(k, s) < stage.checks.length) { st.keepScroll = true; return; }
    st.signed[id(k, s)] = viewInfo().user;
    const it = itemByKey(k);
    const cur = st.stageAt[k] || it.at;
    const next = STAGES[stageIndex(s) + 1];
    if (s === cur && next) { st.stageAt[k] = next.key; st.banner = `${stage.label} signed off — ${k} moved to ${next.label}. ${next.owner} and ${'Shane Kloer'} have been told.`; }
    else st.banner = `${stage.label} signed off for ${k}. ${PEOPLE[stage.owner] ? 'The PM has been told.' : ''}`;
    st.keepScroll = true;
  },
  stepUnsign(el) { delete st.signed[id(el.dataset.k, el.dataset.s)]; st.keepScroll = true; },
  stepIssue(el) { st.issueFor = id(el.dataset.k, el.dataset.s); st.keepScroll = true; },
  stepIssueCancel() { st.issueFor = null; st.keepScroll = true; },
  stepIssueSave(el) {
    const t = (document.getElementById('issueText')?.value || '').trim() || 'Issue reported';
    st.holds[el.dataset.k] = t;
    st.issueFor = null;
    st.banner = `${el.dataset.k} put on hold — Shane Kloer has been told`;
    st.keepScroll = true;
  },
  stepClearHold(el) { st.holds[el.dataset.k] = null; st.banner = 'Hold cleared on ' + el.dataset.k; st.keepScroll = true; },
};
