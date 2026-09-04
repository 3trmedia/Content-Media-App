"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Persistent capture bar, pinned at the top of every protected page. Just
// text in, row into content_inbox. n8n (not this app) does the processing.
export default function Capture() {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(false);

  const submit = async () => {
    const raw_text = text.trim();
    if (!raw_text || saving) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("content_inbox")
      .insert({ raw_text, source: "app", status: "unprocessed" });
    setSaving(false);
    if (!error) {
      setText("");
      setFlash(true);
      setTimeout(() => setFlash(false), 900);
    }
  };

  return (
    <div className="sticky top-0 z-40 border-b border-line bg-surface/95 px-4 py-2.5 backdrop-blur">
      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Jot an idea…"
          className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none"
        />
        <button
          onClick={submit}
          disabled={!text.trim() || saving}
          className={`shrink-0 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors ${
            flash ? "bg-accent text-bg" : "bg-accent/90 text-bg disabled:opacity-40"
          }`}
        >
          {flash ? "Added" : "Add"}
        </button>
      </div>
    </div>
  );
}
