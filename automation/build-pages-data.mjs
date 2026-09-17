import { mkdir, readFile, writeFile } from "node:fs/promises";

const SOURCE_URL = "https://tiak.com.tr/";
const OUTPUT_URL = new URL("../github-pages/data/ratings.json", import.meta.url);

function clean(value) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTiak(html) {
  const section = html.match(/<div class="anatablolar">([\s\S]*?)<\/div>\s*<\/div>\s*<div class="altalan">/)?.[1] ?? html;
  const date = section.match(/<div class="tablobaslik">\s*([^<]+?)\s*<\/div>/)?.[1]?.trim();
  const rows = [];
  const pattern = /<div class="item">[\s\S]*?<span class="yazi">\s*([\d.,]+)\s*<\/span>[\s\S]*?<div class="kanal">\s*([\s\S]*?)\s*<\/div>[\s\S]*?<div class="program">\s*([\s\S]*?)\s*<\/div>/g;
  for (const match of section.matchAll(pattern)) {
    rows.push({
      rank: rows.length + 1,
      rating: Number(match[1].replace(",", ".")),
      network: clean(match[2]),
      program: clean(match[3]),
    });
    if (rows.length === 10) break;
  }
  if (!date || rows.length < 5 || rows.some((row) => !Number.isFinite(row.rating))) {
    throw new Error("TİAK page shape changed; refusing to publish incomplete data.");
  }
  return {
    date,
    fetchedAt: new Date().toISOString(),
    source: { name: "TİAK", url: SOURCE_URL },
    audience: "5+ Yaş Tüm Kişiler",
    metric: "Rating %",
    rows,
  };
}

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 25_000);
try {
  const response = await fetch(SOURCE_URL, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent": "DiziMeter/1.0 (+https://nimania.github.io/dizimeter/)",
    },
    signal: controller.signal,
  });
  if (!response.ok) throw new Error(`TİAK returned HTTP ${response.status}`);
  const payload = parseTiak(await response.text());
  await mkdir(new URL("../github-pages/data/", import.meta.url), { recursive: true });
  await writeFile(OUTPUT_URL, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Published ${payload.rows.length} TİAK rows for ${payload.date}.`);
} catch (error) {
  try {
    const previous = JSON.parse(await readFile(OUTPUT_URL, "utf8"));
    console.error(`Refresh failed; keeping ${previous.date}: ${error instanceof Error ? error.message : error}`);
  } catch {
    console.error(error);
  }
  process.exitCode = 1;
} finally {
  clearTimeout(timeout);
}
