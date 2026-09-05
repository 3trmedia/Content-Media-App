"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader, Section, Card, Pill, Segmented } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import type { ContentClient, ContentInbox, ContentType } from "@/lib/types";

const TYPE_LABELS: Record<ContentType, string> = {
  hook: "Hook",
  video_idea: "Video idea",
  ad_creative: "Ad creative",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<ContentClient[]>([]);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [rows, setRows] = useState<ContentInbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingClient, setAddingClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");

  const [text, setText] = useState("");
  const [contentType, setContentType] = useState<ContentType>("hook");
  const [saving, setSaving] = useState(false);

  const loadClients = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("content_clients")
      .select("*")
      .eq("active", true)
      .order("last_active_at", { ascending: false, nullsFirst: false })
      .order("name", { ascending: true });
    const list = (data as ContentClient[]) ?? [];
    setClients(list);
    setActiveClientId((prev) => prev ?? list[0]?.id ?? null);
  };

  const loadRows = async (clientId: string) => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("content_inbox")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
    setRows((data as ContentInbox[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadClients();
  }, []);

  useEffect(() => {
    if (activeClientId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadRows(activeClientId);
    }
  }, [activeClientId]);

  const activeClient = useMemo(
    () => clients.find((c) => c.id === activeClientId) ?? null,
    [clients, activeClientId]
  );

  const submit = async () => {
    const raw_text = text.trim();
    if (!raw_text || !activeClientId || saving) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("content_inbox").insert({
      raw_text,
      source: "app",
      status: "unprocessed",
      client_id: activeClientId,
      content_type: contentType,
    });
    if (!error) {
      const last_active_at = new Date().toISOString();
      await supabase.from("content_clients").update({ last_active_at }).eq("id", activeClientId);
      setText("");
      loadRows(activeClientId);
      loadClients();
    }
    setSaving(false);
  };

  const addClient = async () => {
    const name = newClientName.trim();
    if (!name) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("content_clients")
      .insert({ name, last_active_at: new Date().toISOString() })
      .select()
      .single();
    if (!error && data) {
      setNewClientName("");
      setAddingClient(false);
      setActiveClientId((data as ContentClient).id);
      loadClients();
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Clients" title="Client ideas" subtitle="Hooks, video ideas, and ad creative — jotted per client." />

      <Section
        title="Clients"
        action={
          <button
            onClick={() => setAddingClient((v) => !v)}
            className="font-mono text-[10.5px] uppercase tracking-wide text-accent"
          >
            {addingClient ? "Cancel" : "+ Add"}
          </button>
        }
      >
        {addingClient && (
          <div className="mb-2.5 flex items-center gap-2">
            <input
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addClient()}
              placeholder="Client name…"
              autoFocus
              className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none"
            />
            <button
              onClick={addClient}
              disabled={!newClientName.trim()}
              className="shrink-0 rounded-lg bg-accent/90 px-3.5 py-2 text-[13px] font-medium text-bg disabled:opacity-40"
            >
              Save
            </button>
          </div>
        )}
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
          {clients.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveClientId(c.id)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                c.id === activeClientId
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line bg-surface text-ink-soft"
              }`}
            >
              {c.name}
            </button>
          ))}
          {clients.length === 0 && !addingClient && (
            <p className="text-[13px] text-ink-soft">No clients yet — add one.</p>
          )}
        </div>
      </Section>

      {activeClient && (
        <>
          <Section title={`Jot for ${activeClient.name}`}>
            <div className="flex flex-col gap-2">
              <Segmented
                options={[
                  { value: "hook", label: "Hook" },
                  { value: "video_idea", label: "Video idea" },
                  { value: "ad_creative", label: "Ad creative" },
                ]}
                value={contentType}
                onChange={setContentType}
              />
              <div className="flex items-center gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Jot it down…"
                  className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none"
                />
                <button
                  onClick={submit}
                  disabled={!text.trim() || saving}
                  className="shrink-0 rounded-lg bg-accent/90 px-3.5 py-2 text-[13px] font-medium text-bg disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            </div>
          </Section>

          <Section title={`Ideas (${rows.length})`}>
            {loading ? (
              <p className="text-[13px] text-ink-soft">Loading…</p>
            ) : rows.length === 0 ? (
              <p className="text-[13px] text-ink-soft">Nothing jotted yet for {activeClient.name}.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {rows.map((row) => (
                  <Card key={row.id}>
                    <p className="text-[14px] leading-snug text-ink">{row.raw_text}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      {row.content_type && <Pill tone="accent">{TYPE_LABELS[row.content_type]}</Pill>}
                      <Pill tone={row.status === "failed" ? "danger" : "neutral"}>{row.status}</Pill>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
