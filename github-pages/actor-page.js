/* Actor (oyuncu) page. window.DM = { root, slug }. */
(async function () {
  "use strict";
  const D = window.DiziMeter;
  const { slug, root } = window.DM;
  const $ = (s) => document.querySelector(s);
  try {
    const { series } = await D.loadData();
    const people = D.buildPeople(series);
    const pr = people[slug];
    if (!pr) throw new Error("actor not found");
    document.title = `${pr.name} — بازیگر | مشکی مدیا`;
    $("#credits").innerHTML = pr.credits.map((c) => {
      const s = series[c.seriesSlug];
      const charUrl = c.character ? `${root}karakter/${D.slugify(c.seriesSlug + "-" + c.character)}/` : null;
      return `<article class="credit-card">
        <a class="credit-series" href="${root}dizi/${c.seriesSlug}/">
          <div class="credit-thumb ${s && s.hero ? "" : "no-image"}" ${s && s.hero ? `style="background-image:url('${s.hero}')"` : ""}></div>
          <strong>${D.esc(c.seriesTitleFa)}</strong>
        </a>
        <div class="credit-role">${charUrl ? `نقش: <a href="${charUrl}">${D.esc(c.character)}</a>` : (c.character ? "نقش: " + D.esc(c.character) : "")}</div>
      </article>`;
    }).join("");
  } catch (e) { console.error(e); const el = $("#credits"); if (el) el.innerHTML = `<div class="notice error">اطلاعات این بازیگر در دسترس نیست.</div>`; }
})();
