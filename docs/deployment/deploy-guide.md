# Deploy it yourself

The full Jjan stack deploys to GIWA Sepolia with one Foundry script.

## Prerequisites

* [Foundry](https://getfoundry.sh) installed (`forge`, `cast`).
* A **throwaway** testnet wallet funded from a [GIWA faucet](giwa-network.md#faucets).
  Never use a mainnet key.

## 1. Configure

Copy the example env and fill in your key (the GIWA URLs are already set):

```bash
cd jjan
cp .env.example .env
# edit .env → set PRIVATE_KEY=0x...
```

## 2. Build & test

```bash
forge build
forge test          # expect 9/9 passing
```

## 3. Deploy & verify

```bash
source .env
forge script script/Deploy.s.sol \
  --rpc-url giwa_testnet --broadcast --verify \
  --verifier blockscout \
  --verifier-url https://sepolia-explorer.giwa.io/api/
```

The script prints the four deployed addresses. It resolves the factory ↔ registry
circular dependency by precomputing the factory address with
`vm.computeCreateAddress`, so the registry can take an immutable factory address.

## 4. Wire the frontend

Drop the printed addresses into `jjan/web/.env.local`:

```
NEXT_PUBLIC_GIWA_CHAIN_ID=91342
NEXT_PUBLIC_GIWA_RPC_URL=https://sepolia-rpc.giwa.io/
NEXT_PUBLIC_FACTORY=0x...
NEXT_PUBLIC_REPUTATION=0x...
NEXT_PUBLIC_MKRW=0x...
```

Then run the app:

```bash
cd web && npm install && npm run dev   # http://localhost:3005
```

## 5. (Optional) seed a demo circle

Create a live circle with short rounds for a demo, from an already-deployed factory:

```bash
FACTORY=0x.. MKRW=0x.. M1=0x.. M2=0x.. M3=0x.. \
forge script script/DemoCircle.s.sol --rpc-url giwa_testnet --broadcast
```

{% hint style="warning" %}
Keep your `PRIVATE_KEY` out of version control — `.env` is gitignored. This stack
uses `MockKRW` and is testnet-only; do not treat it as handling real funds.
{% endhint %}
