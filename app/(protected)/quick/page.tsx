"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader, Section, Card, Pill, Segmented, Checkbox } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import type { ContentIdea } from "@/lib/types";

type GroupBy = "location" | "owner";

export default function QuickPage() {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<GroupBy>("location");

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("content_ideas")
      .select("*")
      // Personal and Blackout have real stage pipelines now (see Board) —
      // Quick is everything else (IG/client jots), not just mode="quick".
      .not("owner", "in", "(Personal,Blackout)")
      .order("created_at", { ascending: false });
    setIdeas((data as ContentIdea[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const toggleFilmed = async (idea: ContentIdea) => {
    const supabase = createClient();
    const filmed_at = idea.filmed_at ? null : new Date().toISOString();
    setIdeas((prev) => prev.map((i) => (i.id === idea.id ? { ...i, filmed_at } : i)));
    await supabase.from("content_ideas").update({ filmed_at }).eq("id", idea.id);
  };

  const groups = useMemo(() => {
    const key = (i: ContentIdea) =>
      groupBy === "location" ? i.location_tag || "Unassigned" : i.owner || "Unassigned";
    const map = new Map<string, ContentIdea[]>();
    for (const idea of ideas) {
      const k = key(idea);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(idea);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [ideas, groupBy]);

  return (
    <div>
      <PageHeader eyebrow="IG / Client" title="Quick list" subtitle="Jot, batch, film. Fast." />
      <Section title="Group by">
        <Segmented
          options={[
            { value: "location", label: "Location" },
            { value: "owner", label: "Owner" },
          ]}
          value={groupBy}
          onChange={setGroupBy}
        />
      </Section>

      {loading ? (
        <Section title="Ideas">
          <p className="text-[13px] text-ink-soft">Loading…</p>
        </Section>
      ) : groups.length === 0 ? (
        <Section title="Ideas">
          <p className="text-[13px] text-ink-soft">Nothing here yet.</p>
        </Section>
      ) : (
        groups.map(([group, items]) => (
          <Section key={group} title={`${group} (${items.length})`}>
            <div className="flex flex-col gap-2">
              {items.map((idea) => (
                <Card key={idea.id} className="flex items-center gap-3">
                  <Checkbox checked={!!idea.filmed_at} onChange={() => toggleFilmed(idea)} />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-[14px] font-medium leading-snug ${
                        idea.filmed_at ? "text-ink-soft line-through" : "text-ink"
                      }`}
                    >
                      {idea.premise}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Pill>{idea.owner}</Pill>
                      {idea.rank && <Pill tone="warm">Rank {idea.rank}</Pill>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        ))
      )}
    </div>
  );
}
