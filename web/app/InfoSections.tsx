// Informational sections (How it works / Why trustless / FAQ) shared by the
// disconnected landing and the connected "How it works" / "FAQ" nav views.

const steps = [
  {
    n: "01",
    title: "Everyone contributes",
    body: "Members pay a fixed amount into the circle each round, in mKRW.",
  },
  {
    n: "02",
    title: "The pot rotates",
    body: "One member is paid the full pot per round, in a fixed, pre-agreed order.",
  },
  {
    n: "03",
    title: "The contract enforces it",
    body: "No organizer holds the money. No admin key can drain it. Ever.",
  },
];

const faqs = [
  {
    q: "What is a kye (곗돈)?",
    a: "A rotating savings circle popular in Korea: a group of friends each contribute a fixed amount every round, and the whole pot is paid out to one member per round until everyone has had a turn. Traditionally organized over KakaoTalk on trust alone.",
  },
  {
    q: "Who actually holds the money?",
    a: "The smart contract does. Every contribution is escrowed on-chain and released only to the round's pre-scheduled recipient. There is no organizer wallet in the middle.",
  },
  {
    q: "Can the organizer run off with the pot?",
    a: "No. There is no admin key, no owner withdrawal, and no arbitrary-transfer function anywhere in the contract. Funds can only leave a circle to the round's fixed recipient, or back to a member as their bond. Removing that rug vector is the entire point of Jjan.",
  },
  {
    q: "What keeps members from skipping a payment?",
    a: "Each member posts a bond when they join. The payout order and recipients are fixed at creation and can't be changed, so nobody can jump the queue or redirect a payout.",
  },
  {
    q: "Is this real money?",
    a: "Not yet. Jjan runs on the GIWA Sepolia testnet using mKRW, a mock KRW stablecoin with an open faucet. It's for demonstrating the trustless mechanics; no real funds are involved.",
  },
  {
    q: "Which network is it on, and how fast?",
    a: "GIWA Sepolia, an Upbit/Dunamu OP-Stack L2 with ~1s blocks (and ~200ms flashblock preconfirmations). Closing a round pays out the recipient almost instantly.",
  },
  {
    q: "Is the code open and verified?",
    a: "Yes. The contracts are open-source, covered by unit, fuzz, and a solvency invariant test, and verified on the GIWA block explorer.",
  },
];

export function InfoSections() {
  return (
    <>
      <section className="section" id="how">
        <p className="eyebrow">How it works</p>
        <div className="steps">
          {steps.map((s) => (
            <div className="step" key={s.n}>
              <span className="step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <p className="eyebrow">Why trustless</p>
        <p className="section-lead">
          Kye circles traditionally run on trust via KakaoTalk, and organizers regularly abscond with the
          pot. Jjan removes the trust: escrow and payout are enforced by code, not a promise.
        </p>
        <div className="stat">
          <div>
            <div className="n">0</div>
            <div className="l">admin drain paths</div>
          </div>
          <div>
            <div className="n">~1s</div>
            <div className="l">GIWA block time</div>
          </div>
          <div>
            <div className="n">100%</div>
            <div className="l">verified open-source contracts</div>
          </div>
        </div>

        <div className="callout">
          <blockquote>
            The contract is the organizer. It can hold the pot and pay the scheduled member, and that
            is <em>all</em> it can do. There is no function, anywhere, that lets anyone take the money.
          </blockquote>
        </div>
      </section>

      <section className="section faq" id="faq">
        <h2 className="dual">
          <span className="faint">Questions.</span> Answered.
        </h2>
        <div className="faq-list">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>
                {f.q}
                <span className="chev" aria-hidden="true">+</span>
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
