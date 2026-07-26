"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract, useChainId, useSwitchChain } from "wagmi";
import type { Address } from "viem";
import { abis, addresses, NOT_DEPLOYED } from "@/lib/contracts";
import { giwaTestnet } from "@/lib/chain";
import { TopBar, NotWiredNotice } from "../TopBar";
import { Connect } from "../Connect";
import { Faucet } from "../Faucet";
import { CreateCircle } from "../CreateCircle";
import { CircleDetail } from "../CircleDetail";
import { CircleRow } from "../CircleRow";
import { IconArrowLeft } from "../icons";

export default function Dashboard() {
  const { isConnected, status } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();
  const wrongChain = isConnected && chainId !== giwaTestnet.id;
  const [selected, setSelected] = useState<Address | null>(null);

  // wagmi restores the injected connection on the client, so the first paint
  // always reads as disconnected. Wait for that to settle before deciding which
  // guard to show, otherwise a connected user gets a flash of "connect wallet".
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const settling = !mounted || status === "connecting" || status === "reconnecting";

  const { data: circles, refetch } = useReadContract({
    address: addresses.factory,
    abi: abis.factory as any,
    functionName: "allCircles",
    query: { enabled: !NOT_DEPLOYED && isConnected && !wrongChain },
  });
  const list = (circles as Address[]) ?? [];

  return (
    <div className="container">
      <TopBar />
      {isConnected && !wrongChain && !NOT_DEPLOYED && (
        <p className="tag net">
          Connected to {giwaTestnet.name} testnet, mock KRW (not real funds)
        </p>
      )}

      <NotWiredNotice />

      {settling ? (
        <div className="card">
          <p className="sub">Checking your wallet…</p>
        </div>
      ) : !isConnected ? (
        <div className="card">
          <h2>Connect your wallet</h2>
          <p className="sub">
            The dashboard needs a wallet on GIWA Sepolia to read your circles and sign contributions.
          </p>
          <Connect />
        </div>
      ) : wrongChain ? (
        <div className="card">
          <h2>Switch to GIWA Sepolia</h2>
          <p className="sub">
            Your wallet is on the wrong network. Jjan runs on GIWA Sepolia (chain {giwaTestnet.id}). Switch networks to
            create or join a circle.
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
              <button className="ghost" onClick={() => setSelected(null)}>
                <IconArrowLeft /> All circles
              </button>
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
      )}
    </div>
  );
}
