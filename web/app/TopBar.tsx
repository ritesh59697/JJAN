"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useChainId } from "wagmi";
import { giwaTestnet } from "@/lib/chain";
import { NOT_DEPLOYED } from "@/lib/contracts";
import { Connect } from "./Connect";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { IconMenu, IconClose } from "./icons";
import { useTranslation } from "@/lib/i18n";

const DOCS_URL = "https://ritesh5969.gitbook.io/jjan-docs/";

// Shared header for both routes. The section nav is homepage-only — on the
// dashboard those links are just noise, and the brand still links back to `/`.
// It also waits for a usable wallet, so a first-time visitor sees only the brand
// and the connect button.
export function TopBar() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const wrongChain = isConnected && chainId !== giwaTestnet.id;
  const showNav = pathname === "/";
  const canAccessDashboard = isConnected && !wrongChain && !NOT_DEPLOYED;

  const { language, t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile menu on Escape key press
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  return (
    <div className="topbar">
      <Link className="brand" href="/">
        <svg className="logo" width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: "8px", display: "block" }}>
          <rect width="100" height="100" rx="24" fill="#0d0d0d"/>
          <circle cx="50" cy="50" r="27" fill="none" stroke="#ffffff" strokeWidth="10"/>
          <circle cx="50" cy="23" r="6.5" fill="#12a150"/>
        </svg>
        <h1>Jjan</h1>
        <span className="ko">
          짠<i className="sep" />{t.topBar.logoText}
        </span>
      </Link>
      {showNav && (
        <nav className="topnav" style={{ marginLeft: "24px" }}>
          {canAccessDashboard && (
            <Link className="navlink" href="/dashboard">
              {t.topBar.dashboard}
            </Link>
          )}
          <Link className="navlink active" href="/">
            {t.topBar.home}
          </Link>
          <Link className="navlink" href="/#how">
            {t.topBar.howItWorks}
          </Link>
          <Link className="navlink" href="/#faq">
            {t.topBar.faq}
          </Link>
          <a className="navlink" href={DOCS_URL} target="_blank" rel="noreferrer">
            {t.topBar.docs}
          </a>
        </nav>
      )}
      <div className="topbar-right">
        <div className="topbar-end">
          {showNav && (
            <button
              className="menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <IconMenu size={16} />
            </button>
          )}
          <ThemeSwitcher />
          <LanguageSwitcher />
          <Connect />
        </div>
      </div>

      {showNav && isMenuOpen && (
        <div className="mobile-nav-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="mobile-nav-card" onClick={(e) => e.stopPropagation()}>
            <button className="mobile-nav-close" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
              <IconClose size={18} />
            </button>
            <nav className="mobile-nav-links">
              {canAccessDashboard && (
                <Link className="mobile-navlink" href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  {t.topBar.dashboard}
                </Link>
              )}
              <Link className={`mobile-navlink ${pathname === "/" ? "active" : ""}`} href="/" onClick={() => setIsMenuOpen(false)}>
                {t.topBar.home}
              </Link>
              <Link className="mobile-navlink" href="/#how" onClick={() => setIsMenuOpen(false)}>
                {t.topBar.howItWorks}
              </Link>
              <Link className="mobile-navlink" href="/#faq" onClick={() => setIsMenuOpen(false)}>
                {t.topBar.faq}
              </Link>
              <a className="mobile-navlink" href={DOCS_URL} target="_blank" rel="noreferrer" onClick={() => setIsMenuOpen(false)}>
                {t.topBar.docs}
              </a>
            </nav>
            <div style={{ marginTop: "24px", borderTop: "1px solid var(--border)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", color: "var(--muted)", fontWeight: 500 }}>{language === "ko" ? "테마" : "Theme"}</span>
                <ThemeSwitcher />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", color: "var(--muted)", fontWeight: 500 }}>{language === "ko" ? "언어" : "Language"}</span>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Shown on both routes when the contract addresses haven't been configured.
export function NotWiredNotice() {
  const { t } = useTranslation();
  if (!NOT_DEPLOYED) return null;
  return (
    <div className="card">
      <h2>{t.topBar.notWiredTitle}</h2>
      <p className="sub">
        {t.topBar.notWiredDesc}
      </p>
    </div>
  );
}
