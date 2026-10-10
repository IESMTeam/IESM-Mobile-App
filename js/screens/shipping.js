import { header, back, button, badge, progress, check, card, section, esc } from '../ui.js';

const openLoad = (st) => st.data.loads.find((l) => l.id === st.view.load);

export function render(st) {
  const load = openLoad(st);

  if (load) {
    const done = load.items.filter((i) => i.done).length;
    const ready = done === load.items.length && load.photos.length > 0;
    return `
      ${header(load.name, `Job ${load.job} · ${load.carrier} · ships ${load.ships}`, back('closeLoad'))}
      ${section('Load checklist')}
      ${card(`
        ${progress(done, load.items.length)}
        ${load.items.map((i) => check({ done: i.done, title: i.text, act: 'toggleItem', args: { id: i.id } })).join('')}`)}
      ${section(`Load photos (${load.photos.length})`)}
      ${card(`
        <div class="photos">
          ${load.photos.map((src, i) => `<img src="${src}" data-act="removePhoto" data-index="${i}" alt="Load photo">`).join('')}
          ${load.photos.length ? '' : '<div class="muted">Take at least one photo of the load before shipping.</div>'}
        </div>
        <div class="btn-row mt12">
          <label class="btn file-btn">Take photo<input type="file" accept="image/*" capture="environment" data-photo></label>
          <label class="btn ghost file-btn">From library<input type="file" accept="image/*" data-photo></label>
        </div>
        ${load.photos.length ? '<div class="muted mt8" style="font-size:12px">Tap a photo to remove it</div>' : ''}`)}
      <div class="pad">
        ${load.shipped ? badge('Shipped', 'green')
          : button(ready ? 'Mark shipped' : 'Check all items and add a photo', 'markShipped', { kind: 'accent', disabled: !ready })}
      </div>
      <div style="height:16px"></div>`;
  }

  return `
    ${header('Shipping', 'Outgoing loads')}
    ${st.data.loads.map((l) => card(`
      <div class="row-between"><div class="h2">Job ${esc(l.job)} · ${esc(l.name)}</div>${badge(l.shipped ? 'Shipped' : `Ships ${l.ships}`, l.shipped ? 'green' : 'blue')}</div>
      <div class="muted mt4">${esc(l.carrier)} · ${l.photos.length} photos</div>
      ${progress(l.items.filter((i) => i.done).length, l.items.length)}`, { act: 'openLoad', args: { id: l.id } })).join('')}`;
}

// Photo picked from camera or library: keep it in memory for the demo.
export function onChange(st, el, render) {
  if (!el.matches('[data-photo]') || !el.files?.[0]) return;
  openLoad(st).photos.push(URL.createObjectURL(el.files[0]));
  render();
}

export const actions = {
  openLoad: (st, el) => { st.view.load = el.dataset.id; window.scrollTo(0, 0); },
  closeLoad: (st) => { st.view.load = null; },
  toggleItem(st, el) {
    const i = openLoad(st).items.find((x) => x.id === el.dataset.id);
    i.done = !i.done;
  },
  removePhoto(st, el) {
    if (confirmRemove()) openLoad(st).photos.splice(Number(el.dataset.index), 1);
  },
  markShipped(st) {
    openLoad(st).shipped = true;
    st.view.load = null;
  },
};

function confirmRemove() {
  return window.confirm('Remove this photo?');
}
