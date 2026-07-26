# CLAUDE.md — Jjan (짠)

Context for AI agents working in this repo. Read this first.

## What this is

**Jjan** is a trustless, on-chain version of Korea's *kye* (곗돈) — rotating savings
circles where friends contribute a fixed amount each round and the pot rotates to
one member per round. Traditionally run on trust via KakaoTalk; organizers
regularly abscond with the pot. Jjan removes the trust: a smart contract escrows
every contribution and pays the scheduled recipient. **No admin key can drain the
pot — that non-custodial guarantee is the entire product.**

Built for **GASOK** (GIWA Accelerator, Upbit/Dunamu's OP-Stack L2). Submission
deadline **2026-07-31**. Tracks: Consumer/Social + Mass Adoption + GIWA-Native.

## Repo layout

```
jjan/
├── src/
│   ├── Circle.sol              # rotating-escrow state machine (clone-initialized)
│   ├── CircleFactory.sol       # EIP-1167 clone factory + reputation authorization
│   ├── ReputationRegistry.sol  # global per-wallet reliability score
│   └── mocks/MockKRW.sol       # testnet KRW stablecoin, open faucet
├── script/
│   ├── Deploy.s.sol            # deploys the full stack
│   └── DemoCircle.s.sol        # creates one demo circle from a live factory
├── test/
│   ├── Circle.t.sol            # unit + fuzz tests
│   └── CircleInvariant.t.sol   # solvency invariant (handler-based)
├── web/                        # Next.js 15 + wagmi/viem frontend (see below)
└── foundry.toml
```

## Architecture & invariants (do not break these)

- **`Circle`** is deployed once as an implementation; every circle is an EIP-1167
  **clone**, so it has **no constructor** — state is set in `initialize()`, guarded
  by an `initialized` flag. Any new config must go through `initialize`.
- **Payout order and recipient are fixed at creation.** Never make the recipient
  caller-selectable — that would reintroduce the rug vector we exist to remove.
- **No drain path.** Funds leave a `Circle` only via `closeRound` (to the round's
  fixed recipient) or `withdrawBond` (to the member). Do not add any owner/admin
  transfer, `selfdestruct`, or arbitrary-call function.
- **Solvency invariant:** `token.balanceOf(circle) >= totalBonds + escrowedPot`
  must always hold. `obligations()` exposes the RHS; `invariant_Solvency` checks it.
  Any change to fund accounting must keep this green.
- **Reentrancy:** every fund-moving function is `nonReentrant` and follows
  checks-effects-interactions; bonds use pull-payment (`withdrawBond`).
- **ReputationRegistry** is written only by factory-authorized circles
  (`isCircle[msg.sender]`); the factory is the only address that can authorize.

## Dev commands

```bash
forge build
forge test -vvv          # 9 tests: unit + fuzz(256) + solvency invariant(128k calls)
forge fmt
```

When Solidity ABIs change, re-export them for the frontend:

```bash
for c in Circle CircleFactory ReputationRegistry MockKRW; do \
  jq '.abi' out/$c.sol/$c.json > web/lib/abi/$c.json; done
```

## GIWA Sepolia testnet (chain id 91342, OP Stack, ~1s blocks)

Verified from docs.giwa.io:

- RPC: `https://sepolia-rpc.giwa.io/`
- Flashblocks RPC (~200ms preconfirmations — use for the live demo):
  `https://sepolia-rpc-flashblocks.giwa.io/`
- Explorer (Blockscout): `https://sepolia-explorer.giwa.io`
- Faucets: `https://faucet.giwa.io/` (0.005 ETH/day),
  `https://faucet.lambda256.io/giwa-sepolia` (0.01 ETH/day)
- Native currency: ETH

Secrets live in `jjan/.env` (gitignored) — `PRIVATE_KEY` plus the GIWA URLs.
Never print, commit, or ask for the private key. `foundry.toml` reads the RPC via
the `giwa_testnet` alias.

## Deployment

```bash
cd jjan && source .env && forge script script/Deploy.s.sol \
  --rpc-url giwa_testnet --broadcast --verify \
  --verifier blockscout --verifier-url https://sepolia-explorer.giwa.io/api/
```

Deploy resolves a factory↔registry circular dependency by precomputing the
factory address with `vm.computeCreateAddress` (registry constructor takes the
factory address as immutable). If you reorder deploys, keep the nonce math correct
or the `require(factory == predictedFactory)` assertion will fire.

### Current live deployment (GIWA Sepolia, deployed 2026-07-24, all verified)

| Contract | Address |
|---|---|
| CircleFactory | `0x7f01efFDbEe10d31f300E2b3Fed000C061940551` |
| ReputationRegistry | `0x0cd53f090471d4aD3f14bEFaC1F60D7F3F076204` |
| MockKRW (mKRW) | `0x6F82D1b448C3e742e2Da3455611c268C6D72f53B` |
| Circle (implementation) | `0xf2b12af647ecf2341960e901e4ee8ba55639377b` |

Deployer: `0xA273683BE2B645a174164C01c71f2d035c39E7EC`.
These are mirrored in `web/.env.local` as `NEXT_PUBLIC_*`.

## Frontend (`web/`)

Next.js 15 (App Router) + wagmi v2 + viem + @tanstack/react-query. Dev server runs
on **port 3005** (launch config name `jjan-web` in `../.claude/launch.json`).

```bash
cd web && npm run dev     # http://localhost:3005
```

- `lib/chain.ts` — GIWA Sepolia chain def (env-overridable).
- `lib/wagmi.ts` — **injected connector only** for the MVP. The app is
  connector-agnostic; swapping in Privy/Dynamic/Web3Auth for social-login
  onboarding (the "Web2-easy" pitch) is a one-file change here.
- `lib/contracts.ts` — addresses (from `NEXT_PUBLIC_*`) + ABIs from `lib/abi/`.
- `app/page.tsx` — shell + circle list; `CreateCircle.tsx`, `CircleDetail.tsx`,
  `Connect.tsx` are the flow. `CircleDetail` drives join/contribute/close/withdraw.
- When contract addresses are the zero address, the UI shows a "not wired yet"
  banner instead of crashing.

**Gotcha:** wagmi's connectors barrel pulls in `@base-org/account` →
`@coinbase/cdp-sdk` → optional `@x402/*` modules we don't install. `next.config.mjs`
stubs that unused subtree (`resolve.alias` false + `IgnorePlugin`). Keep it, or the
build spews module-not-found errors. After editing config, `rm -rf web/.next` and
restart the dev server.

## Verifying UI changes

A preview server may be running. After previewable changes: reload, then check
`read_console_messages`/`preview_logs` for errors and screenshot for proof. The
dev overlay can replay stale console errors across HMR — trust the server logs
(`preview_logs`) as the source of truth, and use a fresh tab if the console buffer
looks stale.

## Status & what's next

- ✅ Contracts complete, tested (9/9 green), deployed + verified on GIWA Sepolia.
- ✅ Frontend wired to the live deployment.
- ✅ Pitch deck (10 slides, `submission/Jjan-Pitch-Deck.pptx`) + technical one-pager
  (`submission/Jjan-Technical-Design-Doc.pdf`).
- ✅ Demo circle seeded at `0x23b3B64C57E721D1f21Dcb429e7d709A9732A108` with three
  controllable wallets (60s rounds). Round 1 is closed and paid out; **round 2 is
  fully funded and its timer has expired, so `closeRound()` pays out instantly** —
  that is the money shot, left primed on purpose. Member keys are in `.env.demo`
  (gitignored); M1 is the deployer. Re-seed with `script/DemoCircle.s.sol`
  (`ROUND_DURATION` is env-overridable).
- ⏳ Record 1–2 min demo video (money shot: close round → near-instant payout next
  to the explorer tx, ideally over the Flashblocks RPC).
- Future/pre-mainnet: timelocked `emergencyWithdraw()` for stalled circles;
  swap injected connector for social login; real KRW stablecoin instead of MockKRW.

## Conventions

- Solidity `0.8.24`, optimizer on (200 runs). OpenZeppelin for
  `ReentrancyGuard`/`SafeERC20`/`Clones`/`ERC20`.
- Deliverables the accelerator scores on: code execution, originality, GIWA fit,
  wallet-friendliness. Favor Web2-easy UX and GIWA's speed as a *felt* advantage.
- This is testnet + MockKRW only. Do not present it as handling real funds, and
  flag any regulatory/custody framing before it reaches mainnet.
