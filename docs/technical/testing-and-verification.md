# Testing & verification

Jjan is tested with Foundry — unit tests, a fuzz test, and a handler-driven
invariant — and the deployed contracts are source-verified on GIWA's explorer.

## Test suite

```bash
forge test -vvv
```

**9 / 9 tests pass**, covering:

* **Happy path** — a full three-round circle where everyone pays and each member
  receives the pot exactly once, with bonds returned intact and the contract
  drained to zero at the end.
* **No admin drain** — asserts there is no callable function that lets the
  organizer extract the pot.
* **Slashing** — a missed contribution is slashed from the no-show's bond into the
  pot, and reputation is updated (`-1` for the no-show, `+1` for payers).
* **Guards** — cannot close a round early, cannot start before all members join,
  uninvited addresses cannot join, and members cannot contribute twice per round.
* **Fuzz — pot conservation** (256 runs) — for any random subset of payers, the
  amount paid out equals contributions plus slashes.

## The solvency invariant

```
invariant_Solvency:  token.balanceOf(circle) ≥ circle.obligations()
```

A handler drives a live circle through randomized `join` / `contribute` /
`closeRound` / `withdrawBond` call sequences, and the invariant is checked after
every step.

{% hint style="success" %}
**Result: held across 128,000 randomized calls with zero reverts.** The contract
never became insolvent under any sequence the fuzzer tried.
{% endhint %}

## Static analysis & schema

* Contracts compile clean under Solidity `0.8.24` with the optimizer enabled.
* Run `slither .` for static analysis before any mainnet deployment.

## On-chain verification

All four contracts are deployed to GIWA Sepolia and **source-verified via
Blockscout**, so anyone can read the exact source behind each address on the
explorer. The addresses are listed in
[Deployed contracts](../deployment/deployed-contracts.md).

Deployment cost was negligible — on the order of **$0** at GIWA's ~0.001 gwei gas
price.
