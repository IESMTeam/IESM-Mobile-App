# IESM Mobile (demo)

Plain HTML / CSS / JavaScript. Styled and filled to match the IESM Dashboard (same header, Home layout, fonts, and the Pipeline page's sample jobs, people and sites). **All data is sample data** (`js/data.js`).

Passcode **4376** (`js/config.js`). Launch animation → passcode → choose your view (Warehouse, Projects & field, Shop, Purchasing).

- Header: search everything (jobs, items, POs, kits, part numbers) and your avatar → **Me** (site switch Nampa / Rupert / Both, switch view, lock).
- Home: greeting with live weather for your site, Needs attention (Open / Done), Team activity.
- Warehouse: Receiving and Kitting, with **Scan a label** (camera opens; reading the code is simulated).
- Shop: shop floor by stage, Shipping with load photos, and **3D models** (same GLBs and viewer as the dashboard; "View in your space" on iPhone).
- Every project item page: 3D model, stage track, the current stage's checklist from Pipeline, photos.

Files: `js/app.js` (shell), `js/store.js` (state), `js/data.js` (sample data), `js/ui.js`, `js/icons.js`, `js/views/*.js` (one per area), `css/app.css`, `models/*.glb`.
