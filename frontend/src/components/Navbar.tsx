"use client";

import { Bell, LogOut, Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type OpenMenu = "notifications" | "profile" | null;

const MOCK_NOTIFICATIONS: {
  id: string;
  title: string;
  meta: string;
  time: string;
  unread?: boolean;
}[] = [
  {
    id: "1",
    title: "Marcus Allen submitted a check-in",
    meta: "Thighs · sore after practice",
    time: "2m ago",
    unread: true,
  },
  {
    id: "2",
    title: "Sarah Chen flagged a recurring knee issue",
    meta: "3rd report this month",
    time: "1h ago",
    unread: true,
  },
  {
    id: "3",
    title: "Weekly performance report is ready",
    meta: "12 athletes · 4 trends to review",
    time: "Yesterday",
  },
];

const MOCK_USER = {
  name: "Justin Hong",
  role: "Head Coach · Football",
  email: "justin@fieldback.app",
  initials: "JH",
};

export default function Navbar({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState<OpenMenu>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (which: Exclude<OpenMenu, null>) =>
    setOpen((cur) => (cur === which ? null : which));

  const logout = () => {
    setOpen(null);
    router.push("/");
  };

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6">
      <button
        type="button"
        aria-label="Toggle sidebar"
        onClick={onToggleSidebar}
        className="rounded-md p-2 text-[var(--muted)] hover:bg-black/5 hover:text-[var(--foreground)] dark:hover:bg-white/5"
      >
        <Menu className="size-5" />
      </button>

      <span className="text-base font-semibold tracking-tight">FieldBack</span>

      <div className="ml-4 hidden flex-1 max-w-md md:block">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="search"
            placeholder="Search athletes, teams, events…"
            className="h-9 w-full rounded-full border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          />
        </label>
      </div>

      <div ref={wrapRef} className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={open === "notifications"}
            onClick={() => toggle("notifications")}
            className="relative rounded-md p-2 text-[var(--muted)] hover:bg-black/5 hover:text-[var(--foreground)] dark:hover:bg-white/5"
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[var(--accent)]" />
            )}
          </button>

          {open === "notifications" && (
            <div
              role="dialog"
              aria-label="Notifications"
              className="absolute right-0 top-full mt-2 w-[22rem] origin-top-right rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg ring-1 ring-black/5"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                <h2 className="text-sm font-semibold">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <ul className="max-h-96 overflow-y-auto">
                {MOCK_NOTIFICATIONS.map((n) => (
                  <li
                    key={n.id}
                    className="border-b border-[var(--border)] last:border-b-0"
                  >
                    <button
                      type="button"
                      className="block w-full px-4 py-3 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <div className="flex items-start gap-2">
                        {n.unread && (
                          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--accent)]" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {n.title}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                            {n.meta}
                          </p>
                        </div>
                        <span className="shrink-0 text-[11px] text-[var(--muted)]">
                          {n.time}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-[var(--border)] px-4 py-2.5 text-center">
                <button
                  type="button"
                  className="text-xs font-medium text-[var(--accent)] hover:underline"
                >
                  View all activity
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="Account menu"
            aria-expanded={open === "profile"}
            onClick={() => toggle("profile")}
            className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-600 text-xs font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
          >
            {MOCK_USER.initials}
          </button>

          {open === "profile" && (
            <div
              role="dialog"
              aria-label="Account"
              className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg ring-1 ring-black/5"
            >
              <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3.5">
                <div className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-600 text-sm font-semibold text-white">
                  {MOCK_USER.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {MOCK_USER.name}
                  </p>
                  <p className="truncate text-[11px] text-[var(--muted)]">
                    {MOCK_USER.role}
                  </p>
                </div>
              </div>
              <div className="px-4 py-2 text-[11px] text-[var(--muted)]">
                Signed in as{" "}
                <span className="font-medium text-[var(--foreground)]">
                  {MOCK_USER.email}
                </span>
              </div>
              <div className="border-t border-[var(--border)] p-1">
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--foreground)] transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <LogOut className="size-4 text-[var(--muted)]" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
