# Roadmap & limitations

Jjan's v1 is a real, verified MVP. Everything past "Now" is the fundable roadmap —
and the primitive underneath extends well beyond savings circles.

## Roadmap

{% tabs %}
{% tab title="Now" %}
Trustless rotating savings, **live and verified** on GIWA testnet. Contracts,
frontend, and deployment complete; 9/9 tests green including the solvency invariant.
{% endtab %}

{% tab title="Next" %}
* **Account Abstraction & Batched Transactions**: Combine `Approve` and `Join` actions into a single transaction signature.
* **Session Keys / Autopay**: Allow users to authorize Jjan to pull round contributions automatically in the background without popups.
* **Relayer Automation**: Automatically call `closeRound()` via decentralized keepers (e.g. Gelato/Chainlink) as soon as the timer hits `0:00`.
* **Social Login Onboarding**: Switch the wagmi connector to Privy/Dynamic for google/kakao social login signup.
* **Timelocked Exit**: Implement `emergencyWithdraw()` for stalled circles.
* **Missed-round insurance pool**: Create a decentralized backup pool to cover default cases.
* **A real KRW stablecoin**: Swap for a bridged/canonical KRW stablecoin instead of `MockKRW`.
{% endtab %}

{% tab title="Then" %}
* **Gas Sponsorship**: Paymasters sponsor user gas fees entirely on GIWA to provide a zero-gas onboarding experience.
* **Yield Escrow**: Earn interest on idle escrow assets between rounds.
* **VRF Ordering**: Randomize payout schedules using on-chain entropy.
* **Credit Rating**: Leverage `ReputationRegistry` history for credit scores.
{% endtab %}

{% tab title="Scale" %}
The same escrow-and-rotate primitive extends to **group buying**, **community
insurance**, and **club/DAO treasuries** — Jjan is the first product on it, not the
last.
{% endtab %}
{% endtabs %}

## Known limitations (by design, testnet MVP)

These are conscious scope choices for the MVP, not oversights. None of them affect
the [custody guarantee](technical/security-model.md).

| Limitation | Plan |
| --- | --- |
| Uses `MockKRW`, not a real stablecoin | Swap for a bridged/canonical KRW stable on mainnet |
| Payout order is fixed, not randomized | Add VRF ordering (see roadmap: Then) |
| A stalled circle has no early exit | Add timelocked `emergencyWithdraw()` (see roadmap: Next) |
| Onboarding via injected wallet | Swap the connector for social login — the app is connector-agnostic |

## Get involved

Built for the **GASOK** accelerator (GIWA × Upbit) by **Ritesh**
([@Ritesh5969](https://x.com/Ritesh5969)). See the live contracts on the
[GIWA explorer](deployment/deployed-contracts.md).
