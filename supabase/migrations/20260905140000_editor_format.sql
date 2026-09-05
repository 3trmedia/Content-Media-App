-- Content Engine: editor + format tracking, ported from the old health-app
-- Content tab (recovered from Ben-App-repo commit 215a4b7~1 before that tab
-- was deleted). That page tracked Blackout content through the same
-- Idea->Scripted->Filmed->Editing->Posted stages as YouTube, plus a named
-- format ("Format #3 - feed teardown") and an assigned editor
-- (a contractor's name, or "Upwork"). Neither concept exists yet here.

alter table content_ideas
  add column editor text,
  add column format text;
