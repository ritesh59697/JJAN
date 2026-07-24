import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { mainnet, sepolia } from "wagmi/chains";
import { giwaTestnet } from "./chain";

// Read/receipt transport for GIWA. Prefer the Flashblocks RPC (~200ms
// preconfirmations) so useWaitForTransactionReceipt resolves almost instantly —
// the payout "money shot" feels live. The chain's default (standard) RPC in
// chain.ts is still what wallets use for add/switch-network.
const giwaHttp = http(
  process.env.NEXT_PUBLIC_GIWA_FLASHBLOCKS_RPC_URL ??
    process.env.NEXT_PUBLIC_GIWA_RPC_URL ??
    "https://sepolia-rpc-flashblocks.giwa.io/"
);

// MVP uses an injected connector (MetaMask etc.) so the app runs with no API keys.
// For the "Web2-easy" social-login onboarding in the pitch, swap this for an
// embedded-wallet connector (Privy / Dynamic / Web3Auth) — the rest of the app
// is connector-agnostic and needs no changes.
// mainnet + sepolia are listed only so wagmi can *detect* when the wallet is on the
// wrong network (e.g. Rabby defaulting to Ethereum) and prompt a switch to GIWA.
// All app reads/writes target giwaTestnet.
export const config = createConfig({
  chains: [giwaTestnet, mainnet, sepolia],
  connectors: [injected()],
  transports: {
    [giwaTestnet.id]: giwaHttp,
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  // Poll fast so Flashblocks preconfirmations surface in the UI within a beat
  // instead of viem's 4s default.
  pollingInterval: 500,
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
