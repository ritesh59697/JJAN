"use client";

import { giwaTestnet } from "@/lib/chain";
import { IconArrowUpRight } from "./icons";

// Small "View on GIWA explorer" link for a transaction hash. Renders nothing
// until a hash exists, so it can be dropped into any action row unconditionally.
export function TxLink({ hash, label = "View on GIWA explorer" }: { hash?: `0x${string}`; label?: string }) {
  if (!hash) return null;
  return (
    <a
      className="txlink"
      href={`${giwaTestnet.blockExplorers.default.url}/tx/${hash}`}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      {label}
      <IconArrowUpRight size={13} />
    </a>
  );
}
