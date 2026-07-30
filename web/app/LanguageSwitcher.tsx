"use client";

import { useTranslation } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="theme-switch" role="radiogroup" aria-label="Language selection" style={{ display: "inline-flex" }}>
      <button
        type="button"
        role="radio"
        aria-checked={language === "en"}
        aria-label="English"
        title="English"
        className={`theme-opt ${language === "en" ? "active" : ""}`}
        onClick={() => setLanguage("en")}
        style={{ fontSize: "11.5px", fontWeight: 600, padding: "0 10px", width: "auto", height: "28px" }}
      >
        English
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={language === "ko"}
        aria-label="한국어"
        title="한국어"
        className={`theme-opt ${language === "ko" ? "active" : ""}`}
        onClick={() => setLanguage("ko")}
        style={{ fontSize: "11.5px", fontWeight: 600, padding: "0 10px", width: "auto", height: "28px" }}
      >
        한국어
      </button>
    </div>
  );
}
