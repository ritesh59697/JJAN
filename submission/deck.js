const pptx = require("pptxgenjs");
const p = new pptx();
p.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
p.author = "Ritesh";
p.title = "Jjan — Pitch Deck";

// --- palette (matches the deployed app) ---
const BG = "0B0B10";
const PANEL = "1B1B27";
const PANEL2 = "252536";
const CORAL = "FF5470";
const GOLD = "FFB400";
const TEXT = "ECECF5";
const MUTED = "9DA0B5";
const GREEN = "35D07F";
const WHITE = "FFFFFF";
const LINE = "33334A";

const H = "Arial";
const B = "Calibri";
const W = 13.333, HT = 7.5;

const shadow = () => ({ type: "outer", color: "000000", blur: 12, offset: 4, angle: 90, opacity: 0.45 });

function base(slide) {
  slide.background = { color: BG };
}

function kicker(slide, text, color = CORAL) {
  slide.addText(text.toUpperCase(), {
    x: 0.7, y: 0.55, w: 8, h: 0.35, fontFace: H, fontSize: 12, bold: true,
    color, charSpacing: 3, align: "left", margin: 0,
  });
}

function title(slide, text, opts = {}) {
  slide.addText(text, {
    x: 0.7, y: 0.9, w: opts.w || 11.9, h: opts.h || 1.2, fontFace: H, fontSize: opts.size || 38,
    bold: true, color: opts.color || TEXT, align: "left", margin: 0, lineSpacingMultiple: 1.0,
  });
}

function card(slide, x, y, w, h, fill = PANEL) {
  slide.addShape(p.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.12, fill: { color: fill }, line: { color: LINE, width: 1 }, shadow: shadow() });
}

function circleNum(slide, x, y, n, color = CORAL) {
  slide.addShape(p.ShapeType.ellipse, { x, y, w: 0.62, h: 0.62, fill: { color }, line: { type: "none" } });
  slide.addText(String(n), { x, y, w: 0.62, h: 0.62, align: "center", valign: "middle", fontFace: H, fontSize: 22, bold: true, color: BG, margin: 0 });
}

function dot(slide, x, y, color) {
  slide.addShape(p.ShapeType.ellipse, { x, y, w: 0.16, h: 0.16, fill: { color }, line: { type: "none" } });
}

/* ---------------- Slide 1 — Title ---------------- */
(() => {
  const s = p.addSlide(); base(s);
  // concentric-ring motif (rotation) on the right
  const cx = 10.7, cy = 3.75;
  const rings = [[3.6, LINE], [2.7, "3A2036"], [1.8, CORAL]];
  rings.forEach(([d, c]) => s.addShape(p.ShapeType.ellipse, { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { type: "none" }, line: { color: c, width: d === 1.8 ? 3 : 1.5 } }));
  // rotating "payout" dots around the inner ring
  [[cx, cy - 0.9, GOLD], [cx + 0.78, cy + 0.45, CORAL], [cx - 0.78, cy + 0.45, WHITE]].forEach(([x, y, c]) => s.addShape(p.ShapeType.ellipse, { x: x - 0.14, y: y - 0.14, w: 0.28, h: 0.28, fill: { color: c }, line: { type: "none" } }));

  s.addText("GIWA × UPBIT  ·  GASOK MVP BUILD PHASE", { x: 0.7, y: 1.0, w: 8, h: 0.4, fontFace: H, fontSize: 13, bold: true, color: GOLD, charSpacing: 2, margin: 0 });
  s.addText([{ text: "Jjan ", options: { color: CORAL } }, { text: "짠", options: { color: TEXT } }], { x: 0.65, y: 1.7, w: 9, h: 1.6, fontFace: H, fontSize: 84, bold: true, margin: 0 });
  s.addText("Trustless 곗돈 — save with friends, on-chain.", { x: 0.7, y: 3.35, w: 8.6, h: 0.6, fontFace: B, fontSize: 24, color: TEXT, margin: 0 });
  s.addText("The smart contract holds the pot, so no organizer can ever run off with it.", { x: 0.7, y: 4.0, w: 8.3, h: 0.6, fontFace: B, fontSize: 16, color: MUTED, margin: 0 });

  s.addText([
    { text: "Live & verified on GIWA Sepolia", options: { color: GREEN, bold: true } },
    { text: "   ·   Ritesh  ·  @Ritesh5969", options: { color: MUTED } },
  ], { x: 0.7, y: 6.5, w: 11, h: 0.4, fontFace: B, fontSize: 14, margin: 0 });
  s.addNotes("Jjan is a trustless, on-chain rebuild of Korea's kye (곗돈) rotating savings circles. Live and verified on GIWA Sepolia today. Solo builder: Ritesh.");
})();

/* ---------------- Slide 2 — Problem ---------------- */
(() => {
  const s = p.addSlide(); base(s);
  kicker(s, "The problem");
  title(s, "Korea already saves this way — on trust alone");

  s.addText("The kye (곗돈) is a rotating savings club: friends put in a fixed amount each round, and the whole pot rotates to one member at a time. It's a centuries-old habit — and it runs on nothing but a group chat and a promise.", {
    x: 0.7, y: 2.05, w: 6.4, h: 2.0, fontFace: B, fontSize: 17, color: TEXT, margin: 0, lineSpacingMultiple: 1.15,
  });

  const items = [
    ["The organizer holds everyone's money", "One dishonest host and the entire pot is gone."],
    ["No record, no recourse", "Disputes come down to whose word you believe."],
    ["Missed payments break the circle", "Nothing enforces that everyone keeps paying in."],
  ];
  items.forEach(([h, d], i) => {
    const y = 2.15 + i * 1.35;
    card(s, 7.35, y, 5.25, 1.15);
    dot(s, 7.65, y + 0.32, CORAL);
    s.addText(h, { x: 7.95, y: y + 0.16, w: 4.5, h: 0.4, fontFace: H, fontSize: 15, bold: true, color: TEXT, margin: 0 });
    s.addText(d, { x: 7.95, y: y + 0.56, w: 4.5, h: 0.5, fontFace: B, fontSize: 12.5, color: MUTED, margin: 0 });
  });
  s.addNotes("Kye is a real, widespread cultural institution in Korea. TODO for Ritesh: add a hard market-size figure / fraud statistic here from real research to strengthen the claim.");
})();

/* ---------------- Slide 3 — Insight (before/after) ---------------- */
(() => {
  const s = p.addSlide(); base(s);
  kicker(s, "The insight", GOLD);
  title(s, "The trust is the bug. The contract is the fix.");

  const colY = 2.2, colH = 4.4;
  // traditional
  card(s, 0.7, colY, 5.85, colH, PANEL);
  s.addText("Traditional kye", { x: 1.0, y: colY + 0.25, w: 5, h: 0.5, fontFace: H, fontSize: 20, bold: true, color: MUTED, margin: 0 });
  [["Organizer custodies the pot", CORAL], ["Rug pull is one decision away", CORAL], ["No shared source of truth", CORAL], ["Reputation lives in memory", CORAL]].forEach(([t, c], i) => {
    const y = colY + 1.05 + i * 0.8; dot(s, 1.0, y + 0.06, c);
    s.addText(t, { x: 1.3, y: y - 0.08, w: 5.0, h: 0.5, fontFace: B, fontSize: 15.5, color: TEXT, margin: 0 });
  });
  // jjan
  card(s, 6.75, colY, 5.85, colH, PANEL2);
  s.addText([{ text: "Jjan ", options: { color: CORAL } }, { text: "짠", options: { color: TEXT } }], { x: 7.05, y: colY + 0.25, w: 5, h: 0.5, fontFace: H, fontSize: 20, bold: true, margin: 0 });
  [["Contract escrows every won", GREEN], ["No admin key, no drain path", GREEN], ["Every round is on-chain & public", GREEN], ["Reputation follows your wallet", GREEN]].forEach(([t, c], i) => {
    const y = colY + 1.05 + i * 0.8; dot(s, 7.05, y + 0.06, c);
    s.addText(t, { x: 7.35, y: y - 0.08, w: 5.0, h: 0.5, fontFace: B, fontSize: 15.5, color: TEXT, bold: true, margin: 0 });
  });
  s.addNotes("The product is one idea: remove the human custodian. Funds only ever move to the round's fixed recipient or back to a member as their bond.");
})();

/* ---------------- Slide 4 — How it works ---------------- */
(() => {
  const s = p.addSlide(); base(s);
  kicker(s, "How it works");
  title(s, "Four steps from group chat to trustless savings");

  const steps = [
    ["Create", "Set members, amount per round, and the payout order. One transaction spins up a circle."],
    ["Join", "Members connect a browser wallet, approve once, and join by posting a bond. Social login is next."],
    ["Contribute", "Each round, everyone pays the fixed amount into escrow. Miss it and your bond is slashed."],
    ["Rotate", "When the timer ends, anyone closes the round and the contract pays the scheduled member — in about a second on GIWA."],
  ];
  steps.forEach(([h, d], i) => {
    const x = 0.7 + i * 3.05;
    card(s, x, 2.35, 2.8, 3.6);
    circleNum(s, x + 0.3, 2.7, i + 1, i === 3 ? GOLD : CORAL);
    s.addText(h, { x: x + 0.3, y: 3.5, w: 2.3, h: 0.5, fontFace: H, fontSize: 19, bold: true, color: TEXT, margin: 0 });
    s.addText(d, { x: x + 0.3, y: 4.0, w: 2.25, h: 1.8, fontFace: B, fontSize: 13, color: MUTED, margin: 0, lineSpacingMultiple: 1.12 });
    if (i < 3) s.addText("→", { x: x + 2.72, y: 3.55, w: 0.4, h: 0.5, fontFace: H, fontSize: 24, bold: true, color: LINE, align: "center", margin: 0 });
  });
  s.addText("Web2-easy on the surface. On-chain-trustless underneath.", { x: 0.7, y: 6.25, w: 12, h: 0.5, fontFace: B, fontSize: 16, italic: true, color: GOLD, margin: 0 });
  s.addNotes("Emphasise the UX: one organizer brings the whole friend group. Be clear that social login and one-step joining are roadmap, not live.");
})();

/* ---------------- Slide 5 — Live proof ---------------- */
(() => {
  const s = p.addSlide(); base(s);
  kicker(s, "Proof", GREEN);
  title(s, "Not a mockup. Live & verified on GIWA today.");

  // left: stat callouts
  const stats = [
    ["4", "contracts deployed\n& source-verified", CORAL],
    ["9/9", "tests green — unit,\nfuzz & invariant", GREEN],
    ["128k", "invariant calls,\nzero reverts", GOLD],
    ["~$0", "to deploy — GIWA\ngas ≈ 0.001 gwei", WHITE],
  ];
  stats.forEach(([n, l, c], i) => {
    const x = 0.7 + (i % 2) * 3.0, y = 2.2 + Math.floor(i / 2) * 2.05;
    card(s, x, y, 2.8, 1.85);
    s.addText(n, { x: x + 0.25, y: y + 0.2, w: 2.4, h: 0.9, fontFace: H, fontSize: 44, bold: true, color: c, margin: 0 });
    s.addText(l, { x: x + 0.27, y: y + 1.1, w: 2.45, h: 0.65, fontFace: B, fontSize: 12, color: MUTED, margin: 0, lineSpacingMultiple: 1.0 });
  });

  // right: the headline security property + addresses
  card(s, 6.85, 2.2, 5.75, 3.9, PANEL2);
  s.addText("The guarantee, enforced in code", { x: 7.15, y: 2.4, w: 5.2, h: 0.4, fontFace: H, fontSize: 16, bold: true, color: TEXT, margin: 0 });
  s.addText("Funds leave a circle only to the round's fixed recipient, or back to a member as their bond. There is no admin function that can move the pot anywhere else — proven by a solvency invariant that held across 128,000 random call sequences.", {
    x: 7.15, y: 2.85, w: 5.2, h: 1.5, fontFace: B, fontSize: 13, color: MUTED, margin: 0, lineSpacingMultiple: 1.15,
  });
  s.addText("VERIFIED ON GIWA SEPOLIA", { x: 7.15, y: 4.55, w: 5.2, h: 0.3, fontFace: H, fontSize: 10.5, bold: true, color: GREEN, charSpacing: 2, margin: 0 });
  s.addText([
    { text: "CircleFactory  ", options: { color: TEXT, bold: true } },
    { text: "0x7f01…0551", options: { color: MUTED } },
    { text: "\nMockKRW  ", options: { color: TEXT, bold: true, breakLine: false } },
    { text: "0x6F82…f53B", options: { color: MUTED } },
    { text: "\nReputation  ", options: { color: TEXT, bold: true, breakLine: false } },
    { text: "0x0cd5…6204", options: { color: MUTED } },
  ], { x: 7.15, y: 4.9, w: 5.3, h: 1.05, fontFace: "Consolas", fontSize: 12, margin: 0, lineSpacingMultiple: 1.25 });
  s.addText("sepolia-explorer.giwa.io", { x: 0.7, y: 6.35, w: 6, h: 0.4, fontFace: B, fontSize: 13, italic: true, color: GOLD, margin: 0 });
  s.addNotes("This is the slide that wins on 'code execution'. Show the verified contracts on the explorer in the demo video.");
})();

/* ---------------- Slide 6 — Why GIWA + Upbit ---------------- */
(() => {
  const s = p.addSlide(); base(s);
  kicker(s, "Why GIWA + Upbit", GOLD);
  title(s, "A many-small-payments product needs a fast, cheap chain");

  const cards = [
    ["Payout feels instant", "~1s blocks, ~200ms Flashblocks preconfirmations. The pot lands the moment a round closes — the magic moment of the demo.", CORAL],
    ["Micro-payments make sense", "Near-zero gas means dozens of tiny recurring transfers per circle don't get eaten by fees — impossible on L1.", GOLD],
    ["Upbit-scale opportunity", "GIWA sits next to Upbit's Korea-native users. The goal: fund circles straight from an Upbit balance.", GREEN],
  ];
  cards.forEach(([h, d, c], i) => {
    const x = 0.7 + i * 4.05;
    card(s, x, 2.35, 3.8, 3.7);
    s.addShape(p.ShapeType.roundRect, { x: x + 0.3, y: 2.65, w: 0.5, h: 0.14, rectRadius: 0.07, fill: { color: c }, line: { type: "none" } });
    s.addText(h, { x: x + 0.3, y: 2.95, w: 3.25, h: 0.9, fontFace: H, fontSize: 19, bold: true, color: TEXT, margin: 0, lineSpacingMultiple: 0.95 });
    s.addText(d, { x: x + 0.3, y: 3.95, w: 3.25, h: 2.0, fontFace: B, fontSize: 13.5, color: MUTED, margin: 0, lineSpacingMultiple: 1.15 });
  });
  s.addNotes("GIWA fit is not cosmetic: the product is unusable on a slow or expensive chain, and Upbit is the distribution opportunity (an Upbit-balance funding path is not built yet).");
})();

/* ---------------- Slide 7 — Traction / metrics ---------------- */
(() => {
  const s = p.addSlide(); base(s);
  kicker(s, "Why it grows");
  title(s, "Retention is built into the product");

  card(s, 0.7, 2.25, 5.7, 3.9, PANEL2);
  s.addText("Every circle is a multi-round commitment", { x: 1.0, y: 2.5, w: 5.1, h: 0.8, fontFace: H, fontSize: 20, bold: true, color: TEXT, margin: 0, lineSpacingMultiple: 1.0 });
  s.addText("A member who joins a 10-person circle has a reason to come back for ten rounds — retention isn't a growth hack we bolt on, it's the shape of the product. And one organizer onboards the whole group from a single link.", {
    x: 1.0, y: 3.5, w: 5.1, h: 2.2, fontFace: B, fontSize: 15, color: MUTED, margin: 0, lineSpacingMultiple: 1.2,
  });

  const metrics = [
    ["5–12", "wallets onboarded per circle created", CORAL],
    ["N rounds", "structural repeat engagement per member", GOLD],
    ["₩ escrowed", "clean, honest on-chain traction metric", GREEN],
    ["Completion %", "circles finishing all rounds = trust earned", WHITE],
  ];
  metrics.forEach(([n, l, c], i) => {
    const y = 2.25 + i * 0.99;
    card(s, 6.7, y, 5.9, 0.82);
    s.addText(n, { x: 6.95, y: y + 0.12, w: 2.1, h: 0.6, fontFace: H, fontSize: 20, bold: true, color: c, valign: "middle", margin: 0 });
    s.addText(l, { x: 9.05, y: y + 0.12, w: 3.4, h: 0.6, fontFace: B, fontSize: 13, color: MUTED, valign: "middle", margin: 0 });
  });
  s.addNotes("Frame KRW-escrowed and completion-rate as the KPIs for Demo Day.");
})();

/* ---------------- Slide 8 — Market & GTM ---------------- */
(() => {
  const s = p.addSlide(); base(s);
  kicker(s, "Market & go-to-market", GOLD);
  title(s, "Start with kye. The primitive goes much further.");

  // expanding rings of TAM
  card(s, 0.7, 2.25, 5.7, 3.9, PANEL);
  const layers = [["Group buying & shared purchases", "3.15", PANEL2], ["Community insurance pools", "2.55", "2C2C40"], ["DAO & club treasuries", "1.95", "343450"]];
  s.addText("One escrow-and-rotate primitive", { x: 1.0, y: 2.45, w: 5, h: 0.4, fontFace: H, fontSize: 15, bold: true, color: MUTED, margin: 0 });
  // core
  s.addShape(p.ShapeType.roundRect, { x: 2.15, y: 3.1, w: 2.8, h: 2.7, rectRadius: 0.1, fill: { color: PANEL2 }, line: { color: LINE, width: 1 } });
  s.addText("kye /\n곗돈", { x: 2.15, y: 3.9, w: 2.8, h: 1.0, align: "center", fontFace: H, fontSize: 22, bold: true, color: CORAL, margin: 0, lineSpacingMultiple: 0.95 });
  s.addText("today", { x: 2.15, y: 4.85, w: 2.8, h: 0.4, align: "center", fontFace: B, fontSize: 13, color: MUTED, margin: 0 });
  s.addText([{ text: "Group buying  ·  community insurance  ·  DAO treasuries", options: {} }], { x: 1.0, y: 5.95, w: 0, h: 0, fontFace: B, fontSize: 1, color: BG, margin: 0 }); // spacer (hidden)
  s.addText("→ the same contracts extend to group buying, community insurance, and club treasuries.", { x: 5.15, y: 3.3, w: 1.05, h: 2.3, fontFace: B, fontSize: 12.5, color: MUTED, margin: 0, lineSpacingMultiple: 1.15 });

  // GTM column
  const gtm = [
    ["Seed real friend groups", "Land whole circles at once — the group is the unit of adoption."],
    ["Korean personal-finance KOLs", "“kye without the fraud” is a story creators can tell in one line."],
    ["University & workplace clubs", "Dense, high-trust networks where circles already exist offline."],
  ];
  s.addText("Go-to-market", { x: 6.9, y: 2.3, w: 5, h: 0.4, fontFace: H, fontSize: 15, bold: true, color: GOLD, margin: 0 });
  gtm.forEach(([h, d], i) => {
    const y = 2.85 + i * 1.12;
    card(s, 6.7, y, 5.9, 0.98);
    dot(s, 6.98, y + 0.3, GOLD);
    s.addText(h, { x: 7.28, y: y + 0.13, w: 5.1, h: 0.4, fontFace: H, fontSize: 14.5, bold: true, color: TEXT, margin: 0 });
    s.addText(d, { x: 7.28, y: y + 0.52, w: 5.1, h: 0.4, fontFace: B, fontSize: 12, color: MUTED, margin: 0 });
  });
  s.addNotes("TODO for Ritesh: add a real TAM figure for Korean informal group finance if available.");
})();

/* ---------------- Slide 9 — Roadmap ---------------- */
(() => {
  const s = p.addSlide(); base(s);
  kicker(s, "Roadmap");
  title(s, "From a verified MVP to a group-finance platform");

  s.addShape(p.ShapeType.line, { x: 1.0, y: 3.5, w: 11.3, h: 0, line: { color: LINE, width: 2 } });
  const phases = [
    ["Now", "Trustless rotating savings, live & verified on GIWA testnet.", CORAL, true],
    ["Next", "Social-login onboarding · missed-round insurance pool · a real KRW stablecoin.", GOLD, false],
    ["Then", "Yield on idle escrow · VRF payout ordering · credit scoring from on-chain reputation.", GREEN, false],
    ["Scale", "Group buying, community insurance & club treasuries on the same primitive.", WHITE, false],
  ];
  phases.forEach(([h, d, c, done], i) => {
    const x = 1.0 + i * 2.95;
    s.addShape(p.ShapeType.ellipse, { x: x - 0.16, y: 3.34, w: 0.32, h: 0.32, fill: { color: c }, line: { color: BG, width: 3 } });
    const up = i % 2 === 0;
    const cy = up ? 1.95 : 3.95;
    card(s, x - 0.15, cy, 2.7, 1.4);
    s.addText(h, { x: x + 0.05, y: cy + 0.15, w: 2.3, h: 0.4, fontFace: H, fontSize: 17, bold: true, color: c, margin: 0 });
    s.addText(d, { x: x + 0.05, y: cy + 0.58, w: 2.35, h: 0.8, fontFace: B, fontSize: 11.5, color: MUTED, margin: 0, lineSpacingMultiple: 1.1 });
  });
  s.addNotes("v1 is real and shipped; everything right of 'Now' is the fundable roadmap.");
})();

/* ---------------- Slide 10 — Ask / close ---------------- */
(() => {
  const s = p.addSlide(); base(s);
  // ring motif echo
  s.addShape(p.ShapeType.ellipse, { x: 10.2, y: 0.6, w: 4.2, h: 4.2, fill: { type: "none" }, line: { color: "2A1A2E", width: 40 } });
  kicker(s, "The ask", GOLD);
  s.addText([{ text: "Web2-easy. On-chain-trustless.\n", options: { color: TEXT } }, { text: "곗돈, finally without the risk.", options: { color: CORAL } }], {
    x: 0.7, y: 1.1, w: 9.5, h: 1.9, fontFace: H, fontSize: 40, bold: true, margin: 0, lineSpacingMultiple: 1.02,
  });

  const asks = [
    ["Grant & program support", "To grow circles and reach production stage."],
    ["Upbit wallet integration", "Fund circles directly from an Upbit balance."],
    ["Demo Day at Korea Blockchain Week", "Put trustless kye in front of Korea's builders."],
  ];
  asks.forEach(([h, d], i) => {
    const y = 3.15 + i * 1.05;
    card(s, 0.7, y, 7.4, 0.92);
    dot(s, 1.0, y + 0.36, CORAL);
    s.addText(h, { x: 1.3, y: y + 0.13, w: 6.6, h: 0.4, fontFace: H, fontSize: 15.5, bold: true, color: TEXT, margin: 0 });
    s.addText(d, { x: 1.3, y: y + 0.5, w: 6.6, h: 0.35, fontFace: B, fontSize: 12.5, color: MUTED, margin: 0 });
  });

  card(s, 8.35, 3.15, 4.25, 3.15, PANEL2);
  s.addText("Team", { x: 8.65, y: 3.4, w: 3.6, h: 0.35, fontFace: H, fontSize: 13, bold: true, color: GOLD, charSpacing: 2, margin: 0 });
  s.addText("Ritesh", { x: 8.65, y: 3.8, w: 3.6, h: 0.55, fontFace: H, fontSize: 26, bold: true, color: TEXT, margin: 0 });
  s.addText("Solo builder — contracts, frontend & deployment.", { x: 8.65, y: 4.4, w: 3.7, h: 0.7, fontFace: B, fontSize: 13, color: MUTED, margin: 0, lineSpacingMultiple: 1.1 });
  s.addText([{ text: "@Ritesh5969", options: { color: TEXT, bold: true } }], { x: 8.65, y: 5.25, w: 3.6, h: 0.35, fontFace: B, fontSize: 14, margin: 0 });
  s.addText("Contact: riteshwork5969@gmail.com", { x: 8.65, y: 5.65, w: 3.7, h: 0.4, fontFace: B, fontSize: 11.5, italic: true, color: MUTED, margin: 0 });

  s.addText("Live on GIWA Sepolia  ·  sepolia-explorer.giwa.io", { x: 0.7, y: 6.85, w: 11, h: 0.4, fontFace: B, fontSize: 13, color: GREEN, margin: 0 });
  s.addNotes("Close on the ask.");
})();

p.writeFile({ fileName: "Jjan-Pitch-Deck.pptx" }).then((f) => console.log("wrote", f));
