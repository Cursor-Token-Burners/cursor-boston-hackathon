"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Role = "coach" | "athlete";

const ROLES: {
  value: Role;
  title: string;
  tagline: string;
  icon: string;
  destination: string;
  cta: string;
}[] = [
  {
    value: "coach",
    title: "Coach",
    tagline: "See your whole roster. Catch injuries before they become seasons-enders.",
    icon: "📋",
    destination: "/dashboard",
    cta: "Open the coach dashboard",
  },
  {
    value: "athlete",
    title: "Athlete",
    tagline: "Log how you feel in plain words. No medical vocabulary needed.",
    icon: "🏃",
    destination: "/checkin",
    cta: "Do a daily check-in",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [pending, setPending] = useState<Role | null>(null);

  const enter = (role: Role, destination: string) => {
    setPending(role);
    router.push(destination);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <header className="mb-10 text-center">
          <p className="mb-3 inline-block rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">
            Live demo · no account needed
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            FieldBack
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            Athlete injury triage for team sports. Athletes describe what hurts
            in their own words, coaches see the roster-wide picture. Built at
            the Cursor Boston Sports Hack.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              data-tour={`role-${r.value}`}
              onClick={() => enter(r.value, r.destination)}
              disabled={pending !== null}
              className="group flex flex-col items-start gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-md disabled:opacity-60"
            >
              <span className="text-3xl leading-none">{r.icon}</span>
              <span className="mt-1 text-lg font-semibold">{r.title}</span>
              <span className="text-xs leading-relaxed text-[var(--muted)]">
                {r.tagline}
              </span>
              <span className="mt-2 text-sm font-medium text-[var(--accent)]">
                {pending === r.value ? "Entering…" : `${r.cta} →`}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-[11px] text-[var(--muted)]">
          Everything here is mock data — nothing is stored, no backend is
          called.
        </p>
      </div>
    </div>
  );
}
