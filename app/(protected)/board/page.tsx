"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Section, Card, Pill, Segmented, ScorePill, EasePill } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import type { ContentIdea, Stage } from "@/lib/types";

type SortKey = "score" | "recent" | "ease";
type FilterKey = "active" | "all" | Stage;

const FILTERS: { value: FilterKey; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "all", label: "All" },
  { value: "idea", label: "Idea" },
  { value: "packaged", label: "Packaged" },
  { value: "scripted", label: "Scripted" },
  { value: "filmed", label: "Filmed" },
  { value: "editing", label: "Editing" },
  { value: "posted", label: "Posted" },
];

export default function BoardPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("score");
  const [filter, setFilter] = useState<FilterKey>("active");

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("content_ideas")
        .select("*")
        .eq("mode", "youtube")
        .order("created_at", { ascending: false });
      setIdeas((data as ContentIdea[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let rows = ideas;
    if (filter === "active") rows = rows.filter((i) => i.stage === "idea" || i.stage === "packaged");
    else if (filter !== "all") rows = rows.filter((i) => i.stage === filter);

    const sorted = [...rows];
    if (sort === "score") sorted.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    else if (sort === "ease") sorted.sort((a, b) => (b.ease ?? -1) - (a.ease ?? -1));
    else sorted.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    return sorted;
  }, [ideas, filter, sort]);

  return (
    <div>
      <PageHeader eyebrow="dpbenb" title="Board" subtitle="YouTube pipeline, idea to posted." />
      <Section title="Sort">
        <Segmented
          options={[
            { value: "score", label: "Score" },
            { value: "recent", label: "Recent" },
            { value: "ease", label: "Ease" },
          ]}
          value={sort}
          onChange={setSort}
        />
      </Section>
      <Section title="Filter">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wide ${
                filter === f.value
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line text-ink-soft"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Section>
      <Section title={`Ideas (${filtered.length})`}>
        {loading ? (
          <p className="text-[13px] text-ink-soft">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-[13px] text-ink-soft">Nothing here yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((idea) => (
              <Card key={idea.id} onClick={() => router.push(`/ideas/${idea.id}`)}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[14px] font-medium leading-snug text-ink">{idea.premise}</p>
                  <ScorePill score={idea.score} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Pill tone="accent">{idea.stage}</Pill>
                  <EasePill ease={idea.ease} />
                  <Pill>{idea.owner}</Pill>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
