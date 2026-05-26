import Image from "next/image";
import type { Athlete } from "@/data/athletes";

export default function AthleteCard({ athlete }: { athlete: Athlete }) {
  return (
    <article className="group flex flex-col items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-shadow hover:shadow-md">
      <div className="relative size-24 overflow-hidden rounded-full ring-2 ring-[var(--border)] transition group-hover:ring-[var(--accent)]/50">
        <Image
          src={athlete.imageUrl}
          alt={athlete.name}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold leading-tight">{athlete.name}</h3>
        <p className="mt-0.5 text-xs text-[var(--muted)]">
          {athlete.position} · {athlete.team}
        </p>
      </div>
    </article>
  );
}
