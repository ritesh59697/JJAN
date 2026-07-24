"use client";

import { useState } from "react";
import { useAccount, useReadContract, useChainId, useSwitchChain } from "wagmi";
import type { Address } from "viem";
import { abis, addresses } from "@/lib/contracts";
import { giwaTestnet } from "@/lib/chain";
import { Connect } from "./Connect";
import { Faucet } from "./Faucet";
import { CreateCircle } from "./CreateCircle";
import { CircleDetail } from "./CircleDetail";

const NOT_DEPLOYED = addresses.factory === "0x0000000000000000000000000000000000000000";

function short(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export default function Home() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();
  const wrongChain = isConnected && chainId !== giwaTestnet.id;
  const [selected, setSelected] = useState<Address | null>(null);

  const { data: circles, refetch } = useReadContract({
    address: addresses.factory,
    abi: abis.factory as any,
    functionName: "allCircles",
    query: { enabled: !NOT_DEPLOYED },
  });
  const list = (circles as Address[]) ?? [];

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <h1>Jjan</h1>
          <span className="ko">짠 · on-chain 곗돈</span>
        </div>
        <Connect />
      </div>
      <p className="tag">Save with friends. The smart contract holds the pot — no organizer can run off with it. Built on GIWA.</p>

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
        <div className="card">
          <h2>Connect to begin</h2>
          <p className="sub">Connect a wallet on the GIWA testnet to create or join a circle.</p>
        </div>
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
        ) : (
        <>
          <Faucet />
          {selected ? (
            <>
              <button className="ghost" onClick={() => setSelected(null)}>← All circles</button>
              <CircleDetail circle={selected} />
            </>
          ) : (
            <>
              <CreateCircle onCreated={() => refetch()} />
              <div className="card">
                <h2>Circles</h2>
                <p className="sub">{list.length} created</p>
                {list.length === 0 && <p className="empty">No circles yet — start one above.</p>}
                {list.map((c) => (
                  <div key={c} className="circle-item" onClick={() => setSelected(c)}>
                    <span className="mono">{short(c)}</span>
                    <span className="pill">Open →</span>
                  </div>
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
