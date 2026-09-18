// Generates all static pages (series, episode, network) from the JSON data.
// Data-driven: add a series to data/series.json and re-run to get its pages.
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";

const PAGES = new URL("../github-pages/", import.meta.url);
const p = (rel) => new URL(rel, PAGES);

const networks = JSON.parse(await readFile(p("data/networks.json"), "utf8"));
const series = JSON.parse(await readFile(p("data/series.json"), "utf8"));

const HEAD = (root, title, desc, extra = "") => `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${desc}">
<title>${title}</title>
<link rel="icon" href="${root}favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${root}styles.css?v=20260918">${extra}
</head>
<body>
<header class="app-header"><a class="brand" href="${root}"><strong>دیزی‌متر</strong><span>هوش سریال ترکی</span></a><div class="header-actions"><button id="theme-toggle" class="icon-button" aria-label="روشن یا تیره">◐</button><a class="icon-button" href="${root}" aria-label="خانه">⌂</a></div></header>`;

const FOOT = (root, boot, scripts) => `${boot}
<script src="${root}dizimeter.js?v=20260918" defer></script>
${scripts.map((s) => `<script src="${root}${s}?v=20260918" defer></script>`).join("\n")}
</body>
</html>
`;

const boot = (obj) => `<script>window.DM=${JSON.stringify(obj)};</script>`;

// ---- Network SVG logo marks (original typographic badges) ------------------
function networkSvg(net) {
  const label = net.abbr || net.name;
  const w = Math.max(96, 30 + label.length * 15);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 40" width="${w}" height="40" role="img" aria-label="${net.name}">
<rect width="${w}" height="40" rx="8" fill="${net.color}"/>
<text x="${w / 2}" y="27" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="18" letter-spacing="0.5" fill="#ffffff">${label}</text>
</svg>
`;
}

// ---- Series page -----------------------------------------------------------
function seriesPage(s) {
  const root = "../../";
  const head = HEAD(root, `${s.titleFa} | دیزی‌متر`, `پروفایل، بازیگران و ری‌کپ قسمت‌های ${s.titleFa} (${s.titleTr})`);
  const body = `
<main class="profile-shell">
<div class="crumbs"><a href="${root}">خانه</a><span>/</span><span id="net-badge"></span></div>
<section id="profile-hero" class="profile-hero"><div class="hero-cover"></div><div class="profile-title">
<div class="profile-tags"><span id="kind-tag">سریال</span><span id="status"></span></div>
<h1 id="title-fa">—</h1><p id="title-tr" dir="ltr">—</p>
<div class="profile-facts"><span id="network"></span><span id="airing"></span><span id="studio"></span></div>
<div id="genre" class="genre-chips"></div>
</div></section>
<section class="profile-section"><div class="section-kicker">داستان</div><p id="synopsis" class="synopsis"></p><div id="official-links" class="official-links"></div></section>
<section id="cast-section" class="profile-section"><div class="section-headline"><div><span>بازیگران</span><h2>کست اصلی</h2></div><small>منبع: شبکهٔ پخش</small></div><div id="cast" class="cast-grid"></div></section>
<section class="profile-section"><div class="section-headline"><div><span>قسمت‌ها</span><h2>ری‌کپ و ریتینگ قسمت‌ها</h2></div><small>Total · AB · ABC1</small></div><div id="episodes" class="episodes"></div></section>
</main>
<nav class="bottom-nav"><a href="${root}"><b>⌂</b><span>خانه</span></a><a class="active" href="#episodes"><b>☰</b><span>قسمت‌ها</span></a><a href="#cast"><b>◉</b><span>بازیگران</span></a><a id="network-link" href="#"><b>▦</b><span>شبکه</span></a></nav>`;
  return head + body + FOOT(root, boot({ root, slug: s.slug }), ["series-page.js"]);
}

// ---- Episode page ----------------------------------------------------------
function episodePage(s, ep) {
  const root = "../../../";
  const head = HEAD(root, `${s.titleFa} — قسمت ${ep.number} | دیزی‌متر`, `ریتینگ، عکس‌ها و خلاصهٔ قسمت ${ep.number} سریال ${s.titleFa}`);
  const body = `
<main class="profile-shell">
<div class="crumbs"><a href="${root}">خانه</a><span>/</span><a id="crumb-series" href="#">سریال</a><span>/</span><span>قسمت ${ep.number}</span></div>
<section id="ep-hero" class="ep-hero"><span id="ep-badge" class="net-chip"></span><div class="ep-hero-copy"><p class="ep-kicker" id="ep-kicker"></p><h1 id="ep-title">—</h1><div class="ep-facts" id="ep-facts"></div></div></section>
<section class="ep-block ratings-big"><span class="kicker">ریتینگ این قسمت</span><h2>Total · AB · ABC1</h2><div id="ep-ratings"></div><p class="ratings-note" id="ratings-note"></p></section>
<section id="gallery-section" class="ep-block"><span class="kicker">تصاویر قسمت</span><h2>گالری</h2><div id="ep-gallery" class="gallery"></div></section>
<section class="ep-block"><span class="kicker">خلاصهٔ قسمت</span><h2>چه گذشت؟</h2><p id="ep-summary" class="ep-summary"></p><div id="ep-links" class="ep-links"></div></section>
<div id="ep-nav" class="ep-nav"></div>
</main>
<nav class="bottom-nav"><a href="${root}"><b>⌂</b><span>خانه</span></a><a id="nav-series" href="#"><b>☰</b><span>سریال</span></a><a href="#ep-ratings"><b>⌁</b><span>ریتینگ</span></a><a id="nav-network" href="#"><b>▦</b><span>شبکه</span></a></nav>`;
  return head + body + FOOT(root, boot({ root, slug: s.slug, epNumber: ep.number }), ["episode-page.js"]);
}

// ---- Network page ----------------------------------------------------------
function networkPage(net) {
  const root = "../../";
  const head = HEAD(root, `${net.name} | دیزی‌متر`, `سریال‌ها و ریتینگ شبکهٔ ${net.name}`);
  const body = `
<main class="app-shell">
<section class="net-hero" style="--net-color:${net.color}"><div class="net-hero-top"><img id="net-logo" src="${root}images/networks/${net.slug}.svg" alt="${net.name}"><div><h1 id="net-name">${net.name}</h1><div class="net-fa" id="net-name-fa"></div></div></div><div class="net-meta"><span><b id="net-count">۰</b> سریال</span><a id="net-site" href="${net.site || "#"}" target="_blank" rel="noreferrer">سایت رسمی ↗</a></div></section>
<section class="feed-section"><div class="feed-label"><span>سریال‌های این شبکه</span><i></i></div><div id="net-series" class="series-grid"></div></section>
<section id="net-ratings-section" class="feed-section"><div class="feed-label"><span>در جدول اخیر (<span id="net-day-date"></span>)</span><i></i></div><div id="net-ratings"></div></section>
</main>
<nav class="bottom-nav"><a href="${root}"><b>⌂</b><span>خانه</span></a><a href="${root}kanal/"><b>▦</b><span>شبکه‌ها</span></a><a href="#net-series"><b>☰</b><span>سریال‌ها</span></a><a href="${root}#ratings"><b>⌁</b><span>ریتینگ</span></a></nav>`;
  return head + body + FOOT(root, boot({ root, slug: net.slug }), ["network-page.js"]);
}

// ---- Networks index --------------------------------------------------------
function networksIndex() {
  const root = "../";
  const head = HEAD(root, `شبکه‌ها | دیزی‌متر`, `فهرست شبکه‌های تلویزیون ترکیه و سریال‌هایشان`);
  const body = `
<main class="app-shell">
<section class="intro"><h1>شبکه‌ها</h1><p>سریال‌های در حال پخش را بر اساس شبکه مرور کنید</p></section>
<section class="feed-section"><div id="net-grid" class="net-grid"></div></section>
</main>
<nav class="bottom-nav"><a href="${root}"><b>⌂</b><span>خانه</span></a><a class="active" href="./"><b>▦</b><span>شبکه‌ها</span></a><a href="${root}#ratings"><b>⌁</b><span>ریتینگ</span></a><a href="${root}#method"><b>✓</b><span>منبع</span></a></nav>`;
  return head + body + FOOT(root, boot({ root }), ["networks-index.js"]);
}

// ---- Write everything ------------------------------------------------------
let count = { logos: 0, series: 0, episodes: 0, networks: 0 };

await mkdir(p("images/networks/"), { recursive: true });
for (const net of Object.values(networks)) {
  await writeFile(p(`images/networks/${net.slug}.svg`), networkSvg(net), "utf8");
  count.logos++;
  await mkdir(p(`kanal/${net.slug}/`), { recursive: true });
  await writeFile(p(`kanal/${net.slug}/index.html`), networkPage(net), "utf8");
  count.networks++;
}

await mkdir(p("kanal/"), { recursive: true });
await writeFile(p("kanal/index.html"), networksIndex(), "utf8");

for (const s of Object.values(series)) {
  await mkdir(p(`dizi/${s.slug}/`), { recursive: true });
  await writeFile(p(`dizi/${s.slug}/index.html`), seriesPage(s), "utf8");
  count.series++;
  // clean legacy per-series assets if present
  for (const legacy of ["profile.js", "profile.css"]) {
    const lp = p(`dizi/${s.slug}/${legacy}`);
    if (existsSync(lp)) await rm(lp);
  }
  for (const season of s.seasons || []) {
    for (const ep of season.episodes || []) {
      await mkdir(p(`dizi/${s.slug}/bolum-${ep.number}/`), { recursive: true });
      await writeFile(p(`dizi/${s.slug}/bolum-${ep.number}/index.html`), episodePage(s, ep), "utf8");
      count.episodes++;
    }
  }
}

console.log(`Built: ${count.logos} logos, ${count.networks} network pages, ${count.series} series pages, ${count.episodes} episode pages.`);
