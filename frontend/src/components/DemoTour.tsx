"use client";

import { useCallback, useEffect, useRef } from "react";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";

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
 * The full journey in story order — file a pain report as an athlete, then
 * flip to the coach side and see the roster-wide picture. Click stages
 * highlight exactly the element the visitor must click; the click itself
 * advances the tour.
 */
const STAGES: Stage[] = [
  // ——— Athlete side ———
  {
    selector: '[data-tour="role-athlete"]',
    title: "1 · Start as an athlete",
    description:
      "No account needed. Click the Athlete card — this is what a player opens on their phone after practice.",
    side: "bottom",
    advance: "click",
    waitMs: 10_000,
  },
  {
    selector: '[data-tour="symptoms"]',
    title: "2 · Say it in plain words",
    description:
      "No medical vocabulary. \u201cMy knee feels wobbly on stairs\u201d is exactly the kind of input this is built for.",
    side: "bottom",
    advance: "next",
    waitMs: 15_000,
  },
  {
    selector: '[data-tour="body-knee"]',
    title: "3 · Tap where it hurts",
    description: "Click Knee to mark the spot.",
    side: "top",
    advance: "click",
    waitMs: 10_000,
  },
  {
    selector: '[data-tour="send-checkin"]',
    title: "4 · Send it to your trainer",
    description:
      "Click Send. The report lands on the coach's dashboard — which is where we're headed next.",
    side: "top",
    advance: "click",
    waitMs: 10_000,
  },
  {
    selector: '[data-tour="checkin-result"]',
    title: "5 · Structured, instantly",
    description:
      "The free-text answer is parsed into areas, pain level, and onset — the shape the triage model consumes.",
    side: "bottom",
    advance: "next",
    waitMs: 10_000,
  },
  {
    selector: '[data-tour="checkin-logout"]',
    title: "6 · Now switch sides",
    description: "Click Log out to head back and see what the coach sees.",
    side: "bottom",
    advance: "click",
    waitMs: 10_000,
  },
  // ——— Coach side ———
  {
    selector: '[data-tour="role-coach"]',
    title: "7 · Enter as the coach",
    description:
      "Click the Coach card to open the dashboard a trainer would see every morning.",
    side: "bottom",
    advance: "click",
    waitMs: 10_000,
  },
  {
    selector: '[data-tour="roster"]',
    title: "8 · The whole roster at a glance",
    description:
      "Every athlete across Football, Soccer, and Swimming. In the real product, cards surface who reported pain overnight — like the check-in you just filed.",
    side: "top",
    advance: "next",
    waitMs: 15_000,
  },
  {
    selector: '[data-tour="athlete-card"]',
    title: "9 · Open an athlete",
    description: "Click this athlete to drill into their profile.",
    side: "bottom",
    advance: "click",
    waitMs: 10_000,
  },
  {
    selector: '[data-tour="silhouette"]',
    title: "10 · A body built from measurements",
    description:
      "This low-poly 3D silhouette is generated directly from the athlete's real measurements — height, shoulder width, chest, waist, hip. Drag to rotate it.",
    side: "right",
    advance: "next",
    waitMs: 15_000,
  },
  {
    selector: '[data-tour="stats"]',
    title: "11 · The numbers behind the mesh",
    description:
      "Body and performance metrics feed the silhouette and, in the full product, the injury-risk triage model.",
    side: "left",
    advance: "next",
    waitMs: 10_000,
  },
];

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * driver.js draws its overlay/stage inside requestAnimationFrame callbacks.
 * Some embedded or throttled browsers never fire rAF for background tabs
 * (or at all), which leaves the tour invisible: popover at opacity 0 and no
 * overlay. Probe once; if rAF is dead, replace it with a setTimeout shim.
 */
let rafProbed = false;
function ensureWorkingRaf() {
  if (rafProbed) return;
  rafProbed = true;
  let fired = false;
  window.requestAnimationFrame(() => {
    fired = true;
  });
  setTimeout(() => {
    if (fired) return;
    window.requestAnimationFrame = ((cb: FrameRequestCallback) =>
      window.setTimeout(
        () => cb(performance.now()),
        16,
      )) as typeof window.requestAnimationFrame;
    window.cancelAnimationFrame = ((id: number) =>
      window.clearTimeout(id)) as typeof window.cancelAnimationFrame;
  }, 300);
}

async function waitForElement(
  selector: string,
  timeoutMs: number,
  isCancelled: () => boolean,
): Promise<HTMLElement | null> {
  const started = Date.now();
  while (!isCancelled() && Date.now() - started < timeoutMs) {
    const el = document.querySelector<HTMLElement>(selector);
    if (el) return el;
    await sleep(150);
  }
  return null;
}

/** Resolves true when the element is clicked, false on cancel/removal. */
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
  const driverRef = useRef<Driver | null>(null);
  const cancelRunRef = useRef<(() => void) | null>(null);

  const startTour = useCallback(async () => {
    // A second invocation cancels the in-flight run and restarts from the
    // top, so programmatic restarts always work.
    if (runningRef.current) {
      cancelRunRef.current?.();
      const waitStart = Date.now();
      while (runningRef.current && Date.now() - waitStart < 3_000) {
        await sleep(50);
      }
      if (runningRef.current) return;
    }
    runningRef.current = true;

    // One driver instance for the whole run. Cancellation (Esc / ✕) is
    // detected by polling `isActive()` — driver.js resets that state
    // synchronously on destroy, unlike the onDestroyed hook which can be
    // skipped depending on animation timing.
    let internalDestroy = false;
    let externallyDestroyed = false;

    const d = driver({
      showProgress: false,
      allowKeyboardControl: true,
      // No fade animation: driver's fade leaves the popover at opacity 0
      // until the CSS animation completes, which can never happen in
      // throttled/background tabs. Synchronous rendering is bulletproof.
      animate: false,
      overlayOpacity: 0.55,
      stagePadding: 6,
      stageRadius: 12,
      popoverClass: "fb-tour",
      // A stray click on the dark overlay must NOT kill the tour — visitors
      // click around while exploring. Close stays available via ✕ and Esc.
      overlayClickBehavior: () => {},
      // The highlighted element stays clickable; everything else is blocked
      // by the overlay.
      disableActiveInteraction: false,
      onDestroyed: () => {
        if (!internalDestroy) externallyDestroyed = true;
      },
    });
    driverRef.current = d;
    const isCancelled = () => externallyDestroyed || !d.isActive();
    cancelRunRef.current = () => {
      externallyDestroyed = true;
      internalDestroy = true;
      d.destroy();
      internalDestroy = false;
    };

    const finish = () => {
      if (d.isActive()) {
        internalDestroy = true;
        d.destroy();
        internalDestroy = false;
      }
      cancelRunRef.current = null;
      driverRef.current = null;
      runningRef.current = false;
    };

    try {
      // Intro card — advanced by its own button.
      let introNext = false;
      d.highlight({
        popover: {
          title: "👋 This is FieldBack",
          description:
            "A Cursor Boston Sports Hack build: injury triage for team sports. You'll play both sides — first file a pain report as an athlete, then flip to the coach dashboard to see the roster-wide picture. When a button glows, click it.",
          showButtons: ["next", "close"],
          nextBtnText: "Show me →",
          onNextClick: () => {
            introNext = true;
          },
        },
      });
      while (!introNext && !isCancelled()) await sleep(100);
      if (isCancelled()) return;

      for (const stage of STAGES) {
        // If the next target isn't in the DOM yet (page transition, data
        // loading), show a neutral waiting card instead of leaving the
        // previous popover anchored to a removed element.
        if (!document.querySelector(stage.selector)) {
          d.highlight({
            popover: {
              title: "⏳ One moment",
              description:
                "The next step lights up automatically as soon as it's ready.",
              showButtons: ["close"],
            },
          });
        }

        const el = await waitForElement(
          stage.selector,
          stage.waitMs ?? 10_000,
          isCancelled,
        );
        if (!el || isCancelled()) return;

        el.scrollIntoView({ block: "center", behavior: "smooth" });

        if (stage.advance === "next") {
          let nextDone = false;
          d.highlight({
            element: el,
            popover: {
              title: stage.title,
              description: stage.description,
              side: stage.side,
              showButtons: ["next", "close"],
              nextBtnText: "Next →",
              onNextClick: () => {
                nextDone = true;
              },
            },
          });
          // Keep the cutout glued to targets in shifting layouts.
          const refreshTimer = setInterval(() => {
            if (d.isActive() && el.isConnected) d.refresh();
          }, 250);
          while (!nextDone && !isCancelled() && el.isConnected)
            await sleep(100);
          clearInterval(refreshTimer);
          if (!nextDone || isCancelled()) return;
        } else {
          d.highlight({
            element: el,
            popover: {
              title: stage.title,
              description: stage.description,
              side: stage.side,
              showButtons: ["close"],
            },
          });
          // driver.js only repositions on window scroll/resize. Targets can
          // move as data streams in, so poll and refresh.
          const refreshTimer = setInterval(() => {
            if (d.isActive() && el.isConnected) d.refresh();
          }, 250);
          const clicked = await waitForClick(el, isCancelled);
          clearInterval(refreshTimer);
          if (!clicked || isCancelled()) return;
        }
      }

      // Finale — closed by the visitor.
      d.highlight({
        popover: {
          title: "🎉 That's the whole loop",
          description:
            "Athlete says what hurts in plain words → report lands structured → coach sees the roster and drills into any body. Everything you saw is live — poke around.",
          showButtons: ["close"],
        },
      });
      while (!isCancelled()) await sleep(200);
    } finally {
      finish();
    }
  }, []);

  // Autoplay on every landing-page load — the tour IS the demo's front door.
  // Visitors who already know the flow can dismiss it with ✕ or Esc.
  useEffect(() => {
    // Probe rAF immediately so a dead implementation is shimmed before the
    // first highlight renders (probe resolves in 300ms, tour starts at 800ms).
    ensureWorkingRaf();
    if (window.location.pathname !== "/") return;
    const t = setTimeout(() => void startTour(), 800);
    return () => clearTimeout(t);
  }, [startTour]);

  // Tear down on unmount.
  useEffect(() => {
    return () => {
      cancelRunRef.current?.();
      driverRef.current = null;
    };
  }, []);

  return null;
}
