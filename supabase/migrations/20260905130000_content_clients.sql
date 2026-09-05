-- Content Engine: client-scoped capture.
--
-- Ben wants a per-client tab where he can jot a hook, video idea, or ad
-- creative idea for any client without going through the YouTube-mode
-- scoring pipeline. This does NOT reintroduce the old health-app's
-- Personal/Blackout/Clients segmented-page architecture (that had its own
-- per-client production-stage tracking, which is out of scope here) — it's
-- purely a small roster table to drive a tab strip + capture picker, on top
-- of the existing content_inbox capture flow. n8n still owns turning any of
-- this into a content_ideas row; nothing here bypasses that.

create table content_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table content_inbox
  add column client_id uuid references content_clients(id) on delete set null,
  add column content_type text check (content_type in ('hook', 'video_idea', 'ad_creative'));

create index content_inbox_client_id_idx on content_inbox (client_id);

alter table content_clients enable row level security;
create policy "approved users only" on content_clients for all to authenticated using (public.is_approved()) with check (public.is_approved());

-- Best-guess active roster from Ben's Business Ops app + old Clients-tab
-- screenshots, seeded so the tab strip isn't empty on first load. Ben can
-- rename/add/remove freely from the Clients tab itself.
insert into content_clients (name) values
  ('J&C Asphalt'),
  ('Swingin Dance Co'),
  ('Swingin Mechanical Bulls'),
  ('Western Events Center'),
  ('Iron Rescue'),
  ('The Art Room'),
  ('Uinta Tactical Precision'),
  ('Peak Defense Works'),
  ('Uptown Drapes')
on conflict (name) do nothing;
