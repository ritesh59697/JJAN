"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { abis, addresses } from "@/lib/contracts";

const fmt = (v?: bigint) => (v === undefined ? "—" : Number(formatUnits(v, 18)).toLocaleString());

export function Faucet() {
  const { address } = useAccount();

  const { data: eth } = useBalance({ address, query: { enabled: !!address } });
  const { data: mkrw, refetch } = useReadContract({
    address: addresses.mkrw,
    abi: abis.mkrw as any,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: mining } = useWaitForTransactionReceipt({ hash, query: { enabled: !!hash } });
  if (hash && !mining) setTimeout(() => refetch(), 0);

  const mint = () =>
    writeContract({
      address: addresses.mkrw,
      abi: abis.mkrw as any,
      functionName: "faucet",
      args: [parseUnits("1000000", 18)], // 1,000,000 mKRW
    });

  return (
    <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
      <div className="row" style={{ gap: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{fmt(mkrw as bigint | undefined)} <span style={{ color: "var(--muted)", fontSize: 13, fontWeight: 400 }}>mKRW</span></div>
          <div className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>test stablecoin balance</div>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{eth ? Number(eth.formatted).toFixed(4) : "—"} <span style={{ color: "var(--muted)", fontSize: 13, fontWeight: 400 }}>ETH</span></div>
          <div className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>for gas</div>
        </div>
      </div>
      <button className="gold" onClick={mint} disabled={isPending || mining}>
        {isPending ? "Confirm in wallet…" : mining ? "Minting…" : "Get 1,000,000 test mKRW"}
      </button>
    </div>
  );
}
