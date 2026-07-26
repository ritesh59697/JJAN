"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { Connect } from "./Connect";
import { AsciiHero } from "./AsciiHero";
import { InfoSections } from "./InfoSections";
import { IconBolt, IconArrowRight } from "./icons";
import { giwaTestnet } from "@/lib/chain";

// Once a wallet is connected the CTAs link straight to /dashboard; otherwise they
// show the connect button, since the dashboard is useless without a wallet.
export function Landing() {
  const { isConnected } = useAccount();

  const renderCta = () =>
    isConnected ? (
      <Link className="btn-link" href="/dashboard">
        Open dashboard <IconArrowRight />
      </Link>
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
          <span className="b">Non-custodial by design</span>
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
