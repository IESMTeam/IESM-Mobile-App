// Small helpers that return HTML strings. Buttons/rows use data-act="name"
// plus data-* values; app.js routes those clicks to the screen's actions.

export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// attrs({ id: 'x' }) -> ' data-id="x"'
const attrs = (args = {}) => Object.entries(args).map(([k, v]) => ` data-${k}="${esc(v)}"`).join('');

export const header = (title, subtitle = '', right = '') => `
  <div class="header">
    <div class="titles">
      <h1>${esc(title)}</h1>
      ${subtitle ? `<div class="subtitle">${esc(subtitle)}</div>` : ''}
    </div>
    ${right}
  </div>`;

export const back = (act, label = 'Back') => `<button class="back" data-act="${act}">‹ ${esc(label)}</button>`;

export const button = (label, act, { kind = '', args, disabled, small } = {}) =>
  `<button class="btn ${kind} ${small ? 'small' : ''}" data-act="${act}"${attrs(args)}${disabled ? ' disabled' : ''}>${esc(label)}</button>`;

export const badge = (text, tone = 'blue') => `<span class="badge ${tone}">${esc(text)}</span>`;

export const progress = (done, total) => {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return `
    <div class="progress">
      <div class="track"><div class="fill ${pct === 100 ? 'full' : ''}" style="width:${pct}%"></div></div>
      <div class="label">${done} of ${total} done</div>
    </div>`;
};

// select: true = a selection row (no strike-through when ticked)
export const check = ({ done, title, detail = '', act, args, right = '', select = false }) => `
  <div class="check ${done ? 'done' : ''} ${select ? 'select' : ''}" data-act="${act}"${attrs(args)}>
    <div class="box">${done ? '✓' : ''}</div>
    <div class="body">
      <div class="title">${esc(title)}</div>
      ${detail ? `<div class="detail">${esc(detail)}</div>` : ''}
    </div>
    ${right}
  </div>`;

export const card = (inner, { act, args, cls = '' } = {}) =>
  `<div class="card ${act ? 'tap' : ''} ${cls}"${act ? ` data-act="${act}"` : ''}${attrs(args)}>${inner}</div>`;

export const section = (text) => `<div class="section">${esc(text)}</div>`;

export const chips = (options, value, act) =>
  `<div class="chips">${options.map((o) => `<button class="chip ${o === value ? 'on' : ''}" data-act="${act}" data-value="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;

export const money = (n) => '$' + Number(n).toLocaleString();
