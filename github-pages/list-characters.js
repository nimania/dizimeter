/* Characters list (karakterler/). Fills #list, filters via #q. window.DM = { root }. */
(async function () {
  "use strict";
  const D = window.DiziMeter;
  const { root } = window.DM;
  const el = document.querySelector("#list");
  const q = document.querySelector("#q");
  try {
    const { series } = await D.loadData();
    const chars = Object.values(D.buildCharacters(series)).sort((a, b) => a.name.localeCompare(b.name));
    if (!chars.length) { el.innerHTML = `<div class="notice">هنوز کاراکتری ثبت نشده است.</div>`; return; }
    el.innerHTML = chars.map((ch) => `<a class="person-card" href="${root}karakter/${ch.slug}/" data-k="${D.esc((ch.name + " " + ch.personName).toLowerCase())}">
      <div class="person-thumb ${ch.image ? "" : "no-image"}" ${ch.image ? `style="background-image:url('${ch.image}')"` : ""}>${ch.image ? "" : D.esc(ch.name.slice(0, 1))}</div>
      <strong dir="ltr">${D.esc(ch.name)}</strong><span>${D.esc(ch.seriesTitleFa)}${ch.personName ? " · " + ch.personName : ""}</span></a>`).join("");
    if (q) q.addEventListener("input", () => { const v = q.value.trim().toLowerCase(); el.querySelectorAll(".person-card").forEach((c) => { c.style.display = !v || c.dataset.k.includes(v) ? "" : "none"; }); });
  } catch (e) { console.error(e); el.innerHTML = `<div class="notice error">فهرست کاراکترها در دسترس نیست.</div>`; }
})();
