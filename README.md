# conf-events

`conf-events` is a small, hand-maintained calendar for AI launches, developer conferences, and major platform event dates.

The current version is intentionally simple:

- static frontend
- local event data in `src/data.ts`
- calendar view plus an upcoming panel
- event detail modal before jumping to the official source

This project is meant to be useful first, and heavier infrastructure can come later.

## What it tracks

The current dataset focuses on:

- AI developer events
- cloud and platform conferences
- frontend and devtools release events
- a small archive of already-finished 2026 events for recap value

Each event entry can carry:

- date range
- organizer
- location
- category
- status
- summary
- highlights
- official link

## Tech stack

- Vue
- Vite
- Vize
- FullCalendar
- TypeScript

## Local development

```bash
pnpm install
pnpm dev
```

Other useful commands:

```bash
pnpm run check
pnpm build
```

## Data model

All event data currently lives in:

- [src/data.ts](./src/data.ts)

That is enough for the first version because the data volume is small and the editing workflow is still manual.

## Deployment

The easiest deployment target for the current version is Vercel.

Suggested setup:

- Framework preset: `Vite`
- Install command: `pnpm install`
- Build command: `pnpm build`
- Output directory: `dist`

This project is a static frontend, so Vercel is mostly just serving the built files.

GitHub Pages is also possible, but Vercel is the cleaner default if you want quick previews and less config friction.

## Roadmap

Near-term ideas:

- improve event metadata quality
- add more precise time ranges instead of date-only placeholders
- support replay / keynote / CFP fields
- improve accessibility for the modal and keyboard navigation
- add filters without cluttering the top bar

Data workflow ideas to research:

- move event data from local `ts` into an online document/database
- evaluate Airtable / Notion / Baserow / similar tools as a lightweight CMS
- keep the frontend static while fetching normalized event data from a managed source

The likely direction is:

1. keep the UI static and fast
2. move data editing to a friendlier online tool
3. add a small sync step or build-time fetch later

## Status

This is an early project.

The current priority is:

- clean browsing
- understandable event summaries
- low-friction maintenance

not a full event platform.
