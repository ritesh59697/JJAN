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
import { useTranslation } from "@/lib/i18n";

export default function Dashboard() {
  const { isConnected, status } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();
  const wrongChain = isConnected && chainId !== giwaTestnet.id;
  const [selected, setSelected] = useState<Address | null>(null);
  const [hiddenCircles, setHiddenCircles] = useState<string[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const stored = localStorage.getItem("jjan_hidden_circles");
    if (stored) {
      try {
        setHiddenCircles(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const hideCircle = (addr: string) => {
    const next = [...hiddenCircles, addr.toLowerCase()];
    setHiddenCircles(next);
    localStorage.setItem("jjan_hidden_circles", JSON.stringify(next));
  };

  const unhideAll = () => {
    setHiddenCircles([]);
    localStorage.removeItem("jjan_hidden_circles");
  };

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
  const visibleList = [...list].reverse().filter((c) => !hiddenCircles.includes(c.toLowerCase()));

  return (
    <div className="container">
      <TopBar />
      {isConnected && !wrongChain && !NOT_DEPLOYED && (
        <p className="tag net">
          {t.topBar.connectedTo} {giwaTestnet.name} {t.topBar.testnetNotice}
        </p>
      )}

      <NotWiredNotice />

      {settling ? (
        <div className="card">
          <p className="sub">{t.dashboard.checkingWallet}</p>
        </div>
      ) : !isConnected ? (
        <div className="card">
          <h2>{t.dashboard.connectWallet}</h2>
          <p className="sub">
            {t.dashboard.connectDesc}
          </p>
          <Connect />
        </div>
      ) : wrongChain ? (
        <div className="card">
          <h2>{t.dashboard.switchNetwork}</h2>
          <p className="sub">
            {t.dashboard.wrongChainDesc.replace("{id}", String(giwaTestnet.id))}
          </p>
          <button className="gold" onClick={() => switchChain({ chainId: giwaTestnet.id })} disabled={switching}>
            {switching ? t.dashboard.switching : t.dashboard.switchNetwork}
          </button>
        </div>
      ) : (
        <>
          <Faucet />
          {selected ? (
            <>
              <button className="ghost" onClick={() => setSelected(null)}>
                <IconArrowLeft /> {t.dashboard.allCircles}
              </button>
              <CircleDetail circle={selected} />
            </>
          ) : (
            <>
              <CreateCircle onCreated={() => refetch()} />
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <h2 style={{ margin: 0 }}>{t.dashboard.circlesHeader}</h2>
                  {hiddenCircles.length > 0 && (
                    <button className="chip-btn" onClick={unhideAll} style={{ fontSize: "11px", padding: "4px 10px" }}>
                      {t.dashboard.showAll.replace("{count}", String(hiddenCircles.length))}
                    </button>
                  )}
                </div>
                <p className="sub">{t.dashboard.createdCount.replace("{count}", String(list.length))}</p>
                {visibleList.length === 0 && (
                  <p className="empty">
                    {hiddenCircles.length > 0 ? t.dashboard.noCircles : t.dashboard.noCirclesNone}
                  </p>
                )}
                {visibleList.map((c) => (
                  <CircleRow key={c} circle={c} onOpen={() => setSelected(c)} onHide={() => hideCircle(c)} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
