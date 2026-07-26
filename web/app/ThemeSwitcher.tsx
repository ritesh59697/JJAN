"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { IconSun, IconMoon, IconMonitor } from "./icons";

const OPTIONS = [
  { value: "light", label: "Light", Icon: IconSun },
  { value: "dark", label: "Dark", Icon: IconMoon },
  { value: "system", label: "System", Icon: IconMonitor },
] as const;

// Segmented light / dark / system control. `theme` is undefined on the server and
// on the first client render, so nothing is marked active until we've mounted —
// otherwise the server HTML and the hydrated markup disagree.
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="theme-switch" role="radiogroup" aria-label="Color theme">
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            className={`theme-opt ${active ? "active" : ""}`}
            onClick={() => setTheme(value)}
          >
            <Icon size={15} />
          </button>
        );
      })}
    </div>
  );
}
