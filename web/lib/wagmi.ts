import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { mainnet, sepolia } from "wagmi/chains";
import { giwaTestnet } from "./chain";

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
    [giwaTestnet.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
