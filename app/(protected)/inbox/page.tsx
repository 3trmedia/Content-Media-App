"use client";

import { useEffect, useState } from "react";
import { PageHeader, Section, Card, Pill } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import type { ContentInbox } from "@/lib/types";

export default function InboxPage() {
  const [rows, setRows] = useState<ContentInbox[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("content_inbox")
      .select("*")
      .in("status", ["unprocessed", "failed"])
      .order("created_at", { ascending: false });
    setRows((data as ContentInbox[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const retry = async (row: ContentInbox) => {
    const supabase = createClient();
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, status: "unprocessed" } : r))
    );
    // n8n picks this back up — the app never processes it itself.
    await supabase
      .from("content_inbox")
      .update({ status: "unprocessed", processed_at: null })
      .eq("id", row.id);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Capture"
        title="Inbox"
        subtitle="Waiting on n8n to process into ideas."
      />
      <Section title={`Unprocessed (${rows.length})`}>
        {loading ? (
          <p className="text-[13px] text-ink-soft">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-[13px] text-ink-soft">Nothing waiting. Inbox is clear.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((row) => (
              <Card key={row.id}>
                <p className="text-[14px] leading-snug text-ink">{row.raw_text}</p>
                <div className="mt-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Pill tone={row.status === "failed" ? "danger" : "neutral"}>
                      {row.status}
                    </Pill>
                    <Pill>{row.source}</Pill>
                  </div>
                  {row.status === "failed" && (
                    <button
                      onClick={() => retry(row)}
                      className="rounded-lg border border-line px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-wide text-accent"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
