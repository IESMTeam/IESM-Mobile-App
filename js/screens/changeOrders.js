import { header, back, button, badge, card, esc, money } from '../ui.js';

const view = (st) => (st.view.co ??= { mode: 'list', signId: null, form: { job: null, title: '', amount: '' }, name: '', sig: null, error: '' });

function startSigning(v, id) {
  v.mode = 'sign';
  v.signId = id;
  v.name = '';
  v.sig = null;
  v.error = '';
  window.scrollTo(0, 0);
}

export function render(st) {
  const v = view(st);
  v.form.job ??= st.data.jobs[0].number;

  if (v.mode === 'new') {
    return `
      ${header('New change order', '', back('coList'))}
      <div class="pad">
        <div class="h2">Job</div>
        <div class="chips" style="margin-bottom:14px">
          ${st.data.jobs.map((j) => `<button class="chip ${v.form.job === j.number ? 'on' : ''}" data-act="coJob" data-value="${j.number}">${j.number}</button>`).join('')}
        </div>
        <div class="h2">What's changing</div>
        <input class="input" data-field="title" value="${esc(v.form.title)}" placeholder="e.g. Add tail guard to BC001">
        <div class="h2">Amount ($)</div>
        <input class="input" data-field="amount" value="${esc(v.form.amount)}" inputmode="decimal" placeholder="0">
        ${button('Continue to signature', 'coCreate')}
        ${v.error ? `<div class="error">${esc(v.error)}</div>` : ''}
      </div>`;
  }

  const co = st.data.changeOrders.find((c) => c.id === v.signId);
  if (v.mode === 'sign' && co) {
    return `
      ${header('Customer signature', co.id, back('coList'))}
      ${card(`
        <div class="h2">${esc(co.title)}</div>
        <div class="muted mt4">Job ${esc(co.job)} · ${money(co.amount)}</div>
        <div class="muted mt8">By signing, the customer approves this change to scope and price.</div>`)}
      <div class="pad">
        <input class="input" data-field="name" value="${esc(v.name)}" placeholder="Customer name" autocomplete="off">
        <canvas class="sig" id="sig"></canvas>
        <div class="row-between mt4">
          <span class="muted">Sign with your finger</span>
          <button class="link" data-act="clearSig">Clear</button>
        </div>
        <div class="mt12">${button('Accept and sign', 'coSign', { kind: 'accent' })}</div>
        ${v.error ? `<div class="error">${esc(v.error)}</div>` : ''}
      </div>
      <div style="height:16px"></div>`;
  }

  return `
    ${header('Change Orders', '', button('+ New', 'coNew', { small: true }))}
    ${st.data.changeOrders.map((c) => {
      const signed = c.status === 'Signed';
      return card(`
        <div class="row-between"><div class="h2">${esc(c.title)}</div>${badge(c.status, signed ? 'green' : 'amber')}</div>
        <div class="muted mt4">${esc(c.id)} · Job ${esc(c.job)} · ${money(c.amount)}</div>
        ${signed ? `<div class="muted mt4">Signed by ${esc(c.signedBy)}</div>` : '<div class="link accent">Tap to get signature ›</div>'}
        ${c.signature ? `<img class="sig-preview" src="${c.signature}" alt="Signature">` : ''}`,
        signed ? {} : { act: 'coOpen', args: { id: c.id } });
    }).join('')}`;
}

// Signature pad: draw with finger/mouse on a canvas.
export function mount(st, root) {
  const v = view(st);
  const canvas = root.querySelector('#sig');
  if (!canvas) return;

  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#1B2430';

  // Redraw what was already signed (a re-render would otherwise wipe it).
  if (v.sig) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
    img.src = v.sig;
  }

  let drawing = false;
  const pos = (e) => {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  canvas.addEventListener('pointerdown', (e) => {
    drawing = true;
    canvas.setPointerCapture(e.pointerId);
    ctx.beginPath();
    ctx.moveTo(...pos(e));
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    ctx.lineTo(...pos(e));
    ctx.stroke();
  });
  const end = () => {
    if (!drawing) return;
    drawing = false;
    v.sig = canvas.toDataURL('image/png');
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
}

// Typing updates state without re-rendering (so the keyboard stays open).
export function onInput(st, el) {
  const v = view(st);
  if (v.error) { v.error = ''; el.closest('.pad')?.querySelector('.error')?.remove(); }
  if (el.dataset.field === 'name') v.name = el.value;
  else if (el.dataset.field === 'amount') { el.value = el.value.replace(/[^0-9.]/g, ''); v.form.amount = el.value; }
  else if (el.dataset.field === 'title') v.form.title = el.value;
}

export const actions = {
  coNew: (st) => { const v = view(st); v.mode = 'new'; v.error = ''; },
  coList: (st) => { view(st).mode = 'list'; },
  coJob: (st, el) => { view(st).form.job = el.dataset.value; },
  coOpen: (st, el) => startSigning(view(st), el.dataset.id),
  clearSig: (st) => { view(st).sig = null; },
  coCreate(st) {
    const v = view(st);
    if (!v.form.title.trim()) { v.error = 'Describe what is changing.'; return; }
    const count = st.data.changeOrders.filter((c) => c.job === v.form.job).length + 1;
    const id = `CO-${v.form.job}-${String(count).padStart(2, '0')}`;
    st.data.changeOrders.push({ id, job: v.form.job, title: v.form.title.trim(), amount: Number(v.form.amount) || 0, status: 'Needs signature', signedBy: null });
    v.form = { job: v.form.job, title: '', amount: '' };
    startSigning(v, id);
  },
  coSign(st) {
    const v = view(st);
    if (!v.name.trim()) { v.error = 'Enter the customer name.'; return; }
    if (!v.sig) { v.error = 'Customer needs to sign.'; return; }
    const c = st.data.changeOrders.find((x) => x.id === v.signId);
    c.status = 'Signed';
    c.signedBy = v.name.trim();
    c.signature = v.sig;
    v.mode = 'list';
  },
};
