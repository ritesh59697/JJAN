"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, isAddress, getAddress, parseEventLogs, type Address } from "viem";
import { abis, addresses } from "@/lib/contracts";
import { TxLink } from "./TxLink";
import { IconCheck, IconClose } from "./icons";
import { useTranslation } from "@/lib/i18n";

// Show currency amounts with thousands separators while keeping raw digits in state.
const rawNum = (s: string) => s.replace(/[^\d.]/g, "");
const fmtNum = (s: string) => {
  if (!s) return "";
  const [int, dec] = s.split(".");
  const n = int.replace(/^0+(?=\d)/, "");
  return (n === "" ? "0" : Number(n).toLocaleString("en-US")) + (dec !== undefined ? "." + dec : "");
};

export function CreateCircle({ onCreated }: { onCreated: () => void }) {
  const { address } = useAccount();
  const [circleName, setCircleName] = useState("");
  const [members, setMembers] = useState<string[]>(["", ""]);
  const [amount, setAmount] = useState("100000");
  const [bond, setBond] = useState("50000");
  const [minutes, setMinutes] = useState("5");
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: mining, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (writeError) {
      const e = writeError as any;
      setError(e?.shortMessage ?? e?.message ?? "Transaction failed.");
    }
  }, [writeError]);

  useEffect(() => {
    // let the parent refresh the list once the tx confirms
    if (isSuccess) {
      onCreated();
      if (receipt && circleName.trim()) {
        try {
          const logs = parseEventLogs({
            abi: abis.factory,
            eventName: "CircleCreated",
            logs: receipt.logs,
          }) as any[];
          if (logs && logs.length > 0) {
            const createdAddress = logs[0].args.circle;
            if (createdAddress) {
              localStorage.setItem(`jjan_circle_name_${createdAddress.toLowerCase()}`, circleName.trim());
              window.dispatchEvent(new Event("jjan_name_update"));
            }
          }
        } catch (e) {
          console.error("Failed to parse logs for circle name:", e);
        }
      }
      setMembers(["", ""]);
      setCircleName("");
    }
  }, [isSuccess, receipt, onCreated, circleName]);

  function addMyWallet() {
    if (!address) return;
    setMembers((prev) => {
      if (prev.some((m) => m.trim().toLowerCase() === address.toLowerCase())) return prev;
      const firstEmptyIdx = prev.findIndex((m) => !m.trim());
      if (firstEmptyIdx !== -1) {
        const next = [...prev];
        next[firstEmptyIdx] = address;
        return next;
      }
      return [...prev, address];
    });
  }

  const alreadyIn =
    !!address && members.some((m) => m.trim().toLowerCase() === address.toLowerCase());

  function submit() {
    setError(null);
    const order = members
      .map((s) => s.trim())
      .filter(Boolean);
    if (order.length < 2) return setError(t.create.errMinMembers);
    // Accept any-case addresses (don't require a checksum), then normalize.
    const invalid = order.find((a) => !isAddress(a, { strict: false }));
    if (invalid) return setError(t.create.errInvalidAddr.replace("{addr}", invalid));
    const normalized = order.map((a) => getAddress(a)) as Address[];
    const lower = normalized.map((a) => a.toLowerCase());
    if (new Set(lower).size !== lower.length)
      return setError(t.create.errDuplicateAddr);

    try {
      writeContract({
        address: addresses.factory,
        abi: abis.factory as any,
        functionName: "createCircle",
        args: [
          addresses.mkrw,
          parseUnits(amount || "0", 18),
          BigInt(Number(minutes) * 60),
          parseUnits(bond || "0", 18),
          normalized,
        ],
      });
    } catch (e: any) {
      setError(e?.shortMessage ?? e?.message ?? "Failed to submit.");
    }
  }

  return (
    <div className="card">
      <h2>{t.create.title}</h2>
      <p className="sub">{t.create.desc}</p>

      <div style={{ marginBottom: "16px" }}>
        <label>{t.create.circleNameLabel}</label>
        <input
          type="text"
          placeholder={t.create.circleNamePlaceholder}
          value={circleName}
          onChange={(e) => setCircleName(e.target.value)}
        />
      </div>

      <div className="label-row">
        <label>{t.create.memberWalletsLabel}</label>
        {address && (
          <button type="button" className="chip-btn" onClick={addMyWallet} disabled={alreadyIn}>
            {alreadyIn ? (<><IconCheck size={12} /> {t.create.addedMyWallet}</>) : t.create.addMyWallet}
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px", marginBottom: "16px" }}>
        {members.map((val, idx) => (
          <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span className="mono" style={{ fontSize: "13px", color: "var(--muted)", width: "24px", textAlign: "right" }}>
              #{idx + 1}
            </span>
            <input
              type="text"
              placeholder={t.create.memberInputPlaceholder.replace("{num}", String(idx + 1))}
              value={val}
              onChange={(e) => {
                const next = [...members];
                next[idx] = e.target.value;
                setMembers(next);
              }}
              style={{ fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}
            />
            {members.length > 2 && (
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  const next = members.filter((_, i) => i !== idx);
                  setMembers(next);
                }}
                style={{ padding: "10px", width: "42px", height: "42px", flexShrink: 0, display: "inline-flex", justifyContent: "center", alignItems: "center" }}
                title="Remove member"
              >
                <IconClose size={16} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="ghost"
          onClick={() => setMembers([...members, ""])}
          style={{ width: "fit-content", padding: "8px 16px", fontSize: "13px", marginTop: "4px" }}
        >
          {t.create.addMember}
        </button>
      </div>

      <div className="row">
        <div className="grow">
          <label>{t.create.contributionLabel}</label>
          <input inputMode="numeric" value={fmtNum(amount)} onChange={(e) => setAmount(rawNum(e.target.value))} />
        </div>
        <div className="grow">
          <label>{t.create.bondLabel}</label>
          <input inputMode="numeric" value={fmtNum(bond)} onChange={(e) => setBond(rawNum(e.target.value))} />
        </div>
        <div className="grow">
          <label>{t.create.roundLengthLabel}</label>
          <input inputMode="numeric" value={minutes} onChange={(e) => setMinutes(rawNum(e.target.value))} />
        </div>
      </div>

      <div className="row" style={{ marginTop: 16 }}>
        <button onClick={submit} disabled={isPending || mining}>
          {isPending ? t.create.confirmWallet : mining ? t.create.creating : t.create.createBtn}
        </button>
        {isSuccess && <span className="pill ok"><IconCheck size={12} /> {t.create.created}</span>}
        <TxLink hash={hash} />
      </div>
      {error && <p className="notice" style={{ color: "var(--accent)" }}>{error}</p>}
    </div>
  );
}
