"use client";

import { useEffect, useRef } from "react";

const FRAMES = [
  `  ╭──────╮
 ╱  ◈ ◈  ╲
│  ▓▒░ ░▒▓  │
│  BOB·IL  │
 ╲  ◈ ◈  ╱
  ╰──────╯`,
  `  ╭──────╮
 ╱  ░ ░  ╲
│  ░▒▓ ▓▒░  │
│  BOB·IL  │
 ╲  ░ ░  ╱
  ╰──────╯`,
  `  ╭──────╮
 ╱  ◇ ◇  ╲
│  ▒▓░ ░▓▒  │
│  BOB·IL  │
 ╲  ◇ ◇  ╱
  ╰──────╯`,
  `  ╭──────╮
 ╱  ◈ ◈  ╲
│  ░▒▓ ▓▒░  │
│  BOB·IL  │
 ╲  ◈ ◈  ╱
  ╰──────╯`,
];

export function AsciiOrb() {
  const ref = useRef<HTMLPreElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      frame.current = (frame.current + 1) % FRAMES.length;
      if (ref.current) ref.current.textContent = FRAMES[frame.current];
    }, 420);
    return () => clearInterval(interval);
  }, []);

  return (
    <pre
      ref={ref}
      className="font-mono text-[10px] leading-[1.4] text-blue-400/60 select-none animate-ascii-flicker"
      aria-hidden
    >
      {FRAMES[0]}
    </pre>
  );
}
