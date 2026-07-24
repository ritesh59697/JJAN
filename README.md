# Jjan (짠) — trustless on-chain _kye_ (곗돈) for GIWA

Korea's _kye_ — informal rotating savings clubs among friends and family — moves
billions of won a year on nothing but trust and a KakaoTalk group. Organizers run
off with the pot constantly. **Jjan removes the trust.** A smart contract escrows
every member's contribution and pays the rotating recipient each round. No
organizer, and no admin key, can ever drain the pot.

Built on **GIWA** (Upbit/Dunamu's Ethereum L2) because a club of many small,
recurring payments only feels good on a fast, near-free chain.

## Contracts

| Contract | Purpose |
|---|---|
| `Circle.sol` | Rotating-escrow state machine: join → contribute → closeRound (pays fixed recipient, slashes no-shows) → withdrawBond. Clone-initialized. |
| `CircleFactory.sol` | Deploys EIP-1167 clones of `Circle` cheaply; authorizes each to write reputation. |
| `ReputationRegistry.sol` | Global per-wallet reliability score; only factory-authorized circles can write. |
| `mocks/MockKRW.sol` | Testnet-only KRW stablecoin with an open faucet. Replace with a real stable on mainnet. |

### Security properties (all test-backed)
- **No custodial drain:** funds leave only via `closeRound` (to the round's fixed recipient) or `withdrawBond` (to the member). There is no admin transfer path.
- **Solvency invariant:** `balance >= liveBonds + unpaidEscrow` holds across 128k randomized calls (`invariant_Solvency`).
- **Reentrancy:** `nonReentrant` + checks-effects-interactions on every fund-moving function; pull-payment for bonds.
- **No manipulation:** payout order and recipient are fixed at creation; duplicate/zero members rejected.

## Develop

```bash
forge build
forge test -vvv          # 9 tests: unit + fuzz + solvency invariant
forge fmt
```

## Deploy to GIWA testnet

1. Fill `.env` from `.env.example` (**verify GIWA RPC / explorer values against official docs**).
2. Deploy the stack:
   ```bash
   forge script script/Deploy.s.sol --rpc-url giwa_testnet --broadcast --verify
   ```
3. (Demo) create a live circle with short rounds:
   ```bash
   FACTORY=0x.. MKRW=0x.. M1=0x.. M2=0x.. M3=0x.. \
   forge script script/DemoCircle.s.sol --rpc-url giwa_testnet --broadcast
   ```

## Status

Contracts + tests complete and green. Next: frontend (Next.js + wagmi/viem +
embedded/social login), then deploy + verify on GIWA testnet for the GASOK
submission (due 2026-07-31).
