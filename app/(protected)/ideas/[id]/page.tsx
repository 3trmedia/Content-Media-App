"use client";

import { use, useEffect, useState } from "react";
import { PageHeader, Section, Card, Pill, Segmented, Collapsible, ScorePill, EasePill } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import type { ContentIdea, ContentPackaging, ContentScript, Requirements, Stage } from "@/lib/types";
import { STAGES, isPipelineOwner } from "@/lib/types";

export default function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [idea, setIdea] = useState<ContentIdea | null>(null);
  const [packaging, setPackaging] = useState<ContentPackaging[]>([]);
  const [scripts, setScripts] = useState<ContentScript[]>([]);
  const [tab, setTab] = useState<"packaging" | "script">("packaging");
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [reqDraft, setReqDraft] = useState<Requirements>({});
  const [editor, setEditor] = useState("");
  const [format, setFormat] = useState("");

  const supabase = createClient();

  const load = async () => {
    const [ideaRes, packagingRes, scriptsRes] = await Promise.all([
      supabase.from("content_ideas").select("*").eq("id", id).single(),
      supabase
        .from("content_packaging")
        .select("*")
        .eq("idea_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("content_scripts")
        .select("*")
        .eq("idea_id", id)
        .order("version", { ascending: false }),
    ]);
    const ideaRow = ideaRes.data as ContentIdea | null;
    setIdea(ideaRow);
    setPackaging((packagingRes.data as ContentPackaging[]) ?? []);
    setScripts((scriptsRes.data as ContentScript[]) ?? []);
    setNotes(ideaRow?.notes ?? "");
    setReqDraft(ideaRow?.requirements ?? {});
    setEditor(ideaRow?.editor ?? "");
    setFormat(ideaRow?.format ?? "");
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p className="p-5 text-[13px] text-ink-soft">Loading…</p>;
  if (!idea) return <p className="p-5 text-[13px] text-ink-soft">Idea not found.</p>;

  const latestScript = scripts[0] ?? null;

  const setStage = async (stage: Stage) => {
    setIdea({ ...idea, stage });
    await supabase.from("content_ideas").update({ stage }).eq("id", id);
  };

  const togglePackaging = async (row: ContentPackaging) => {
    setPackaging((prev) =>
      prev.map((p) => (p.id === row.id ? { ...p, selected: !p.selected } : p))
    );
    await supabase
      .from("content_packaging")
      .update({ selected: !row.selected })
      .eq("id", row.id);
  };

  const saveNotes = async () => {
    await supabase.from("content_ideas").update({ notes }).eq("id", id);
  };

  const saveRequirements = async () => {
    await supabase.from("content_ideas").update({ requirements: reqDraft }).eq("id", id);
  };

  const saveProduction = async () => {
    await supabase
      .from("content_ideas")
      .update({ editor: editor || null, format: format || null })
      .eq("id", id);
  };

  const readAloud = () => {
    if (!latestScript) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(latestScript.body);
    window.speechSynthesis.speak(utterance);
  };

  const stopReading = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const easeFactors = describeEaseFactors(idea.requirements);

  return (
    <div>
      <PageHeader eyebrow={idea.owner} title={idea.premise} />

      <Section title="Overview">
        <Card className="flex flex-col gap-2.5">
          {idea.hook && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">Hook</p>
              <p className="mt-0.5 text-[13.5px] text-ink">{idea.hook}</p>
            </div>
          )}
          {idea.why_click && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                Why click
              </p>
              <p className="mt-0.5 text-[13.5px] text-ink">{idea.why_click}</p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {idea.title_system && <Pill tone="info">{idea.title_system}</Pill>}
            {idea.pillar && <Pill tone="warm">Pillar {idea.pillar}</Pill>}
            <Pill>{idea.platform}</Pill>
            <Pill>{idea.mode}</Pill>
          </div>
        </Card>
      </Section>

      <Section title="Score & ease">
        <div className="grid grid-cols-2 gap-2.5">
          <Card className="flex flex-col items-start gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
              Score
            </span>
            <ScorePill score={idea.score} />
          </Card>
          <Card className="flex flex-col items-start gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
              Ease
            </span>
            <EasePill ease={idea.ease} />
          </Card>
        </div>
        {idea.score_breakdown && Object.keys(idea.score_breakdown).length > 0 && (
          <Card className="mt-2">
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-soft">
              Score breakdown
            </p>
            <ul className="flex flex-col gap-1">
              {Object.entries(idea.score_breakdown).map(([k, v]) => (
                <li key={k} className="flex items-center justify-between text-[13px]">
                  <span className="text-ink-soft">{k}</span>
                  <span className="font-mono text-ink">{String(v)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {easeFactors.length > 0 && (
          <Card className="mt-2">
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-soft">
              What lowered ease
            </p>
            <ul className="flex flex-col gap-1">
              {easeFactors.map((f) => (
                <li key={f} className="text-[13px] text-ink-soft">
                  – {f}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </Section>

      {isPipelineOwner(idea.owner) && (
        <Section title="Production">
          <div className="grid grid-cols-2 gap-2.5">
            <LabeledInput label="Format" value={format} onChange={setFormat} />
            <LabeledInput label="Editor" value={editor} onChange={setEditor} />
          </div>
          <button
            onClick={saveProduction}
            className="mt-2.5 self-start rounded-lg bg-accent px-3.5 py-2 text-[13px] font-medium text-bg"
          >
            Save
          </button>
        </Section>
      )}

      <Section title="Details">
        <div className="flex flex-col gap-2">
          <Collapsible title="Requirements">
            <div className="flex flex-col gap-3">
              <LabeledInput
                label="Locations (comma-separated)"
                value={(reqDraft.locations ?? []).join(", ")}
                onChange={(v) =>
                  setReqDraft({ ...reqDraft, locations: splitList(v) })
                }
              />
              <LabeledInput
                label="People besides Ben (comma-separated)"
                value={(reqDraft.people ?? []).join(", ")}
                onChange={(v) => setReqDraft({ ...reqDraft, people: splitList(v) })}
              />
              <LabeledInput
                label="Timing constraint"
                value={reqDraft.timing ?? ""}
                onChange={(v) => setReqDraft({ ...reqDraft, timing: v || null })}
              />
              <LabeledInput
                label="Props / scenes (comma-separated)"
                value={(reqDraft.props_or_scenes ?? []).join(", ")}
                onChange={(v) =>
                  setReqDraft({ ...reqDraft, props_or_scenes: splitList(v) })
                }
              />
              <label className="flex items-center gap-2 text-[13px] text-ink">
                <input
                  type="checkbox"
                  checked={!!reqDraft.multi_day}
                  onChange={(e) => setReqDraft({ ...reqDraft, multi_day: e.target.checked })}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                Multi-day filming
              </label>
              <button
                onClick={saveRequirements}
                className="self-start rounded-lg bg-accent px-3.5 py-2 text-[13px] font-medium text-bg"
              >
                Save requirements
              </button>
            </div>
          </Collapsible>

          <Collapsible title="Raw dump">
            <p className="whitespace-pre-wrap text-[13.5px] text-ink-soft">
              {idea.raw_dump || "—"}
            </p>
          </Collapsible>

          <Collapsible title="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              rows={4}
              className="w-full resize-none rounded-lg border border-line bg-bg p-2.5 text-[13.5px] text-ink focus:border-accent focus:outline-none"
              placeholder="Notes…"
            />
          </Collapsible>
        </div>
      </Section>

      <Section
        title="Packaging & script"
        action={
          <Segmented
            options={[
              { value: "packaging", label: "Packaging" },
              { value: "script", label: "Script" },
            ]}
            value={tab}
            onChange={setTab}
          />
        }
      >
        {tab === "packaging" ? (
          packaging.length === 0 ? (
            <p className="text-[13px] text-ink-soft">No packaging options yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {packaging.map((row) => (
                <Card key={row.id} onClick={() => togglePackaging(row)}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13.5px] text-ink">{row.body}</p>
                    {row.selected && <Pill tone="accent">Selected</Pill>}
                  </div>
                  <Pill>{row.kind}</Pill>
                </Card>
              ))}
            </div>
          )
        ) : latestScript ? (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <button
                onClick={readAloud}
                className="rounded-lg bg-accent px-3.5 py-2 text-[13px] font-medium text-bg"
              >
                Read it to me
              </button>
              <button
                onClick={stopReading}
                className="rounded-lg border border-line px-3.5 py-2 text-[13px] text-ink-soft"
              >
                Stop
              </button>
              <span className="font-mono text-[10.5px] uppercase tracking-widest text-ink-soft">
                v{latestScript.version}
              </span>
            </div>
            <Card>
              <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink">
                {latestScript.body}
              </p>
            </Card>
          </div>
        ) : (
          <p className="text-[13px] text-ink-soft">No script yet.</p>
        )}
      </Section>

      {isPipelineOwner(idea.owner) && (
        <Section title="Stage">
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map((s) => (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={`rounded-full border px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-wide ${
                  idea.stage === s
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line text-ink-soft"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function describeEaseFactors(req: Requirements): string[] {
  const factors: string[] = [];
  if ((req.locations?.length ?? 0) > 1) factors.push("More than one location");
  if ((req.people?.length ?? 0) > 0) factors.push("Requires people besides Ben");
  if (req.timing) factors.push(`Timing constraint: ${req.timing}`);
  if ((req.props_or_scenes?.length ?? 0) > 0) factors.push("Props or scenes need arranging");
  if (req.multi_day) factors.push("Multi-day filming");
  return factors;
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-line bg-bg px-2.5 py-2 text-[13.5px] text-ink focus:border-accent focus:outline-none"
      />
    </label>
  );
}
