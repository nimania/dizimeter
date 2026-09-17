const faDigits = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

function formatDate(value) {
  const [day, month, year] = value.split(".").map(Number);
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date(Date.UTC(year, month - 1, day)));
}

async function loadRatings() {
  try {
    const response = await fetch(`data/ratings.json?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const rows = data.rows.map((row) => `<tr><td><b class="rank">${new Intl.NumberFormat("fa-IR").format(row.rank)}</b></td><td class="program" dir="ltr">${row.program}</td><td><span class="network">${row.network}</span></td><td class="score">${faDigits.format(row.rating)}</td></tr>`).join("");
    document.querySelector("#ratings-body").innerHTML = rows;
    document.querySelector("#data-date").textContent = formatDate(data.date);
    document.querySelector("#fetched-at").textContent = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tehran" }).format(new Date(data.fetchedAt));
    document.querySelector("#top-rating").textContent = faDigits.format(data.rows[0].rating);
    document.querySelector("#top-program").textContent = `${data.rows[0].program} · ${data.rows[0].network}`;
    document.querySelector("#loading").hidden = true;
    document.querySelector("#table-shell").hidden = false;
  } catch (error) {
    console.error(error);
    document.querySelector("#loading").hidden = true;
    document.querySelector("#error").hidden = false;
  }
}

loadRatings();
