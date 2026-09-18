/* Networks index (kanal/). Fills #list. window.DM = { root }. */
(async function () {
  "use strict";
  const D = window.DiziMeter;
  const { root } = window.DM;
  const el = document.querySelector("#list");
  try {
    const { networks, series } = await D.loadData();
    el.innerHTML = Object.values(networks).map((n) => {
      const count = D.seriesForNetwork(series, n.slug).length;
      return `<a class="net-tile" href="${root}kanal/${n.slug}/" style="--net-color:${n.color}"><img src="${root}images/networks/${n.slug}.svg" alt="${D.esc(n.name)}" loading="lazy"><div><strong>${D.esc(n.name)}</strong><span>${D.fmtInt(count)} سریال</span></div></a>`;
    }).join("");
  } catch (e) { console.error(e); el.innerHTML = `<div class="notice error">فهرست شبکه‌ها در دسترس نیست.</div>`; }
})();
