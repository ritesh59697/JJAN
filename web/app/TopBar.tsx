"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useChainId } from "wagmi";
import { giwaTestnet } from "@/lib/chain";
import { NOT_DEPLOYED } from "@/lib/contracts";
import { Connect } from "./Connect";
import { ThemeSwitcher } from "./ThemeSwitcher";

// Shared header for both routes. The section nav is homepage-only — on the
// dashboard those links are just noise, and the brand still links back to `/`.
// It also waits for a usable wallet, so a first-time visitor sees only the brand
// and the connect button.
export function TopBar() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const wrongChain = isConnected && chainId !== giwaTestnet.id;
  const showNav = pathname === "/" && isConnected && !wrongChain && !NOT_DEPLOYED;

  return (
    <div className="topbar">
      <Link className="brand" href="/">
        <h1>Jjan</h1>
        <span className="ko">
          짠<i className="sep" />on-chain 곗돈
        </span>
      </Link>
      {showNav && (
        <nav className="topnav">
          <Link className="navlink" href="/dashboard">
            Dashboard
          </Link>
          <Link className="navlink active" href="/">
            Home
          </Link>
          <Link className="navlink" href="/#how">
            How it works
          </Link>
          <Link className="navlink" href="/#faq">
            FAQ
          </Link>
        </nav>
      )}
      <div className="topbar-end">
        <ThemeSwitcher />
        <Connect />
      </div>
    </div>
  );
}

// Shown on both routes when the contract addresses haven't been configured.
export function NotWiredNotice() {
  if (!NOT_DEPLOYED) return null;
  return (
    <div className="card">
      <h2>Contracts not wired yet</h2>
      <p className="sub">
        Deploy with <span className="mono">forge script script/Deploy.s.sol</span>, then set{" "}
        <span className="mono">NEXT_PUBLIC_FACTORY</span>, <span className="mono">NEXT_PUBLIC_MKRW</span> and{" "}
        <span className="mono">NEXT_PUBLIC_REPUTATION</span> in <span className="mono">web/.env.local</span>. The UI is
        fully wired and will light up once those are set.
      </p>
    </div>
  );
}
