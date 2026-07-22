"use client";

import { useCallback, useEffect, useRef } from "react";
import { driver, type Driver, type AllowedButtons } from "driver.js";
import "driver.js/dist/driver.css";

const SEEN_KEY = "fb_tour_seen_v1";

type Stage = {
  selector: string;
  title: string;
  description: string;
  side?: "top" | "bottom" | "left" | "right";
  /** "click" advances when the visitor clicks the highlighted element;
   *  "next" shows a Next button for purely informational stops. */
  advance: "click" | "next";
  /** How long to wait for the element to appear (ms). */
  waitMs?: number;
};

/**
 * The coach journey, in order. Click stages highlight exactly the element
 * the visitor must click; the click itself advances the tour.
 */
const STAGES: Stage[] = [
  {
    selector: '[data-tour="role-coach"]',
    title: "1 · Enter as a coach",
    description:
      "No account needed. Click the Coach card to open the dashboard a trainer would see every morning.",
    side: "bottom",
    advance: "click",
    waitMs: 10_000,
  },
  {
    selector: '[data-tour="roster"]',
    title: "2 · The whole roster at a glance",
    description:
      "Every athlete across Football, Soccer, and Swimming. In the real product, cards surface who reported pain overnight so the trainer knows where to look first.",
    side: "top",
    advance: "next",
    waitMs: 15_000,
  },
  {
    selector: '[data-tour="athlete-card"]',
    title: "3 · Open an athlete",
    description: "Click this athlete to drill into their profile.",
    side: "bottom",
    advance: "click",
    waitMs: 10_000,
  },
  {
    selector: '[data-tour="silhouette"]',
    title: "4 · A body built from measurements",
    description:
      "This low-poly 3D silhouette is generated directly from the athlete's real measurements — height, shoulder width, chest, waist, hip. Drag to rotate it.",
    side: "right",
    advance: "next",
    waitMs: 15_000,
  },
  {
    selector: '[data-tour="stats"]',
    title: "5 · The numbers behind the mesh",
    description:
      "Body and performance metrics feed the silhouette and, in the full product, the injury-risk triage model.",
    side: "left",
    advance: "next",
    waitMs: 10_000,
  },
];

function waitForElement(
  selector: string,
  timeoutMs: number,
  isCancelled: () => boolean,
): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      if (isCancelled()) return resolve(null);
      const el = document.querySelector<HTMLElement>(selector);
      if (el) return resolve(el);
      if (Date.now() - started > timeoutMs) return resolve(null);
      setTimeout(tick, 150);
    };
    tick();
  });
}

function waitForClick(
  el: HTMLElement,
  isCancelled: () => boolean,
): Promise<boolean> {
  return new Promise((resolve) => {
    const onClick = () => {
      cleanup();
      resolve(true);
    };
    const poll = setInterval(() => {
      if (isCancelled() || !el.isConnected) {
        cleanup();
        resolve(false);
      }
    }, 250);
    const cleanup = () => {
      el.removeEventListener("click", onClick, true);
      clearInterval(poll);
    };
    el.addEventListener("click", onClick, { capture: true, once: true });
  });
}

export default function DemoTour() {
  const runningRef = useRef(false);
  const cancelledRef = useRef(false);
  const driverRef = useRef<Driver | null>(null);
  // Set while we tear a driver down ourselves, so onDestroyed can tell a
  // user-initiated close (Esc / ✕ / overlay) from our own stage transitions.
  const internalDestroyRef = useRef(false);

  const makeDriver = useCallback(
    () =>
      driver({
        showProgress: false,
        allowKeyboardControl: true,
        overlayOpacity: 0.55,
        stagePadding: 6,
        stageRadius: 12,
        popoverClass: "fb-tour",
        disableActiveInteraction: false,
        onDestroyed: () => {
          if (!internalDestroyRef.current) cancelledRef.current = true;
        },
      }),
    [],
  );

  const destroyCurrent = useCallback(() => {
    internalDestroyRef.current = true;
    driverRef.current?.destroy();
    internalDestroyRef.current = false;
    driverRef.current = null;
  }, []);

  const startTour = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    cancelledRef.current = false;
    const isCancelled = () => cancelledRef.current;

    try {
      // Intro card.
      const introDone = await new Promise<boolean>((resolve) => {
        const d = makeDriver();
        driverRef.current = d;
        d.highlight({
          popover: {
            title: "👋 This is FieldBack",
            description:
              "A Cursor Boston Sports Hack build: injury triage for team sports. Athletes log pain in plain words, coaches watch the roster. Follow the highlights — when a button glows, click it.",
            showButtons: ["next", "close"] as AllowedButtons[],
            nextBtnText: "Show me →",
            onNextClick: () => resolve(true),
          },
        });
        const poll = setInterval(() => {
          if (cancelledRef.current) {
            clearInterval(poll);
            resolve(false);
          }
        }, 200);
      });
      destroyCurrent();
      if (!introDone || isCancelled()) return;

      for (const stage of STAGES) {
        const el = await waitForElement(
          stage.selector,
          stage.waitMs ?? 10_000,
          isCancelled,
        );
        if (!el || isCancelled()) return;

        el.scrollIntoView({ block: "center", behavior: "smooth" });

        if (stage.advance === "next") {
          const nextDone = await new Promise<boolean>((resolve) => {
            const d = makeDriver();
            driverRef.current = d;
            d.highlight({
              element: el,
              popover: {
                title: stage.title,
                description: stage.description,
                side: stage.side,
                showButtons: ["next", "close"] as AllowedButtons[],
                nextBtnText: "Next →",
                onNextClick: () => resolve(true),
              },
            });
            const poll = setInterval(() => {
              if (cancelledRef.current) {
                clearInterval(poll);
                resolve(false);
              }
            }, 200);
          });
          destroyCurrent();
          if (!nextDone || isCancelled()) return;
        } else {
          const d = makeDriver();
          driverRef.current = d;
          d.highlight({
            element: el,
            popover: {
              title: stage.title,
              description: stage.description,
              side: stage.side,
              showButtons: ["close"] as AllowedButtons[],
            },
          });
          const clicked = await waitForClick(el, isCancelled);
          destroyCurrent();
          if (!clicked || isCancelled()) return;
        }
      }

      // Finale.
      const d = makeDriver();
      driverRef.current = d;
      d.highlight({
        popover: {
          title: "🎉 That's the coach side",
          description:
            "There's a second half: log out (top-right menu) and enter as an Athlete to file a plain-language pain check-in. Replay this tour anytime with the Tour button, bottom-left.",
          showButtons: ["close"] as AllowedButtons[],
        },
      });
    } finally {
      runningRef.current = false;
    }
  }, [destroyCurrent, makeDriver]);

  // Auto-start once per visitor, only from the landing page so the
  // journey begins at step one. `?tour=1` (set by the replay button)
  // forces a start regardless of the seen flag.
  useEffect(() => {
    try {
      const forced = new URLSearchParams(window.location.search).has("tour");
      if (window.location.pathname !== "/") return;
      if (!forced && localStorage.getItem(SEEN_KEY)) return;
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      return;
    }
    const t = setTimeout(() => void startTour(), 800);
    return () => clearTimeout(t);
  }, [startTour]);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      destroyCurrent();
    };
  }, [destroyCurrent]);

  return (
    <button
      type="button"
      onClick={() => {
        // Restart the journey from the landing page if we're mid-app.
        if (window.location.pathname !== "/") {
          window.location.href = "/?tour=1";
          return;
        }
        void startTour();
      }}
      aria-label="Replay the guided tour"
      title="What is this? Take the tour"
      className="fixed bottom-5 left-5 z-40 flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 text-[12px] font-semibold shadow-lg transition-colors hover:border-[var(--accent)]"
    >
      <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--accent)] font-mono text-[11px] font-bold text-white">
        ?
      </span>
      Tour
    </button>
  );
}
