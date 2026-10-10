# IESM Mobile (demo)

Plain HTML / CSS / JavaScript, no frameworks and no build step. Built from the IESM App design canvases (Warehouse, Projects & Field, Shop, plus Purchasing). **All data is sample data** (`js/data.js`) and resets on reload.

## How it works

1. Launch animation: the IESM mark draws in, fills white, then eases away (tap to skip).
2. Passcode: **4376** (change it in `js/config.js`).
3. Choose your view: Warehouse, Projects & field, Shop or Purchasing. Everyone gets Home and Time.
4. Switch views any time with the ⇄ button in the header. The lock button on the view picker returns to the passcode.

What works for real on a phone: checklists, taking or uploading photos (camera), finger signature on change orders, and the change-order pricing. The time card and dates are sample values.

## Files

- `index.html`: page shell
- `css/app.css`: all styles (colors and type from the design canvases)
- `js/app.js`: screens, navigation, splash, passcode and view picker
- `js/data.js`: sample jobs, POs, projects, change orders and each view's notifications
- `js/icons.js`: icons and the IESM mark
- `js/config.js`: passcode and splash timing
- `manifest.webmanifest`, `icons/`: home-screen name and icon

## Publishing (GitHub Pages)

Push to the repo; Pages serves it at `https://iesmteam.github.io/IESMMobileApp/`. On a phone, open the link, then Share → Add to Home Screen.

The site is public and the passcode lives in the page code, so it only hides the screens. Keep this to sample data.
