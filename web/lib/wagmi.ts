import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { giwaTestnet } from "./chain";

// MVP uses an injected connector (MetaMask etc.) so the app runs with no API keys.
// For the "Web2-easy" social-login onboarding in the pitch, swap this for an
// embedded-wallet connector (Privy / Dynamic / Web3Auth) — the rest of the app
// is connector-agnostic and needs no changes.
export const config = createConfig({
  chains: [giwaTestnet],
  connectors: [injected()],
  transports: {
    [giwaTestnet.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
