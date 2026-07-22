"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type PainLevel = 1 | 2 | 3 | 4 | 5;
type WhenStarted = "today" | "yesterday" | "few-days" | "week" | "longer";

const BODY_PARTS = [
  "Head",
  "Neck",
  "Shoulder",
  "Back",
  "Chest",
  "Arm",
  "Elbow",
  "Wrist",
  "Hip",
  "Thigh",
  "Knee",
  "Shin",
  "Ankle",
  "Foot",
];

const PAIN_FACES: Record<PainLevel, { face: string; label: string }> = {
  1: { face: "🙂", label: "Barely" },
  2: { face: "😐", label: "Mild" },
  3: { face: "😕", label: "Sore" },
  4: { face: "😣", label: "Hurts" },
  5: { face: "😫", label: "Bad" },
};

const WHEN_OPTIONS: { value: WhenStarted; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "few-days", label: "A few days ago" },
  { value: "week", label: "About a week ago" },
  { value: "longer", label: "Longer" },
];

type Result = {
  description: string;
  parts: string[];
  pain: PainLevel | null;
  when: WhenStarted | null;
  videoName: string | null;
};

export default function CheckinPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [parts, setParts] = useState<string[]>([]);
  const [pain, setPain] = useState<PainLevel | null>(null);
  const [when, setWhen] = useState<WhenStarted | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const togglePart = (part: string) => {
    setParts((prev) =>
      prev.includes(part) ? prev.filter((p) => p !== part) : [...prev, part],
    );
    textareaRef.current?.focus();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && parts.length === 0) return;
    setResult({ description: description.trim(), parts, pain, when, videoName });
  };

  const reset = () => {
    setDescription("");
    setParts([]);
    setPain(null);
    setWhen(null);
    setVideoName(null);
    setResult(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
    textareaRef.current?.focus();
  };

  const canSubmit = description.trim().length > 0 || parts.length > 0;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            data-tour="checkin-logout"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            <LogOut className="size-3.5" />
            Log out
          </button>
        </div>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          How are you feeling?
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Tell us in your own words. No medical terms needed — just say what hurts.
        </p>
      </header>

      {result ? (
        <ResultCard result={result} onReset={reset} />
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <section>
            <label
              htmlFor="symptoms"
              className="mb-2 block text-sm font-medium"
            >
              What hurts?
            </label>
            <textarea
              id="symptoms"
              ref={textareaRef}
              data-tour="symptoms"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. my thighs hurt after practice, kind of a dull ache"
              rows={5}
              autoFocus
              className="w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-lg leading-relaxed outline-none transition-colors placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)]"
            />
            <p className="mt-1.5 text-xs text-[var(--muted)]">
              Plain language is best. Don&apos;t worry about being precise.
            </p>
          </section>

          <section>
            <p className="mb-2 text-sm font-medium">
              Or tap where it hurts{" "}
              <span className="text-[var(--muted)] font-normal">(optional)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {BODY_PARTS.map((part) => {
                const active = parts.includes(part);
                return (
                  <button
                    key={part}
                    type="button"
                    data-tour={part === "Knee" ? "body-knee" : undefined}
                    onClick={() => togglePart(part)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                      active
                        ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--accent)]/60"
                    }`}
                  >
                    {part}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <p className="mb-2 text-sm font-medium">
              How bad is it?{" "}
              <span className="text-[var(--muted)] font-normal">(optional)</span>
            </p>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(PAIN_FACES) as unknown as PainLevel[])
                .map(Number)
                .filter((n): n is PainLevel => n >= 1 && n <= 5)
                .map((level) => {
                  const { face, label } = PAIN_FACES[level];
                  const active = pain === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPain(active ? null : level)}
                      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 transition-colors ${
                        active
                          ? "border-[var(--accent)] bg-[var(--accent)]/10"
                          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/60"
                      }`}
                    >
                      <span className="text-2xl leading-none">{face}</span>
                      <span className="text-[11px] text-[var(--muted)]">
                        {label}
                      </span>
                    </button>
                  );
                })}
            </div>
          </section>

          <section>
            <p className="mb-2 text-sm font-medium">
              When did it start?{" "}
              <span className="text-[var(--muted)] font-normal">(optional)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {WHEN_OPTIONS.map(({ value, label }) => {
                const active = when === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setWhen(active ? null : value)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--accent)]/60"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          <details className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)]/40 px-4 py-3">
            <summary className="cursor-pointer text-sm text-[var(--muted)]">
              Add a video {videoName && <span className="ml-1">· {videoName}</span>}
            </summary>
            <div className="mt-3 flex items-center gap-3">
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => setVideoName(e.target.files?.[0]?.name ?? null)}
                className="block w-full text-xs text-[var(--muted)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--accent)]/10 file:px-3 file:py-1.5 file:text-xs file:text-[var(--accent)] hover:file:bg-[var(--accent)]/20"
              />
              {videoName && (
                <button
                  type="button"
                  onClick={() => {
                    setVideoName(null);
                    if (videoInputRef.current) videoInputRef.current.value = "";
                  }}
                  className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="mt-2 text-[11px] text-[var(--muted)]">
              Useful for showing range-of-motion or how a movement feels off.
            </p>
          </details>

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-xs text-[var(--muted)]">
              Your trainer will see this. AI suggestions are not medical advice.
            </p>
            <button
              type="submit"
              data-tour="send-checkin"
              disabled={!canSubmit}
              className="rounded-xl bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </form>
      )}
      </div>
    </div>
  );
}

function ResultCard({ result, onReset }: { result: Result; onReset: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div
        data-tour="checkin-result"
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-block size-2 rounded-full bg-[var(--accent)]" />
          <h2 className="text-sm font-semibold tracking-tight">
            Thanks — we got it
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          A trainer will follow up. In the meantime, here&apos;s what our
          assistant picked up from what you shared:
        </p>

        <dl className="mt-4 flex flex-col gap-2 text-sm">
          {result.description && (
            <Row label="You said">
              <span className="italic">&ldquo;{result.description}&rdquo;</span>
            </Row>
          )}
          {result.parts.length > 0 && (
            <Row label="Areas">{result.parts.join(", ")}</Row>
          )}
          {result.pain && (
            <Row label="Pain">
              {PAIN_FACES[result.pain].face} {PAIN_FACES[result.pain].label}
            </Row>
          )}
          {result.when && (
            <Row label="Started">
              {WHEN_OPTIONS.find((o) => o.value === result.when)?.label}
            </Row>
          )}
          {result.videoName && <Row label="Video">{result.videoName}</Row>}
        </dl>
      </div>

      <div className="rounded-2xl border border-dashed border-[var(--accent)]/40 bg-[var(--accent)]/5 p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-md bg-[var(--accent)]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
            AI · placeholder
          </span>
        </div>
        <p className="text-sm leading-relaxed">
          Diagnosis from injury history + symptoms will appear here once the
          model is wired up.
        </p>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="self-start text-sm text-[var(--muted)] underline-offset-4 hover:text-[var(--foreground)] hover:underline"
      >
        Submit another
      </button>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-[var(--border)] py-1.5 last:border-b-0">
      <dt className="text-xs uppercase tracking-wider text-[var(--muted)]">
        {label}
      </dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
