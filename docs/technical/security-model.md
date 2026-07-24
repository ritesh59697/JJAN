# Security model

Jjan's entire value proposition is that no one can steal the pot. That is not a
promise — it is a property of the code, and it is tested.

## The non-custodial guarantee

{% hint style="success" %}
Funds leave a `Circle` through exactly **two** paths:

1. `closeRound()` → to the round's **fixed** recipient.
2. `withdrawBond()` → back to the **member** who posted the bond.

There is no owner, no admin, no `selfdestruct`, and no arbitrary-call function. The
organizer has no more power over the pot than any other member.
{% endhint %}

## The solvency invariant

The core safety property:

```
token.balanceOf(circle)  ≥  totalBonds + escrowedPot   // i.e. obligations()
```

In plain terms: **the contract always holds enough tokens to cover everything it
owes** — every live bond and every unpaid contribution. If this ever broke, some
member's money would have become unbacked.

It is enforced by construction (every fund movement updates the accounting buckets
in lockstep) and verified by a Foundry **invariant test** that drives a live circle
through random `join` / `contribute` / `closeRound` / `withdrawBond` sequences. See
[Testing & verification](testing-and-verification.md).

## Defensive measures

* **Reentrancy.** Every fund-moving function is `nonReentrant` and follows the
  checks-effects-interactions pattern. Token transfers happen last.
* **Pull payments for bonds.** Members withdraw their own bonds (`withdrawBond`)
  rather than the contract pushing funds, avoiding a class of failure and
  griefing bugs.
* **Access control.** Only factory-authorized circles may write to the
  `ReputationRegistry`; only the factory can authorize a circle. Scores cannot be
  forged.
* **Input hardening.** `initialize()` rejects zero-address members, duplicate
  members, and circles with fewer than two members. The initializer is one-shot.
* **Deterministic payouts.** Because the recipient is fixed at creation, there is
  no ordering game to play and no randomness to manipulate in v1.

## `SafeERC20`

All token interactions use OpenZeppelin's `SafeERC20`, so non-standard ERC-20
return-value behaviour cannot silently break accounting.

## Known limitations

This is a testnet MVP; some hardening is deliberately deferred. See
[Roadmap & limitations](../roadmap.md) — most notably a timelocked
`emergencyWithdraw()` for stalled circles, which is planned before mainnet.
