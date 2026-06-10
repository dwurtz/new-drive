// ui.jsx — shared UI: icons, doc previews, sidebar, coverslide card

// ─────────── Icons ───────────
const I = {
  home: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9.5A.5.5 0 0 0 5.5 20H9v-5h6v5h3.5a.5.5 0 0 0 .5-.5V10"/></svg>,
  drive: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 14h18l-4 7H7z"/><path d="M3 14 9 3h6"/><path d="M21 14 15 3"/></svg>,
  shared: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5"/><path d="M14.5 19c0-2 2-4 4.5-4 1.6 0 3 .9 3 3"/></svg>,
  recent: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  starred: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.2 6.1L12 16.9 6.6 19.7l1.2-6.1L3.4 9.4l6-.8z"/></svg>,
  trash: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 7h16"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M6 7l1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7"/></svg>,
  threads: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12c0 4.4-4 8-9 8-1.3 0-2.5-.2-3.6-.6L3 21l1.6-4.5C3.6 15.1 3 13.6 3 12c0-4.4 4-8 9-8s9 3.6 9 8z"/></svg>,
  search: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  settings: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>,
  bell: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>,
  grid: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  list: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" {...p}><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>,
  plus: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  send: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></svg>,
  paperclip: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 12 11.5 20.5a5 5 0 1 1-7-7L13 5a3.5 3.5 0 1 1 5 5l-8 8a2 2 0 1 1-2.8-2.8L14 9"/></svg>,
  at: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>,
  arrowLeft: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>,
  pin: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m12 2 4 4-1.5 1.5L17 10l-3 3-8-8 3-3 2.5 2.5z"/><path d="m9 13-7 9"/></svg>,
  more: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>,
  close: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="m6 6 12 12M18 6 6 18"/></svg>,
  spark: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2 13.5 8.5 20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z"/><path d="M19 16l.6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6z"/></svg>,
  peekIcon: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7Z"/><circle cx="12" cy="12" r="2.5"/></svg>,
  doc: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>,
};

// Google Drive's real multi-color logo
function DriveLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 87.3 78" fill="none" style={{ display: 'block' }}>
      <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
      <path d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3L1.2 48.5C.4 49.9 0 51.45 0 53h27.5z" fill="#00ac47" />
      <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.8 57c.8-1.4 1.2-2.95 1.2-4.5H60.5l5.85 11.5z" fill="#ea4335" />
      <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
      <path d="M60.5 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.5c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
      <path d="M73.4 26.5l-12.65-21.8c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 60.5 53H87.95c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
    </svg>
  );
}

// File-type tile (small colored block with letter)
function TypeTile({ t, size = 22 }) {
  const c = {
    doc:      { bg: 'var(--doc)', l: 'D' },
    sheet:    { bg: 'var(--sheet)', l: 'S' },
    preso:    { bg: 'var(--preso)', l: 'P' },
    app:      { bg: 'var(--app)', l: 'A' },
    notebook: { bg: 'var(--notebook)', l: 'N' },
    pdf:      { bg: '#B72D2D', l: 'P' },
    img:      { bg: '#0E7C7B', l: 'I' },
    csv:      { bg: '#0F8F5A', l: 'C' },
    folder:   { bg: '#C2A246', l: 'F' },
  }[t] || { bg: '#999', l: '?' };
  return (
    <div className="ficon" style={{ background: c.bg, width: size, height: size * 32/28 }}>
      {c.l}
    </div>
  );
}

// ─────────── Slide content (the deck being built) ───────────
function DeckSlide1({ title = 'Northwind', subtitle = 'A new shape for industrial water.', tag = 'Series A · 2026' }) {
  return (
    <div className="slide slide-1">
      <div className="eyebrow">Pitch · {tag}</div>
      <div className="mark"></div>
      <h2><em>The future of</em><br />water doesn't<br />come from the tap.</h2>
      <div className="sub">{subtitle}</div>
      <div className="foot">
        <span>{title.toUpperCase()}</span>
        <span>· 02.2026</span>
      </div>
    </div>
  );
}

// ─────── Math worksheet (kids · bilingual EN/ES) ───────
const MATH_PROBLEMS = [
  { n: 1, e: '🍎', en: 'Andre has 7 apples. His friend gives him 5 more. How many apples does Andre have now?',
    es: 'Andre tiene 7 manzanas. Su amigo le da 5 más. ¿Cuántas manzanas tiene Andre ahora?' },
  { n: 2, e: '🐦', en: 'There are 12 birds in a tree. 4 fly away. How many birds are left?',
    es: 'Hay 12 pájaros en un árbol. 4 se van volando. ¿Cuántos pájaros quedan?' },
  { n: 3, e: '🎈', en: 'Maria has 6 red balloons and 8 blue balloons. How many balloons does she have in all?',
    es: 'María tiene 6 globos rojos y 8 globos azules. ¿Cuántos globos tiene en total?' },
  { n: 4, e: '🖍️', en: 'A box has 15 crayons. 6 of them are broken. How many crayons are not broken?',
    es: 'Una caja tiene 15 crayones. 6 están rotos. ¿Cuántos crayones no están rotos?' },
  { n: 5, e: '🦆', en: 'Pedro saw 9 ducks in the pond. 7 more ducks came. How many ducks are there now?',
    es: 'Pedro vio 9 patos en el estanque. Llegaron 7 patos más. ¿Cuántos patos hay ahora?' },
  { n: 6, e: '⭐', en: 'Lucia had 18 stickers. She gave 5 to her brother. How many stickers does she have left?',
    es: 'Lucía tenía 18 calcomanías. Le dio 5 a su hermano. ¿Cuántas calcomanías le quedan?' },
];

function MathWorksheet() {
  return (
    <div className="math-worksheet">
      <div className="mw-header">
        <div className="mw-title">Math Adventures <span className="sparkle">✨</span> Aventuras de Matemáticas</div>
        <div className="mw-sub">Word Problems · Problemas de palabras  |  Addition &amp; Subtraction within 20 · Suma y resta hasta 20</div>
        <div className="mw-meta">
          <span>Name / Nombre:<span className="blank"></span></span>
          <span>Date / Fecha:<span className="blank"></span></span>
        </div>
        <div className="mw-abacus">🧮</div>
      </div>
      <div className="mw-problems">
        {MATH_PROBLEMS.map((p, i) => (
          <div className={`mw-card mw-card-${i % 2 === 0 ? 'blue' : 'pink'}`} key={p.n}>
            <div className="mw-num">{p.n}</div>
            <div className="mw-emoji">{p.e}</div>
            <div className="mw-text">
              <div className="mw-en">{p.en}</div>
              <div className="mw-es">{p.es}</div>
              <div className="mw-answer">ANSWER / RESPUESTA <span className="mw-blank"></span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Generic doc preview
function DocPreview({ kind, title, folderId }) {
  if (folderId === 'fmath') return <MathWorksheet />;
  if (kind === 'preso') return <DeckSlide1 title={title} />;
  if (kind === 'doc') return (
    <div className="docprev doc">
      <h2>{title || 'Engineering principles · v2'}</h2>
      <div className="meta">Last edited just now · 3 collaborators</div>
      <p>We build the thing that makes the thing. Tools are infrastructure — they decide what's possible.</p>
      <div className="h3">1 · Optimize for read-through</div>
      <p>Code is read 10× more than it's written. Prefer obvious over clever; name things for the next person.</p>
      <div className="h3">2 · Ship small, ship often</div>
      <p>The smallest reversible change that proves a hypothesis. Velocity compounds; perfectionism doesn't.</p>
      <div className="h3">3 · Own the seam</div>
      <p>Whoever defines the interface owns the system. Make boundaries explicit before they become bottlenecks.</p>
    </div>
  );
  if (kind === 'sheet') return (
    <div className="docprev sheet">
      <div className="row head"><div className="num"></div><div>Quarter</div><div>Revenue</div><div>Growth</div><div>Churn</div><div>NRR</div></div>
      {['Q1 ’25', 'Q2 ’25', 'Q3 ’25', 'Q4 ’25', 'Q1 ’26'].map((q, i) => (
        <div className="row" key={q}>
          <div className="num">{i+1}</div>
          <div>{q}</div>
          <div>{['$1.2M','$1.8M','$2.4M','$3.1M','$4.0M'][i]}</div>
          <div>{['—','+50%','+33%','+29%','+29%'][i]}</div>
          <div>{['4.2%','3.8%','3.1%','2.6%','2.4%'][i]}</div>
          <div>{['108%','114%','119%','124%','131%'][i]}</div>
        </div>
      ))}
      <div className="row tot"><div className="num">Σ</div><div>FY blended</div><div>$12.5M</div><div>+233%</div><div>2.9%</div><div>119%</div></div>
    </div>
  );
  if (kind === 'app') return (
    <div className="docprev app">
      <div className="bar">
        <div style={{width:8, height:8, borderRadius:'50%', background:'#F87171'}}></div>
        <div style={{width:8, height:8, borderRadius:'50%', background:'#FBBF24'}}></div>
        <div style={{width:8, height:8, borderRadius:'50%', background:'#34D399'}}></div>
        <div style={{marginLeft:8, opacity:.4}}>onboarding-flow</div>
      </div>
      <div className="grid">
        <div className="tile"><div className="lbl">New signups</div><div className="v">2,418</div></div>
        <div className="tile"><div className="lbl">Activated</div><div className="v">1,196</div></div>
        <div className="tile"><div className="lbl">Day-1 retention</div><div className="v">74%</div></div>
        <div className="tile"><div className="lbl">Avg time-to-value</div><div className="v">3:42</div></div>
      </div>
    </div>
  );
  if (kind === 'notebook') return (
    <div className="docprev notebook">
      <div className="cell in">
        <div className="lbl">In [1]</div>
        <pre>{`df = pd.read_csv("interviews.csv")
df.groupby("persona").size().plot(kind="bar")`}</pre>
      </div>
      <div className="cell out">
        <div className="lbl">Out [1]</div>
        <div className="barchart">
          {[14, 22, 9, 18, 27, 11, 6].map((h, i) => (
            <i key={i} style={{ height: h * 1.2 }}></i>
          ))}
        </div>
      </div>
    </div>
  );
  return <div className="docprev" style={{ padding: 24 }}>Preview</div>;
}

// ─────────── Coverslide card (folder represented by its cover doc) ───────────
function CoverslideCard({ folder, metaphor = 'replace', isNew = false, onClick }) {
  return (
    <div className={`cs-card${isNew ? ' new' : ''}`} data-metaphor={metaphor} onClick={onClick}>
      {metaphor === 'nest' ? (
        <div className="cs-cover">
          <div className="cs-doc-inner">
            <DocPreview kind={folder.kind} title={folder.title} folderId={folder.id} />
          </div>
        </div>
      ) : (
        <div className="cs-cover">
          <DocPreview kind={folder.kind} title={folder.title} folderId={folder.id} />
        </div>
      )}
      <div className="cs-meta">
        <div style={{minWidth:0, flex:1}}>
          <div className="title">{folder.title}</div>
          <div className="sub">
            <span>{folder.sub}</span>
            <span className="sep"></span>
            <span>{folder.items} items</span>
          </div>
        </div>
        <div className="right">
          <span className="type-pill" data-t={folder.kind}>{
            { preso:'Deck', doc:'Doc', sheet:'Sheet', app:'App', notebook:'Notebook' }[folder.kind] || folder.kind
          }</span>
        </div>
      </div>
    </div>
  );
}

// Classic (no coverslide) folder card
function ClassicFolderCard({ folder, onClick }) {
  return (
    <div onClick={onClick} style={{cursor:'pointer'}}>
      <div className="cls-folder">
        <div className="lbl">{folder.title}</div>
        <div className="ct">{folder.items}</div>
      </div>
      <div className="cs-meta">
        <div style={{minWidth:0, flex:1}}>
          <div className="title">{folder.title}</div>
          <div className="sub">
            <span>{folder.sub}</span>
            <span className="sep"></span>
            <span>{folder.items} items</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────── Sidebar ───────────
const SB_SECTIONS = [
  { id: 'home', label: 'Home', icon: I.home },
  { id: 'shared', label: 'Shared with me', icon: I.shared },
  { id: 'starred', label: 'Starred', icon: I.starred },
  { id: 'trash', label: 'Trash', icon: I.trash },
];
const SB_SECTION_IDS = { shared: ['f1', 'f2', 'f4', 'f6'], starred: ['fmath', 'f1'], trash: [] };

// Icon rail (clear nav icons) that fans out a labeled panel for the clicked section.
function Sidebar({ tree, onCreate, currentView, currentFolderId, onSelectFolder, onSelectHome, collapsed, onToggleCollapsed }) {
  const [expanded, setExpanded] = React.useState({ f4: false });
  const [filter, setFilter] = React.useState('');
  const [section, setSection] = React.useState('home');
  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const root = tree.find(t => t.id === 'mydrive') || { children: [] };
  const items = root.children.filter(c => !filter || c.name.toLowerCase().includes(filter.toLowerCase()));
  const grouped = BUCKETS.map(b => ({ ...b, items: items.filter(it => bucketFor(it.updatedAt) === b.id) })).filter(g => g.items.length > 0);
  const sectionNodes = (SB_SECTION_IDS[section] || []).map(id => root.children.find(c => c.id === id)).filter(Boolean);
  const activeLabel = (SB_SECTIONS.find(s => s.id === section) || SB_SECTIONS[0]).label;

  function pickSection(id) {
    setSection(id);
    if (collapsed) onToggleCollapsed();      // fan out
    if (id === 'home') onSelectHome && onSelectHome();
  }
  const node = (n) => (
    <TreeNode key={n.id} node={n} depth={0} expanded={expanded} onToggle={toggle}
      currentFolderId={currentFolderId} onSelectFolder={onSelectFolder} />
  );

  return (
    <aside className="sb">
      <div className="sb-rail">
        <div className="sb-rail-logo" onClick={onSelectHome} title="Home"><DriveLogo size={28} /></div>
        <button className="sb-rail-create" onClick={onCreate} title="Create (⌘N)"><I.plus /></button>
        <div className="sb-rail-nav">
          {SB_SECTIONS.map(s => (
            <button key={s.id} className={`sb-rail-item${section === s.id ? ' active' : ''}`} title={s.label} onClick={() => pickSection(s.id)}>
              {s.icon()}
            </button>
          ))}
        </div>
        <button className="sb-rail-toggle" onClick={onToggleCollapsed} title={collapsed ? 'Expand' : 'Collapse'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d={collapsed ? 'm9 6 6 6-6 6' : 'm15 6-6 6 6 6'} />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <div className="sb-panel">
          <div className="sb-panel-hd">
            <h3>{activeLabel}</h3>
            {section === 'home' && <>
              <button className="sb-icon-btn" title="Search"><I.search /></button>
              <button className="sb-icon-btn" title="New folder"><I.plus /></button>
            </>}
          </div>

          {section === 'home' ? (
            <>
              <div className="sb-search">
                <I.search />
                <input placeholder="Filter…" value={filter} onChange={(e) => setFilter(e.target.value)} />
              </div>
              <div className="sb-mydrive">
                {grouped.map(g => (
                  <div className="sb-group" key={g.id}>
                    <div className="sb-group-label">{g.label}</div>
                    {g.items.map(node)}
                  </div>
                ))}
                {grouped.length === 0 && <div className="sb-empty">No folders match “{filter}”</div>}
              </div>
            </>
          ) : (
            <div className="sb-mydrive">
              {sectionNodes.length === 0
                ? <div className="sb-empty">{section === 'trash' ? 'Trash is empty' : 'Nothing here yet'}</div>
                : sectionNodes.map(node)}
            </div>
          )}

          <div className="sb-foot">
            <div className="row"><b>Storage</b><span>5.7 of 15 GB</span></div>
            <div className="bar"><i></i></div>
          </div>
        </div>
      )}
    </aside>
  );
}

// Expandable tree node
function TreeNode({ node, depth, expanded, onToggle, currentFolderId, onSelectFolder }) {
  const hasChildren = node.children && node.children.length > 0;
  const isOpen = !!expanded[node.id];
  const isActive = currentFolderId === node.id;
  return (
    <>
      <div
        className={`tree-node${isActive ? ' active' : ''}`}
        onClick={() => {
          if (node.kind === 'root') { onToggle(node.id); return; }
          onSelectFolder && onSelectFolder(node);
        }}
      >
        <span
          className={`chev${hasChildren ? (isOpen ? ' open' : '') : ' none'}`}
          onClick={(e) => { e.stopPropagation(); if (hasChildren) onToggle(node.id); }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
        </span>
        {(node.kind === 'root') ? (
          <span style={{display:'grid', placeItems:'center', width:18, height:18, color:'var(--ink-dim)'}}><I.drive /></span>
        ) : node.cs ? (
          <div className="mini-cover has-cs">
            {node.id === 'fmath'
              ? <div style={{width:'100%', height:'100%', background:'linear-gradient(135deg,#FFD79A,#FFA862)'}}></div>
              : <MiniCover kind={node.kind} />}
          </div>
        ) : (
          <div className="mini-cover">
            <MiniCover kind="folder" />
          </div>
        )}
        <span className="name">{node.name}</span>
      </div>
      {hasChildren && isOpen && (
        <div className="tree-children">
          {node.children.map(c => (
            <TreeNode
              key={c.id}
              node={c}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              currentFolderId={currentFolderId}
              onSelectFolder={onSelectFolder}
            />
          ))}
        </div>
      )}
    </>
  );
}

function MiniCover({ kind }) {
  const tones = {
    preso: ['#0B1A3F', '#DC4A2D'],
    doc: ['#FFFFFF', '#2D67E2'],
    sheet: ['#FFFFFF', '#0F8F5A'],
    app: ['#1A1B25', '#7C5AE0'],
    notebook: ['#F8F7F1', '#D89A1F'],
    folder: ['#FFF8DD', '#F0CE5F'],
  }[kind] || ['#E5E5E5', '#999'];
  return (
    <div style={{
      width: '100%', height: '100%',
      background: `linear-gradient(135deg, ${tones[0]}, ${tones[1]})`,
    }}></div>
  );
}

// Topbar — consistent Gemini-powered "Ask Drive" bar (with typed scope sources)
const TB_SOURCE_GROUPS = [
  { label: 'People', type: 'person', items: ['Linh T.', 'Sam K.', 'Priya R.'] },
  { label: 'Recent folders', type: 'folder', items: ['Brand Refresh ’26', 'Q2 Financial Model', 'Customer Research'] },
  { label: 'Recent meetings', type: 'meeting', items: ['Q2 Planning Sync · Mon', 'Board Review · Fri', 'Design Critique · Wed'] },
  { label: 'Recent files', type: 'doc', items: ['Engineering Principles', 'Investor Update — May 2026', 'northwind-water-market.pdf'] },
];
const TB_SOURCE_TYPE = {};
TB_SOURCE_GROUPS.forEach(g => g.items.forEach(n => (TB_SOURCE_TYPE[n] = g.type)));
function srcInitials(n) { return n.split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase(); }
function SrcIcon({ type, name }) {
  if (type === 'person') return <span className="src-av">{srcInitials(name)}</span>;
  if (type === 'folder') return <span className="src-ic folder"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg></span>;
  if (type === 'meeting') return <span className="src-ic mtg"><I.recent /></span>;
  return <span className="src-ic doc"><I.doc /></span>;
}
function Topbar() {
  const [sources, setSources] = React.useState([]);
  const [menu, setMenu] = React.useState(false);
  const wrapRef = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  const add = (s) => { setSources(v => v.includes(s) ? v : [...v, s]); setMenu(false); };
  const remove = (s) => setSources(v => v.filter(x => x !== s));
  const allAdded = TB_SOURCE_GROUPS.every(g => g.items.every(n => sources.includes(n)));
  return (
    <div className="topbar">
      <div className="search gem-search">
        <span className="gem-spark" title="Powered by Gemini"><GemGlyph size={17} /></span>
        <div className="src-add-wrap" ref={wrapRef}>
          <button className="src-add" title="Add a source to scope your question" onClick={() => setMenu(o => !o)}><I.plus /></button>
          {menu && (
            <div className="src-menu">
              {allAdded && <div className="src-menu-empty">All sources added</div>}
              {TB_SOURCE_GROUPS.map(g => {
                const avail = g.items.filter(n => !sources.includes(n));
                if (!avail.length) return null;
                return (
                  <div className="src-grp" key={g.label}>
                    <div className="src-menu-h">{g.label}</div>
                    {avail.map(n => (
                      <button key={n} className="src-opt" onClick={() => add(n)}>
                        <SrcIcon type={g.type} name={n} /><span>{n}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {sources.map(s => (
          <span className="src-chip" key={s}>
            <SrcIcon type={TB_SOURCE_TYPE[s] || 'doc'} name={s} /><span className="t">{s}</span>
            <button onClick={() => remove(s)} title="Remove">×</button>
          </span>
        ))}
        <input className="gem-input" placeholder={sources.length ? 'Ask about these sources…' : 'Ask Drive…'}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const q = e.target.value.trim();
              if (q) window.dispatchEvent(new CustomEvent('nd-search', { detail: { q, sources } }));
            }
          }} />
        <span className="kbd">⌘K</span>
      </div>
      <div className="tb-spacer"></div>
      <button className="tb-icon"><I.bell /></button>
      <button className="tb-icon"><I.settings /></button>
      <div className="avatar">DW</div>
    </div>
  );
}

Object.assign(window, {
  I, TypeTile, DocPreview, DeckSlide1, MathWorksheet, DriveLogo,
  CoverslideCard, ClassicFolderCard,
  Sidebar, Topbar, MiniCover, TreeNode,
});
