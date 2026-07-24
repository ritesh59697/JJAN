"use client";

import { useMemo } from "react";

// Small deterministic PRNG so the art renders identically on server + client
// (no hydration mismatch) and is stable across reloads.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Weighted toward 0/1 (it's on-chain), with a few symbols for texture.
const GLYPHS = "010101010101010101010101%#$!&=";

/**
 * A binary "savings circle" rendered as halftone ASCII art — dense in the ring
 * band, spraying out to sparse scattered digits at the edges, then masked to
 * melt into the page. Echoes frontend.supply's crown motif.
 */
export function AsciiHero() {
  const art = useMemo(() => {
    const cols = 116;
    const rows = 30;
    const cw = 1; // monospace cell aspect: ~0.6 wide : 1.0 tall line-height
    const ch = 1.7;
    const cx = (cols - 1) / 2;
    const cy = (rows - 1) / 2;
    const rand = mulberry32(0x4a4a614e); // "Jja N"

    const Ro = 24.5; // outer ring radius (physical units)
    const Ri = 13.5; // inner ring radius
    const mid = (Ro + Ri) / 2;
    const half = (Ro - Ri) / 2;

    const lines: string[] = [];
    for (let y = 0; y < rows; y++) {
      let line = "";
      for (let x = 0; x < cols; x++) {
        const dx = (x - cx) * cw;
        const dy = (y - cy) * ch;
        const r = Math.sqrt(dx * dx + dy * dy);
        const t = Math.abs(r - mid) / half; // 0 at ring centerline, 1 at band edge

        let p: number;
        if (t <= 0.86) p = 0.92; // dense ring core
        else if (t <= 1) p = 0.12 + 0.8 * (1 - (t - 0.86) / 0.14); // clean falloff at edge
        else p = 0; // no scattered spray — keep it a crisp ring, not a dot field

        line += rand() < p ? GLYPHS[(rand() * GLYPHS.length) | 0] : " ";
      }
      lines.push(line); // keep full width so lines stay aligned
    }
    return lines.join("\n");
  }, []);

  return (
    <div className="ascii-hero" aria-hidden="true">
      <pre>{art}</pre>
    </div>
  );
}
