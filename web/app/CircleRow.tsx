"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { formatUnits, type Address } from "viem";
import { abis } from "@/lib/contracts";
import { IconArrowRight, IconClose } from "./icons";
import { useTranslation } from "@/lib/i18n";

function short(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
const fmt = (v?: bigint) => (v === undefined ? "-" : Number(formatUnits(v, 18)).toLocaleString());

// A scannable circle summary for the list: status, round, pot, and whether the
// connected wallet is a member or up next, so you can read a circle without opening it.
export function CircleRow({ circle, onOpen, onHide }: { circle: Address; onOpen: () => void; onHide?: () => void }) {
  const { address } = useAccount();
  const { t } = useTranslation();

  const [localName, setLocalName] = useState<string | null>(null);

  useEffect(() => {
    const loadName = () => {
      const stored = localStorage.getItem(`jjan_circle_name_${circle.toLowerCase()}`);
      setLocalName(stored);
    };
    loadName();
    window.addEventListener("jjan_name_update", loadName);
    return () => window.removeEventListener("jjan_name_update", loadName);
  }, [circle]);
  const base = { address: circle, abi: abis.circle as any } as const;

  const { data } = useReadContracts({
    contracts: [
      { ...base, functionName: "members" },
      { ...base, functionName: "contribution" },
      { ...base, functionName: "started" },
      { ...base, functionName: "finished" },
      { ...base, functionName: "currentRound" },
    ],
  });

  const loading = !data;
  const members = (data?.[0]?.result as Address[]) ?? [];
  const contribution = data?.[1]?.result as bigint | undefined | null;
  const started = data?.[2]?.result as boolean | undefined | null;
  const finished = data?.[3]?.result as boolean | undefined | null;
  const round = Number((data?.[4]?.result as bigint | undefined | null) ?? 0n);

  const n = members.length;
  const pot = contribution !== undefined && contribution !== null ? contribution * BigInt(n) : undefined;
  const recipient = started === true && finished === false ? members[round] : undefined;
  const me = address?.toLowerCase();
  const isMine = !!me && members.some((m) => m.toLowerCase() === me);
  const myTurn = !!me && !!recipient && recipient.toLowerCase() === me;

  const status = loading 
    ? "Loading…" 
    : finished 
    ? t.row.finished 
    : started 
    ? t.row.roundN.replace("{num}", String(round + 1)).replace("{total}", String(n)) 
    : t.row.forming;
  const statusCls = started && !finished ? "ok" : "";

  return (
    <div className="circle-item" onClick={onOpen}>
      <div className="ci-main">
        <div className="ci-top">
          {localName ? (
            <>
              <span style={{ fontWeight: 700, marginRight: "6px" }}>{localName}</span>
              <span className="mono" style={{ fontSize: "11px", color: "var(--muted)", marginRight: "8px" }}>({short(circle)})</span>
            </>
          ) : (
            <span className="mono" style={{ fontSize: "14px", marginRight: "8px" }}>{short(circle)}</span>
          )}
          {isMine && <span className="tagchip">{t.row.youreIn}</span>}
          {myTurn && <span className="tagchip turn">{t.row.yourTurn} <IconArrowRight size={11} /></span>}
        </div>
        <div className="ci-meta">
          {loading ? (
            <span className="skeleton" style={{ width: 160 }} />
          ) : (
            <>
              <span>{t.row.membersCount.replace("{count}", String(n))}</span>
              <i className="sep" />
              <span>{t.row.potCount.replace("{amount}", fmt(pot))}</span>
            </>
          )}
        </div>
      </div>
      <div className="ci-right">
        <span className={`pill ${statusCls}`}>{status}</span>
        {onHide && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onHide();
            }}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              color: "var(--muted)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              marginRight: "4px",
              transition: "background 0.2s, color 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "var(--border)";
              e.currentTarget.style.color = "var(--text)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--muted)";
            }}
            title={t.row.hide}
          >
            <IconClose size={14} />
          </button>
        )}
        <span className="ci-open">{t.row.open} <IconArrowRight /></span>
      </div>
    </div>
  );
}
