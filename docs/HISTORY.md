# Project history & changelog

Meshki Media began life as **DiziMeter**. This page records how it evolved so that
anyone picking up the project understands its intent and its data decisions.

## Timeline

| Date | Milestone |
| --- | --- |
| 2026‑09‑17 | **Repository initialized** — `chore: initialize DiziMeter repository`. |
| 2026‑09‑17 | **Foundation** — `feat: launch DiziMeter foundation`: Next.js‑compatible app on Cloudflare Workers, D1 + Drizzle schema (series, episodes, ratings, recaps, sources, snapshots, ingestion runs), R2 snapshot ingestion, and the source registry (TİAK, broadcasters, Dizilah). |
| 2026‑09‑17 | **CI gating** — `ci: gate collector until production secrets are ready`. |
| 2026‑09‑17 | **Live ratings on Pages** — `feat: publish live ratings on GitHub Pages`: a static Persian RTL slice reading TİAK’s public **Total** top‑10. |
| 2026‑09‑18 | **Design system** — `style: align … design system`. |
| 2026‑09‑18 | **Series profiles** — `feat: add Persian names and series profiles`. |
| 2026‑09‑18 | **Episodes, networks, multi‑mode ratings** — `Add episode & network pages, multi-mode ratings (Total/AB/ABC1), 10-day window`: per‑episode pages with photos and trailers, per‑network pages + index with generated marks, browse‑by‑network, a Total/AB/ABC1 switcher, and a rolling 10‑day ratings window. The collector was rewritten to accumulate the window and to fold Turkish letters so program names match series keys. |
| 2026‑09‑18 | **Rebrand → Meshki Media (مشکی مدیا)** — new name, logo, favicon, titles, metadata, README, workflow names, and public URLs (`nimania.github.io/meshkimedia`). Internal identifiers (`window.DiziMeter`, `dizimeter.js`) were intentionally left unchanged for stability. The GitHub repository was renamed `dizimeter → meshkimedia`. |

## Design decisions that persist

- **Static, data‑driven site.** The public experience is plain HTML/CSS/JS generated
  from three JSON files — cheap to host, easy to audit, no server required.
- **Single source of truth for ratings.** Episodes join ratings by
  `(ratingKey, date)` rather than copying numbers, so one dataset drives every view.
- **Honesty over completeness.** TİAK publishes exact numbers only for **Total**;
  AB/ABC1 are shown as ranks. Missing values are never guessed. See
  [`DATA-MODEL.md`](./DATA-MODEL.md) and [`SOURCES.md`](./SOURCES.md).
- **Original network marks.** Channel “logos” are generated typographic badges, not
  the broadcasters’ trademarked logos.

## Naming note

The name changed from DiziMeter to Meshki Media, but three internal things kept the
old name on purpose because they are not user‑facing and renaming them only risks
breakage:

- the shared client file `github-pages/dizimeter.js`;
- the JS global `window.DiziMeter`;
- the GitHub Actions ingest **secret names** `DIZIMETER_INGEST_URL` /
  `DIZIMETER_INGEST_SECRET` (renaming these would require re‑creating the secrets).
