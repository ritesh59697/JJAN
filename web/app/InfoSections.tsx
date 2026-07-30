"use client";

import { useTranslation } from "@/lib/i18n";

export function InfoSections() {
  const { t } = useTranslation();

  const steps = [
    {
      n: "01",
      title: t.info.createTitle,
      body: t.info.createDesc,
    },
    {
      n: "02",
      title: t.info.joinTitle,
      body: t.info.joinDesc,
    },
    {
      n: "03",
      title: t.info.contributeTitle,
      body: t.info.contributeDesc,
    },
    {
      n: "04",
      title: t.info.rotateTitle,
      body: t.info.rotateDesc,
    },
  ];

  const faqs = [
    {
      q: t.info.q1,
      a: t.info.a1,
    },
    {
      q: t.info.q2,
      a: t.info.a2,
    },
    {
      q: t.info.q3,
      a: t.info.a3,
    },
    {
      q: t.info.q4,
      a: t.info.a4,
    },
  ];

  return (
    <>
      <section className="section" id="how">
        <p className="eyebrow">{t.topBar.howItWorks}</p>
        <p className="section-lead">{t.info.howItWorksSub}</p>
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
        <p className="eyebrow">{t.info.trustlessTitle}</p>
        <div className="stat" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
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

        <div className="callout" style={{ marginTop: "30px" }}>
          <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "10px", margin: 0 }}>
            <li>{t.info.trustlessItem1}</li>
            <li>{t.info.trustlessItem2}</li>
            <li>{t.info.trustlessItem3}</li>
            <li>{t.info.trustlessItem4}</li>
          </ul>
        </div>
      </section>

      <section className="section faq" id="faq">
        <h2 className="dual">
          <span className="faint">{t.info.faqTitle.split(" ")[0]}</span> {t.info.faqTitle.split(" ").slice(1).join(" ")}
        </h2>
        <div className="faq-list">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                <span style={{ paddingRight: "16px" }}>{f.q}</span>
                <span className="chev" aria-hidden="true" style={{ flexShrink: 0 }}>+</span>
              </summary>
              <p style={{ marginTop: "10px", lineHeight: "1.6", color: "var(--muted)" }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
