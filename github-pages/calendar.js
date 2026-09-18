/* Broadcast calendar (takvim/). Groups series by weekday with Turkey/Iran/US(PT) times. */
(async function () {
  "use strict";
  const D = window.DiziMeter;
  const { root } = window.DM;
  const el = document.querySelector("#list");
  try {
    const { networks, series } = await D.loadData();
    const days = D.WEEKDAYS_FA; // 0=Mon..6=Sun
    const byDay = {};
    D.seriesList(series).forEach((s) => { if (s.dayIndex != null && s.dayIndex >= 0 && s.dayIndex <= 6) (byDay[s.dayIndex] = byDay[s.dayIndex] || []).push(s); });
    let html = `<div class="cal-legend"><span>🇹🇷 ترکیه</span><span>🇮🇷 ایران</span><span>🇺🇸 آمریکا (لس‌آنجلس)</span></div>`;
    for (let i = 0; i < 7; i++) {
      const list = (byDay[i] || []).sort((a, b) => (a.time || "20:00").localeCompare(b.time || "20:00"));
      html += `<section class="cal-day"><h2>${days[i]}</h2>`;
      if (!list.length) { html += `<div class="cal-empty">—</div></section>`; continue; }
      html += list.map((s) => {
        const t = D.calendarTimes(s.dayIndex, s.time);
        const net = networks[s.network];
        const times = t ? `<div class="cal-times"><span>🇹🇷 ${t.tr}</span><span>🇮🇷 ${t.ir}</span><span>🇺🇸 ${t.us}${t.usDay !== t.trDay ? " (" + t.usDay + ")" : ""}</span></div>` : "";
        return `<a class="cal-row" href="${root}dizi/${s.slug}/"><div class="cal-net">${net ? `<img src="${root}images/networks/${net.slug}.svg" alt="${D.esc(net.name)}">` : ""}</div><div class="cal-info"><strong>${D.esc(s.titleFa)}</strong><span dir="ltr">${D.esc(s.titleTr)}</span></div>${times}</a>`;
      }).join("");
      html += `</section>`;
    }
    el.innerHTML = html;
  } catch (e) { console.error(e); el.innerHTML = `<div class="notice error">تقویم در دسترس نیست.</div>`; }
})();
