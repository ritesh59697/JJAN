"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, isAddress, getAddress, type Address } from "viem";
import { abis, addresses } from "@/lib/contracts";
import { TxLink } from "./TxLink";
import { IconCheck } from "./icons";

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
  const [members, setMembers] = useState("");
  const [amount, setAmount] = useState("100000");
  const [bond, setBond] = useState("50000");
  const [minutes, setMinutes] = useState("5");
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: mining, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (writeError) {
      const e = writeError as any;
      setError(e?.shortMessage ?? e?.message ?? "Transaction failed.");
    }
  }, [writeError]);

  useEffect(() => {
    // let the parent refresh the list once the tx confirms
    if (isSuccess) onCreated();
  }, [isSuccess, onCreated]);

  function addMyWallet() {
    if (!address) return;
    setMembers((m) => {
      const lines = m.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
      if (lines.some((l) => l.toLowerCase() === address.toLowerCase())) return m;
      return (m.trim() ? m.replace(/\s*$/, "") + "\n" : "") + address;
    });
  }

  const alreadyIn =
    !!address && members.split(/[\s,]+/).some((l) => l.trim().toLowerCase() === address.toLowerCase());

  function submit() {
    setError(null);
    const order = members
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (order.length < 2) return setError("Add at least 2 member addresses.");
    // Accept any-case addresses (don't require a checksum), then normalize.
    const invalid = order.find((a) => !isAddress(a, { strict: false }));
    if (invalid) return setError(`Not a valid wallet address: ${invalid}`);
    const normalized = order.map((a) => getAddress(a)) as Address[];
    const lower = normalized.map((a) => a.toLowerCase());
    if (new Set(lower).size !== lower.length)
      return setError("Duplicate address. Each member must appear once.");

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
      <h2>Start a savings circle</h2>
      <p className="sub">Everyone contributes each round; the pot rotates. The contract holds the money, not you.</p>

      <div className="label-row">
        <label>Member wallets (one per line, in payout order)</label>
        {address && (
          <button type="button" className="chip-btn" onClick={addMyWallet} disabled={alreadyIn}>
            {alreadyIn ? (<><IconCheck size={12} /> You&apos;re added</>) : "+ Add my wallet"}
          </button>
        )}
      </div>
      <textarea
        placeholder={"0xAlice…\n0xBob…\n0xCarol…"}
        value={members}
        onChange={(e) => setMembers(e.target.value)}
      />

      <div className="row">
        <div className="grow">
          <label>Contribution / round (mKRW)</label>
          <input inputMode="numeric" value={fmtNum(amount)} onChange={(e) => setAmount(rawNum(e.target.value))} />
        </div>
        <div className="grow">
          <label>Bond (mKRW)</label>
          <input inputMode="numeric" value={fmtNum(bond)} onChange={(e) => setBond(rawNum(e.target.value))} />
        </div>
        <div className="grow">
          <label>Round length (minutes)</label>
          <input inputMode="numeric" value={minutes} onChange={(e) => setMinutes(rawNum(e.target.value))} />
        </div>
      </div>

      <div className="row" style={{ marginTop: 16 }}>
        <button onClick={submit} disabled={isPending || mining}>
          {isPending ? "Confirm in wallet…" : mining ? "Creating…" : "Create circle"}
        </button>
        {isSuccess && <span className="pill ok"><IconCheck size={12} /> Created</span>}
        <TxLink hash={hash} />
      </div>
      {error && <p className="notice" style={{ color: "var(--accent)" }}>{error}</p>}
    </div>
  );
}
