# Pitwright · Share Your Cook

A mobile-first PWA that turns a BBQ cook-log entry into a share-ready card —
temperature curve, probe readouts, rating, and pitmaster credit — exportable
as a high-resolution PNG or via the native share sheet.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # production build -> dist/
npm run preview  # serve the production build
```

## Project structure

```
index.html              # head/meta, fonts (Oswald + Space Mono), PWA links
public/
  manifest.json         # PWA manifest
  service-worker.js      # app-shell cache (offline + installable)
  icons/                # favicon / PWA icons (192, 512)
  og-image.png          # 1200x630 link-preview image
src/
  index.jsx             # entry, error boundary, SW registration
  App.jsx               # page chrome, controls, export/share logic
  ShareCard.jsx         # the card itself (theme/format/hero driven)
  shareCard.css         # card + control styles (scoped under .gw-app)
  styles.css            # base reset / tokens (template)
  utils/
    cook.js             # buildCurve(): temp-curve geometry + stall detection
    cookLog.js          # localStorage-backed cook log (seeded with samples)
    storage.js          # safe localStorage wrappers + key constants
```

## How it works

- **Cook log** — `cookLog.js` reads/writes an array of cook entries in
  `localStorage`, seeded with two sample cooks on first run. The "Sharing cook"
  selector picks which entry the card renders; the selection persists.
- **The card** — `ShareCard` renders entirely from the selected cook plus
  `theme` / `format` / `hero` props. The temperature curve and "STALL" label are
  derived from each cook's probe readings by `buildCurve()`. A `--u` unit
  (1% of card width, via `ResizeObserver`) keeps the layout resolution-independent
  so the PNG export looks identical at any size.
- **Export** — `html2canvas` is dynamically imported only on export (kept out of
  the initial bundle). Share uses the Web Share API when available and falls back
  to a download.
- **Themes & formats** — four themes (Ember, Butcher's Ticket, Midnight,
  Competition Gold), three formats (Feed / Square / Story), and a Curve/Photo
  hero toggle.

## Pro gating (debug)

Pro themes (Butcher's Ticket, Midnight, Competition Gold) and Pro formats
(Square, Story) are gated behind an entitlement. There is **no real billing yet**
— the header **Pro On/Off** toggle is a debug switch that flips the entitlement
and persists it (`pw_pro` in `localStorage`). When wiring real monetization,
replace the `isPro` source in `App.jsx`; `PRO_THEMES` / `PRO_FORMATS` already
define what's gated.

## Deploy

Configured for Netlify (`netlify.toml`): `npm run build`, publish `dist/`, with
a SPA fallback redirect.

**Before production:** set `og:image` in `index.html` to an absolute URL
(`https://<your-domain>/og-image.png`) — some scrapers (e.g. older Facebook)
don't resolve relative image paths.
