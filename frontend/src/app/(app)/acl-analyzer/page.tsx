"use client";

import { useMemo, useState } from "react";

type Mechanism = "pivot_twist" | "contact" | "noncontact_jump" | "unknown";
type WeightBearing = "normal" | "painful" | "unable";

const DEFAULT_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

export default function AclAnalyzerPage() {
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL);
  const [video, setVideo] = useState<File | null>(null);

  const [mechanism, setMechanism] = useState<Mechanism>("pivot_twist");
  const [heardPop, setHeardPop] = useState(false);
  const [rapidSwelling, setRapidSwelling] = useState(false);
  const [instability, setInstability] = useState(false);
  const [locking, setLocking] = useState(false);
  const [weightBearing, setWeightBearing] = useState<WeightBearing>("painful");
  const [pain, setPain] = useState<number>(7);
  const [hoursSince, setHoursSince] = useState<number>(24);
  const [notes, setNotes] = useState("");

  const [startSec, setStartSec] = useState<number>(0);
  const [durationSec, setDurationSec] = useState<number>(8);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultJson, setResultJson] = useState<string | null>(null);

  const intakeJson = useMemo(
    () =>
      JSON.stringify({
        mechanism,
        heard_pop: heardPop,
        immediate_swelling_within_2h: rapidSwelling,
        instability_giving_way: instability,
        locking_catching: locking,
        weight_bearing: weightBearing,
        pain_0_10: pain,
        hours_since_injury: hoursSince,
        notes: notes || undefined,
      }),
    [
      mechanism,
      heardPop,
      rapidSwelling,
      instability,
      locking,
      weightBearing,
      pain,
      hoursSince,
      notes,
    ],
  );

  const videoInputJson = useMemo(
    () =>
      JSON.stringify({
        start_sec: startSec,
        duration_sec: durationSec,
      }),
    [startSec, durationSec],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResultJson(null);

    if (!video) {
      setError("Please choose a video file (mp4/mov/avi/mkv/webm).");
      return;
    }

    setPending(true);
    try {
      const form = new FormData();
      form.append("video", video);
      form.append("text_intake_json", intakeJson);
      form.append("video_input_json", videoInputJson);

      const normalized = backendUrl.replace(/\/+$/, "");
      const res = await fetch(`${normalized}/analyze/acl`, {
        method: "POST",
        body: form,
      });

      const text = await res.text();
      if (!res.ok) {
        try {
          const parsed = JSON.parse(text);
          const detail =
            typeof parsed?.detail === "string"
              ? parsed.detail
              : JSON.stringify(parsed);
          setError(`Backend error ${res.status}: ${detail}`);
        } catch {
          setError(`Backend error ${res.status}: ${text}`);
        }
        return;
      }

      try {
        const parsed = JSON.parse(text);
        setResultJson(JSON.stringify(parsed, null, 2));
      } catch {
        setResultJson(text);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">ACL Analyzer</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Upload a short clip and structured intake. This is decision support, not a diagnosis.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Backend URL">
            <input
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            />
          </Field>

          <Field label="Video file">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Mechanism">
            <select
              value={mechanism}
              onChange={(e) => setMechanism(e.target.value as Mechanism)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              <option value="pivot_twist">Pivot / twist</option>
              <option value="noncontact_jump">Non-contact jump / landing</option>
              <option value="contact">Contact</option>
              <option value="unknown">Unknown</option>
            </select>
          </Field>

          <Field label="Weight bearing">
            <select
              value={weightBearing}
              onChange={(e) => setWeightBearing(e.target.value as WeightBearing)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              <option value="normal">Normal</option>
              <option value="painful">Painful</option>
              <option value="unable">Unable</option>
            </select>
          </Field>

          <Field label="Pain (0–10)">
            <input
              type="number"
              min={0}
              max={10}
              value={pain}
              onChange={(e) => setPain(Number(e.target.value))}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Hours since injury">
            <input
              type="number"
              min={0}
              value={hoursSince}
              onChange={(e) => setHoursSince(Number(e.target.value))}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Clip start (sec)">
            <input
              type="number"
              min={0}
              value={startSec}
              onChange={(e) => setStartSec(Number(e.target.value))}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Clip duration (sec)">
            <input
              type="number"
              min={2}
              max={20}
              value={durationSec}
              onChange={(e) => setDurationSec(Number(e.target.value))}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            />
          </Field>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Toggle label="Heard a pop" value={heardPop} onChange={setHeardPop} />
          <Toggle
            label="Rapid swelling (≤2 hours)"
            value={rapidSwelling}
            onChange={setRapidSwelling}
          />
          <Toggle label="Instability / giving way" value={instability} onChange={setInstability} />
          <Toggle label="Locking / catching" value={locking} onChange={setLocking} />
        </div>

        <div className="mt-4">
          <Field label="Notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else relevant (where it hurts, what movement causes it, etc.)"
              className="min-h-20 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            />
          </Field>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Analyzing…" : "Analyze ACL"}
        </button>
      </form>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-[var(--muted)]">Result</h2>
        <pre className="mt-2 overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-xs leading-relaxed">
          {resultJson ?? "Submit a video to see JSON output here."}
        </pre>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2">
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[var(--accent)]"
      />
    </label>
  );
}

