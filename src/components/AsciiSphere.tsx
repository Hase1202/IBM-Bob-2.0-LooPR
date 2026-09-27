"use client";

import { useEffect, useRef } from "react";

const CHARS = " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
const WIDTH = 44;
const HEIGHT = 22;
const R = 9;
const ASPECT = 2.2;
const K2 = 30;
const K1 = (WIDTH * K2 * 3) / (8 * R * 1.5);

interface Particle {
  theta: number;
  phi: number;
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  tx: number; ty: number; tz: number;
  nx: number; ny: number; nz: number;
}

function makeParticle(theta: number, phi: number): Particle {
  const p: Particle = { theta, phi, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, tx: 0, ty: 0, tz: 0, nx: 0, ny: 0, nz: 0 };
  updateTarget(p, 0, 0);
  p.x = p.tx; p.y = p.ty; p.z = p.tz;
  return p;
}

function updateTarget(p: Particle, A: number, B: number) {
  const st = Math.sin(p.theta), ct = Math.cos(p.theta);
  const sp = Math.sin(p.phi),   cp = Math.cos(p.phi);
  const bx = R * st * cp, by = R * st * sp, bz = R * ct;
  const cosA = Math.cos(A), sinA = Math.sin(A);
  const cosB = Math.cos(B), sinB = Math.sin(B);
  const y1 = by * cosA - bz * sinA;
  const z1 = by * sinA + bz * cosA;
  p.tx = bx * cosB + z1 * sinB;
  p.tz = -bx * sinB + z1 * cosB;
  p.ty = y1;
  p.nx = p.tx / R; p.ny = p.ty / R; p.nz = p.tz / R;
}

// Light direction (normalised)
const LX = -1 / Math.sqrt(3), LY = -1 / Math.sqrt(3), LZ = -1 / Math.sqrt(3);

export function AsciiSphere() {
  const canvasRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    // Build particles
    const particles: Particle[] = [];
    for (let ti = 0; ti < 314; ti += 7) {
      for (let pi = 0; pi < 628; pi += 7) {
        particles.push(makeParticle(ti / 100, pi / 100));
      }
    }

    let A = 0, B = 0;
    let rafId: number;

    function frame() {
      A += 0.03;
      B += 0.015;

      const output = new Array<string>(WIDTH * HEIGHT).fill(" ");
      const zbuf = new Float32Array(WIDTH * HEIGHT).fill(-999);

      for (const p of particles) {
        updateTarget(p, A, B);

        // spring physics
        const spring = 0.14, friction = 0.80;
        p.vx += (p.tx - p.x) * spring;
        p.vy += (p.ty - p.y) * spring;
        p.vz += (p.tz - p.z) * spring;
        p.vx *= friction; p.vy *= friction; p.vz *= friction;
        p.x += p.vx; p.y += p.vy; p.z += p.vz;

        const zs = p.z + K2;
        if (zs <= 0) continue;
        const ooz = 1.0 / zs;
        const px = Math.round(WIDTH / 2 + K1 * ooz * p.x);
        const py = Math.round(HEIGHT / 2 + (K1 * ooz * p.y) / ASPECT);
        if (px < 0 || px >= WIDTH || py < 0 || py >= HEIGHT) continue;
        const idx = px + py * WIDTH;
        if (ooz > zbuf[idx]) {
          zbuf[idx] = ooz;
          let L = p.nx * LX + p.ny * LY + p.nz * LZ;
          L = Math.min(1, Math.max(0, L) + 0.22);
          L = Math.pow(L, 1.3);
          const ci = Math.min(CHARS.length - 1, Math.max(0, Math.round(L * (CHARS.length - 1))));
          output[idx] = CHARS[ci];
        }
      }

      if (canvasRef.current) {
        const rows: string[] = [];
        for (let row = 0; row < HEIGHT; row++) {
          rows.push(output.slice(row * WIDTH, (row + 1) * WIDTH).join(""));
        }
        canvasRef.current.textContent = rows.join("\n");
      }

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <pre
      ref={canvasRef}
      aria-hidden
      className="font-mono select-none leading-[1.25] text-[11px] sm:text-[12px]"
      style={{
        color: "#3b82f6",
        textShadow: "0 0 8px rgba(59,130,246,0.55)",
        minWidth: `${WIDTH}ch`,
        minHeight: `${HEIGHT * 1.25}em`,
      }}
    />
  );
}
