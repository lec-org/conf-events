# Agent Notes

## Project shape

This repo is a small static site for tracking AI launches, developer conferences, and major platform event dates.

Current priorities:

- accurate dates
- clean summaries
- low-maintenance data workflow
- fast static deployment

This is not a general event platform. Avoid overbuilding.

## Validation

Use the normal project commands, not Vite+ commands:

```bash
pnpm install
pnpm run check
pnpm build
```

If a user asks for a code or content change and there is no reason to stop early, make the change, validate it, and continue through commit/push when requested.

## Deployment

The deploy target is a normal Vite static build.

Vercel settings should be:

```bash
Install Command: pnpm install
Build Command: pnpm build
Output Directory: dist
```

Do not reintroduce Vite+ or `@vizejs/vite-plugin` into the deploy path unless there is a very strong reason and the user explicitly asks for it.

## Event data rules

All event data currently lives in:

- `src/data.ts`

When collecting or editing event entries:

1. Prefer official sources only.
2. If the official source does not clearly confirm a date, mark the item `watch` or skip it.
3. Do not invent exact times.
4. If only dates are known, keep time fields empty.
5. If a summary is unclear, write a short agent-authored summary from the official event description.
6. If the organizer is unclear, leave the organizer conservative and factual.
7. Do not pad the dataset with weak or rumor-level events.

## Priority companies and sources

When the user asks to expand the dataset, search these groups first:

- AI model companies: OpenAI, Anthropic, Google/Gemini, Meta AI, xAI
- China AI companies: Alibaba Cloud / Qwen, Baidu, Tencent, DeepSeek, Moonshot / Kimi
- Dev platform companies: GitHub, Microsoft, Vercel, AWS, Oracle, Salesforce
- Major conference organizers: CNCF, Apple, Google, Microsoft, Databricks

For China AI companies such as DeepSeek, Kimi, or Moonshot:

- do not assume they have a fixed annual conference
- only add entries when an official event page or official announcement exists

## Summary style

Modal summaries should answer:

- who is hosting it
- what kind of event it is
- what the main content usually covers

Keep summaries short, factual, and readable.

Good examples:

- "OpenAI's developer event centered on APIs, models, agent tooling, and platform roadmap."
- "Alibaba Cloud's flagship Qwen event for global developers and enterprise clients, focused on LLM and agent applications."

Avoid:

- hype wording
- marketing claims presented as fact
- speculative roadmap language

## Time display rules

The UI currently displays schedule metadata in a UTC+8-oriented format.

Rules:

- if official start/end times are known, show them with explicit `AM` / `PM`
- if only dates are known, do not fabricate a real time
- in that case, show a `time TBA` style label

## Workflow preference

For this repo, the preferred operating mode is:

1. inspect current data/UI
2. update `src/data.ts` and related UI
3. validate with `pnpm run check` and `pnpm build`
4. if the user has asked for it, commit and push directly

Unless the user says otherwise, treat "改好了就push" as the default workflow for follow-up turns in this repo.
