"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { Connect } from "./Connect";
import { AsciiHero } from "./AsciiHero";
import { InfoSections } from "./InfoSections";
import { IconBolt, IconArrowRight } from "./icons";
import { giwaTestnet } from "@/lib/chain";
import { useTranslation } from "@/lib/i18n";

// Once a wallet is connected the CTAs link straight to /dashboard; otherwise they
// show the connect button, since the dashboard is useless without a wallet.
export function Landing() {
  const { isConnected } = useAccount();
  const { t } = useTranslation();

  const renderCta = () =>
    isConnected ? (
      <Link className="btn-link" href="/dashboard">
        {t.landing.openDashboard} <IconArrowRight />
      </Link>
    ) : (
      <Connect />
    );

  return (
    <>
      <section className="hero">
        <h1>
          <span className="faint">{t.landing.heroTitleFaint}</span>
          <br />
          {t.landing.heroTitleStrong}
        </h1>
        <p className="lead">
          {t.landing.lead}
        </p>
        <div className="hero-badges">
          <span className="b">{t.landing.badgeCustody}</span>
          <span className="b"><IconBolt /> {t.landing.badgeSpeed}</span>
        </div>
        <div className="hero-cta">{renderCta()}</div>
        <AsciiHero />
      </section>

      <InfoSections />

      <section className="section closing">
        <h2>{t.landing.closingTitle}</h2>
        {renderCta()}
      </section>

      <footer className="landing-footer">
        {giwaTestnet.name} {t.topBar.testnetNotice}<i className="sep" />
        <a href="https://ritesh5969.gitbook.io/jjan-docs/" target="_blank" rel="noreferrer">
          {t.topBar.docs}
        </a>
        <i className="sep" />
        <a href={giwaTestnet.blockExplorers.default.url} target="_blank" rel="noreferrer">
          Explorer
        </a>
      </footer>
    </>
  );
}
