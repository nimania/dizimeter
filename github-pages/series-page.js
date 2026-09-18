/* Renders a series (dizi) profile page. Expects window.DM = { root, slug }. */
(async function () {
  "use strict";
  const D = window.DiziMeter;
  const { slug } = window.DM;
  const $ = (s) => document.querySelector(s);

  try {
    const { networks, series, ratings } = await D.loadData();
    const d = series[slug];
    if (!d) throw new Error("not found");
    const net = networks[d.network];

    document.title = `${d.titleFa} | دیزی‌متر`;
    $("#title-fa").textContent = d.titleFa;
    $("#title-tr").textContent = d.titleTr;
    $("#status").textContent = d.status;
    $("#kind-tag").textContent = d.kind === "entertainment" ? "برنامه" : "سریال";
    $("#network").innerHTML = net ? `<a href="${D.ROOT}kanal/${net.slug}/">${net.name}</a>` : "";
    $("#airing").textContent = d.airing || "";
    $("#studio").textContent = d.studio || "";
    $("#net-badge").innerHTML = D.netBadge(networks, d.network);

    if (d.hero) $(".hero-cover").style.backgroundImage = `url('${d.hero}')`;
    $("#synopsis").textContent = d.synopsis && d.synopsis.trim() ? d.synopsis : "خلاصهٔ داستان به‌زودی افزوده می‌شود.";

    // Genre chips
    $("#genre").innerHTML = (d.genre || []).map((g) => `<span class="genre-chip">${g}</span>`).join("");

    // Official links
    const off = d.official || {};
    const links = [];
    if (off.website) links.push(`<a href="${off.website}" target="_blank" rel="noreferrer">صفحهٔ رسمی ↗</a>`);
    if (off.episodes) links.push(`<a href="${off.episodes}" target="_blank" rel="noreferrer">قسمت‌ها در شبکه ↗</a>`);
    if (d.fragman) links.push(`<a href="${d.fragman}" target="_blank" rel="noreferrer">فراگمان ↗</a>`);
    if (off.youtube) links.push(`<a href="${off.youtube}" target="_blank" rel="noreferrer">یوتیوب رسمی ↗</a>`);
    $("#official-links").innerHTML = links.join("");

    // Cast
    if (d.cast && d.cast.length) {
      $("#cast").innerHTML = d.cast
        .map((c) => `<article class="cast-card"><div class="cast-photo" ${c.image ? `style="background-image:url('${c.image}')"` : ""}>${c.image ? "" : (c.name || "?").slice(0, 1)}</div><div><strong>${c.name}</strong><span>${c.role || ""}</span></div></article>`)
        .join("");
    } else {
      $("#cast-section").hidden = true;
    }

    // Episodes with per-episode multi-mode ratings + link to episode page
    const eps = D.allEpisodes(d);
    if (eps.length) {
      $("#episodes").innerHTML = eps
        .slice()
        .reverse()
        .map((e) => {
          const modes = D.ratingModesFor(ratings, d.ratingKey, e.date);
          const href = `${D.ROOT}dizi/${d.slug}/bolum-${e.number}/`;
          const img = e.image || (e.images && e.images[0]) || "";
          const title = e.title && e.title.trim() ? e.title : `قسمت ${D.fmtInt(e.number)}`;
          const summary = e.summary && e.summary.trim() ? e.summary : "خلاصه به‌زودی افزوده می‌شود.";
          return `<article class="episode-card">
            <a class="episode-image ${img ? "" : "no-image"}" href="${href}" ${img ? `style="background-image:url('${img}')"` : ""}>${img ? "" : "<span>بدون تصویر</span>"}</a>
            <div class="episode-copy">
              <div class="episode-meta"><span>قسمت ${D.fmtInt(e.number)}</span><span>${D.isoToFa(e.date)}</span></div>
              <h3><a href="${href}">${title}</a></h3>
              <p>${summary}</p>
              ${D.ratingPills(modes, ratings)}
              <a class="ep-open" href="${href}">صفحهٔ کامل قسمت ←</a>
            </div>
          </article>`;
        })
        .join("");
    } else {
      $("#episodes").innerHTML = `<div class="notice">قسمت‌های این ${d.kind === "entertainment" ? "برنامه" : "سریال"} به‌زودی در سیستم ثبت می‌شوند.</div>`;
    }

    $("#network-link").href = net ? `${D.ROOT}kanal/${net.slug}/` : `${D.ROOT}`;
  } catch (e) {
    console.error(e);
    $("#synopsis").textContent = "اطلاعات این سریال موقتاً در دسترس نیست.";
  }
})();
