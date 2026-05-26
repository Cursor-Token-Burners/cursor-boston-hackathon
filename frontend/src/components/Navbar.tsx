"use client";

import { Bell, Menu, Search } from "lucide-react";

export default function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
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

      <div className="flex items-center gap-2">
        <div className="grid size-8 place-items-center rounded-md bg-[var(--accent)] text-sm font-bold text-white">
          A
        </div>
        <span className="text-base font-semibold tracking-tight">AthletesHub</span>
      </div>

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

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-md p-2 text-[var(--muted)] hover:bg-black/5 hover:text-[var(--foreground)] dark:hover:bg-white/5"
        >
          <Bell className="size-5" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[var(--accent)]" />
        </button>
        <div
          aria-label="Profile"
          className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-600 text-xs font-semibold text-white"
        >
          JH
        </div>
      </div>
    </header>
  );
}
