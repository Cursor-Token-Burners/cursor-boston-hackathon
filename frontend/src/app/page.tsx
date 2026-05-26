import AthleteGrid from "@/components/AthleteGrid";
import { athletes } from "@/data/athletes";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Athletes</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {athletes.length} athletes in your roster
          </p>
        </div>
      </header>

      <AthleteGrid athletes={athletes} />
    </div>
  );
}
