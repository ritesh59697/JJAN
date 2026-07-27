"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { giwaTestnet } from "@/lib/chain";
import { IconChevronDown } from "./icons";

function short(a?: string) {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";
}

export function Connect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  if (!isConnected) {
    const injected = connectors[0];
    return (
      <button onClick={() => connect({ connector: injected })} disabled={isPending}>
        {isPending ? "Connecting…" : "Connect wallet"}
      </button>
    );
  }

  const wrongChain = chainId !== giwaTestnet.id;

  return (
    <div className="connect-container" ref={dropdownRef}>
      <div className="row" style={{ flexWrap: "nowrap" }}>
        {wrongChain && (
          <button className="gold" onClick={() => switchChain({ chainId: giwaTestnet.id })}>
            Switch to GIWA
          </button>
        )}
        <button
          className="pill ok wallet-trigger"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-haspopup="true"
          aria-expanded={isDropdownOpen}
        >
          {short(address)}
          <IconChevronDown size={11} className={`chevron-icon ${isDropdownOpen ? "open" : ""}`} />
        </button>
      </div>

      {isDropdownOpen && (
        <div className="wallet-dropdown">
          <button
            className="disconnect-btn"
            onClick={() => {
              disconnect();
              setIsDropdownOpen(false);
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
