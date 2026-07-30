"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, type Address } from "viem";
import { abis, addresses } from "@/lib/contracts";
import { TxLink } from "./TxLink";
import { IconCheck } from "./icons";
import { useTranslation } from "@/lib/i18n";

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
  const { t } = useTranslation();

  return (
    <div className={`round-node ${isCurrent ? "current" : ""} ${isDone ? "done" : ""}`}>
      <div className="r" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{t.detail.roundRecipient.replace("{num}", String(index + 1))}</span>
        {!started && (
          joined ? (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              color: "var(--ok)",
              backgroundColor: "var(--go-bg)",
              border: "1px solid var(--go-border)",
              padding: "2px 8px",
              borderRadius: "999px",
              fontWeight: 600
            }}>
              <IconCheck size={10} /> {t.detail.statusJoined}
            </span>
          ) : (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              color: "var(--accent)",
              backgroundColor: "rgba(229, 72, 77, 0.06)",
              border: "1px solid rgba(229, 72, 77, 0.22)",
              padding: "2px 8px",
              borderRadius: "999px",
              fontWeight: 600
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flex: "none" }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {t.detail.statusNotJoined}
            </span>
          )
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
  const { t } = useTranslation();

  const [warning, setWarning] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000));

  const [localName, setLocalName] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    const loadName = () => {
      const stored = localStorage.getItem(`jjan_circle_name_${circle.toLowerCase()}`);
      setLocalName(stored || "");
      setNameInput(stored || "");
    };
    loadName();
    window.addEventListener("jjan_name_update", loadName);
    return () => window.removeEventListener("jjan_name_update", loadName);
  }, [circle]);

  const saveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      localStorage.setItem(`jjan_circle_name_${circle.toLowerCase()}`, trimmed);
      setLocalName(trimmed);
    } else {
      localStorage.removeItem(`jjan_circle_name_${circle.toLowerCase()}`);
      setLocalName("");
    }
    setIsEditingName(false);
    window.dispatchEvent(new Event("jjan_name_update"));
  };

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
  const { isLoading: mining, isSuccess } = useWaitForTransactionReceipt({
    hash,
    query: { enabled: !!hash },
  });
  const busy = isPending || mining;

  // Refetch when transactions complete
  useEffect(() => {
    if (isSuccess) {
      const doRefetch = () => {
        refetch();
        refetchIsMember();
        refetchAllowance();
        refetchPaid();
        refetchMyBond();
      };
      doRefetch();
      const t = setTimeout(doRefetch, 1000);
      return () => clearTimeout(t);
    }
  }, [isSuccess, refetch, refetchIsMember, refetchAllowance, refetchPaid, refetchMyBond]);

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

  const status = finished
    ? t.detail.finished
    : started
    ? t.detail.roundOf.replace("{current}", String(currentRound + 1)).replace("{total}", String(members.length))
    : t.detail.waitingMembers;

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          {isEditingName ? (
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px", marginBottom: "8px" }}>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={t.detail.renamePlaceholder}
                style={{ fontSize: "16px", padding: "6px 12px", width: "auto", maxWidth: "240px" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") {
                    setNameInput(localName);
                    setIsEditingName(false);
                  }
                }}
                autoFocus
              />
              <button onClick={saveName} className="chip-btn" style={{ padding: "6px 12px" }}>{t.detail.saveBtn}</button>
              <button onClick={() => { setNameInput(localName); setIsEditingName(false); }} className="chip-btn ghost" style={{ padding: "6px 12px" }}>{t.detail.cancelBtn}</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <h2 style={{ margin: 0 }}>{localName || `Circle ${short(circle)}`}</h2>
              <button
                onClick={() => setIsEditingName(true)}
                className="chip-btn"
                style={{ padding: "2px 8px", fontSize: "11px", height: "auto" }}
              >
                {t.detail.renameBtn}
              </button>
            </div>
          )}
          {localName && <p className="sub mono" style={{ margin: "4px 0 0" }}>{circle}</p>}
        </div>
        <span className={`pill ${started && !finished ? "ok" : ""}`} style={{ flexShrink: 0 }}>{status}</span>
      </div>
      {!localName && <p className="sub mono" style={{ margin: "4px 0 12px" }}>{circle}</p>}

      <div className="stat">
        <div><div className="n">{fmt(contribution)}</div><div className="l">{t.detail.mkrwRound}</div></div>
        <div><div className="n">{members.length}</div><div className="l">{t.detail.members}</div></div>
        <div><div className="n">{fmt(bond)}</div><div className="l">{t.detail.bond}</div></div>
        <div><div className="n">{fmt(contribution !== undefined && contribution !== null ? contribution * BigInt(members.length) : undefined)}</div><div className="l">{t.detail.potRound}</div></div>
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
              <button onClick={approveAndJoin} disabled={busy}>{t.detail.approveBtn}</button>
            ) : (
              <button disabled className="ghost" style={{ cursor: "default" }}>
                <IconCheck size={12} /> {t.detail.approvedBtn}
              </button>
            )}
            <button
              className={hasAllowance ? "" : "ghost"}
              onClick={() => {
                if (!hasAllowance) {
                  setWarning(t.detail.warningAllowance);
                  return;
                }
                setWarning(null);
                tx("join");
              }}
              disabled={busy}
            >
              {t.detail.joinBtn}
            </button>
          </>
        )}
        {!started && (
          <button
            className="gold"
            onClick={() => {
              if (!allJoined) {
                setWarning(t.detail.warningJoinedAll);
                return;
              }
              setWarning(null);
              tx("start");
            }}
            disabled={busy || !allJoined}
          >
            {allJoined ? t.detail.startCircle : t.detail.startCircleStatus.replace("{joined}", String(joinedCount)).replace("{total}", String(members.length))}
          </button>
        )}
        {started && !finished && (
          <>
            <button onClick={() => tx("contribute")} disabled={busy || paidThisRound === true}>
              {paidThisRound ? (<><IconCheck /> {t.detail.contributedBtn}</>) : t.detail.contributeBtn}
            </button>
            <button
              className="gold"
              onClick={() => {
                if (!canClose) {
                  setWarning(t.detail.warningRoundNotOver.replace("{time}", formatTime(timeLeft)));
                  return;
                }
                setWarning(null);
                tx("closeRound");
              }}
              disabled={busy || !canClose}
            >
              {canClose ? t.detail.closeRoundPay : t.detail.closeRoundTimer.replace("{time}", formatTime(timeLeft))}
            </button>
          </>
        )}
        {finished && (
          <button
            onClick={() => tx("withdrawBond")}
            disabled={busy || myBond === undefined || myBond === null || myBond === 0n}
          >
            {myBond === 0n ? (<><IconCheck /> {t.detail.bondClaimed}</>) : t.detail.withdrawBond}
          </button>
        )}
        {busy && <span className="pill">{t.detail.working}</span>}
        <TxLink hash={hash} />
      </div>

      <p className="notice">
        {t.detail.nonCustodialNotice}
      </p>
    </div>
  );
}
