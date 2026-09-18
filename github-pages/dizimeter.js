/* DiziMeter shared client library.
   Loaded on every page. Reads window.DM = { root, slug?, epNumber? } set inline. */
(function () {
  "use strict";
  const DM = (window.DM = window.DM || {});
  const ROOT = DM.root || "";

  // ---- Persian formatting helpers -------------------------------------------
  const faInt = new Intl.NumberFormat("fa-IR");
  const faScore = new Intl.NumberFormat("fa-IR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const faDate = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" });

  const fmtInt = (n) => faInt.format(n);
  const fmtScore = (n) => (n === null || n === undefined || Number.isNaN(n) ? "—" : faScore.format(n));
  const fmtRank = (n) => (n === null || n === undefined ? "—" : faInt.format(n));

  function isoToFa(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return faDate.format(d);
  }
  // "YYYY-MM-DD" -> "DD.MM.YYYY"
  function isoToTiak(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}.${m}.${y}`;
  }

  // ---- Data loading (cached across the page) --------------------------------
  let _cache = null;
  async function loadData() {
    if (_cache) return _cache;
    const stamp = Date.now();
    const [networks, series, ratings] = await Promise.all([
      fetch(`${ROOT}data/networks.json?v=${stamp}`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${ROOT}data/series.json?v=${stamp}`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${ROOT}data/ratings.json?v=${stamp}`, { cache: "no-store" }).then((r) => r.json()),
    ]);
    _cache = { networks, series, ratings };
    return _cache;
  }

  // ---- Lookups --------------------------------------------------------------
  function networkOf(networks, series) {
    return networks[series.network] || null;
  }
  function seriesList(series) {
    return Object.values(series);
  }
  function seriesForNetwork(series, netSlug) {
    return seriesList(series).filter((s) => s.network === netSlug);
  }

  // Find a program's placement in a given category on a given ISO date.
  function ratingFor(ratings, ratingKey, iso, category) {
    if (!ratings || !ratings.days) return null;
    const tiakDate = isoToTiak(iso);
    const day = ratings.days.find((d) => d.date === tiakDate);
    if (!day || !day.categories || !day.categories[category]) return null;
    const key = (ratingKey || "").toUpperCase().trim();
    const row = day.categories[category].find((r) => (r.program || "").toUpperCase().trim() === key);
    if (!row) return null;
    return { rank: row.rank, rating: row.rating, network: row.network, date: day.date };
  }

  // All three categories for one program+date.
  function ratingModesFor(ratings, ratingKey, iso) {
    return {
      total: ratingFor(ratings, ratingKey, iso, "total"),
      ab: ratingFor(ratings, ratingKey, iso, "ab"),
      abc1: ratingFor(ratings, ratingKey, iso, "abc1"),
    };
  }

  // Best (most recent, highest total rating) episode rating for a series card.
  function seriesHeadlineRating(ratings, s) {
    const eps = allEpisodes(s);
    for (const ep of eps.slice().reverse()) {
      const m = ratingModesFor(ratings, s.ratingKey, ep.date);
      if (m.total || m.ab || m.abc1) return { ep, modes: m };
    }
    return null;
  }

  function allEpisodes(s) {
    const out = [];
    (s.seasons || []).forEach((season) => {
      (season.episodes || []).forEach((ep) => out.push(Object.assign({ season: season.number }, ep)));
    });
    return out.sort((a, b) => (a.date || "").localeCompare(b.date || "") || a.number - b.number);
  }

  function latestDay(ratings) {
    return ratings && ratings.days && ratings.days[0] ? ratings.days[0] : null;
  }

  // ---- UI fragments ---------------------------------------------------------
  function netBadge(networks, netSlug, opts = {}) {
    const n = networks[netSlug];
    if (!n) return "";
    const href = opts.link === false ? null : `${ROOT}kanal/${n.slug}/`;
    const img = `<img class="net-logo" src="${ROOT}images/networks/${n.slug}.svg" alt="${n.name}" loading="lazy">`;
    return href ? `<a class="net-chip" href="${href}" title="${n.name}">${img}</a>` : `<span class="net-chip">${img}</span>`;
  }

  function ratingPills(modes, ratings) {
    const cat = (ratings && ratings.categories) || {};
    const cell = (m, meta) => {
      if (!m) return `<div class="rp"><span class="rp-k">${meta.label}</span><b class="rp-v muted">—</b></div>`;
      const val = m.rating != null ? fmtScore(m.rating) : `<span class="rp-rank">#${fmtRank(m.rank)}</span>`;
      return `<div class="rp"><span class="rp-k">${meta.label}</span><b class="rp-v">${val}</b><span class="rp-r">رتبه ${fmtRank(m.rank)}</span></div>`;
    };
    return `<div class="rating-pills">
      ${cell(modes.total, cat.total || { label: "Total" })}
      ${cell(modes.ab, cat.ab || { label: "AB" })}
      ${cell(modes.abc1, cat.abc1 || { label: "ABC1" })}
    </div>`;
  }

  // Theme toggle wiring (shared).
  function initTheme() {
    try {
      const stored = localStorage.getItem("dizimeter-theme");
      if (stored) document.documentElement.dataset.theme = stored;
    } catch (e) {}
    const btn = document.querySelector("#theme-toggle");
    if (btn) {
      btn.addEventListener("click", () => {
        const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        try { localStorage.setItem("dizimeter-theme", next); } catch (e) {}
      });
    }
  }

  window.DiziMeter = {
    ROOT,
    fmtInt, fmtScore, fmtRank, isoToFa, isoToTiak,
    loadData, networkOf, seriesList, seriesForNetwork,
    ratingFor, ratingModesFor, seriesHeadlineRating, allEpisodes, latestDay,
    netBadge, ratingPills, initTheme,
  };
  document.addEventListener("DOMContentLoaded", initTheme);
})();
