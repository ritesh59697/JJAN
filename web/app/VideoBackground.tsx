"use client";

import { useEffect, useRef, useState } from "react";

// Fixed, full-viewport ambient video behind the landing page. The source is
// already blurred and downscaled at build time (854x480, ~900KB), so this costs
// far less than blurring 4K in the compositor on every frame — which matters
// while screen-recording the demo.
export function VideoBackground() {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduceMotion(mq.matches);
      const v = ref.current;
      if (!v) return;
      // Honour the OS setting: hold a still frame instead of looping motion.
      if (mq.matches) v.pause();
      else void v.play().catch(() => {});
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <div className="video-bg" aria-hidden="true">
      <video
        ref={ref}
        className="video-bg-media"
        poster="/hero-bg.jpg"
        src="/hero-bg.mp4"
        autoPlay={!reduceMotion}
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className="video-bg-scrim" />
    </div>
  );
}
