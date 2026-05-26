"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import AthleteCard from "./AthleteCard";
import type { Roster } from "@/data/athletes";

export default function RosterBoard({ rosters }: { rosters: Roster[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".athlete-card",
        { scale: 0 },
        {
          scale: 1,
          stagger: 0.025,
          ease: "elastic.out(1, 0.8)",
          delay: 0.15,
        },
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col gap-8">
      {rosters.map((roster) => (
        <section key={roster.sport} className="flex flex-col gap-3">
          <header className="flex items-baseline justify-between border-b border-[var(--border)] pb-2">
            <h2 className="text-lg font-semibold tracking-tight">{roster.sport}</h2>
            <span className="text-xs text-[var(--muted)]">{roster.athletes.length}</span>
          </header>
          <div className="flex flex-row gap-3 overflow-x-auto pb-2">
            {roster.athletes.map((athlete) => (
              <div
                key={athlete.id}
                className="athlete-card w-64 shrink-0"
                style={{ transform: "scale(0)" }}
              >
                <AthleteCard athlete={athlete} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
