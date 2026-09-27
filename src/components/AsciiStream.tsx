"use client";

import { useEffect, useRef } from "react";

const LINES = [
  "► analyzing architectural contracts…",
  "► scanning intent drift vectors…",
  "► mapping blast radius [████████░░] 82%",
  "► loading PR diff summary…",
  "► verifying design contracts [OK]",
  "► syncing github repository index…",
  "► running intent-loop engine v2.0…",
  "► cross-referencing component graph…",
  "► drift score: 0.04 ● within bounds",
  "► contract ARCH-042 → status: ACTIVE",
  "► pulling open pull requests…",
  "► generating dossier report…",
];

export function AsciiStream() {
  const ref = useRef<HTMLDivElement>(null);
  const lineIdx = useRef(0);
  const charIdx = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function tick() {
      if (!el) return;
      const line = LINES[lineIdx.current];
      if (charIdx.current < line.length) {
        el.textContent = line.slice(0, charIdx.current + 1) + "█";
        charIdx.current++;
        timeout.current = setTimeout(tick, 28);
      } else {
        el.textContent = line;
        lineIdx.current = (lineIdx.current + 1) % LINES.length;
        charIdx.current = 0;
        timeout.current = setTimeout(tick, 1800);
      }
    }

    timeout.current = setTimeout(tick, 600);
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="font-mono text-xs text-blue-400/70 min-h-[1.4em] select-none"
      aria-hidden
    />
  );
}
