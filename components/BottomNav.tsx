"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const TABS = [
  { href: "/clients", label: "Clients", icon: IconClients },
  { href: "/pipeline", label: "Pipeline", icon: IconBoard },
  { href: "/batch", label: "Batch", icon: IconQuick },
  { href: "/inbox", label: "Inbox", icon: IconInbox },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const [unprocessedCount, setUnprocessedCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const load = async () => {
      const { count } = await supabase
        .from("content_inbox")
        .select("id", { count: "exact", head: true })
        .in("status", ["unprocessed", "failed"]);
      if (!cancelled) setUnprocessedCount(count ?? 0);
    };

    load();
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pathname]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t border-line bg-surface/95 backdrop-blur">
      <ul className="grid grid-cols-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                className="relative flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium"
              >
                <Icon className={active ? "text-accent" : "text-ink-soft"} />
                <span className={active ? "text-accent" : "text-ink-soft"}>{label}</span>
                {href === "/inbox" && unprocessedCount > 0 && (
                  <span className="absolute right-[22%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 font-mono text-[9px] text-ink">
                    {unprocessedCount > 99 ? "99+" : unprocessedCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

type IconProps = { className?: string };

function IconBoard({ className }: IconProps) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="4" width="17" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 4V20" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 8H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 12H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconQuick({ className }: IconProps) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M13 3L4.5 13.5H11l-1 7.5L19 10.5H12.5L13 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClients({ className }: IconProps) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M3.5 19.5c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="17" cy="8.5" r="2.3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M15.5 14.3c2.4.3 4.3 2.3 4.5 4.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconInbox({ className }: IconProps) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 12.5V18a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 18v-5.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4 12.5h4.2l1.3 2.2h4.9l1.3-2.2H20L16.4 5.6A1.5 1.5 0 0 0 15 4.7H9a1.5 1.5 0 0 0-1.4.9L4 12.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
