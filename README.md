# Content Engine

A single-user Next.js app for Ben to run the dpbenb YouTube content pipeline
(idea → packaged → scripted → filmed → editing → posted) plus a quick
jot-and-batch list for Instagram and client content. This app is a
viewer/editor only — it never calls an AI model or vidIQ itself.

## Shared Supabase project

This app shares its Supabase project (`bobujirqspjsbfkyxhcj`) with Ben's
Improvement App and Business Ops App — it does **not** have its own project,
and it reuses their existing `app_users` allowlist and `public.is_approved()`
RLS gate rather than a new auth system. Local env values go in `.env.local`
(gitignored); see `.env.local.example` for the required keys.

To avoid colliding with that shared project's existing (unrelated) `inbox`
and `idea_bank` tables, every table this app owns is prefixed `content_`:
`content_inbox`, `content_ideas`, `content_packaging`, `content_scripts`.

## Database migration

The schema has **not** been applied yet. Run
[`supabase/migrations/20260903190000_content_engine_schema.sql`](supabase/migrations/20260903190000_content_engine_schema.sql)
manually in the Supabase SQL Editor for that project before using the app.

## Automation

A companion doc, `content-engine-n8n-flows.md`, will separately cover the n8n
automation that turns `content_inbox` rows into `content_ideas` rows (score,
ease, packaging, and script generation). It has not been written yet — this
app is only the viewer/editor for that pipeline's output.

## brain/

`brain/` holds the reference material n8n/Claude will use during processing
(hooks, retention, packaging rules, channel data). Most files are placeholders
Ben will fill in later; `brain/scoring.md` already has the real score and
ease formulas.
