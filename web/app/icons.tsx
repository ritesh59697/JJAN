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

export function IconSun({ size = 14, className }: P) {
  return (
    <svg {...base(size)} className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  );
}

export function IconMoon({ size = 14, className }: P) {
  return (
    <svg {...base(size)} className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13.5A8 8 0 0 1 10.5 4a8.5 8.5 0 1 0 9.5 9.5Z" />
    </svg>
  );
}

export function IconMonitor({ size = 14, className }: P) {
  return (
    <svg {...base(size)} className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="4" width="19" height="12.5" rx="2" />
      <path d="M8.5 20.5h7M12 16.5v4" />
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

export function IconMenu({ size = 18, className }: P) {
  return (
    <svg {...base(size)} className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function IconClose({ size = 18, className }: P) {
  return (
    <svg {...base(size)} className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function IconChevronDown({ size = 12, className }: P) {
  return (
    <svg {...base(size)} className={className} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
