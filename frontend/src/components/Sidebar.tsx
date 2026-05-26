"use client";

import {
  Activity,
  CalendarDays,
  ChevronLeft,
  LayoutDashboard,
  LineChart,
  MessageSquare,
  Settings,
  Trophy,
  Users,
  Utensils,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

const nav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Athletes", icon: Users, active: true },
  { label: "Teams", icon: Trophy },
  { label: "Schedule", icon: CalendarDays },
  { label: "Training Plans", icon: Activity },
  { label: "Performance Stats", icon: LineChart },
  { label: "Nutrition", icon: Utensils },
  { label: "Messages", icon: MessageSquare },
  { label: "Settings", icon: Settings },
];

export default function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      aria-label="Primary"
      className={`sticky top-16 h-[calc(100vh-4rem)] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] transition-[width] duration-200 ease-out ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex h-full flex-col">
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <ul className="flex flex-col gap-1">
            {nav.map(({ label, icon: Icon, active }) => (
              <li key={label}>
                <a
                  href="#"
                  title={collapsed ? label : undefined}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-[var(--accent)]/10 text-[var(--accent)] font-medium"
                      : "text-[var(--muted)] hover:bg-black/5 hover:text-[var(--foreground)] dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className="size-5 shrink-0" />
                  <span
                    className={`truncate transition-opacity ${
                      collapsed ? "pointer-events-none opacity-0" : "opacity-100"
                    }`}
                  >
                    {label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex items-center justify-center gap-2 border-t border-[var(--border)] px-3 py-3 text-sm text-[var(--muted)] hover:bg-black/5 hover:text-[var(--foreground)] dark:hover:bg-white/5"
        >
          <ChevronLeft
            className={`size-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
