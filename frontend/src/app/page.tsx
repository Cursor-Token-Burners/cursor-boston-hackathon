import RosterBoard from "@/components/RosterBoard";
import { rosters } from "@/data/athletes";

export default function Home() {
  const totalAthletes = rosters.reduce((sum, r) => sum + r.athletes.length, 0);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Athletes</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {totalAthletes} athletes across {rosters.length} sports
        </p>
      </header>

      <RosterBoard rosters={rosters} />
    </div>
  );
}
