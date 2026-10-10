# IESM Mobile (demo)

Plain HTML / CSS / JavaScript — no frameworks, no build step. **All data is fake** (`js/data.js`) and resets on reload.

Passcode: **4376** (change it in `js/config.js`).

## Put it on GitHub Pages

1. Create a repo in the IESM GitHub org (e.g. `IESMMobileApp`) and push these files to the `main` branch.
2. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `(root)`** → Save.
3. After a minute the site is at `https://<org-name>.github.io/IESMMobileApp/`.
4. On a phone, open that link in Safari (iPhone) or Chrome (Android) → **Share → Add to Home Screen**. It opens full screen like an app.

Note: a GitHub Pages site is public (private Pages needs GitHub Enterprise Cloud). The passcode only hides the screens — it lives in the page code — so keep this to fake data. The page asks search engines not to index it.

## Run it locally instead

Serve the folder with any static web server (it uses JS modules, so opening `index.html` straight from disk won't work), e.g. IIS, or `python -m http.server 8080` in this folder, then open `http://<your-pc-ip>:8080` on a phone on the same Wi-Fi.

## What's in it

- Passcode screen, then a role picker (demo only; later the role comes from the login)
- **Everyone:** Home (notifications for that role), Time (clock in/out by project item + task)
- **Warehouse:** Receiving (per PO, full or partial quantities), Kitting (per project item)
- **Field / PM:** Projects (job checklist), Change Orders (create + customer finger signature)
- **Shop:** Fabrication (operations per project item), Shipping (load checklist + camera photos)
- **Purchasing:** lines needing purchasing across jobs, multi-select → RFQ sent / Purchased

## Files

- `index.html` — page shell
- `css/app.css` — all styles
- `js/app.js` — passcode, roles, tab bar, click routing
- `js/config.js` — passcode, roles and their tabs
- `js/data.js` — sample data
- `js/ui.js` — shared HTML helpers (cards, buttons, checklist rows)
- `js/screens/` — one file per screen
- `manifest.webmanifest`, `icons/` — home-screen name and icon

## Later: private App Store app

These same files can be wrapped in a native shell (e.g. Capacitor) for a private App Store listing — the code stays plain HTML/JS.
