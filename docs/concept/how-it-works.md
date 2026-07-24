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

Each invited member opens a share link and joins in two taps, posting their bond.
With social login there is no seed phrase to manage — the onboarding feels like a
Web2 app.
{% endstep %}

{% step %}
### Contribute

Every round, each member pays the fixed amount into the contract's escrow. Miss a
round and part of your bond is slashed into the pot.
{% endstep %}

{% step %}
### Rotate

Once the round window elapses, the contract pays that round's scheduled recipient
automatically — in about a second on GIWA — and advances to the next round.
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
those of a public, verifiable smart contract.

For exactly how this is enforced in code, see the
[Architecture](../technical/architecture.md) and
[Security model](../technical/security-model.md).
