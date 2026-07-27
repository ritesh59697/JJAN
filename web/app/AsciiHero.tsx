"use client";

import { useEffect, useMemo, useState } from "react";

// Small 2D hash function for deterministic ASCII noise
function hash2D(x: number, y: number) {
  const val = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
  return val - Math.floor(val);
}

// Weighted toward 0/1 (it's on-chain), with a few symbols for texture.
const GLYPHS = "010101010101010101010101%#$!&=";

/**
 * A binary "savings circle" rendered as halftone ASCII art — dense in the ring
 * band, spraying out to sparse scattered digits at the edges, then masked to
 * melt into the page. Echoes frontend.supply's crown motif.
 * 
 * Animated to rotate smoothly, shimmer glyphs, and gently breathe organically.
 */
export function AsciiHero() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setMounted(true);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handleChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!mounted || reduceMotion) return;
    let animationFrameId: number;
    const tick = (timestamp: number) => {
      setTime(timestamp);
      animationFrameId = requestAnimationFrame(tick);
    };
    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mounted, reduceMotion]);

  const art = useMemo(() => {
    const cols = 116;
    const rows = 30;
    const cw = 1; // monospace cell aspect: ~0.6 wide : 1.0 tall line-height
    const ch = 1.7;
    const cx = (cols - 1) / 2;
    const cy = (rows - 1) / 2;

    const Ro = 24.5; // outer ring radius (physical units)
    const Ri = 13.5; // inner ring radius
    const mid = (Ro + Ri) / 2;
    const half = (Ro - Ri) / 2;

    // Use time = 0 for initial SSR rendering to match exactly
    const activeTime = mounted && !reduceMotion ? time : 0;

    // Slow rotation: 1 full rotation every 16 seconds
    const alpha = (activeTime / 16000) * 2 * Math.PI;
    const cosA = Math.cos(alpha);
    const sinA = Math.sin(alpha);

    // Characters shimmer at ~16 FPS (every 60ms)
    const shimmer = Math.floor(activeTime / 60);

    const lines: string[] = [];
    for (let y = 0; y < rows; y++) {
      let line = "";
      for (let x = 0; x < cols; x++) {
        const dx = (x - cx) * cw;
        const dy = (y - cy) * ch;
        const r = Math.sqrt(dx * dx + dy * dy);

        // Subtle organic breathing animation (period of 4.5 seconds)
        const breathe = Math.sin((activeTime / 4500) * 2 * Math.PI) * 0.4;
        const currentMid = mid + breathe;

        const t = Math.abs(r - currentMid) / half; // 0 at ring centerline, 1 at band edge

        let p: number;
        if (t <= 0.86) p = 0.92; // dense ring core
        else if (t <= 1) p = 0.12 + 0.8 * (1 - (t - 0.86) / 0.14); // clean falloff at edge
        else p = 0; // no scattered spray — keep it a crisp ring, not a dot field

        // Rotate coordinates for character lookup
        const rx = dx * cosA - dy * sinA;
        const ry = dx * sinA + dy * cosA;

        // Convert back to integer grid cell space relative to center
        const rotatedX = Math.round(rx / cw + cx);
        const rotatedY = Math.round(ry / ch + cy);

        // Determine character presence and choice based on rotated coordinates
        const h1 = hash2D(rotatedX, rotatedY);
        const h2 = hash2D(rotatedX + 500 + shimmer, rotatedY + 500 + shimmer);

        line += h1 < p ? GLYPHS[Math.floor(h2 * GLYPHS.length)] : " ";
      }
      lines.push(line); // keep full width so lines stay aligned
    }
    return lines.join("\n");
  }, [mounted, time, reduceMotion]);

  return (
    <div className="ascii-hero" aria-hidden="true">
      <pre>{art}</pre>
    </div>
  );
}
