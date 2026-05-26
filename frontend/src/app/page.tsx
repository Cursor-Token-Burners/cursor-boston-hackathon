"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Mode = "signin" | "signup";
type Role = "coach" | "athlete";

const ROLES: { value: Role; title: string; tagline: string; icon: string }[] = [
  {
    value: "athlete",
    title: "Athlete",
    tagline: "Log how you feel. Track your body.",
    icon: "🏃",
  },
  {
    value: "coach",
    title: "Coach",
    tagline: "See your roster. Catch issues early.",
    icon: "📋",
  },
];

const DESTINATION: Record<Role, string> = {
  coach: "/dashboard",
  athlete: "/checkin",
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [role, setRole] = useState<Role>("athlete");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    router.push(DESTINATION[role]);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            {mode === "signin" ? "Sign in" : "Create an account"}
          </h1>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            {mode === "signin"
              ? "Pick your role and continue."
              : "Tell us who you are to get started."}
          </p>
        </header>

        <div className="mb-5 grid grid-cols-2 gap-3">
          {ROLES.map((r) => {
            const active = role === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                aria-pressed={active}
                className={`flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent)]/5 shadow-sm"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/60"
                }`}
              >
                <span className="text-2xl leading-none">{r.icon}</span>
                <span className="mt-1 text-sm font-semibold">{r.title}</span>
                <span className="text-[11px] leading-snug text-[var(--muted)]">
                  {r.tagline}
                </span>
              </button>
            );
          })}
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
        >
          <div className="mb-4 flex rounded-lg border border-[var(--border)] bg-[var(--background)] p-0.5 text-sm">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 rounded-md px-3 py-1.5 transition-colors ${
                  mode === m
                    ? "bg-[var(--surface)] font-medium shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {mode === "signup" && (
              <Field label="Name">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  autoComplete="name"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none transition-colors placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)]"
                />
              </Field>
            )}

            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@team.com"
                autoComplete="email"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none transition-colors placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)]"
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none transition-colors placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)]"
              />
            </Field>

            {mode === "signin" && (
              <div className="-mt-1 text-right">
                <button
                  type="button"
                  className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-5 w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending
              ? "Signing in…"
              : `${mode === "signin" ? "Continue" : "Create account"} as ${
                  role === "coach" ? "Coach" : "Athlete"
                }`}
          </button>

          <p className="mt-3 text-center text-[11px] text-[var(--muted)]">
            Mock auth — any input works.
          </p>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          {mode === "signin" ? (
            <>
              New here?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="font-medium text-[var(--foreground)] underline-offset-4 hover:underline"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have one?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="font-medium text-[var(--foreground)] underline-offset-4 hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}
