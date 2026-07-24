"use client";

import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, type Address } from "viem";
import { abis, addresses } from "@/lib/contracts";

function short(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
const fmt = (v?: bigint) => (v === undefined ? "—" : Number(formatUnits(v, 18)).toLocaleString());

export function CircleDetail({ circle }: { circle: Address }) {
  const { address } = useAccount();
  const base = { address: circle, abi: abis.circle as any } as const;

  const { data, refetch } = useReadContracts({
    contracts: [
      { ...base, functionName: "members" },
      { ...base, functionName: "contribution" },
      { ...base, functionName: "bond" },
      { ...base, functionName: "started" },
      { ...base, functionName: "finished" },
      { ...base, functionName: "currentRound" },
    ],
  });

  const members = (data?.[0]?.result as Address[]) ?? [];
  const contribution = data?.[1]?.result as bigint | undefined;
  const bond = data?.[2]?.result as bigint | undefined;
  const started = data?.[3]?.result as boolean | undefined;
  const finished = data?.[4]?.result as boolean | undefined;
  const currentRound = Number((data?.[5]?.result as bigint | undefined) ?? 0n);

  const { data: isMemberOfCircle } = useReadContract({
    ...base,
    functionName: "isMember",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: paidThisRound } = useReadContract({
    ...base,
    functionName: "paid",
    args: address ? [BigInt(currentRound), address] : undefined,
    query: { enabled: !!address && !!started },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: mining } = useWaitForTransactionReceipt({
    hash,
    query: { enabled: !!hash },
  });
  const busy = isPending || mining;
  if (hash && !mining) setTimeout(() => refetch(), 0);

  const tx = (functionName: string, args: any[] = []) =>
    writeContract({ ...base, functionName, args });

  const approveAndJoin = () => {
    // one-time max approval so contribute() also works without re-approving
    writeContract({
      address: addresses.mkrw,
      abi: abis.mkrw as any,
      functionName: "approve",
      args: [circle, (bond ?? 0n) + (contribution ?? 0n) * BigInt(members.length || 1)],
    });
  };

  const status = finished ? "Finished" : started ? `Round ${currentRound + 1} of ${members.length}` : "Waiting for members";

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h2>Circle {short(circle)}</h2>
        <span className={`pill ${started && !finished ? "ok" : ""}`}>{status}</span>
      </div>
      <p className="sub mono">{circle}</p>

      <div className="stat">
        <div><div className="n">{fmt(contribution)}</div><div className="l">mKRW / round</div></div>
        <div><div className="n">{members.length}</div><div className="l">members</div></div>
        <div><div className="n">{fmt(bond)}</div><div className="l">bond</div></div>
        <div><div className="n">{fmt(contribution ? contribution * BigInt(members.length) : undefined)}</div><div className="l">pot / round</div></div>
      </div>

      <div className="round-track">
        {members.map((m, i) => (
          <div key={m} className={`round-node ${i === currentRound && started && !finished ? "current" : ""} ${i < currentRound ? "done" : ""}`}>
            <div className="r">Round {i + 1} → paid to</div>
            <div className="who mono">{short(m)}{address && m.toLowerCase() === address.toLowerCase() ? " (you)" : ""}</div>
          </div>
        ))}
      </div>

      <div className="row" style={{ marginTop: 8 }}>
        {!started && isMemberOfCircle === false && (
          <>
            <button onClick={approveAndJoin} disabled={busy}>1. Approve mKRW</button>
            <button className="ghost" onClick={() => tx("join")} disabled={busy}>2. Join</button>
          </>
        )}
        {!started && (
          <button className="gold" onClick={() => tx("start")} disabled={busy}>Start circle</button>
        )}
        {started && !finished && (
          <>
            <button onClick={() => tx("contribute")} disabled={busy || paidThisRound === true}>
              {paidThisRound ? "Contributed ✓" : "Contribute this round"}
            </button>
            <button className="gold" onClick={() => tx("closeRound")} disabled={busy}>
              Close round → pay out
            </button>
          </>
        )}
        {finished && (
          <button onClick={() => tx("withdrawBond")} disabled={busy}>Withdraw bond</button>
        )}
        {busy && <span className="pill">Working…</span>}
      </div>

      <p className="notice">
        Payout goes to the round&apos;s scheduled member automatically — there is no function anywhere
        that lets the organizer take the pot.
      </p>
    </div>
  );
}
