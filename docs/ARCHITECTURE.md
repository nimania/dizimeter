# Architecture — the static site

The public site is a **data‑driven static build**. Content lives in JSON; a small
Node script turns that JSON into plain HTML pages; GitHub Pages serves them. There
is no framework and no client build step to view the result.

```
github-pages/                     ← everything deployed to GitHub Pages
├── index.html                    ← home (ratings dashboard)
├── styles.css                    ← single stylesheet (light + dark themes)
├── dizimeter.js                  ← shared client library (window.DiziMeter)  ¹
├── home.js                       ← home page logic
├── series-page.js                ← renders a series profile
├── episode-page.js               ← renders an episode profile
├── network-page.js               ← renders a network page
├── networks-index.js             ← renders the networks index
├── data/
│   ├── networks.json             ← channels + brand colors + rating keys
│   ├── series.json               ← series, cast, seasons, episodes
│   └── ratings.json              ← rolling 10‑day Total / AB / ABC1 window
├── images/
│   ├── meshki-media-logo.png     ← brand logo (header + favicon)
│   └── networks/<slug>.svg       ← generated network marks
├── dizi/<slug>/index.html        ← generated series page
├── dizi/<slug>/bolum-<n>/index.html  ← generated episode page
└── kanal/<slug>/index.html       ← generated network page + kanal/index.html

automation/
├── build-site.mjs                ← generator: JSON → all series/episode/network pages + logos
└── build-pages-data.mjs          ← collector: TİAK → today's Total row, appended to the 10‑day window
```

¹ `dizimeter.js` and the global `window.DiziMeter` keep the old project name on
purpose — they are internal identifiers, not user‑facing, and renaming them buys
nothing but churn.

## How a page is rendered

Generated HTML files are **thin shells**. Each one sets a small bootstrap and loads
the shared library plus one page script:

```html
<script>window.DM = { root: "../../", slug: "sevdan-bir-ates" };</script>
<script src="../../dizimeter.js" defer></script>
<script src="../../series-page.js" defer></script>
```

- `window.DM.root` is the relative path back to the site root (depends on page
  depth). `slug` / `epNumber` identify what to render.
- `dizimeter.js` exposes `window.DiziMeter` with data loading, Persian number/date
  formatting, rating lookups, and small HTML fragment helpers (network badge,
  rating pills).
- The page script `fetch`es the three JSON files (once, cached) and fills the shell.

This means **all content is data**: to change what a page shows, edit JSON — not
HTML.

## URL scheme

| Path | Page |
| --- | --- |
| `/` | Home — daily ratings dashboard |
| `/kanal/` | Networks index |
| `/kanal/<slug>/` | One network: its series + latest‑day placements |
| `/dizi/<slug>/` | Series profile |
| `/dizi/<slug>/bolum-<n>/` | Episode profile |

`dizi` (series) and `kanal` (channel) are Turkish words, kept as stable path
segments. Slugs are ASCII (e.g. `sevdan-bir-ates`, `show-tv`).

## Rating join

Ratings are stored once, in `ratings.json`, as daily tables. An episode does not
copy its rating; instead the client **joins** on `(series.ratingKey, episode.date)`
against the daily table for each category (Total/AB/ABC1) and shows the rank and,
when available, the exact number. This keeps a single source of truth and lets the
same data drive the home dashboard, the series page, the episode page, and the
network page. See [`DATA-MODEL.md`](./DATA-MODEL.md).

## Generator (`automation/build-site.mjs`)

Reads `data/networks.json` + `data/series.json` and writes:

- one **network mark** SVG per channel (`images/networks/<slug>.svg`) — an original
  typographic badge in the channel’s brand color (not the broadcaster’s logo);
- one **network page** per channel + the `kanal/` index;
- one **series page** per series;
- one **episode page** per episode.

Run it after any change to the data or the templates:

```bash
node automation/build-site.mjs
```

Because pages are generated, the committed HTML and the JSON must stay in sync — the
GitHub Pages workflow regenerates them on every deploy, so JSON is the thing to edit.

## Collector (`automation/build-pages-data.mjs`)

Fetches TİAK’s public page, parses the **Total** top list with real `Rating %`
values, folds Turkish letters to ASCII so program names match series keys, and
**appends today into the rolling 10‑day window** in `ratings.json` (de‑duplicating by
date, trimming to `windowDays`). TİAK’s public homepage does not expose AB/ABC1
numbers, so those categories are preserved across runs and their numbers stay
`null` until a licensed data source is wired in. The script **refuses to publish
incomplete or invented data** and keeps the last good window on failure.

## Deployment

`.github/workflows/pages.yml` runs on push to `main` (and on a schedule):

1. `node automation/build-pages-data.mjs` — refresh today’s Total (non‑fatal).
2. `node automation/build-site.mjs` — regenerate all pages from JSON.
3. Upload `github-pages/` and deploy to GitHub Pages.

The result is served at `https://nimania.github.io/meshkimedia/`.

A second workflow, `.github/workflows/collector.yml`, is the scaffold for the larger
automation vision and is gated behind a repository variable until production secrets
exist (see [`AUTOMATION.md`](./AUTOMATION.md)).
