"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, isAddress, type Address } from "viem";
import { abis, addresses } from "@/lib/contracts";

export function CreateCircle({ onCreated }: { onCreated: () => void }) {
  const [members, setMembers] = useState("");
  const [amount, setAmount] = useState("100000");
  const [bond, setBond] = useState("50000");
  const [minutes, setMinutes] = useState("5");
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: mining, isSuccess } = useWaitForTransactionReceipt({ hash });

  if (isSuccess) {
    // let the parent refresh the list once, then reset
    setTimeout(onCreated, 0);
  }

  function submit() {
    setError(null);
    const order = members
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (order.length < 2) return setError("Add at least 2 member addresses.");
    if (!order.every((a) => isAddress(a))) return setError("One of the addresses is invalid.");

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
          order as Address[],
        ],
      });
    } catch (e: any) {
      setError(e?.shortMessage ?? e?.message ?? "Failed to submit.");
    }
  }

  return (
    <div className="card">
      <h2>Start a savings circle</h2>
      <p className="sub">Everyone contributes each round; the pot rotates. The contract holds the money — not you.</p>

      <label>Member wallets (one per line, in payout order)</label>
      <textarea
        placeholder={"0xAlice…\n0xBob…\n0xCarol…"}
        value={members}
        onChange={(e) => setMembers(e.target.value)}
      />

      <div className="row">
        <div className="grow">
          <label>Contribution / round (mKRW)</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="grow">
          <label>Bond (mKRW)</label>
          <input value={bond} onChange={(e) => setBond(e.target.value)} />
        </div>
        <div className="grow">
          <label>Round length (minutes)</label>
          <input value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        </div>
      </div>

      <div className="row" style={{ marginTop: 16 }}>
        <button onClick={submit} disabled={isPending || mining}>
          {isPending ? "Confirm in wallet…" : mining ? "Creating…" : "Create circle"}
        </button>
        {isSuccess && <span className="pill ok">Created ✓</span>}
      </div>
      {error && <p className="notice" style={{ color: "var(--accent)" }}>{error}</p>}
    </div>
  );
}
