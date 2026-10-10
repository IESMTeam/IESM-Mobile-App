// HTML helpers. Taps are routed by data-act="name" (+ data-* values) in app.js.
import { ICON } from './icons.js';
import { PEOPLE } from './data.js';

export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
export const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
const data = (d = {}) => Object.entries(d).map(([k, v]) => ` data-${k}="${esc(v)}"`).join('');

// Status: coloured dot + plain text
export const status = (text, tone = 'grey') => (text ? `<span class="st ${tone}">${esc(text)}</span>` : '');

// Coloured icon tile
export const ico = (name, tone = 'blue') => `<span class="ico ${tone}">${ICON[name] || ''}</span>`;

// Person circle with initials
export function avatar(name, cls = '') {
  const p = PEOPLE[name] || { initials: '•', tone: ['#e8f0ff', '#1e40af'] };
  return `<span class="avatar ${cls}" style="background:${p.tone[0]};color:${p.tone[1]}">${esc(p.initials)}</span>`;
}

// One list row. act + d make it tappable.
export function row({ icon, tone, lead, title, sub, right = '', act, d, chev = !!act, cls = '' }) {
  const tag = act ? 'button type="button"' : 'div';
  const end = act ? 'button' : 'div';
  return `
    <${tag} class="row ${cls}"${act ? ` data-act="${act}"` : ''}${data(d)}>
      ${lead || (icon ? ico(icon, tone) : '')}
      <span class="row-main">
        <span class="row-title">${title}</span>
        ${sub ? `<span class="row-sub">${sub}</span>` : ''}
      </span>
      ${right ? `<span class="row-right">${right}</span>` : ''}
      ${chev ? `<span class="chev">${ICON.chev}</span>` : ''}
    </${end}>`;
}
export const list = (rows, cls = '') => `<div class="list ${cls}">${rows.join('')}</div>`;

// Checklist row
export function check({ done, title, sub, act, d, right = '', cls = '' }) {
  return `
    <div class="check ${done ? 'done' : ''} ${cls}" role="checkbox" tabindex="0" data-act="${act}"${data(d)} aria-checked="${done ? 'true' : 'false'}">
      <span class="tick">${done ? ICON.check : ''}</span>
      <span class="row-main"><span class="row-title">${title}</span>${sub ? `<span class="row-sub">${sub}</span>` : ''}</span>
      ${right}
    </div>`;
}

// Segmented control
export const seg = (opts, value, act) =>
  `<div class="seg" role="tablist">${opts.map(([v, label, n]) =>
    `<button type="button" class="${v === value ? 'on' : ''}" data-act="${act}" data-v="${esc(v)}">${esc(label)}${n !== undefined ? `<span class="n">${n}</span>` : ''}</button>`).join('')}</div>`;

export const bar = (pct, cls = '') => `<div class="bar"><span class="${pct >= 100 ? 'full' : ''} ${cls}" style="width:${Math.max(0, Math.min(100, pct))}%"></span></div>`;

export const sec = (title, link = '', act = '') =>
  `<div class="h-sec"><h2>${esc(title)}</h2>${link ? `<button type="button" class="h-link" data-act="${act}">${esc(link)}</button>` : ''}</div>`;
export const group = (title, n) => `<div class="h-group">${esc(title)}${n !== undefined ? `<span>${n}</span>` : ''}</div>`;

// Photo tiles + camera / library buttons
export function photos(listOf, kind, id) {
  const tiles = listOf.length
    ? `<div class="photos">${listOf.map((url, i) => `<div class="ph" style="background-image:url('${url}')">Photo ${i + 1}</div>`).join('')}</div>`
    : '';
  return `
    ${tiles}
    <div class="btn-row">
      <label class="btn fill file-btn">${ICON.camera} Take photo<input type="file" accept="image/*" capture="environment" data-photo="${kind}" data-id="${esc(id)}"></label>
      <label class="btn soft file-btn">${ICON.upload} Upload<input type="file" accept="image/*" data-photo="${kind}" data-id="${esc(id)}"></label>
    </div>`;
}

// 3D model (Google's <model-viewer>, the same one the dashboard uses)
export function model(file, alt, { tall = false, tag = '', interactive = true } = {}) {
  return `
    <div class="mv ${tall ? 'tall' : ''}">
      <model-viewer src="${file}" alt="${esc(alt)}" ${interactive ? 'camera-controls' : 'disable-zoom disable-pan'} auto-rotate auto-rotate-delay="0"
        rotation-per-second="12deg" interaction-prompt="none" camera-orbit="30deg 72deg auto" environment-image="neutral"
        exposure="1" shadow-intensity="1" shadow-softness="0.9" ar ar-modes="webxr scene-viewer quick-look" touch-action="pan-y">
        <button slot="ar-button" class="pill fill mv-ar">${ICON.ar} View in your space</button>
      </model-viewer>
      ${tag ? `<span class="mv-tag">${esc(tag)}</span>` : ''}
    </div>`;
}
