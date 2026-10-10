// Stroke icons (same style as the dashboard's) and the IESM mark
const svg = (inner, sw = 2) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

export const ICON = {
  home: svg('<path d="M4 11l8-7 8 7v9h-5v-6h-6v6H4z"/>', 1.8),
  recv: svg('<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>', 1.8),
  kit: svg('<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V5h8v3"/><path d="M3 13h18"/>', 1.8),
  fab: svg('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z"/>', 1.8),
  wrench: svg('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z"/>', 1.8),
  ship: svg('<path d="M3 6h11v10H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>', 1.8),
  buy: svg('<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.2a1.5 1.5 0 0 0 1.5 1.2h8.8a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/>', 1.8),
  co: svg('<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M8 17c1.5-2 2.5-2 3 0s1.5 2 3 0"/>', 1.8),
  time: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 1.8),
  proj: svg('<rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/>', 1.8),
  models: svg('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>', 1.8),
  cube: svg('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>', 1.8),
  back: svg('<path d="M15 6l-6 6 6 6"/>', 2.2),
  down: svg('<path d="M6 9l6 6 6-6"/>', 2.4),
  chev: svg('<path d="M9 6l6 6-6 6"/>', 2.2),
  check: svg('<path d="M5 12l5 5L20 7"/>', 3),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>', 2),
  scan: svg('<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M7 12h10"/>', 2),
  warn: svg('<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>', 1.9),
  mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>', 1.8),
  bell: svg('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>', 1.9),
  camera: svg('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>', 1.9),
  upload: svg('<path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 20h16"/>', 1.9),
  plus: svg('<path d="M12 5v14M5 12h14"/>', 2.2),
  swap: svg('<path d="M7 4L3 8l4 4"/><path d="M3 8h14"/><path d="M17 20l4-4-4-4"/><path d="M21 16H7"/>', 1.9),
  lock: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>', 1.9),
  del: svg('<path d="M21 5H9l-6 7 6 7h12z"/><path d="M17 9l-6 6M11 9l6 6"/>', 1.6),
  pin: svg('<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>', 1.8),
  user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', 1.8),
  clip: svg('<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 10h6M9 14h6M9 18h3"/>', 1.8),
  ar: svg('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>', 1.8),
};

// Weather icons (Open-Meteo codes map onto these, like the dashboard)
export const WX = {
  sun: '<circle cx="12" cy="12" r="4.5" fill="#ffb800"/><g stroke="#ffb800" stroke-width="2" stroke-linecap="round"><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></g>',
  moon: '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" fill="#8e8ee6"/>',
  sunCloud: '<circle cx="8.5" cy="8.5" r="3.5" fill="#ffb800"/><path d="M7 19h10a4 4 0 0 0 0-8 5 5 0 0 0-9.6 1.5A3.3 3.3 0 0 0 7 19z" fill="#c9d3e0"/>',
  cloud: '<path d="M6.5 19h11a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.4 2A3.5 3.5 0 0 0 6.5 19z" fill="#b8c2cf"/>',
  rain: '<path d="M6.5 15h11a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.4 2A3.5 3.5 0 0 0 6.5 15z" fill="#b8c2cf"/><g stroke="#3b82f6" stroke-width="2" stroke-linecap="round"><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/></g>',
  snow: '<path d="M6.5 15h11a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.4 2A3.5 3.5 0 0 0 6.5 15z" fill="#b8c2cf"/><g fill="#7fb2ff"><circle cx="8" cy="19" r="1.2"/><circle cx="12" cy="21" r="1.2"/><circle cx="16" cy="19" r="1.2"/></g>',
  fog: '<g stroke="#9aa5b4" stroke-width="2" stroke-linecap="round"><path d="M4 9h16M6 13h12M4 17h16"/></g>',
  storm: '<path d="M6.5 14h11a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.4 2A3.5 3.5 0 0 0 6.5 14z" fill="#9aa5b4"/><path d="M12 14l-2 4h3l-2 4" stroke="#ffb800" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
};

// The IESM circle mark (same outline as the launch animation)
export const MARK_PATH = 'M94.0,172.0 L79.0,172.3 L71.0,171.3 L59.0,168.3 L45.0,162.3 L34.0,155.3 L27.0,149.4 L16.8,138.0 L11.6,130.0 L5.8,118.0 L1.7,104.0 L0.3,92.0 L0.5,79.0 L2.8,66.0 L6.8,54.0 L10.7,46.0 L18.7,34.0 L29.0,22.9 L43.0,12.6 L58.0,5.7 L73.0,1.7 L93.0,-0.0 L233.0,0.0 L233.4,1.0 L228.3,14.0 L215.0,45.7 L101.0,45.7 L83.0,46.7 L74.0,48.7 L68.0,51.5 L57.8,60.0 L51.5,70.0 L48.7,79.0 L48.7,93.0 L51.6,102.0 L56.4,110.0 L65.0,118.3 L75.0,123.3 L84.0,125.3 L97.0,124.3 L105.0,121.4 L114.4,115.0 L122.3,105.0 L126.5,94.0 L127.3,83.0 L124.3,71.0 L119.5,60.0 L120.0,59.0 L164.0,59.3 L165.4,60.0 L167.4,65.0 L170.3,81.0 L170.3,93.0 L169.3,102.0 L167.2,111.0 L163.2,122.0 L155.3,136.0 L145.0,148.2 L131.0,159.3 L122.0,164.2 L112.0,168.2 L94.0,172.0 Z';

export const mark = (cls = 'hdr-logo') =>
  `<svg class="${cls}" viewBox="-4 -4 242 181" role="img" aria-label="IESM"><path fill="#ffffff" d="${MARK_PATH}"/></svg>`;

export const splashMark = () => `
  <svg class="iesm-mark" width="164" height="121" viewBox="-4 -4 242 181" role="img" aria-label="IESM">
    <path class="iesm-fill" fill="#ffffff" d="${MARK_PATH}"/>
    <path class="iesm-line" pathLength="1" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round" d="${MARK_PATH}"/>
  </svg>`;
