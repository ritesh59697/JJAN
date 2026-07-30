"use client";

import { giwaTestnet } from "@/lib/chain";
import { useTranslation } from "@/lib/i18n";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="landing-footer" style={{ marginTop: "48px", borderTop: "1px solid var(--border)", paddingTop: "32px", paddingBottom: "24px" }}>
      <div style={{ marginBottom: "10px" }}>
        {giwaTestnet.name} {t.topBar.testnetNotice}
        <i className="sep" />
        <a href="https://ritesh5969.gitbook.io/jjan-docs/" target="_blank" rel="noreferrer">
          {t.topBar.docs}
        </a>
        <i className="sep" />
        <a href={giwaTestnet.blockExplorers.default.url} target="_blank" rel="noreferrer">
          Explorer
        </a>
      </div>
      <div style={{ fontSize: "11.5px", opacity: 0.8 }}>
        {t.footer.builtBy}{" "}
        <a href="https://x.com/Ritesh5969" target="_blank" rel="noreferrer" style={{ fontWeight: 600, borderBottom: "1px solid var(--border-strong)" }}>
          ritesh5969
        </a>{" "}
        {t.footer.forProgram}{" "}
        <a href="https://giwa.io/gasok" target="_blank" rel="noreferrer" style={{ fontWeight: 600, borderBottom: "1px solid var(--border-strong)" }}>
          {t.footer.programName}
        </a>
      </div>
    </footer>
  );
}
