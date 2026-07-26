"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, type Address } from "viem";
import { abis, addresses } from "@/lib/contracts";
import { TxLink } from "./TxLink";
import { IconCheck } from "./icons";

function short(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
const fmt = (v?: bigint | null) => (v === undefined || v === null ? "-" : Number(formatUnits(v, 18)).toLocaleString());

function RoundNode({
  member,
  index,
  circle,
  isCurrent,
  isDone,
  isUser,
  started,
}: {
  member: Address;
  index: number;
  circle: Address;
  isCurrent: boolean;
  isDone: boolean;
  isUser: boolean;
  started: boolean;
}) {
  const { data: joined } = useReadContract({
    address: circle,
    abi: abis.circle as any,
    functionName: "isMember",
    args: [member],
  });

  return (
    <div className={`round-node ${isCurrent ? "current" : ""} ${isDone ? "done" : ""}`}>
      <div className="r" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Round {index + 1} recipient</span>
        {!started && (
          <span style={{ fontSize: "0.85em", color: joined ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
            {joined ? "✓ Joined" : "⏳ Not joined"}
          </span>
        )}
      </div>
      <div className="who mono">
        {short(member)}
        {isUser ? " (you)" : ""}
      </div>
    </div>
  );
}

export function CircleDetail({ circle }: { circle: Address }) {
  const { address } = useAccount();
  const base = { address: circle, abi: abis.circle as any } as const;

  const [warning, setWarning] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000));

  const { data, refetch } = useReadContracts({
    contracts: [
      { ...base, functionName: "members" },
      { ...base, functionName: "contribution" },
      { ...base, functionName: "bond" },
      { ...base, functionName: "started" },
      { ...base, functionName: "finished" },
      { ...base, functionName: "currentRound" },
      { ...base, functionName: "totalBonds" },
      { ...base, functionName: "roundStart" },
      { ...base, functionName: "roundDuration" },
    ],
  });

  const members = (data?.[0]?.result as Address[]) ?? [];
  const contribution = data?.[1]?.result as bigint | undefined | null;
  const bond = data?.[2]?.result as bigint | undefined | null;
  const started = data?.[3]?.result as boolean | undefined | null;
  const finished = data?.[4]?.result as boolean | undefined | null;
  const currentRound = Number((data?.[5]?.result as bigint | undefined | null) ?? 0n);
  const totalBonds = data?.[6]?.result as bigint | undefined | null;
  const roundStart = data?.[7]?.result as bigint | undefined | null;
  const roundDuration = data?.[8]?.result as bigint | undefined | null;

  const joinedCount = bond && bond > 0n && totalBonds !== undefined && totalBonds !== null
    ? Number((totalBonds as bigint) / bond) 
    : (bond === 0n ? members.length : 0);
  const allJoined = members.length > 0 && joinedCount >= members.length;

  useEffect(() => {
    if (!started || finished) return;
    setNow(Math.floor(Date.now() / 1000));
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [started, finished, roundStart]); // refetching roundStart updates the countdown base

  const endTime = roundStart !== undefined && roundStart !== null && roundDuration !== undefined && roundDuration !== null
    ? Number((roundStart as bigint) + (roundDuration as bigint))
    : 0;
  const timeLeft = endTime > now ? endTime - now : 0;
  const canClose = timeLeft === 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const { data: isMemberOfCircle, refetch: refetchIsMember } = useReadContract({
    ...base,
    functionName: "isMember",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: addresses.mkrw,
    abi: abis.mkrw as any,
    functionName: "allowance",
    args: address && circle ? [address, circle] : undefined,
    query: { enabled: !!address && !!circle },
  });

  const { data: paidThisRound, refetch: refetchPaid } = useReadContract({
    ...base,
    functionName: "paid",
    args: address ? [BigInt(currentRound), address] : undefined,
    query: { enabled: !!address && started === true },
  });

  const { data: myBond, refetch: refetchMyBond } = useReadContract({
    ...base,
    functionName: "bondOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: mining } = useWaitForTransactionReceipt({
    hash,
    query: { enabled: !!hash },
  });
  const busy = isPending || mining;

  // Refetch when transactions complete
  useEffect(() => {
    if (hash && !mining) {
      refetch();
      refetchIsMember();
      refetchAllowance();
      refetchPaid();
      refetchMyBond();
    }
  }, [hash, mining, refetch, refetchIsMember, refetchAllowance, refetchPaid, refetchMyBond]);

  useEffect(() => {
    setWarning(null);
  }, [address, circle]);

  const hasAllowance = allowance !== undefined && allowance !== null && bond !== undefined && bond !== null && (allowance as bigint) >= bond;

  const tx = (functionName: string, args: any[] = []) =>
    writeContract({ ...base, functionName, args });

  const approveAndJoin = () => {
    setWarning(null);
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
        <div><div className="n">{fmt(contribution !== undefined && contribution !== null ? contribution * BigInt(members.length) : undefined)}</div><div className="l">pot / round</div></div>
      </div>

      <div className="round-track">
        {members.map((m, i) => (
          <RoundNode
            key={m}
            member={m}
            index={i}
            circle={circle}
            isCurrent={i === currentRound && !!started && !finished}
            isDone={i < currentRound}
            isUser={address !== undefined && m.toLowerCase() === address.toLowerCase()}
            started={!!started}
          />
        ))}
      </div>

      {warning && (
        <p className="notice" style={{ color: "#ef4444", borderColor: "#ef4444", backgroundColor: "rgba(239, 68, 68, 0.05)" }}>
          ⚠️ {warning}
        </p>
      )}

      <div className="row" style={{ marginTop: 8 }}>
        {!started && isMemberOfCircle === false && (
          <>
            {!hasAllowance ? (
              <button onClick={approveAndJoin} disabled={busy}>1. Approve mKRW</button>
            ) : (
              <button disabled className="ghost" style={{ cursor: "default" }}>
                <IconCheck size={12} /> mKRW Approved
              </button>
            )}
            <button
              className={hasAllowance ? "" : "ghost"}
              onClick={() => {
                if (!hasAllowance) {
                  setWarning("Allowance insufficient. You must click '1. Approve mKRW' and confirm the approval transaction first.");
                  return;
                }
                setWarning(null);
                tx("join");
              }}
              disabled={busy}
            >
              2. Join
            </button>
          </>
        )}
        {!started && (
          <button
            className="gold"
            onClick={() => {
              if (!allJoined) {
                setWarning("Cannot start circle until all invited members have joined and deposited their bonds.");
                return;
              }
              setWarning(null);
              tx("start");
            }}
            disabled={busy || !allJoined}
          >
            {allJoined ? "Start circle" : `Start circle (${joinedCount}/${members.length} joined)`}
          </button>
        )}
        {started && !finished && (
          <>
            <button onClick={() => tx("contribute")} disabled={busy || paidThisRound === true}>
              {paidThisRound ? (<><IconCheck /> Contributed</>) : "Contribute this round"}
            </button>
            <button
              className="gold"
              onClick={() => {
                if (!canClose) {
                  setWarning(`Round is not over yet. Please wait ${formatTime(timeLeft)} before closing.`);
                  return;
                }
                setWarning(null);
                tx("closeRound");
              }}
              disabled={busy || !canClose}
            >
              {canClose ? "Close round, pay out" : `Close round (${formatTime(timeLeft)})`}
            </button>
          </>
        )}
        {finished && (
          <button
            onClick={() => tx("withdrawBond")}
            disabled={busy || myBond === undefined || myBond === null || myBond === 0n}
          >
            {myBond === 0n ? (<><IconCheck /> Bond claimed</>) : "Withdraw bond"}
          </button>
        )}
        {busy && <span className="pill">Working…</span>}
        <TxLink hash={hash} />
      </div>

      <p className="notice">
        Payout goes to the round&apos;s scheduled member automatically. There is no function anywhere
        that lets the organizer take the pot.
      </p>
    </div>
  );
}
