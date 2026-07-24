// Small inline SVG icons — used instead of emoji glyphs so everything renders
// consistently and inherits text color/size (currentColor).
type P = { size?: number; className?: string };
const base = (size: number) =>
  ({ width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true, style: { display: "block", flex: "none" } }) as const;

export function IconBolt({ size = 14, className }: P) {
  return (
    <svg {...base(size)} className={className} fill="currentColor">
      <path d="M13 2 4 13.5h5.5L8.5 22 20 10.5h-5.5L13 2Z" />
    </svg>
  );
}

export function IconCheck({ size = 14, className }: P) {
  return (
    <svg {...base(size)} className={className} fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconArrowRight({ size = 14, className }: P) {
  return (
    <svg {...base(size)} className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h13M12 5.5 18.5 12 12 18.5" />
    </svg>
  );
}

export function IconArrowLeft({ size = 14, className }: P) {
  return (
    <svg {...base(size)} className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H6M12 5.5 5.5 12 12 18.5" />
    </svg>
  );
}

export function IconArrowUpRight({ size = 14, className }: P) {
  return (
    <svg {...base(size)} className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}
