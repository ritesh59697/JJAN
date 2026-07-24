"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract, useChainId, useSwitchChain } from "wagmi";
import type { Address } from "viem";
import { abis, addresses } from "@/lib/contracts";
import { giwaTestnet } from "@/lib/chain";
import { Connect } from "./Connect";
import { Faucet } from "./Faucet";
import { CreateCircle } from "./CreateCircle";
import { CircleDetail } from "./CircleDetail";
import { CircleRow } from "./CircleRow";
import { Landing } from "./Landing";
import { IconArrowLeft } from "./icons";

const NOT_DEPLOYED = addresses.factory === "0x0000000000000000000000000000000000000000";

type View = "app" | "home";
type Anchor = "top" | "how" | "faq";

export default function Home() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();
  const wrongChain = isConnected && chainId !== giwaTestnet.id;
  const [selected, setSelected] = useState<Address | null>(null);
  const [view, setView] = useState<View>("app");
  const [anchor, setAnchor] = useState<Anchor>("top");

  const { data: circles, refetch } = useReadContract({
    address: addresses.factory,
    abi: abis.factory as any,
    functionName: "allCircles",
    query: { enabled: !NOT_DEPLOYED },
  });
  const list = (circles as Address[]) ?? [];

  const inApp = isConnected && !wrongChain && !NOT_DEPLOYED;

  const goApp = () => {
    setView("app");
    setSelected(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goHome = (a: Anchor = "top") => {
    setSelected(null);
    setAnchor(a);
    setView("home");
  };

  // Scroll to the top (or the requested section) once the homepage is rendered.
  useEffect(() => {
    if (view !== "home") return;
    const t = setTimeout(() => {
      if (anchor === "top") window.scrollTo({ top: 0, behavior: "smooth" });
      else document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 90);
    return () => clearTimeout(t);
  }, [view, anchor]);

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand" role="button" tabIndex={0} onClick={() => goHome("top")} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && goHome("top")}>
          <h1>Jjan</h1>
          <span className="ko">짠<i className="sep" />on-chain 곗돈</span>
        </div>
        {inApp && (
          <nav className="topnav">
            <button className={`navlink ${view === "app" ? "active" : ""}`} onClick={goApp}>Dashboard</button>
            <button className={`navlink ${view === "home" && anchor === "top" ? "active" : ""}`} onClick={() => goHome("top")}>Home</button>
            <button className={`navlink ${view === "home" && anchor === "how" ? "active" : ""}`} onClick={() => goHome("how")}>How it works</button>
            <button className={`navlink ${view === "home" && anchor === "faq" ? "active" : ""}`} onClick={() => goHome("faq")}>FAQ</button>
          </nav>
        )}
        <Connect />
      </div>
      {inApp && view === "app" ? (
        <p className="tag net">
          <span className="dot" /> Connected to {giwaTestnet.name} testnet, mock KRW (not real funds)
        </p>
      ) : !isConnected ? (
        <p className="tag">Save with friends. The smart contract holds the pot, so no organizer can run off with it. Built on GIWA.</p>
      ) : null}

      {NOT_DEPLOYED && (
        <div className="card">
          <h2>Contracts not wired yet</h2>
          <p className="sub">
            Deploy with <span className="mono">forge script script/Deploy.s.sol</span>, then set{" "}
            <span className="mono">NEXT_PUBLIC_FACTORY</span>, <span className="mono">NEXT_PUBLIC_MKRW</span> and{" "}
            <span className="mono">NEXT_PUBLIC_REPUTATION</span> in <span className="mono">web/.env.local</span>.
            The UI below is fully wired and will light up once those are set.
          </p>
        </div>
      )}

      {!isConnected ? (
        <Landing />
      ) : (
        wrongChain ? (
        <div className="card">
          <h2>Switch to GIWA Sepolia</h2>
          <p className="sub">
            Your wallet is on the wrong network. Jjan runs on GIWA Sepolia (chain {giwaTestnet.id}). Switch
            networks to create or join a circle.
          </p>
          <button className="gold" onClick={() => switchChain({ chainId: giwaTestnet.id })} disabled={switching}>
            {switching ? "Switching…" : "Switch to GIWA Sepolia"}
          </button>
        </div>
        ) : view === "home" ? (
        <Landing onEnterApp={goApp} />
        ) : (
        <>
          <Faucet />
          {selected ? (
            <>
              <button className="ghost" onClick={() => setSelected(null)}><IconArrowLeft /> All circles</button>
              <CircleDetail circle={selected} />
            </>
          ) : (
            <>
              <CreateCircle onCreated={() => refetch()} />
              <div className="card">
                <h2>Circles</h2>
                <p className="sub">{list.length} created</p>
                {list.length === 0 && <p className="empty">No circles yet. Start one above.</p>}
                {list.map((c) => (
                  <CircleRow key={c} circle={c} onOpen={() => setSelected(c)} />
                ))}
              </div>
            </>
          )}
        </>
        )
      )}
    </div>
  );
}
