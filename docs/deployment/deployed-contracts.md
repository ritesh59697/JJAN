# Deployed contracts

All contracts are **live and source-verified** on GIWA Sepolia (chain `91342`).
Click any address to read the verified source on the explorer.

## Addresses

| Contract | Address |
| --- | --- |
| **CircleFactory** | [`0x7f01effDbEe10d31f300E2b3Fed000C061940551`](https://sepolia-explorer.giwa.io/address/0x7f01effDbEe10d31f300E2b3Fed000C061940551) |
| **ReputationRegistry** | [`0x0cd53f090471d4aD3f14bEFaC1F60D7F3F076204`](https://sepolia-explorer.giwa.io/address/0x0cd53f090471d4aD3f14bEFaC1F60D7F3F076204) |
| **MockKRW (mKRW)** | [`0x6F82D1b448C3e742e2Da3455611c268C6D72f53B`](https://sepolia-explorer.giwa.io/address/0x6F82D1b448C3e742e2Da3455611c268C6D72f53B) |
| **Circle (implementation)** | [`0xf2b12af647ecf2341960e901e4ee8ba55639377b`](https://sepolia-explorer.giwa.io/address/0xf2b12af647ecf2341960e901e4ee8ba55639377b) |

Deployer: `0xA273683BE2B645a174164C01c71f2d035c39E7EC`

{% hint style="success" %}
Every address above shows a green **Verified** contract on the explorer — the exact
Solidity source is published and matches the deployed bytecode.
{% endhint %}

## Quick checks

Anyone can query the live contracts, for example with [Foundry's](https://getfoundry.sh) `cast`:

```bash
# how many circles exist
cast call 0x7f01effDbEe10d31f300E2b3Fed000C061940551 \
  "circleCount()(uint256)" --rpc-url https://sepolia-rpc.giwa.io/

# the stablecoin symbol
cast call 0x6F82D1b448C3e742e2Da3455611c268C6D72f53B \
  "symbol()(string)" --rpc-url https://sepolia-rpc.giwa.io/
```

## Getting test tokens

`MockKRW` has an open faucet so anyone can try the app:

```bash
# mint yourself 1,000,000 mKRW (18 decimals)
cast send 0x6F82D1b448C3e742e2Da3455611c268C6D72f53B \
  "faucet(uint256)" 1000000000000000000000000 \
  --rpc-url https://sepolia-rpc.giwa.io/ --private-key <YOUR_TESTNET_KEY>
```
