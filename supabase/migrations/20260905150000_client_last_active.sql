-- Content Engine: order the Clients tab strip by most-recently-jotted-for,
-- not alphabetically, so whichever client Ben just added an idea for is
-- first in line next time he opens the app.

alter table content_clients
  add column last_active_at timestamptz;

update content_clients set last_active_at = created_at where last_active_at is null;
