"use client";

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { giwaTestnet } from "@/lib/chain";

function short(a?: string) {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";
}

export function Connect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  if (!isConnected) {
    const injected = connectors[0];
    return (
      <button onClick={() => connect({ connector: injected })} disabled={isPending}>
        {isPending ? "Connecting…" : "Connect wallet"}
      </button>
    );
  }

  const wrongChain = chainId !== giwaTestnet.id;
  return (
    <div className="row">
      {wrongChain && (
        <button className="gold" onClick={() => switchChain({ chainId: giwaTestnet.id })}>
          Switch to GIWA
        </button>
      )}
      <span className="pill ok"><span className="dot" /> {short(address)}</span>
      <button className="ghost" onClick={() => disconnect()}>
        Disconnect
      </button>
    </div>
  );
}
