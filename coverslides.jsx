// coverslides.jsx — functional Coverslide artifacts (the "upgrade").
//   preso → a full presentation app (nav, overview, present + speaker notes, editable)
//   sheet → a robust analytics dashboard (pivot, sort, sparklines, 4 charts, export)
//   app   → a live monitoring app
// Wrapped in an IIFE so it doesn't collide with screens.jsx's top-level hooks.

(function () {
  const { useState, useEffect, useRef, useMemo } = React;

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const TH = { bg: "#0b1020", ink: "#eef1ff", accent: "#5ee0c0", blue: "#7c9cff", dim: "#aeb6d6", faint: "#8a93b2", orange: "#e8714c" };

  // ════════════════════════ SLIDE DECK ════════════════════════
  const DECK = [
    { type: "cover", notes: "Open warm but get to the model fast. One breath on the cover, then move." },
    { type: "agenda", title: "What we'll cover", items: [
      "The $480B blind spot", "Why capex stalls", "How Northwind works",
      "The ROI math", "Market & traction", "Team & the ask"],
      notes: "Keep this to 15 seconds. It's a map, not a destination." },
    { type: "bigstat", eyebrow: "The problem", stat: "$480B", caption: "spent every year cooling industrial equipment — then dumping the water.",
      foot: "No one owns the software layer.", notes: "Let the number land. Pause after you say it." },
    { type: "bullets", eyebrow: "Why now", title: "Why cooling-tower capex stalls", bullets: [
      "New towers are 18-month, $4–9M capital projects",
      "Water-reuse compliance is now mandatory in 14 states",
      "Plant engineers have zero real-time visibility",
      "Every retrofit is bespoke — there's no standard system"],
      notes: "Three forces converging: cost, regulation, blindness. That's the 'why now'." },
    { type: "comparison", eyebrow: "The shift", title: "From capital project to software",
      left: { h: "The old way", items: ["$4–9M new tower", "18-month install", "Bespoke every time", "No live data"] },
      right: { h: "Northwind", items: ["Software + sensors", "Live in 6 weeks", "One standard OS", "Real-time controls"] },
      notes: "This is the whole pitch in one slide. We turn a capital project into a subscription." },
    { type: "system", eyebrow: "Product", title: "How Northwind works", steps: ["Sensors", "Reuse OS", "Controls", "Compliance"],
      notes: "Sensors in, controls out, compliance reporting falls out for free." },
    { type: "metrics", eyebrow: "ROI math", title: "The payback is the pitch", metrics: [
      { v: "31%", l: "less make-up water" }, { v: "$1.4M", l: "avg annual savings" },
      { v: "14 mo", l: "payback period" }, { v: "$0", l: "new capex required" }],
      notes: "Lead buyers care about payback period above all. 14 months sells itself." },
    { type: "bars", eyebrow: "Market", title: "A market sized in billions", note: "TAM / SAM / SOM ($B)",
      series: [{ q: "TAM", v: 480 }, { q: "SAM", v: 92 }, { q: "SOM", v: 11 }],
      notes: "SOM is what we can win in 5 years with this round." },
    { type: "line", eyebrow: "Traction", title: "Revenue is compounding", note: "Net revenue by quarter ($M)",
      series: [1.2, 1.8, 2.4, 3.1, 4.0, 5.4], notes: "233% growth over the trailing year. The curve is the story." },
    { type: "donut", eyebrow: "Mix", title: "Revenue by segment", slices: [
      { l: "Enterprise", v: 58, c: "#7c9cff" }, { l: "Mid-Market", v: 30, c: "#5ee0c0" }, { l: "SMB", v: 12, c: "#ffd166" }],
      notes: "Enterprise-led, but mid-market is the fastest-growing slice." },
    { type: "quote", quote: "Northwind paid for itself in the first cooling season. We're rolling it out to all eleven plants.",
      who: "— VP Operations, Granite Foods", notes: "Granite Foods is our anchor logo. Name-drop the plant count." },
    { type: "team", eyebrow: "Team", title: "Operators who've done this", people: [
      { n: "D. Wurtz", r: "CEO · ex-Tesla Energy", c: "#7c9cff" },
      { n: "L. Tran", r: "CTO · ex-Siemens Water", c: "#5ee0c0" },
      { n: "S. Kaur", r: "VP Eng · ex-Samsara", c: "#ffd166" },
      { n: "M. Ortiz", r: "VP Sales · ex-GE Digital", c: "#ff8fab" }],
      notes: "Every hire has shipped industrial software at scale before." },
    { type: "roadmap", eyebrow: "Roadmap", title: "Where the round takes us", phases: [
      { w: "Q1", t: "Multi-site dashboard", c: "#7c9cff" }, { w: "Q2", t: "Predictive maintenance", c: "#5ee0c0" },
      { w: "Q3", t: "Compliance auto-filing", c: "#ffd166" }, { w: "Q4", t: "Open API + marketplace", c: "#ff8fab" }],
      notes: "Tie each milestone back to a revenue unlock." },
    { type: "metrics", eyebrow: "The ask", title: "Raising a $14M Series A", metrics: [
      { v: "$14M", l: "round size" }, { v: "24 mo", l: "runway" },
      { v: "8", l: "key hires" }, { v: "3×", l: "pipeline coverage" }],
      notes: "Close confident. State the number, the runway, what it buys. Then stop talking." },
    { type: "closing", notes: "End on the mission, not the metrics. Invite the conversation." },
  ];

  function Slide({ s, editable }) {
    const { bg, ink, accent, blue, dim, faint } = TH;
    const base = { position: "absolute", inset: 0, padding: "7% 8%", color: ink, background: bg, overflow: "hidden",
      fontFamily: "var(--font-sans, sans-serif)" };
    const ed = editable ? { contentEditable: true, suppressContentEditableWarning: true, spellCheck: false } : {};
    const eyebrow = (t) => <div style={{ color: blue, letterSpacing: ".14em", textTransform: "uppercase", fontSize: "1.6cqw", fontWeight: 600, marginBottom: "2.5%" }}>{t}</div>;
    const H = (t) => <div {...ed} style={{ fontSize: "5cqw", fontWeight: 700, lineHeight: 1.05, maxWidth: "94%", outline: "none" }}>{t}</div>;

    if (s.type === "cover") return (
      <div style={base}>
        <div style={{ position: "absolute", right: "-8%", top: "-14%", width: "44%", height: "120%", background: "radial-gradient(circle,#7c9cff44,transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, padding: "7% 8%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {eyebrow("Pitch · Series A · Feb 2026")}
          <div style={{ width: "5cqw", height: "5cqw", borderRadius: "50%", background: "radial-gradient(circle at 35% 35%,#ffb37a,#e8714c)", marginBottom: "3.5%" }} />
          <div {...ed} style={{ fontSize: "7cqw", fontWeight: 700, lineHeight: 1.02, outline: "none" }}>We replace<br />cooling-tower <em style={{ color: accent, fontStyle: "normal" }}>capex</em><br />with software.</div>
          <div style={{ color: accent, fontSize: "2.4cqw", marginTop: "3%" }}>A water-reuse OS for industrial cooling.</div>
          <div style={{ position: "absolute", left: "8%", bottom: "6%", color: faint, fontSize: "1.5cqw", letterSpacing: ".1em" }}>NORTHWIND · 02.2026</div>
        </div>
      </div>);

    if (s.type === "closing") return (
      <div style={base}>
        <div style={{ position: "absolute", inset: 0, padding: "7% 8%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {eyebrow("Thank you")}
          <div {...ed} style={{ fontSize: "6cqw", fontWeight: 700, outline: "none" }}>Let's rebuild industrial water.</div>
          <div style={{ color: accent, fontSize: "2.2cqw", marginTop: "3%" }}>david@northwind.io · northwind.io</div>
        </div>
      </div>);

    if (s.type === "agenda") return (
      <div style={base}>{eyebrow("Agenda")}{H(s.title)}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3% 6%", marginTop: "5%" }}>
          {s.items.map((it, i) => <div key={i} style={{ display: "flex", gap: "1.4cqw", alignItems: "baseline", fontSize: "2.4cqw" }}>
            <span style={{ color: accent, fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span><span {...ed} style={{ outline: "none" }}>{it}</span></div>)}
        </div></div>);

    if (s.type === "bigstat") return (
      <div style={base}>{eyebrow(s.eyebrow)}
        <div style={{ position: "absolute", inset: 0, padding: "7% 8%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: "13cqw", fontWeight: 800, lineHeight: 1, color: accent }}>{s.stat}</div>
          <div {...ed} style={{ fontSize: "3cqw", marginTop: "2%", maxWidth: "80%", lineHeight: 1.3, outline: "none" }}>{s.caption}</div>
          <div style={{ fontSize: "2cqw", color: faint, marginTop: "3%" }}>{s.foot}</div>
        </div></div>);

    if (s.type === "statement") return (<div style={base}>{eyebrow(s.eyebrow)}{H(s.title)}
      <div {...ed} style={{ fontSize: "2.6cqw", color: dim, marginTop: "4%", maxWidth: "80%", lineHeight: 1.4, outline: "none" }}>{s.body}</div></div>);

    if (s.type === "bullets") return (<div style={base}>{eyebrow(s.eyebrow)}{H(s.title)}
      <ul style={{ listStyle: "none", padding: 0, margin: "5% 0 0", display: "flex", flexDirection: "column", gap: "3%" }}>
        {s.bullets.map((b, i) => <li key={i} style={{ fontSize: "2.4cqw", display: "flex", gap: "1.4cqw" }}><span style={{ color: accent }}>▸</span><span {...ed} style={{ outline: "none" }}>{b}</span></li>)}
      </ul></div>);

    if (s.type === "comparison") return (<div style={base}>{eyebrow(s.eyebrow)}{H(s.title)}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4%", marginTop: "5%" }}>
        {[s.left, s.right].map((col, ci) => <div key={ci} style={{ background: ci ? "#5ee0c012" : "#ffffff08", border: `1px solid ${ci ? "#5ee0c044" : "#ffffff1a"}`, borderRadius: 16, padding: "5%" }}>
          <div style={{ fontSize: "2.2cqw", fontWeight: 700, color: ci ? accent : faint, marginBottom: "6%" }}>{col.h}</div>
          {col.items.map((it, i) => <div key={i} style={{ fontSize: "2cqw", padding: "3% 0", borderTop: i ? "1px solid #ffffff14" : "none" }}>{it}</div>)}
        </div>)}
      </div></div>);

    if (s.type === "system") return (<div style={base}>{eyebrow(s.eyebrow)}{H(s.title)}
      <div style={{ display: "flex", gap: "2%", marginTop: "7%", alignItems: "center" }}>
        {s.steps.map((st, i) => <React.Fragment key={i}>
          <div style={{ flex: 1, background: "#ffffff0d", border: "1px solid #ffffff1a", borderRadius: 14, padding: "6% 3%", textAlign: "center", fontSize: "2cqw", fontWeight: 600 }}>{st}</div>
          {i < s.steps.length - 1 && <span style={{ color: accent, fontSize: "3cqw" }}>→</span>}
        </React.Fragment>)}
      </div></div>);

    if (s.type === "metrics") return (<div style={base}>{eyebrow(s.eyebrow)}{H(s.title)}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4%", marginTop: "5%" }}>
        {s.metrics.map((m, i) => <div key={i} style={{ background: "#ffffff0d", border: "1px solid #ffffff1a", borderRadius: 14, padding: "4% 5%" }}>
          <div style={{ fontSize: "5cqw", fontWeight: 700 }}>{m.v}</div><div style={{ fontSize: "1.7cqw", color: faint }}>{m.l}</div></div>)}
      </div></div>);

    if (s.type === "quote") return (<div style={base}>
      <div style={{ position: "absolute", inset: 0, padding: "7% 8%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: "8cqw", color: accent, lineHeight: 0.5, height: "4cqw" }}>"</div>
        <div {...ed} style={{ fontSize: "3.4cqw", fontWeight: 600, lineHeight: 1.3, maxWidth: "88%", outline: "none" }}>{s.quote}</div>
        <div style={{ fontSize: "2cqw", color: faint, marginTop: "4%" }}>{s.who}</div>
      </div></div>);

    if (s.type === "team") return (<div style={base}>{eyebrow(s.eyebrow)}{H(s.title)}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "3%", marginTop: "6%" }}>
        {s.people.map((p, i) => <div key={i} style={{ textAlign: "center" }}>
          <div style={{ width: "100%", aspectRatio: "1", borderRadius: "50%", background: `linear-gradient(135deg,${p.c},${p.c}88)`, marginBottom: "10%" }} />
          <div style={{ fontSize: "1.8cqw", fontWeight: 600 }}>{p.n}</div>
          <div style={{ fontSize: "1.3cqw", color: faint, marginTop: "4%" }}>{p.r}</div></div>)}
      </div></div>);

    if (s.type === "roadmap") return (<div style={base}>{eyebrow(s.eyebrow)}{H(s.title)}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${s.phases.length},1fr)`, gap: "3%", marginTop: "8%" }}>
        {s.phases.map((p, i) => <div key={i}>
          <div style={{ height: "1cqw", borderRadius: "0.5cqw", background: p.c, marginBottom: "14%" }} />
          <div style={{ fontSize: "2.4cqw", fontWeight: 700, color: p.c }}>{p.w}</div>
          <div style={{ fontSize: "1.9cqw", marginTop: "6%" }}>{p.t}</div></div>)}
      </div></div>);

    if (s.type === "bars") {
      const max = Math.max(...s.series.map(d => d.v));
      return (<div style={base}>{eyebrow(s.eyebrow)}{H(s.title)}
        <div style={{ fontSize: "1.5cqw", color: faint, marginTop: "1%" }}>{s.note}</div>
        <svg viewBox="0 0 1000 420" style={{ width: "100%", height: "68%", marginTop: "1%" }}>
          {s.series.map((d, i) => { const bw = 150, gap = (1000 - bw * s.series.length) / (s.series.length + 1), x = gap + i * (bw + gap), h = d.v / max * 320, y = 360 - h;
            return <g key={i}><rect x={x} y={y} width={bw} height={h} rx="8" fill={i === 0 ? blue : i === 1 ? "#5e7fe0" : accent} />
              <text x={x + bw / 2} y={y - 12} fill={ink} fontSize="28" textAnchor="middle">${d.v}B</text>
              <text x={x + bw / 2} y="392" fill={faint} fontSize="22" textAnchor="middle">{d.q}</text></g>; })}
        </svg></div>);
    }
    if (s.type === "line") {
      const max = Math.max(...s.series), min = Math.min(...s.series);
      const pts = s.series.map((v, i) => [60 + i / (s.series.length - 1) * 880, 360 - (v - min) / (max - min || 1) * 300]);
      const path = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(0) + " " + p[1].toFixed(0)).join(" ");
      return (<div style={base}>{eyebrow(s.eyebrow)}{H(s.title)}
        <div style={{ fontSize: "1.5cqw", color: faint, marginTop: "1%" }}>{s.note}</div>
        <svg viewBox="0 0 1000 420" style={{ width: "100%", height: "68%", marginTop: "1%" }}>
          <path d={path + " L940 360 L60 360 Z"} fill="#7c9cff22" />
          <path d={path} fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="6" fill={accent} />)}
        </svg></div>);
    }
    if (s.type === "donut") {
      const tot = s.slices.reduce((a, d) => a + d.v, 0); let a0 = -Math.PI / 2;
      const arcs = s.slices.map(d => { const a1 = a0 + d.v / tot * Math.PI * 2; const x0 = 210 + 150 * Math.cos(a0), y0 = 210 + 150 * Math.sin(a0), x1 = 210 + 150 * Math.cos(a1), y1 = 210 + 150 * Math.sin(a1); const large = a1 - a0 > Math.PI ? 1 : 0; a0 = a1; return { d: `M210 210 L${x0.toFixed(1)} ${y0.toFixed(1)} A150 150 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`, c: d.c }; });
      return (<div style={base}>{eyebrow(s.eyebrow)}{H(s.title)}
        <div style={{ display: "flex", alignItems: "center", gap: "6%", marginTop: "3%" }}>
          <svg viewBox="0 0 420 420" style={{ width: "44%" }}>
            {arcs.map((a, i) => <path key={i} d={a.d} fill={a.c} />)}<circle cx="210" cy="210" r="78" fill={bg} />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", gap: "5%" }}>
            {s.slices.map((d, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: "1.4cqw", fontSize: "2.2cqw" }}>
              <span style={{ width: "1.8cqw", height: "1.8cqw", borderRadius: 4, background: d.c }} /><b>{d.v}%</b><span style={{ color: dim }}>{d.l}</span></div>)}
          </div></div></div>);
    }
    return <div style={base}>{H(s.title || "")}</div>;
  }

  function DeckArtifact() {
    const [cur, setCur] = useState(0);
    const [present, setPresent] = useState(false);
    const [overview, setOverview] = useState(false);
    const [notes, setNotes] = useState(true);
    const [edit, setEdit] = useState(false);
    const clamp = (i) => Math.max(0, Math.min(DECK.length - 1, i));
    useEffect(() => {
      const onKey = (e) => {
        if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName) || e.target?.isContentEditable) return;
        if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); setCur(c => clamp(c + 1)); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); setCur(c => clamp(c - 1)); }
        else if (e.key.toLowerCase() === "g") setOverview(o => !o);
        else if (e.key.toLowerCase() === "p" || e.key.toLowerCase() === "f") setPresent(p => !p);
        else if (e.key === "Escape") { setPresent(false); setOverview(false); }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, []);

    if (present) return (
      <div className="cs-present">
        <div className="cs-present-stage" onClick={() => setCur(c => clamp(c + 1))}>
          <div className="cs-slide-canvas big" key={cur}><Slide s={DECK[cur]} /></div>
        </div>
        {notes && <div className="cs-notes"><div className="cs-notes-h">Speaker notes · slide {cur + 1}</div><p>{DECK[cur].notes}</p>
          <div className="cs-notes-next">Next: {DECK[cur + 1] ? (DECK[cur + 1].title || DECK[cur + 1].type) : "— end —"}</div></div>}
        <div className="cs-present-bar">
          <button onClick={() => setCur(c => clamp(c - 1))}>‹</button>
          <span>{cur + 1} / {DECK.length}</span>
          <button onClick={() => setCur(c => clamp(c + 1))}>›</button>
          <button className="t" onClick={() => setNotes(n => !n)}>{notes ? "Hide notes" : "Notes"}</button>
          <button className="t" onClick={() => setPresent(false)}>Exit ⎋</button>
        </div>
        <div className="cs-progress"><i style={{ width: ((cur + 1) / DECK.length * 100) + "%" }} /></div>
      </div>);

    if (overview) return (
      <div className="cs-overview">
        <div className="cs-ov-head"><b>All slides</b><span>{DECK.length} slides · click to jump · G to toggle</span></div>
        <div className="cs-ov-grid">
          {DECK.map((s, i) => <div key={i} className={`cs-ov-cell${i === cur ? " on" : ""}`} onClick={() => { setCur(i); setOverview(false); }}>
            <div className="cs-slide-canvas"><Slide s={s} /></div><div className="cs-ov-n">{i + 1}</div></div>)}
        </div>
      </div>);

    return (
      <div className="cs-deck">
        <div className="cs-rail">
          {DECK.map((s, i) => <div key={i} className={`cs-thumb${i === cur ? " on" : ""}`} onClick={() => setCur(i)}>
            <span className="n">{i + 1}</span><div className="cs-slide-canvas"><Slide s={s} /></div></div>)}
        </div>
        <div className="cs-stage">
          <div className="cs-slide-canvas main" key={cur}><Slide s={DECK[cur]} editable={edit} /></div>
          <div className="cs-progress in-stage"><i style={{ width: ((cur + 1) / DECK.length * 100) + "%" }} /></div>
          <div className="cs-deck-nav">
            <button onClick={() => setCur(c => clamp(c - 1))} title="Previous (←)">‹</button>
            <span>{cur + 1} / {DECK.length}</span>
            <button onClick={() => setCur(c => clamp(c + 1))} title="Next (→)">›</button>
            <span className="div" />
            <button className={`tg${edit ? " on" : ""}`} onClick={() => setEdit(e => !e)} title="Toggle inline editing">✎ Edit</button>
            <button className="tg" onClick={() => setOverview(true)} title="Overview (G)">⊞ Grid</button>
            <button className="present" onClick={() => setPresent(true)} title="Present (P)">▶ Present</button>
          </div>
        </div>
      </div>);
  }

  // ════════════════════════ ROBUST DASHBOARD ════════════════════════
  const SEGMENTS = ["Enterprise", "Mid-Market", "SMB"];
  const REGIONS = ["North America", "EMEA", "APAC", "LATAM"];
  const CHANNELS = ["Direct", "Partner", "Self-serve"];
  const QUARTERS = ["Q1 ’25", "Q2 ’25", "Q3 ’25", "Q4 ’25", "Q1 ’26"];
  const DIMS = [
    { k: "segment", l: "Segment", vals: SEGMENTS },
    { k: "region", l: "Region", vals: REGIONS },
    { k: "channel", l: "Channel", vals: CHANNELS },
    { k: "quarter", l: "Quarter", vals: QUARTERS },
  ];
  const MEAS = [
    { k: "revenue", l: "Revenue", fmt: "money", agg: "sum" },
    { k: "customers", l: "Customers", fmt: "int", agg: "sum" },
    { k: "arpu", l: "ARPU", fmt: "money0", agg: "wavg" },
    { k: "nrr", l: "Net revenue retention", fmt: "pct100", agg: "wavg" },
    { k: "churn", l: "Churn rate", fmt: "pct", agg: "wavg" },
    { k: "cac", l: "Avg CAC", fmt: "money0", agg: "wavg" },
  ];
  const FIN_ROWS = (() => {
    const r = rng(7); const rows = [];
    const segW = { Enterprise: 1, "Mid-Market": 0.5, SMB: 0.22 };
    const regW = { "North America": 1, EMEA: 0.6, APAC: 0.5, LATAM: 0.25 };
    const chW = { Direct: 1, Partner: 0.55, "Self-serve": 0.35 };
    QUARTERS.forEach((q, qi) => {
      const g = 1 + qi * 0.26;
      SEGMENTS.forEach(segment => REGIONS.forEach(region => CHANNELS.forEach(channel => {
        const base = 150000 * segW[segment] * regW[region] * chW[channel] * g * (0.8 + r() * 0.4);
        const aov = segment === "Enterprise" ? 9000 : segment === "Mid-Market" ? 1800 : 380;
        const customers = Math.max(1, Math.round(base / aov));
        rows.push({
          segment, region, channel, quarter: q,
          revenue: Math.round(base), customers,
          arpu: Math.round(base / customers),
          nrr: +(1.05 + r() * 0.3).toFixed(3),
          churn: +(0.012 + r() * 0.04).toFixed(3),
          cac: Math.round(channel === "Self-serve" ? 40 + r() * 60 : channel === "Partner" ? 120 + r() * 120 : 300 + r() * 400),
        });
      })));
    });
    return rows;
  })();

  function fmt(v, k) {
    if (v == null || isNaN(v)) return "—";
    if (k === "money") return v >= 1e6 ? "$" + (v / 1e6).toFixed(2) + "M" : "$" + (v / 1e3).toFixed(0) + "K";
    if (k === "money0") return "$" + Math.round(v).toLocaleString();
    if (k === "int") return Math.round(v).toLocaleString();
    if (k === "pct") return (v * 100).toFixed(1) + "%";
    if (k === "pct100") return (v * 100).toFixed(0) + "%";
    return v;
  }

  function DashboardArtifact() {
    const [rowDim, setRowDim] = useState("segment");
    const [colDim, setColDim] = useState("quarter");
    const [meas, setMeas] = useState("revenue");
    const [chart, setChart] = useState("bar");
    const [exclude, setExclude] = useState({});
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState(null); // {col:'total'|index, dir}
    const m = MEAS.find(x => x.k === meas);

    const rows = useMemo(() => FIN_ROWS.filter(r => !exclude[r.segment] && !exclude[r.region] && !exclude[r.channel]), [exclude]);
    const totCust = (recs) => recs.reduce((a, r) => a + r.customers, 0) || 1;
    const agg = (recs, mk = meas) => {
      const mm = MEAS.find(x => x.k === mk);
      if (!recs.length) return 0;
      if (mm.agg === "wavg") return recs.reduce((a, r) => a + r[mk] * r.customers, 0) / totCust(recs);
      return recs.reduce((a, r) => a + r[mk], 0);
    };

    let rowVals = DIMS.find(d => d.k === rowDim).vals.filter(v => !search || v.toLowerCase().includes(search.toLowerCase()));
    const colVals = DIMS.find(d => d.k === colDim).vals;
    const rowRecs = (rv) => rows.filter(r => r[rowDim] === rv);
    const matrixOf = (rv) => colVals.map(cv => agg(rows.filter(r => r[rowDim] === rv && r[colDim] === cv)));
    let data = rowVals.map(rv => ({ rv, cells: matrixOf(rv), total: agg(rowRecs(rv)), spark: QUARTERS.map(q => agg(rows.filter(r => r[rowDim] === rv && r.quarter === q))) }));
    if (sort) data = [...data].sort((a, b) => ((sort.col === "total" ? a.total : a.cells[sort.col]) - (sort.col === "total" ? b.total : b.cells[sort.col])) * sort.dir);
    const colTot = colVals.map((cv, j) => agg(rows.filter(r => r[colDim] === cv)));
    const grand = agg(rows);
    const max = Math.max(...data.flatMap(d => d.cells), 1);

    // KPI cards with QoQ deltas + sparkline
    const kpiDefs = [["revenue", "Total revenue"], ["customers", "Customers"], ["nrr", "Net rev retention"], ["churn", "Avg churn"]];
    const qSeries = (mk) => QUARTERS.map(q => agg(rows.filter(r => r.quarter === q), mk));
    const kpis = kpiDefs.map(([mk, l]) => {
      const ser = qSeries(mk), last = ser[ser.length - 1], prev = ser[ser.length - 2] || last;
      const mm = MEAS.find(x => x.k === mk);
      const total = mm.agg === "wavg" ? agg(rows, mk) : ser.reduce((a, b) => a + b, 0);
      const d = prev ? (last - prev) / prev * 100 : 0;
      return { l, v: fmt(mm.agg === "wavg" ? last : total, mm.fmt), d, ser, up: mk === "churn" ? d <= 0 : d >= 0 };
    });

    const palette = ["#1a73e8", "#0F8F5A", "#F4B400", "#E55934", "#7C5AE0", "#00ACC1"];
    const toggle = (v) => setExclude(e => ({ ...e, [v]: !e[v] }));
    const sortBy = (col) => setSort(s => s && s.col === col ? (s.dir === -1 ? { col, dir: 1 } : null) : { col, dir: -1 });
    const heat = (v) => (m.k === "revenue" || m.k === "customers") ? `rgba(26,115,232,${(0.05 + v / max * 0.5).toFixed(3)})` : "transparent";

    const exportCsv = () => {
      const head = [DIMS.find(d => d.k === rowDim).l, ...colVals, "Total"];
      const lines = [head.join(",")];
      data.forEach(d => lines.push([d.rv, ...d.cells.map(v => Math.round(v)), Math.round(d.total)].join(",")));
      lines.push(["Total", ...colTot.map(v => Math.round(v)), Math.round(grand)].join(","));
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
      a.download = `${meas}_${rowDim}_x_${colDim}.csv`; a.click(); URL.revokeObjectURL(a.href);
    };

    return (
      <div className="cs-dash">
        <div className="cs-dash-ctrls">
          <Ctl label="Rows" value={rowDim} opts={DIMS.map(d => [d.k, d.l])} onChange={v => { setRowDim(v); if (v === colDim) setColDim(DIMS.find(d => d.k !== v).k); setSort(null); }} />
          <Ctl label="Columns" value={colDim} opts={DIMS.map(d => [d.k, d.l])} onChange={v => { setColDim(v); if (v === rowDim) setRowDim(DIMS.find(d => d.k !== v).k); setSort(null); }} />
          <Ctl label="Measure" value={meas} opts={MEAS.map(d => [d.k, d.l])} onChange={v => { setMeas(v); setSort(null); }} />
          <div className="cs-ctl"><span>Chart</span>
            <div className="cs-seg">
              {[["bar", "Bar"], ["line", "Trend"], ["stack", "Stacked"], ["donut", "Share"]].map(([k, l]) =>
                <button key={k} className={chart === k ? "on" : ""} onClick={() => setChart(k)}>{l}</button>)}
            </div></div>
          <div className="cs-ctl" style={{ flex: 1, minWidth: 140 }}><span>Find row</span>
            <input className="cs-search" placeholder="Filter rows…" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <button className="cs-export" onClick={exportCsv}>↓ Export CSV</button>
        </div>

        <div className="cs-filters wide">
          <span>Filters:</span>
          {[...SEGMENTS, ...REGIONS, ...CHANNELS].map(v => <span key={v} className={`cs-chip${exclude[v] ? "" : " on"}`} onClick={() => toggle(v)}>{v}</span>)}
        </div>

        <div className="cs-kpis">
          {kpis.map((k, i) => <div className="cs-kpi" key={i}>
            <div className="l">{k.l}</div><div className="v">{k.v}</div>
            <div className={`d ${k.up ? "up" : "down"}`}>{k.d >= 0 ? "▲" : "▼"} {Math.abs(k.d).toFixed(1)}% QoQ</div>
            <Spark vals={k.ser} color={k.up ? "#0F8F5A" : "#E55934"} />
          </div>)}
        </div>

        <div className="cs-dash-grid">
          <div className="cs-card">
            <h4>{m.l} — {DIMS.find(d => d.k === rowDim).l} × {DIMS.find(d => d.k === colDim).l}
              {sort && <span className="cs-sorted"> · sorted by {sort.col === "total" ? "Total" : colVals[sort.col]} {sort.dir === -1 ? "↓" : "↑"}</span>}</h4>
            <div className="cs-table-wrap">
              <table className="cs-pivot">
                <thead><tr><th>{DIMS.find(d => d.k === rowDim).l}</th>
                  {colVals.map((c, j) => <th key={c} className="sortable" onClick={() => sortBy(j)}>{c}{sort && sort.col === j ? (sort.dir === -1 ? " ↓" : " ↑") : ""}</th>)}
                  <th className="sortable" onClick={() => sortBy("total")}>Total{sort && sort.col === "total" ? (sort.dir === -1 ? " ↓" : " ↑") : ""}</th>
                  <th>Trend</th></tr></thead>
                <tbody>
                  {data.map((d, i) => <tr key={d.rv}><td>{d.rv}</td>
                    {d.cells.map((v, j) => <td key={j}><span style={{ background: heat(v), padding: "2px 6px", borderRadius: 4 }}>{fmt(v, m.fmt)}</span></td>)}
                    <td><b>{fmt(d.total, m.fmt)}</b></td>
                    <td><Spark vals={d.spark} color={palette[i % palette.length]} w={70} h={22} /></td></tr>)}
                </tbody>
                <tfoot><tr><td>Total</td>{colTot.map((v, j) => <td key={j}>{fmt(v, m.fmt)}</td>)}<td>{fmt(grand, m.fmt)}</td><td></td></tr></tfoot>
              </table>
            </div>
          </div>
          <div className="cs-card">
            <h4>{chart === "donut" ? `${m.l} share by ${DIMS.find(d => d.k === rowDim).l}` :
              chart === "stack" ? `${m.l} by ${DIMS.find(d => d.k === rowDim).l} × ${DIMS.find(d => d.k === colDim).l}` :
                chart === "line" ? `${m.l} trend by ${DIMS.find(d => d.k === rowDim).l}` :
                  `${m.l} by ${DIMS.find(d => d.k === rowDim).l}`}</h4>
            {chart === "bar" && <BarChart labels={data.map(d => d.rv)} values={data.map(d => d.total)} k={m.fmt} palette={palette} />}
            {chart === "line" && <LineChart data={data} colVals={QUARTERS} palette={palette} />}
            {chart === "stack" && <StackChart data={data} colVals={colVals} palette={palette} k={m.fmt} />}
            {chart === "donut" && <DonutChart data={data} palette={palette} k={m.fmt} />}
          </div>
        </div>
      </div>);
  }

  function Ctl({ label, value, opts, onChange }) {
    return <label className="cs-ctl"><span>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>;
  }
  function Spark({ vals, color, w = 120, h = 30 }) {
    const max = Math.max(...vals, 1), min = Math.min(...vals, 0);
    const pts = vals.map((v, i) => `${(i / (vals.length - 1) * w).toFixed(1)},${(h - 2 - (v - min) / (max - min || 1) * (h - 4)).toFixed(1)}`);
    return <svg width={w} height={h} style={{ display: "block" }}><polyline fill="none" stroke={color} strokeWidth="1.6" points={pts.join(" ")} />
      <circle cx={w} cy={(h - 2 - (vals[vals.length - 1] - min) / (max - min || 1) * (h - 4))} r="2" fill={color} /></svg>;
  }
  function BarChart({ labels, values, k, palette }) {
    const max = Math.max(...values, 1), W = 480, H = 250, n = values.length || 1, bw = (W / n) * 0.6;
    return <svg className="cs-chart" viewBox={`0 0 ${W} ${H}`}>
      <line x1="8" y1={H - 30} x2={W - 8} y2={H - 30} stroke="#dadce0" />
      {values.map((v, i) => { const x = (i + 0.5) * (W / n) - bw / 2, hh = v / max * (H - 60), y = H - 30 - hh;
        return <g key={i}><rect x={x} y={y} width={bw} height={hh} rx="5" fill={palette[i % palette.length]} />
          <text x={x + bw / 2} y={y - 6} fontSize="11" fill="#5f6368" textAnchor="middle">{fmt(v, k)}</text>
          <text x={x + bw / 2} y={H - 12} fontSize="10" fill="#5f6368" textAnchor="middle">{labels[i].length > 11 ? labels[i].slice(0, 10) + "…" : labels[i]}</text></g>; })}
    </svg>;
  }
  function LineChart({ data, colVals, palette }) {
    const W = 480, H = 250, max = Math.max(...data.flatMap(d => d.spark), 1);
    const x = i => 12 + i / (colVals.length - 1) * (W - 24), y = v => H - 34 - v / max * (H - 60);
    return <div><svg className="cs-chart" viewBox={`0 0 ${W} ${H}`}>
      <line x1="8" y1={H - 34} x2={W - 8} y2={H - 34} stroke="#dadce0" />
      {data.map((d, idx) => <path key={idx} d={d.spark.map((v, i) => (i ? "L" : "M") + x(i).toFixed(0) + " " + y(v).toFixed(0)).join(" ")} fill="none" stroke={palette[idx % palette.length]} strokeWidth="2.5" />)}
      {colVals.map((q, i) => <text key={i} x={x(i)} y={H - 16} fontSize="9" fill="#5f6368" textAnchor="middle">{q}</text>)}
    </svg><div className="cs-legend">{data.map((d, i) => <span key={d.rv}><i style={{ background: palette[i % palette.length] }} />{d.rv}</span>)}</div></div>;
  }
  function StackChart({ data, colVals, palette, k }) {
    const W = 480, H = 250, n = colVals.length, bw = (W / n) * 0.6;
    const colSums = colVals.map((_, j) => data.reduce((a, d) => a + d.cells[j], 0));
    const max = Math.max(...colSums, 1);
    return <div><svg className="cs-chart" viewBox={`0 0 ${W} ${H}`}>
      <line x1="8" y1={H - 30} x2={W - 8} y2={H - 30} stroke="#dadce0" />
      {colVals.map((c, j) => { let acc = 0; const x = (j + 0.5) * (W / n) - bw / 2;
        return <g key={j}>{data.map((d, i) => { const hh = d.cells[j] / max * (H - 60); const y = H - 30 - acc - hh; acc += hh;
          return <rect key={i} x={x} y={y} width={bw} height={Math.max(0, hh)} fill={palette[i % palette.length]} />; })}
          <text x={x + bw / 2} y={H - 12} fontSize="9.5" fill="#5f6368" textAnchor="middle">{c.length > 8 ? c.slice(0, 7) + "…" : c}</text></g>; })}
    </svg><div className="cs-legend">{data.map((d, i) => <span key={d.rv}><i style={{ background: palette[i % palette.length] }} />{d.rv}</span>)}</div></div>;
  }
  function DonutChart({ data, palette, k }) {
    const tot = data.reduce((a, d) => a + d.total, 0) || 1; let a0 = -Math.PI / 2;
    const arcs = data.map((d, i) => { const a1 = a0 + d.total / tot * Math.PI * 2; const x0 = 125 + 95 * Math.cos(a0), y0 = 125 + 95 * Math.sin(a0), x1 = 125 + 95 * Math.cos(a1), y1 = 125 + 95 * Math.sin(a1); const large = a1 - a0 > Math.PI ? 1 : 0; a0 = a1; return { p: `M125 125 L${x0.toFixed(1)} ${y0.toFixed(1)} A95 95 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`, c: palette[i % palette.length], d }; });
    return <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg viewBox="0 0 250 250" style={{ width: 200, flex: "0 0 200px" }}>{arcs.map((a, i) => <path key={i} d={a.p} fill={a.c} />)}<circle cx="125" cy="125" r="52" fill="#fff" /></svg>
      <div className="cs-legend col">{data.map((d, i) => <span key={d.rv}><i style={{ background: palette[i % palette.length] }} /><b>{(d.total / tot * 100).toFixed(0)}%</b> {d.rv}</span>)}</div>
    </div>;
  }

  // ════════════════════════ LIVE MONITOR (unchanged) ════════════════════════
  const SRC = ["Organic", "Referral", "Paid", "Partner", "Direct"];
  const EVENTS = ["signed up from a webinar", "activated their workspace", "invited 3 teammates", "connected a data source", "completed onboarding", "upgraded to Pro", "started a free trial", "hit their first activation", "imported a project"];
  const NAMES = ["Avery", "Jordan", "Priya", "Marco", "Lena", "Sam", "Noah", "Mia", "Diego", "Yuki", "Omar", "Tess"];

  function MonitorArtifact() {
    const [feed, setFeed] = useState([]);
    const [paused, setPaused] = useState(false);
    const [spark, setSpark] = useState(() => Array.from({ length: 40 }, (_, i) => 10 + Math.round(Math.sin(i / 4) * 6 + (i % 5))));
    const ctr = useRef(0);
    useEffect(() => {
      if (paused) return;
      const t = setInterval(() => {
        ctr.current++;
        const r = (ctr.current * 9301 + 49297) % 233280 / 233280;
        const name = NAMES[ctr.current % NAMES.length], ev = EVENTS[Math.floor(r * EVENTS.length)], src = SRC[ctr.current % SRC.length];
        setFeed(f => [{ id: ctr.current, name, ev, src, t: "just now", hot: r > 0.8 }, ...f].slice(0, 14));
        setSpark(s => [...s.slice(1), 8 + Math.round(r * 18)]);
      }, 1600);
      return () => clearInterval(t);
    }, [paused]);
    const funnel = [{ l: "Signups", v: 2418, p: 100 }, { l: "Activated", v: 1196, p: 49 }, { l: "Invited team", v: 742, p: 31 }, { l: "Day-7 retained", v: 531, p: 22 }];
    const sparkMax = Math.max(...spark);
    return (
      <div className="cs-monitor">
        <div className="cs-mon-main">
          <div className="cs-mon-head"><div><h3>Onboarding · live monitor</h3><div className="sub"><span className="live" /> streaming · {feed.length ? "events flowing" : "warming up"}</div></div>
            <button className="cs-mon-pause" onClick={() => setPaused(p => !p)}>{paused ? "▶ Resume" : "⏸ Pause"}</button></div>
          <div className="cs-mon-kpis">
            {[{ l: "New signups · today", v: "2,418", d: "+18%" }, { l: "Activation rate", v: "49%", d: "+3.1pts" }, { l: "Avg time-to-value", v: "3:42", d: "−12s" }, { l: "Live now", v: String(38 + (feed.length % 9)), d: "users" }].map((k, i) =>
              <div className="cs-mon-kpi" key={i}><div className="l">{k.l}</div><div className="v">{k.v}</div><div className="d">{k.d}</div></div>)}
          </div>
          <div className="cs-card dark"><h4>Signups / minute</h4>
            <svg className="cs-spark" viewBox="0 0 480 120" preserveAspectRatio="none">
              <polyline fill="none" stroke="#34D399" strokeWidth="2" points={spark.map((v, i) => `${i / (spark.length - 1) * 480},${110 - v / sparkMax * 96}`).join(" ")} />
              <polygon fill="#34D39922" points={`0,110 ${spark.map((v, i) => `${i / (spark.length - 1) * 480},${110 - v / sparkMax * 96}`).join(" ")} 480,110`} /></svg></div>
          <div className="cs-card dark"><h4>Activation funnel</h4>
            {funnel.map((f, i) => <div className="cs-funnel-row" key={i}><span className="fl">{f.l}</span>
              <span className="ftrack"><i style={{ width: f.p + "%", background: ["#60A5FA", "#34D399", "#FBBF24", "#F87171"][i] }} /></span>
              <span className="fv">{f.v.toLocaleString()} · {f.p}%</span></div>)}</div>
        </div>
        <div className="cs-mon-side"><h4>Live activity</h4>
          <div className="cs-feed">{feed.length === 0 && <div className="cs-feed-empty">Listening for events…</div>}
            {feed.map(e => <div className={`cs-feed-row${e.hot ? " hot" : ""}`} key={e.id}>
              <div className="av" style={{ background: ["#60A5FA", "#34D399", "#F472B6", "#FBBF24", "#A78BFA"][e.id % 5] }}>{e.name[0]}</div>
              <div className="body"><div><b>{e.name}</b> {e.ev}</div><div className="meta">{e.src} · {e.t}</div></div>
              {e.hot && <span className="hot-tag">🔥</span>}</div>)}</div></div>
      </div>);
  }

  // ════════════════════════ Overlay dispatcher ════════════════════════
  function ArtifactViewer({ folder, onClose }) {
    useEffect(() => {
      const onKey = (e) => { if (e.key === "Escape" && !document.querySelector(".cs-present") && !document.querySelector(".cs-overview")) onClose(); };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);
    const kind = folder.kind;
    const titleByKind = { preso: "Northwind Series A · Deck", sheet: "Q2 Financial Model · Dashboard", app: "Onboarding · Live monitor" };
    let body, label;
    if (kind === "preso") { body = <DeckArtifact />; label = "15 slides · present, grid, notes, edit"; }
    else if (kind === "sheet") { body = <DashboardArtifact />; label = "pivot · sort · sparklines · 4 charts · export"; }
    else if (kind === "app") { body = <MonitorArtifact />; label = "live app"; }
    else { body = <div className="cs-fallback">No interactive artifact for this Coverslide type yet.</div>; label = ""; }
    return (
      <div className="cs-overlay">
        <div className="cs-topbar">
          <button className="cs-back" onClick={onClose} title="Back to folder">←</button>
          <div className="cs-titles"><div className="t">{titleByKind[kind] || folder.title}</div><div className="s">{folder.title} · {label}</div></div>
          <div className="cs-spacer" />
          <span className="cs-flag">functional Coverslide</span>
        </div>
        <div className="cs-body">{body}</div>
      </div>);
  }

  // Each artifact is a distinct "app" with its own brand + chrome, so it reads as an
  // application running inside the panel — not part of Drive.
  const APP_META = {
    preso: { name: "Spotlight", sub: "Presentation", theme: "deck", glyph: "◆", badge: "Slides" },
    sheet: { name: "Pivot", sub: "Analytics workspace", theme: "analytics", glyph: "▦", badge: "Live data" },
    app: { name: "Pulse", sub: "Realtime monitoring", theme: "pulse", glyph: "◉", badge: "Streaming" },
  };

  // Embeddable body — the live artifact AS the Coverslide, wrapped in app-window chrome.
  function ArtifactBody({ kind }) {
    const meta = APP_META[kind] || { name: "App", sub: "", theme: "generic", glyph: "▣", badge: "" };
    const inner = kind === "preso" ? <DeckArtifact /> : kind === "sheet" ? <DashboardArtifact /> : kind === "app" ? <MonitorArtifact /> : null;
    return (
      <div className={`appwin theme-${meta.theme}`}>
        <div className="appwin-bar">
          <span className="appwin-dots"><i /><i /><i /></span>
          <span className="appwin-glyph">{meta.glyph}</span>
          <span className="appwin-name">{meta.name}</span>
          <span className="appwin-sub">{meta.sub}</span>
          <span className="appwin-spacer" />
          <span className="appwin-badge">{meta.badge}</span>
          <span className="appwin-host">running in Drive</span>
        </div>
        <div className="appwin-body">{inner}</div>
      </div>
    );
  }

  window.ArtifactViewer = ArtifactViewer;
  window.ArtifactBody = ArtifactBody;
  window.__hasArtifact = (kind) => ["preso", "sheet", "app"].includes(kind);
})();
