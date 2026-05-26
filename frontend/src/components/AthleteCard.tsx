import Image from "next/image";
import type { Athlete } from "@/data/athletes";

export default function AthleteCard({ athlete }: { athlete: Athlete }) {
  return (
    <article className="group flex flex-col items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative size-24 overflow-hidden rounded-full ring-2 ring-[var(--border)] transition group-hover:ring-[var(--accent)]/50">
        <Image
          src={`https://i.pravatar.cc/240?img=${athlete.avatarId}`}
          alt={athlete.name}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold leading-tight">{athlete.name}</h3>
        <p className="mt-0.5 text-xs text-[var(--muted)]">{athlete.sport}</p>
        <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--muted)]">
          {athlete.country}
        </p>
      </div>
    </article>
  );
}
