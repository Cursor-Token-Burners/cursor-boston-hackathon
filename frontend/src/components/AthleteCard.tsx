import Image from "next/image";
import Link from "next/link";
import type { Athlete } from "@/data/athletes";

export default function AthleteCard({ athlete }: { athlete: Athlete }) {
  return (
    <Link
      href={`/athletes/${athlete.id}`}
      className="group flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
    >
      <div className="relative size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-[var(--border)] transition group-hover:ring-[var(--accent)]/50">
        <Image
          src={athlete.imageUrl}
          alt={athlete.name}
          fill
          sizes="48px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold leading-tight">{athlete.name}</h3>
        <p className="truncate text-xs text-[var(--muted)]">{athlete.detail}</p>
      </div>
    </Link>
  );
}
