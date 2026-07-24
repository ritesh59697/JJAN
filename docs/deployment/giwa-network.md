# GIWA network

Jjan runs on **GIWA Sepolia**, the public testnet of GIWA — Upbit/Dunamu's
Ethereum Layer 2 built on the OP Stack.

## Why GIWA

A savings club is, mechanically, **many small recurring payments**. That is exactly
the workload that is painful on Ethereum L1 and delightful on a fast, cheap L2:

* **Payout feels instant.** ~1-second blocks, and ~200ms preconfirmations via the
  Flashblocks endpoint — so the pot lands the moment a round closes.
* **Micro-payments make sense.** Near-zero gas means dozens of tiny contributions
  per circle aren't eaten by fees.
* **Upbit distribution.** A Korea-native user base, a familiar wallet, and a direct
  path to fund circles from an Upbit balance.

## Network parameters

| Parameter | Value |
| --- | --- |
| Network name | GIWA Sepolia |
| Chain ID | `91342` |
| RPC URL | `https://sepolia-rpc.giwa.io/` |
| Flashblocks RPC (~200ms) | `https://sepolia-rpc-flashblocks.giwa.io/` |
| Block explorer | `https://sepolia-explorer.giwa.io` |
| Native currency | ETH |

{% hint style="info" %}
For the live demo, point the app's RPC at the **Flashblocks** endpoint — the
preconfirmed payout is the moment that best showcases GIWA's speed.
{% endhint %}

## Faucets

Get testnet ETH (once per 24h):

* [https://faucet.giwa.io/](https://faucet.giwa.io/) — up to 0.005 ETH
* [https://faucet.lambda256.io/giwa-sepolia](https://faucet.lambda256.io/giwa-sepolia) — 0.01 ETH

_Always verify current network parameters against the official docs at
[docs.giwa.io](https://docs.giwa.io) before deploying._
