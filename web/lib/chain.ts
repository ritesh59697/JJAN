import { defineChain } from "viem";

// GIWA Sepolia testnet (OP Stack). Verified from docs.giwa.io.
// The Flashblocks RPC (~200ms preconfirmations) makes the payout feel instant in
// the demo — set NEXT_PUBLIC_GIWA_RPC_URL to it to show that off.
export const giwaTestnet = defineChain({
  id: Number(process.env.NEXT_PUBLIC_GIWA_CHAIN_ID ?? 91342),
  name: "GIWA Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_GIWA_RPC_URL ?? "https://sepolia-rpc.giwa.io/"],
    },
  },
  blockExplorers: {
    default: {
      name: "GIWA Explorer",
      url: process.env.NEXT_PUBLIC_GIWA_EXPLORER_URL ?? "https://sepolia-explorer.giwa.io",
    },
  },
  testnet: true,
});
