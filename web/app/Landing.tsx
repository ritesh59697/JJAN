"use client";

import { Connect } from "./Connect";
import { AsciiHero } from "./AsciiHero";
import { InfoSections } from "./InfoSections";
import { IconBolt, IconArrowRight } from "./icons";
import { giwaTestnet } from "@/lib/chain";

// `onEnterApp` is passed only when the wallet is already connected (viewing the
// homepage from inside the app), so the CTAs route to the dashboard instead of
// showing the connect button again.
export function Landing({ onEnterApp }: { onEnterApp?: () => void }) {
  const renderCta = () =>
    onEnterApp ? (
      <button onClick={onEnterApp}>
        Open dashboard <IconArrowRight />
      </button>
    ) : (
      <Connect />
    );

  return (
    <>
      <section className="hero">
        <h1>
          <span className="faint">Save with friends.</span>
          <br />
          No one runs off with it.
        </h1>
        <p className="lead">
          A trustless, on-chain <span className="ko">곗돈</span>. Rotating savings circles where the smart
          contract holds the pot, not an organizer who could run off with it.
        </p>
        <div className="hero-badges">
          <span className="b"><span className="dot" /> Non-custodial by design</span>
          <span className="b"><IconBolt /> ~1s payouts on GIWA</span>
        </div>
        <div className="hero-cta">{renderCta()}</div>
        <AsciiHero />
      </section>

      <InfoSections />

      <section className="section closing">
        <h2>Start a circle with people you trust. Let the contract handle the rest.</h2>
        {renderCta()}
      </section>

      <footer className="landing-footer">
        {giwaTestnet.name} testnet<i className="sep" />mock KRW, not real funds<i className="sep" />
        <a href={giwaTestnet.blockExplorers.default.url} target="_blank" rel="noreferrer">
          Explorer
        </a>
      </footer>
    </>
  );
}
