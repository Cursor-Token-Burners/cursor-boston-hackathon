"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import AthleteCard from "./AthleteCard";
import type { Athlete } from "@/data/athletes";

export default function AthleteGrid({ athletes }: { athletes: Athlete[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".athlete-card",
        { scale: 0 },
        {
          scale: 1,
          stagger: 0.06,
          ease: "elastic.out(1, 0.8)",
          delay: 0.2,
        },
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      aria-label="Athlete tiles"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      {athletes.map((athlete) => (
        <div key={athlete.id} className="athlete-card" style={{ transform: "scale(0)" }}>
          <AthleteCard athlete={athlete} />
        </div>
      ))}
    </section>
  );
}
