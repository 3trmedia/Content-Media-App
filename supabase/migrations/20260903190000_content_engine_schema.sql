-- Content Engine: core schema.
--
-- Shares its Supabase project with Ben's Improvement App and Business Ops
-- App (same free-tier org constraint). Reuses that project's existing
-- auth/approval system rather than inventing a parallel one: the app_users
-- allowlist and public.is_approved() already exist from the Improvement
-- App's access-control migration and gate every table below the same way
-- every other table in this project is gated.
--
-- Naming note: the shared project already has an unrelated table literally
-- named "inbox" (Improvement App's still-unbuilt voice-capture feature) and
-- an old, unrelated "idea_bank" table. To avoid any collision, every table
-- this app owns is prefixed content_: content_inbox, content_ideas,
-- content_packaging, content_scripts.
--
-- This app is a viewer/editor only — n8n does the actual AI processing of
-- content_inbox rows into content_ideas rows (score, ease, packaging,
-- scripts are all written by that pipeline, documented separately in the
-- not-yet-written content-engine-n8n-flows.md). Nothing in this app calls
-- an AI model or vidIQ.

create table content_ideas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner text not null,
  platform text not null check (platform in ('youtube_long', 'youtube_short', 'ig_post')),
  mode text not null default 'quick' check (mode in ('youtube', 'quick')),
  stage text not null default 'idea' check (stage in ('idea', 'packaged', 'scripted', 'filmed', 'editing', 'posted')),
  premise text not null,
  hook text,
  title_system text,
  pillar text check (pillar in ('A', 'B')),
  why_click text,
  raw_dump text,
  notes text,
  requirements jsonb not null default '{}'::jsonb,
  ease int check (ease between 1 and 5),
  score int check (score between 0 and 100),
  score_breakdown jsonb,
  location_tag text,
  -- Quick-mode-only optional rough rank. Not in Ben's original field list
  -- for this table, but Quick mode's spec explicitly calls for a 1-3 rank
  -- badge per idea, so it's added here as the obvious home for it.
  rank int check (rank between 1 and 3),
  filmed_at timestamptz,
  posted_at timestamptz,
  youtube_video_id text
);

create table content_inbox (
  id uuid primary key default gen_random_uuid(),
  raw_text text not null,
  source text not null check (source in ('phone', 'app', 'claude')),
  status text not null default 'unprocessed' check (status in ('unprocessed', 'processed', 'failed')),
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  idea_id uuid references content_ideas(id) on delete set null
);

create table content_packaging (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references content_ideas(id) on delete cascade,
  kind text not null check (kind in ('title', 'thumbnail')),
  body text not null,
  selected boolean not null default false,
  created_at timestamptz not null default now()
);

create table content_scripts (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references content_ideas(id) on delete cascade,
  version int not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index content_ideas_stage_idx on content_ideas (stage);
create index content_ideas_mode_idx on content_ideas (mode);
create index content_inbox_status_idx on content_inbox (status);
create index content_inbox_idea_id_idx on content_inbox (idea_id);
create index content_packaging_idea_id_idx on content_packaging (idea_id);
create index content_scripts_idea_id_idx on content_scripts (idea_id);

alter table content_ideas enable row level security;
alter table content_inbox enable row level security;
alter table content_packaging enable row level security;
alter table content_scripts enable row level security;

create policy "approved users only" on content_ideas for all to authenticated using (public.is_approved()) with check (public.is_approved());
create policy "approved users only" on content_inbox for all to authenticated using (public.is_approved()) with check (public.is_approved());
create policy "approved users only" on content_packaging for all to authenticated using (public.is_approved()) with check (public.is_approved());
create policy "approved users only" on content_scripts for all to authenticated using (public.is_approved()) with check (public.is_approved());
