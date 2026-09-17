# DiziMeter

A Persian-first, automation-first reference for Turkish TV series: schedules, episode recaps, daily ratings, and renewal/cancellation signals.

## Product principles

- No routine manual publishing: collectors discover changes, preserve source snapshots, normalize records, and publish only after quality gates pass.
- Every fact keeps provenance, fetch time, content hash, and confidence.
- Primary sources win conflicts. TİAK and official broadcasters are primary; Dizilah is a valuable secondary discovery and cross-check source.
- Raw source documents live in R2; structured, searchable records live in D1.
- The public site never republishes full copyrighted articles, subtitles, episodes, or source pages.

## Current slice

- Persian RTL homepage with ratings, series cards, recaps, search, and detail routes
- D1 schema for series, episodes, ratings, recaps, sources, snapshots, and ingestion runs
- R2-backed source snapshot ingestion endpoint
- Scheduled GitHub Actions collector scaffold
- TİAK, Dizilah, and official broadcaster source registry

The visible ratings and recap copy are explicitly marked as demo data until the normalization and editorial pipeline is connected to live sources.

## Stack

- Next.js-compatible Vinext on Cloudflare Workers
- Cloudflare D1 + Drizzle
- Cloudflare R2
- GitHub Actions for scheduled collection

## Local development

```bash
pnpm install
pnpm run db:generate
pnpm run dev
```

Collector health check:

```bash
pnpm run collect:dry
```

## Required secrets

- `INGEST_SECRET` on the deployed Site
- `DIZIMETER_INGEST_URL` in GitHub Actions
- `DIZIMETER_INGEST_SECRET` in GitHub Actions
- An AI provider key will be added only when the recap-generation stage is enabled

See [docs/AUTOMATION.md](docs/AUTOMATION.md) and [docs/SOURCES.md](docs/SOURCES.md).
