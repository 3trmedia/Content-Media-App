// Shared row types for the content_* tables (see supabase/migrations for the
// schema). Kept hand-written rather than generated since this is a small,
// stable schema.

export type Mode = "youtube" | "quick";

export type Stage = "idea" | "packaged" | "scripted" | "filmed" | "editing" | "posted";

export const STAGES: Stage[] = ["idea", "packaged", "scripted", "filmed", "editing", "posted"];

export type Platform = "youtube_long" | "youtube_short" | "ig_post";

export type Requirements = {
  locations?: string[];
  people?: string[];
  timing?: string | null;
  props_or_scenes?: string[];
  multi_day?: boolean;
};

export type ContentIdea = {
  id: string;
  created_at: string;
  updated_at: string;
  owner: string;
  platform: Platform | string;
  mode: Mode;
  stage: Stage;
  premise: string;
  hook: string | null;
  title_system: string | null;
  pillar: "A" | "B" | null;
  why_click: string | null;
  raw_dump: string | null;
  notes: string | null;
  requirements: Requirements;
  ease: number | null;
  score: number | null;
  score_breakdown: Record<string, unknown> | null;
  location_tag: string | null;
  // Quick-mode-only optional rough rank (1-3). Not in Ben's original field
  // list for content_ideas, but Quick mode's spec explicitly calls for a
  // rank badge on each row, so it's added here — see migration comment.
  rank: number | null;
  filmed_at: string | null;
  posted_at: string | null;
  youtube_video_id: string | null;
  // Ported from the old health-app Content tab's content_items table (see
  // migration comment) — who's cutting it and what named format it is
  // ("Format #3 - feed teardown"), for the two owners with a real
  // production pipeline (Personal, Blackout).
  editor: string | null;
  format: string | null;
};

export const PIPELINE_OWNERS = ["Personal", "Blackout"] as const;
export type PipelineOwner = (typeof PIPELINE_OWNERS)[number];

export function isPipelineOwner(owner: string): owner is PipelineOwner {
  return (PIPELINE_OWNERS as readonly string[]).includes(owner);
}

export type ContentType = "hook" | "video_idea" | "ad_creative";

export type ContentInbox = {
  id: string;
  raw_text: string;
  source: string;
  status: "unprocessed" | "processed" | "failed";
  created_at: string;
  processed_at: string | null;
  idea_id: string | null;
  client_id: string | null;
  content_type: ContentType | null;
};

export type ContentClient = {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
  last_active_at: string | null;
};

export type ContentPackaging = {
  id: string;
  idea_id: string;
  kind: "title" | "thumbnail";
  body: string;
  selected: boolean;
  created_at: string;
};

export type ContentScript = {
  id: string;
  idea_id: string;
  version: number;
  body: string;
  created_at: string;
};

// A YouTube-mode idea, per Ben's derivation rule, is Personal-owned and on a
// YouTube platform — but `mode` is stored and editable so he can override it.
export function deriveMode(owner: string, platform: string): Mode {
  const isYouTube = platform === "youtube_long" || platform === "youtube_short";
  return owner === "Personal" && isYouTube ? "youtube" : "quick";
}
