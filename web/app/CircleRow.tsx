"use client";

import { useAccount, useReadContracts } from "wagmi";
import { formatUnits, type Address } from "viem";
import { abis } from "@/lib/contracts";
import { IconArrowRight } from "./icons";

function short(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
const fmt = (v?: bigint) => (v === undefined ? "-" : Number(formatUnits(v, 18)).toLocaleString());

// A scannable circle summary for the list: status, round, pot, and whether the
// connected wallet is a member or up next, so you can read a circle without opening it.
export function CircleRow({ circle, onOpen }: { circle: Address; onOpen: () => void }) {
  const { address } = useAccount();
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

  const status = loading ? "Loading…" : finished ? "Finished" : started ? `Round ${round + 1} / ${n}` : "Forming";
  const statusCls = started && !finished ? "ok" : "";

  return (
    <div className="circle-item" onClick={onOpen}>
      <div className="ci-main">
        <div className="ci-top">
          <span className="mono">{short(circle)}</span>
          {isMine && <span className="tagchip">You&apos;re in</span>}
          {myTurn && <span className="tagchip turn">Your turn <IconArrowRight size={11} /></span>}
        </div>
        <div className="ci-meta">
          {loading ? (
            <span className="skeleton" style={{ width: 160 }} />
          ) : (
            <>
              <span>{n} members</span>
              <i className="sep" />
              <span>{fmt(pot)} mKRW pot</span>
            </>
          )}
        </div>
      </div>
      <div className="ci-right">
        <span className={`pill ${statusCls}`}>{status}</span>
        <span className="ci-open">Open <IconArrowRight /></span>
      </div>
    </div>
  );
}
