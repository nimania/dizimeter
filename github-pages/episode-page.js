/* Renders a single episode (قسمت) profile page. Expects window.DM = { root, slug, epNumber }. */
(async function () {
  "use strict";
  const D = window.DiziMeter;
  const { slug, epNumber } = window.DM;
  const $ = (s) => document.querySelector(s);

  try {
    const { networks, series, ratings } = await D.loadData();
    const s = series[slug];
    if (!s) throw new Error("series not found");
    const eps = D.allEpisodes(s);
    const idx = eps.findIndex((e) => String(e.number) === String(epNumber));
    const ep = eps[idx];
    if (!ep) throw new Error("episode not found");
    const net = networks[s.network];

    document.title = `${s.titleFa} — قسمت ${D.fmtInt(ep.number)} | دیزی‌متر`;

    // Breadcrumb + title
    $("#crumb-series").textContent = s.titleFa;
    $("#crumb-series").href = `${D.ROOT}dizi/${s.slug}/`;
    $("#ep-badge").innerHTML = D.netBadge(networks, s.network);
    $("#ep-kicker").textContent = `${s.titleTr} · قسمت ${D.fmtInt(ep.number)}`;
    $("#ep-title").textContent = ep.title && ep.title.trim() ? ep.title : `قسمت ${D.fmtInt(ep.number)}`;
    $("#ep-facts").innerHTML = [
      ep.date ? `<span>📅 ${D.isoToFa(ep.date)}</span>` : "",
      `<span>قسمت ${D.fmtInt(ep.number)}</span>`,
      net ? `<span>${net.name}</span>` : "",
    ].join("");

    // Hero image = first photo or series hero
    const heroImg = ep.image || (ep.images && ep.images[0]) || s.hero || "";
    if (heroImg) $("#ep-hero").style.backgroundImage = `url('${heroImg}')`;
    else $("#ep-hero").classList.add("no-image");

    // Ratings (Total / AB / ABC1)
    const modes = D.ratingModesFor(ratings, s.ratingKey, ep.date);
    const anyRating = modes.total || modes.ab || modes.abc1;
    $("#ep-ratings").innerHTML = D.ratingPills(modes, ratings);
    $("#ratings-note").textContent = anyRating
      ? `منبع: ${ratings.source.name} · تاریخ ${modes.total ? modes.total.date : (modes.ab ? modes.ab.date : modes.abc1.date)}`
      : "ریتینگ این قسمت هنوز در سیستم ثبت نشده است.";

    // Photos gallery
    const gallery = (ep.images && ep.images.length ? ep.images : (ep.image ? [ep.image] : []));
    if (gallery.length) {
      $("#ep-gallery").innerHTML = gallery
        .map((src) => `<a class="shot" href="${src}" target="_blank" rel="noreferrer" style="background-image:url('${src}')"></a>`)
        .join("");
    } else {
      $("#gallery-section").hidden = true;
    }

    // Summary
    $("#ep-summary").textContent = ep.summary && ep.summary.trim()
      ? ep.summary
      : "خلاصهٔ این قسمت به‌زودی از منبع رسمی افزوده می‌شود.";

    // Links: fragman + official source
    const links = [];
    const fragman = ep.fragman || s.fragman;
    if (fragman) links.push(`<a class="btn-primary" href="${fragman}" target="_blank" rel="noreferrer">▶ تماشای فراگمان</a>`);
    if (ep.source) links.push(`<a class="btn-ghost" href="${ep.source}" target="_blank" rel="noreferrer">منبع رسمی قسمت ↗</a>`);
    $("#ep-links").innerHTML = links.join("");

    // Prev / next episode nav
    const prev = eps[idx - 1];
    const next = eps[idx + 1];
    const navHtml = [];
    if (prev) navHtml.push(`<a class="ep-nav-btn" href="${D.ROOT}dizi/${s.slug}/bolum-${prev.number}/"><span>قسمت قبلی</span><b>قسمت ${D.fmtInt(prev.number)} →</b></a>`);
    else navHtml.push(`<span></span>`);
    if (next) navHtml.push(`<a class="ep-nav-btn left" href="${D.ROOT}dizi/${s.slug}/bolum-${next.number}/"><span>قسمت بعدی</span><b>← قسمت ${D.fmtInt(next.number)}</b></a>`);
    $("#ep-nav").innerHTML = navHtml.join("");

    // Bottom nav links
    $("#nav-series").href = `${D.ROOT}dizi/${s.slug}/`;
    $("#nav-network").href = net ? `${D.ROOT}kanal/${net.slug}/` : `${D.ROOT}`;
  } catch (e) {
    console.error(e);
    $("#ep-summary").textContent = "اطلاعات این قسمت موقتاً در دسترس نیست.";
  }
})();
