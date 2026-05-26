import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { rosters, type Athlete } from "@/data/athletes";
import { getMeasurements, getSportFromId } from "@/data/measurements";
import AthleteSilhouette from "@/components/AthleteSilhouette";

function findAthlete(id: string): { athlete: Athlete; sport: string } | null {
  for (const roster of rosters) {
    const athlete = roster.athletes.find((a) => a.id === id);
    if (athlete) return { athlete, sport: roster.sport };
  }
  return null;
}

const sportAccent: Record<string, string> = {
  Football: "#f97316",
  Soccer: "#22c55e",
  Swimming: "#0ea5e9",
};

export async function generateStaticParams() {
  return rosters.flatMap((r) => r.athletes.map((a) => ({ id: a.id })));
}

export default async function AthletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const found = findAthlete(id);
  if (!found) notFound();

  const { athlete, sport } = found;
  const { body, stats } = getMeasurements(id);
  const accent = sportAccent[sport] ?? "#818cf8";

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
      >
        <span aria-hidden>←</span> Back to roster
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="aspect-[4/5] w-full sm:aspect-[16/10] lg:aspect-auto lg:h-[640px]">
            <AthleteSilhouette body={body} stats={stats} accent={accent} />
          </div>
          <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-3">
            <div className="relative size-12 overflow-hidden rounded-full ring-2 ring-white/30">
              <Image
                src={athlete.imageUrl}
                alt={athlete.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="rounded-md bg-black/40 px-3 py-1.5 backdrop-blur">
              <h1 className="text-base font-semibold text-white">{athlete.name}</h1>
              <p className="text-xs text-white/70">{athlete.detail}</p>
            </div>
          </div>
          <div
            className="pointer-events-none absolute right-4 top-4 rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white"
            style={{ background: accent }}
          >
            {sport}
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <StatGroup title="Body" accent={accent}>
            <StatRow label="Sex" value={body.sex === "M" ? "Male" : "Female"} />
            <StatRow label="Height" value={`${body.height} cm`} />
            <StatRow label="Weight" value={`${body.weight} kg`} />
            <StatRow label="Shoulder width" value={`${body.shoulderWidth} cm`} />
            <StatRow label="Chest" value={`${body.chest} cm`} />
            <StatRow label="Waist" value={`${body.waist} cm`} />
            <StatRow label="Hip" value={`${body.hip} cm`} />
          </StatGroup>

          <StatGroup title="Performance" accent={accent}>
            <StatRow label="Wingspan" value={`${stats.wingspan} cm`} />
            <StatRow label="Standing reach" value={`${stats.reach} cm`} />
            <StatRow label="Vertical jump" value={`${stats.vertical} cm`} />
            <StatRow label="Body fat" value={`${stats.bodyFat}%`} />
          </StatGroup>

          <p className="text-[11px] leading-relaxed text-[var(--muted)]">
            Measurements are illustrative. Silhouette is a low-poly approximation
            driven directly by the values above.
          </p>
        </aside>
      </div>
    </div>
  );
}

function StatGroup({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-block size-2 rounded-full" style={{ background: accent }} />
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      </div>
      <dl className="flex flex-col gap-1.5">{children}</dl>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-dashed border-[var(--border)] py-1 last:border-b-0">
      <dt className="text-xs text-[var(--muted)]">{label}</dt>
      <dd className="font-mono text-sm tabular-nums">{value}</dd>
    </div>
  );
}
