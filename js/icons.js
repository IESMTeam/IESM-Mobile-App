// Inline stroke icons from the design canvases
const svg = (inner, size = 24, sw = 2) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

export const ICON = {
  home: svg('<path d="M4 11l8-7 8 7v9h-5v-6h-6v6H4z"></path>'),
  recv: svg('<path d="M3 7l9-4 9 4-9 4-9-4z"></path><path d="M3 7v10l9 4 9-4V7"></path><path d="M12 11v10"></path>'),
  kit: svg('<rect x="3" y="8" width="18" height="12" rx="2"></rect><path d="M8 8V5h8v3"></path><path d="M3 13h18"></path>'),
  fab: svg('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z"></path>'),
  ship: svg('<path d="M3 6h11v10H3z"></path><path d="M14 10h4l3 3v3h-7"></path><circle cx="7" cy="18" r="2"></circle><circle cx="17" cy="18" r="2"></circle>'),
  buy: svg('<circle cx="9" cy="20" r="1.5"></circle><circle cx="18" cy="20" r="1.5"></circle><path d="M2 3h3l2.6 12.2a1.5 1.5 0 0 0 1.5 1.2h8.8a1.5 1.5 0 0 0 1.5-1.2L21 7H6"></path>'),
  co: svg('<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"></path><path d="M14 3v5h5"></path><path d="M8 17c1.5-2 2.5-2 3 0s1.5 2 3 0"></path>'),
  time: svg('<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>'),
  proj: svg('<rect x="3" y="4" width="18" height="6" rx="1.5"></rect><rect x="3" y="14" width="18" height="6" rx="1.5"></rect>'),
  back: svg('<path d="M15 6l-6 6 6 6"></path>', 20, 2.2),
  check: svg('<path d="M5 12l5 5L20 7"></path>', 18, 3.2),
  checkSm: svg('<path d="M5 12l5 5L20 7"></path>', 14, 3.2),
  bannerCheck: svg('<path d="M5 12l5 5L20 7"></path>', 18, 2.4),
  camera: svg('<path d="M4 8h3l2-3h6l2 3h3v11H4z"></path><circle cx="12" cy="13" r="3.5"></circle>', 20),
  upload: svg('<path d="M12 16V4"></path><path d="M7 9l5-5 5 5"></path><path d="M4 20h16"></path>', 20),
  plus: svg('<path d="M12 5v14M5 12h14"></path>', 20, 2.4),
  swap: svg('<path d="M7 4L3 8l4 4"></path><path d="M3 8h14"></path><path d="M17 20l4-4-4-4"></path><path d="M21 16H7"></path>', 20),
  chevron: svg('<path d="M9 6l6 6-6 6"></path>', 20),
  del: svg('<path d="M21 5H9l-6 7 6 7h12z"></path><path d="M17 9l-6 6M11 9l6 6"></path>', 28, 1.8),
  lock: svg('<rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path>', 20),
};

// The IESM circle mark (same outline used for the splash animation)
export const MARK_PATH = 'M94.0,172.0 L79.0,172.3 L71.0,171.3 L59.0,168.3 L45.0,162.3 L34.0,155.3 L27.0,149.4 L16.8,138.0 L11.6,130.0 L5.8,118.0 L1.7,104.0 L0.3,92.0 L0.5,79.0 L2.8,66.0 L6.8,54.0 L10.7,46.0 L18.7,34.0 L29.0,22.9 L43.0,12.6 L58.0,5.7 L73.0,1.7 L93.0,-0.0 L233.0,0.0 L233.4,1.0 L228.3,14.0 L215.0,45.7 L101.0,45.7 L83.0,46.7 L74.0,48.7 L68.0,51.5 L57.8,60.0 L51.5,70.0 L48.7,79.0 L48.7,93.0 L51.6,102.0 L56.4,110.0 L65.0,118.3 L75.0,123.3 L84.0,125.3 L97.0,124.3 L105.0,121.4 L114.4,115.0 L122.3,105.0 L126.5,94.0 L127.3,83.0 L124.3,71.0 L119.5,60.0 L120.0,59.0 L164.0,59.3 L165.4,60.0 L167.4,65.0 L170.3,81.0 L170.3,93.0 L169.3,102.0 L167.2,111.0 L163.2,122.0 L155.3,136.0 L145.0,148.2 L131.0,159.3 L122.0,164.2 L112.0,168.2 L94.0,172.0 Z';

export const mark = (cls = 'hdr-logo') =>
  `<svg class="${cls}" viewBox="-4 -4 242 181" role="img" aria-label="IESM"><path fill="#ffffff" d="${MARK_PATH}"></path></svg>`;

// Animated version for the splash screen
export const splashMark = () => `
  <svg class="iesm-mark" width="164" height="121" viewBox="-4 -4 242 181" role="img" aria-label="IESM">
    <path class="iesm-fill" fill="#ffffff" d="${MARK_PATH}"></path>
    <path class="iesm-line" pathLength="1" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round" d="${MARK_PATH}"></path>
  </svg>`;
