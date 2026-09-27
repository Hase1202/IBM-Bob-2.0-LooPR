"use client";

import { useEffect, useRef } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const CHARS = " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
const WIDTH  = 62;
const HEIGHT = 31;
const R      = 12;
const ASPECT = 2.2;        // terminal char aspect (height/width ≈ 2:1)
const K2     = 40;
const K1     = (WIDTH * K2 * 3) / (8 * R * 1.5);

// Light direction (normalised)
const LX = -1 / Math.sqrt(3);
const LY = -1 / Math.sqrt(3);
const LZ = -1 / Math.sqrt(3);

// Interaction parameters (matching sphere.py)
const REPULSE_RADIUS = 6.0;   // char-cell distance
const REPULSE_FORCE  = 8.0;
const SPRING         = 0.12;
const FRICTION       = 0.82;

// ── Particle ──────────────────────────────────────────────────────────────────
interface Particle {
  theta: number; phi: number;
  x: number;  y: number;  z: number;
  vx: number; vy: number; vz: number;
  tx: number; ty: number; tz: number;
  nx: number; ny: number; nz: number;
}

function makeParticle(theta: number, phi: number): Particle {
  const p: Particle = {
    theta, phi,
    x: 0, y: 0, z: 0,
    vx: 0, vy: 0, vz: 0,
    tx: 0, ty: 0, tz: 0,
    nx: 0, ny: 0, nz: 0,
  };
  updateTarget(p, 0, 0);
  p.x = p.tx; p.y = p.ty; p.z = p.tz;
  return p;
}

function updateTarget(p: Particle, A: number, B: number) {
  const st = Math.sin(p.theta), ct = Math.cos(p.theta);
  const sp = Math.sin(p.phi),   cp = Math.cos(p.phi);
  
  // Base sphere coordinates
  let bx = st * cp;
  let by = st * sp;
  let bz = ct;
  
  // Transform to a prism (cube)
  const max = Math.max(Math.abs(bx), Math.abs(by), Math.abs(bz));
  const PRISM_R = R * 0.75;
  bx = (bx / max) * PRISM_R;
  by = (by / max) * PRISM_R;
  bz = (bz / max) * PRISM_R;

  const cosA = Math.cos(A), sinA = Math.sin(A);
  const cosB = Math.cos(B), sinB = Math.sin(B);
  const y1 = by * cosA - bz * sinA;
  const z1 = by * sinA + bz * cosA;
  p.tx = bx * cosB + z1 * sinB;
  p.tz = -bx * sinB + z1 * cosB;
  p.ty = y1;
  p.nx = p.tx / PRISM_R;
  p.ny = p.ty / PRISM_R;
  p.nz = p.tz / PRISM_R;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function AsciiSphere() {
  const preRef      = useRef<HTMLPreElement>(null);
  // Mouse position in char-cell coords, or null when outside
  const mouseCell   = useRef<{ col: number; row: number } | null>(null);
  // Seed for per-frame deterministic "random" scatter (avoids Math.random() churn)
  let rngSeed = 42;

  function rng() {
    // xorshift32
    rngSeed ^= rngSeed << 13;
    rngSeed ^= rngSeed >> 17;
    rngSeed ^= rngSeed << 5;
    return (rngSeed >>> 0) / 0xffffffff - 0.5;
  }

  useEffect(() => {
    const pre = preRef.current!;
    if (!pre) return;

    // ── Build particle cloud ──────────────────────────────────────────────────
    const particles: Particle[] = [];
    for (let ti = 0; ti < 314; ti += 6) {
      for (let pi = 0; pi < 628; pi += 6) {
        particles.push(makeParticle(ti / 100, pi / 100));
      }
    }

    // ── Mouse / touch → char-cell coords ─────────────────────────────────────
    function toCell(clientX: number, clientY: number) {
      const rect = pre.getBoundingClientRect();
      // Pixel position relative to the <pre>
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      // Character cell size in pixels
      const cellW = rect.width  / WIDTH;
      const cellH = rect.height / HEIGHT;
      return {
        col: px / cellW,
        row: py / cellH,
      };
    }

    function onMouseMove(e: MouseEvent) {
      mouseCell.current = toCell(e.clientX, e.clientY);
    }
    function onMouseLeave() {
      mouseCell.current = null;
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      const t = e.touches[0];
      mouseCell.current = toCell(t.clientX, t.clientY);
    }
    function onTouchEnd() {
      mouseCell.current = null;
    }

    pre.addEventListener("mousemove", onMouseMove);
    pre.addEventListener("mouseleave", onMouseLeave);
    pre.addEventListener("touchmove", onTouchMove, { passive: false });
    pre.addEventListener("touchend", onTouchEnd);

    // ── Render loop ───────────────────────────────────────────────────────────
    let A = 0, B = 0;
    let rafId: number;

    function frame() {
      A += 0.03;
      B += 0.015;

      const mc = mouseCell.current;

      const output = new Array<string>(WIDTH * HEIGHT).fill(" ");
      const zbuf   = new Float32Array(WIDTH * HEIGHT).fill(-999);

      for (const p of particles) {
        updateTarget(p, A, B);

        // ── Mouse repulsion (sphere.py exact port) ──────────────────────────
        if (mc !== null) {
          // Project current position to screen to find its cell
          const zsCur = p.z + K2;
          if (zsCur > 0) {
            const oozCur = 1.0 / zsCur;
            const screenCol = WIDTH  / 2 + K1 * oozCur * p.x;
            const screenRow = HEIGHT / 2 + (K1 * oozCur * p.y) / ASPECT;

            const dx = screenCol - mc.col;
            const dy = (screenRow - mc.row) * ASPECT;  // aspect-correct distance
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < REPULSE_RADIUS) {
              const force = REPULSE_FORCE / (dist + 0.5);
              let ndx = dx, ndy = dy;
              if (dist < 0.001) {
                ndx = rng(); ndy = rng();
              }
              p.vx += ndx * force * 0.4 + rng() * 2;
              p.vy += ndy * force * 0.4 + rng() * 2;
              p.vz += rng() * 3;
            }
          }
        }

        // ── Spring physics ──────────────────────────────────────────────────
        p.vx += (p.tx - p.x) * SPRING;
        p.vy += (p.ty - p.y) * SPRING;
        p.vz += (p.tz - p.z) * SPRING;
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.vz *= FRICTION;
        p.x  += p.vx;
        p.y  += p.vy;
        p.z  += p.vz;

        // ── Render ──────────────────────────────────────────────────────────
        const zs = p.z + K2;
        if (zs <= 0) continue;
        const ooz = 1.0 / zs;
        const col = Math.round(WIDTH  / 2 + K1 * ooz * p.x);
        const row = Math.round(HEIGHT / 2 + (K1 * ooz * p.y) / ASPECT);
        if (col < 0 || col >= WIDTH || row < 0 || row >= HEIGHT) continue;
        const idx = col + row * WIDTH;
        if (ooz > zbuf[idx]) {
          zbuf[idx] = ooz;
          let L = p.nx * LX + p.ny * LY + p.nz * LZ;
          L = Math.min(1, Math.max(0, L) + 0.22);
          L = Math.pow(L, 1.3);
          const ci = Math.min(CHARS.length - 1, Math.max(0, Math.round(L * (CHARS.length - 1))));
          output[idx] = CHARS[ci];
        }
      }

      // Write to DOM in one shot
      if (preRef.current) {
        const rows: string[] = [];
        for (let r = 0; r < HEIGHT; r++) {
          rows.push(output.slice(r * WIDTH, (r + 1) * WIDTH).join(""));
        }
        preRef.current.textContent = rows.join("\n");
      }

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      pre.removeEventListener("mousemove", onMouseMove);
      pre.removeEventListener("mouseleave", onMouseLeave);
      pre.removeEventListener("touchmove", onTouchMove);
      pre.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <pre
      ref={preRef}
      aria-hidden
      className="font-mono select-none leading-[1.25] text-[11px] sm:text-[12px]"
      style={{
        color: "#3b82f6",
        textShadow: "0 0 8px rgba(59,130,246,0.55)",
        minWidth:  `${WIDTH}ch`,
        minHeight: `${HEIGHT * 1.25}em`,
        touchAction: "none",
      }}
    />
  );
}
