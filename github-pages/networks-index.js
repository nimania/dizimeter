/* Renders the networks index (kanal/). Expects window.DM = { root }. */
(async function () {
  "use strict";
  const D = window.DiziMeter;
  const $ = (s) => document.querySelector(s);
  try {
    const { networks, series } = await D.loadData();
    const nets = Object.values(networks);
    $("#net-grid").innerHTML = nets
      .map((n) => {
        const count = D.seriesForNetwork(series, n.slug).length;
        return `<a class="net-tile" href="${D.ROOT}kanal/${n.slug}/" style="--net-color:${n.color}">
          <img src="${D.ROOT}images/networks/${n.slug}.svg" alt="${n.name}" loading="lazy">
          <div><strong>${n.name}</strong><span>${D.fmtInt(count)} سریال</span></div>
        </a>`;
      })
      .join("");
  } catch (e) {
    console.error(e);
    $("#net-grid").innerHTML = `<div class="notice error">فهرست شبکه‌ها در دسترس نیست.</div>`;
  }
})();
