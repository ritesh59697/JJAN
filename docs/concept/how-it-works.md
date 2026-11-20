# How Jjan works

Jjan keeps the social ritual of a _kye_ intact and removes the trust it used to
require. The contract becomes the organizer — one that cannot lie, forget, or run
off with the money.

## The four-step flow

{% stepper %}
{% step %}
### Create

An organizer sets the members, the contribution amount per round, the bond, and the
payout order. One transaction spins up a new circle.
{% endstep %}

{% step %}
### Join

Each invited member opens the circle from the dashboard, connects a browser wallet
(MetaMask or Rabby), approves the token once, and joins by posting their bond.
Social-login onboarding, with no seed phrase to manage, is on the
[roadmap](../roadmap.md).
{% endstep %}

{% step %}
### Contribute

Every round, each member pays the fixed amount into the contract's escrow. Miss a
round and your bond covers your share: up to one contribution is slashed from your
bond into the pot.
{% endstep %}

{% step %}
### Rotate

Once the round window elapses, anyone can close the round. The contract then pays
that round's scheduled recipient — in about a second on GIWA — and advances to the
next round. Nobody chooses the recipient at payout time.
{% endstep %}
{% endstepper %}

## What makes it trustless

* **The pot is never in a person's hands.** Contributions sit in the contract's
  escrow and can only move to the round's pre-agreed recipient.
* **The recipient is fixed in advance.** Payout order is set when the circle is
  created, so no one can manipulate who gets paid.
* **Everyone sees the same truth.** Every contribution, payout, and slash is an
  on-chain event.
* **Reliability is portable.** Paying on time (or missing) updates an on-chain
  reputation score that follows your wallet into future circles.

## Web2-easy, on-chain-trustless

The design goal is that a first-time user experiences Jjan like any consumer
savings app — a link, a tap, a clear schedule — while the guarantees underneath are
those of a public, verifiable smart contract. Today's testnet MVP gets part of the
way there: it needs a browser wallet, and joining takes two transactions. One-step
joining and social login are next on the [roadmap](../roadmap.md).

For exactly how this is enforced in code, see the
[Architecture](../technical/architecture.md) and
[Security model](../technical/security-model.md).
