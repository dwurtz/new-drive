// screens.jsx — DriveHome, CreateThread, PeekViewer

const { useState, useEffect, useRef, useMemo } = React;

// ───────── Seed data ─────────
const SEED_FOLDERS = [
  { id:'fmath', title:'Math Adventures',     sub:'For Andre & Lucía', items:5,  kind:'doc',      hasThread:true, customCover:'math' },
  { id:'f1', title:'Brand Refresh ’26',     sub:'Edited 2h ago',    items:14, kind:'preso',    cover:{ title:'Brand Refresh' }, hasThread:true },
  { id:'f2', title:'Q2 Financial Model',    sub:'Edited yesterday', items:9,  kind:'sheet',    hasThread:true },
  { id:'f3', title:'Engineering Principles',sub:'Edited Tue',       items:6,  kind:'doc',      hasThread:true },
  { id:'f4', title:'Customer Research',     sub:'Edited Mon',       items:23, kind:'notebook', hasThread:true },
  { id:'f5', title:'Onboarding Internal',   sub:'Edited Apr 28',    items:5,  kind:'app',      hasThread:true },
  { id:'f6', title:'Marketing Site Copy',   sub:'Edited Apr 22',    items:11, kind:'doc',      hasThread:true },
];
const CLASSIC_FOLDERS = [
  { id:'c1', title:'2024 Archive',  sub:'Edited Jan 12', items:142 },
  { id:'c2', title:'Vendor Files',  sub:'Edited Mar 1',  items:38  },
];

// Folder hierarchy tree (Drive structure)
const DRIVE_TREE = [
  { id:'mydrive', name:'My Drive', kind:'root', children:[
    { id:'fmath', name:'Math Adventures',      kind:'doc',      cs:true, updatedAt:'today' },
    { id:'f1', name:'Brand Refresh ’26',      kind:'preso',    cs:true, updatedAt:'today-2h' },
    { id:'f2', name:'Q2 Financial Model',     kind:'sheet',    cs:true, updatedAt:'yesterday' },
    { id:'f3', name:'Engineering Principles', kind:'doc',      cs:true, updatedAt:'tue' },
    { id:'f4', name:'Customer Research',      kind:'notebook', cs:true, updatedAt:'mon', children:[
      { id:'f4a', name:'H1 2026 Interviews', kind:'folder', updatedAt:'mon' },
      { id:'f4b', name:'Survey responses',   kind:'folder', updatedAt:'apr28' },
      { id:'f4c', name:'Persona deep-dives', kind:'doc', cs:true, updatedAt:'apr25' },
    ] },
    { id:'f5', name:'Onboarding Internal',    kind:'app',      cs:true, updatedAt:'apr28' },
    { id:'f6', name:'Marketing Site Copy',    kind:'doc',      cs:true, updatedAt:'apr22' },
    { id:'c1', name:'2024 Archive',           kind:'folder',            updatedAt:'jan12' },
    { id:'c2', name:'Vendor Files',           kind:'folder',            updatedAt:'mar1' },
  ]},
];

// Buckets for chronological grouping
const BUCKETS = [
  { id:'today',     label:'Today',         keys:['today-2h', 'today'] },
  { id:'yesterday', label:'Yesterday',     keys:['yesterday'] },
  { id:'week',      label:'Past 7 days',   keys:['mon','tue','wed','thu','fri','sat','sun'] },
  { id:'month',     label:'Past 30 days',  keys:['apr22','apr25','apr28','apr30','may1'] },
  { id:'older',     label:'Older',         keys:['jan12','mar1','feb','jan'] },
];
function bucketFor(updatedAt) {
  for (const b of BUCKETS) if (b.keys.includes(updatedAt)) return b.id;
  return 'older';
}

// Folder contents (what you see when you open a folder)
const FOLDER_CONTENTS = {
  fmath: {
    cover: 'Math Adventures.gdoc',
    items: [
      { name:'Math Adventures.gdoc',                 type:'doc',    owner:'Me', when:'today',    size:'—',     pinned:true },
      { name:'Math Adventures · Answer key.gdoc',    type:'doc',    owner:'Me', when:'today',    size:'—' },
      { name:'Math Adventures · Print version.pdf',  type:'pdf',    owner:'Me', when:'today',    size:'180 KB' },
      { name:'Math Adventures · v1.gdoc',            type:'doc',    owner:'Me', when:'Mon',      size:'—' },
      { name:'first-grade-math-standards.pdf',       type:'pdf',    owner:'Me', when:'Mon',      size:'420 KB' },
    ],
  },
  f1: {
    cover: 'Cover.slide',
    items: [
      { name:'Cover.slide',                  type:'preso',    owner:'Me',     when:'2h ago',  size:'—',     pinned:true },
      { name:'02 — Why now.slide',           type:'preso',    owner:'Me',     when:'2h ago',  size:'—' },
      { name:'03 — System.slide',            type:'preso',    owner:'Me',     when:'2h ago',  size:'—' },
      { name:'04 — Customer voice.slide',    type:'preso',    owner:'Me',     when:'3h ago',  size:'—' },
      { name:'logo-marks-v3.png',            type:'img',      owner:'Sam K.', when:'Apr 30',  size:'1.1 MB' },
      { name:'brand-color-tokens.gsheet',    type:'sheet',    owner:'Me',     when:'Apr 30',  size:'—' },
      { name:'identity-guidelines-draft.gdoc', type:'doc',    owner:'Linh T.', when:'May 1',  size:'—' },
    ],
  },
  f4: {
    cover: 'cluster-analysis.ipynb',
    items: [
      { name:'cluster-analysis.ipynb',       type:'notebook', owner:'Me',     when:'Mon',    size:'420 KB', pinned:true },
      { name:'H1 2026 Interviews',           type:'folder',   owner:'Me',     when:'Mon',    size:'12 items' },
      { name:'Survey responses',             type:'folder',   owner:'Me',     when:'Apr 28', size:'8 items' },
      { name:'Persona deep-dives',           type:'folder',   owner:'Me',     when:'Apr 25', size:'5 items' },
      { name:'interviews.csv',               type:'csv',      owner:'Me',     when:'Apr 22', size:'88 KB' },
      { name:'recruiting-criteria.gdoc',     type:'doc',      owner:'Me',     when:'Apr 20', size:'—' },
    ],
  },
  // generic fallback contents
  default: {
    cover: null,
    items: [
      { name:'Draft v3.gdoc',  type:'doc',   owner:'Me',     when:'2h ago',  size:'—' },
      { name:'Notes.gdoc',     type:'doc',   owner:'Me',     when:'Yesterday', size:'—' },
      { name:'Data.gsheet',    type:'sheet', owner:'Me',     when:'Tue',     size:'—' },
      { name:'reference.pdf',  type:'pdf',   owner:'Me',     when:'Mon',     size:'320 KB' },
      { name:'screenshot.png', type:'img',   owner:'Sam K.', when:'Apr 28',  size:'480 KB' },
    ],
  },
};

// Rich collaborative thread history (people + AI + actions)
const PEOPLE = {
  me:   { name: 'You',     short: 'DW', color: 'linear-gradient(135deg,#E55934,#F8B58A)' },
  linh: { name: 'Linh T.', short: 'LT', color: 'linear-gradient(135deg,#1F6FEB,#6CA8FF)' },
  sam:  { name: 'Sam K.',  short: 'SK', color: 'linear-gradient(135deg,#0F8F5A,#5BC58F)' },
  ai:   { name: 'Drive',   short: '✱',  color: 'linear-gradient(135deg,#17171C,#3A3A42)' },
};

const RICH_THREAD = [
  { day: 'Tuesday · May 5' },
  { type:'msg', who:'me', when:'9:42 AM',
    text:"Draft a Series A pitch deck for Northwind. Use the attached market research and interviews — confident, plainspoken.",
    files:[
      { name:'northwind-water-market.pdf', type:'pdf', size:'2.4 MB' },
      { name:'industrial-buyer-interviews.csv', type:'csv', size:'88 KB' },
    ]
  },
  { type:'msg', who:'ai', when:'9:42 AM',
    text: "I read the 47-page market doc and the 22 interview transcripts. Strong narrative around capex avoidance and water-reuse compliance. Drafting a 12-slide structure now — cover, problem, market, product, traction, team, ask."
  },
  { type:'artifact', when:'9:43 AM',
    title:'Northwind · v1 (cover)',
    kind:'preso', variant:'philosophical',
  },
  { type:'action', who:'ai', when:'9:43 AM',
    actionText: 'generated', target: 'Cover.slide + 11 outline slides',
  },
  { type:'action', who:'linh', when:'10:18 AM',
    actionText: 'joined the thread', target: null,
  },
  { type:'comment', who:'linh', when:'10:19 AM',
    quote:'"The future of water doesn\u2019t come from the tap."',
    text:"Beautiful, but a Series A room won't sit through poetry. Lead with the business model."
  },
  { type:'msg', who:'me', when:'10:24 AM',
    text:'Agreed. Make the headline confident — "We replace cooling-tower capex with software" — and drop the future-of-water bit.'
  },
  { type:'msg', who:'ai', when:'10:24 AM',
    text:'Sharper. Updated below. I also tightened the tag to "Seed → Series A · Feb 2026."'
  },
  { type:'artifact', when:'10:25 AM',
    title:'Northwind · v2 (cover)',
    kind:'preso', variant:'replaced',
  },
  { day: 'Wednesday · May 6' },
  { type:'action', who:'sam', when:'8:51 AM',
    actionText: 'added', target: 'logo-marks-v3.png',
  },
  { type:'msg', who:'sam', when:'8:52 AM',
    text:'Brand marks attached. The orange dot is the locked element; the cover should breathe around it.'
  },
  { type:'msg', who:'ai', when:'8:53 AM',
    text: "Got it — I'll keep the warm tone in the cover gradient and reserve the orange dot for the seal. Threading the mark through slide 03 (System) and the ask slide too."
  },
  { type:'action', who:'ai', when:'8:54 AM',
    actionText: 'edited', target: 'Cover.slide, 03 — System.slide, 12 — Ask.slide',
  },
  { type:'comment', who:'sam', when:'9:14 AM',
    quote:'tag: "Series A · Feb 2026"',
    text:'+1 from brand. Use the small-caps treatment from the type tokens though, not all-caps.'
  },
  { type:'action', who:'ai', when:'9:15 AM',
    actionText: 'applied', target: 'type-tokens.smallCaps to cover eyebrow',
  },
  { day: 'Today · May 21' },
  { type:'msg', who:'me', when:'2:36 PM',
    text:'This is the one. Pin v2 as the Coverslide for the folder.'
  },
  { type:'msg', who:'ai', when:'2:36 PM',
    text: 'Pinned. Slide 1 is now the face of Northwind Series A. Anyone in the folder can peek behind to read this thread.'
  },
  { type:'artifact', when:'2:36 PM',
    title:'Northwind · v2 (cover)',
    kind:'preso', variant:'replaced', pinned:true,
  },
  { type:'action', who:'linh', when:'2:48 PM',
    actionText: 'reacted 🔥 to the pinned cover', target: null,
  },
];

function getFolderContents(folderId, isNew) {
  if (isNew) return {
    cover: 'Cover.slide',
    items: [
      { name:'Cover.slide',                          type:'preso', owner:'Me', when:'Just now', size:'—', pinned:true },
      { name:'02 — Industrial water blind spot.slide', type:'preso', owner:'Me', when:'Just now', size:'—' },
      { name:'03 — Why capex stalls.slide',          type:'preso', owner:'Me', when:'Just now', size:'—' },
      { name:'04 — How Northwind works.slide',       type:'preso', owner:'Me', when:'Just now', size:'—' },
      { name:'05 — Demo.slide',                      type:'preso', owner:'Me', when:'Just now', size:'—' },
      { name:'06 — Granite Foods story.slide',       type:'preso', owner:'Me', when:'Just now', size:'—' },
      { name:'07 — ROI math.slide',                  type:'preso', owner:'Me', when:'Just now', size:'—' },
      { name:'08 — Market.slide',                    type:'preso', owner:'Me', when:'Just now', size:'—' },
      { name:'09 — Traction.slide',                  type:'preso', owner:'Me', when:'Just now', size:'—' },
      { name:'10 — Team.slide',                      type:'preso', owner:'Me', when:'Just now', size:'—' },
      { name:'11 — Use of funds.slide',              type:'preso', owner:'Me', when:'Just now', size:'—' },
      { name:'12 — Ask.slide',                       type:'preso', owner:'Me', when:'Just now', size:'—' },
      { name:'northwind-water-market.pdf',           type:'pdf',   owner:'Me', when:'Just now', size:'2.4 MB' },
      { name:'industrial-buyer-interviews.csv',      type:'csv',   owner:'Me', when:'Just now', size:'88 KB' },
      { name:'logo-marks-v3.png',                    type:'img',   owner:'Me', when:'Just now', size:'1.1 MB' },
    ],
  };
  return FOLDER_CONTENTS[folderId] || FOLDER_CONTENTS.default;
}
const RECENT_FILES = [
  { name:'Q1-board-update.gdoc',    type:'doc',    owner:'Me',         when:'2h ago',    size:'—' },
  { name:'Hiring-pipeline.gsheet',  type:'sheet',  owner:'Priya R.',    when:'4h ago',    size:'—' },
  { name:'Northwind-research.pdf',  type:'pdf',    owner:'Me',         when:'Yesterday', size:'2.4 MB' },
  { name:'Logo-explorations.png',   type:'img',    owner:'Sam K.',      when:'Yesterday', size:'1.1 MB' },
  { name:'Sales-pipeline.gsheet',   type:'sheet',  owner:'Me',         when:'Mon',       size:'—' },
  { name:'engineering-allhands.gpreso', type:'preso', owner:'Linh T.',  when:'Apr 30',    size:'—' },
];

// The fake desktop files visible in the create-thread Hero (for drag demo / display only)
const HERO_FILES = [
  { name:'northwind-water-market.pdf',  type:'pdf',  size:'2.4 MB' },
  { name:'industrial-buyer-interviews.csv', type:'csv', size:'88 KB' },
  { name:'logo-marks-v3.png',           type:'img',  size:'1.1 MB' },
];

// ───────── DriveHome ─────────
function DriveHome({ folders, onOpenFolder, onOpenFile, onPreviewFolder, onCreate, metaphor }) {
  const allFolders = [...folders, ...CLASSIC_FOLDERS];
  return (
    <>
      <Topbar />
      <div className="dh-scroll">
        <h1 className="dh-welcome">Welcome to Drive</h1>

        <div className="dh-filters">
          <button className="dh-filter">
            <I.doc />
            <span>Type</span>
            <ChevronDown />
          </button>
          <button className="dh-filter">
            <I.shared />
            <span>People</span>
            <ChevronDown />
          </button>
          <button className="dh-filter">
            <I.recent />
            <span>Modified</span>
            <ChevronDown />
          </button>
          <button className="dh-filter">
            <FolderGlyph />
            <span>Location</span>
            <ChevronDown />
          </button>
        </div>

        <div className="dh-section">
          <div className="dh-section-head">
            <ChevronDown className="chev" />
            <h3>Suggested folders</h3>
          </div>
          <div className="dh-folders">
            {allFolders.slice(0, 5).map(f => (
              <SuggestedFolder
                key={f.id}
                folder={f}
                onClick={() => onPreviewFolder ? onPreviewFolder(f) : onOpenFolder(f)}
              />
            ))}
          </div>
        </div>

        <div className="dh-section">
          <div className="dh-section-head">
            <ChevronDown className="chev" />
            <h3>Suggested files</h3>
            <div className="right">
              <button className="tb-icon" style={{ width: 30, height: 30 }} title="List view"><I.list /></button>
              <button className="tb-icon active" style={{ width: 30, height: 30 }} title="Grid view"><I.grid /></button>
            </div>
          </div>
          <div className="dh-files">
            {folders.slice(0, 5).map(f => (
              <SuggestedFile
                key={f.id}
                folder={f}
                onClick={() => onOpenFile
                  ? onOpenFile({ name: f.title, kind: f.kind })
                  : onOpenFolder(f)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ChevronDown(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// Compact folder card — folder icon + name + "in My Drive" + menu
function SuggestedFolder({ folder, onClick }) {
  const hasCover = folder.kind && folder.hasThread !== false;
  return (
    <div className="dh-folder-card" onClick={onClick}>
      <div className="icon-tile" data-cover={hasCover ? 'true' : 'false'}>
        {hasCover ? (
          <div className="cover-mini">
            {folder.id === 'fmath'
              ? <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#FFD79A,#FFA862)' }}></div>
              : <MiniCover kind={folder.kind} />}
          </div>
        ) : (
          <FolderIcon />
        )}
      </div>
      <div className="info">
        <div className="name">{folder.title}</div>
        <div className="loc">in My Drive</div>
      </div>
      <button className="more" onClick={(e) => e.stopPropagation()}><I.more /></button>
    </div>
  );
}

// File card with large thumbnail preview — like native Drive's Suggested files
function SuggestedFile({ folder, onClick }) {
  return (
    <div className="dh-file-card" onClick={onClick}>
      <div className="hd">
        <TypeTile t={folder.kind} size={18} />
        <div className="name">{folder.title}</div>
        <button className="more" onClick={(e) => e.stopPropagation()}><I.more /></button>
      </div>
      <div className="thumb">
        <DocPreview kind={folder.kind} title={folder.title} folderId={folder.id} />
      </div>
      <div className="ft">
        <div className="avt" style={{ background: 'linear-gradient(135deg,#E55934,#F8B58A)' }}>DW</div>
        <span>You edited · {folder.sub.replace('Edited ', '')}</span>
      </div>
    </div>
  );
}

function FolderIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M2 8 A2 2 0 0 1 4 6 H9 L11.5 8.5 H20 A2 2 0 0 1 22 10.5 V18 A2 2 0 0 1 20 20 H4 A2 2 0 0 1 2 18 Z" fill="#5F6368" />
    </svg>
  );
}

// Slimmer topbar for the home view — no search (it lives in the hero)
function TopbarHome() {
  return (
    <div className="topbar topbar-home">
      <div className="tb-spacer"></div>
      <button className="tb-icon"><I.bell /></button>
      <button className="tb-icon"><I.settings /></button>
      <div className="avatar">DW</div>
    </div>
  );
}

// ───────── CreateThread ─────────
// Scripted progression that simulates a real session.
const THREAD_SCRIPT = [
  // step 0 — initial empty state, no messages
  null,
  // step 1 — first user message with attachments + AI ack
  {
    user: {
      text: "Draft a Series A pitch deck for Northwind — an industrial water tech company. Use the attached market research and interviews. Tone: confident, plainspoken.",
      files: [
        { name:'northwind-water-market.pdf', type:'pdf', size:'2.4 MB' },
        { name:'industrial-buyer-interviews.csv', type:'csv', size:'88 KB' },
        { name:'logo-marks-v3.png', type:'img', size:'1.1 MB' },
      ],
    },
    ai: {
      text: <>
        <p>Got it. I read through the 47-page market doc and the 22 interview transcripts in the CSV — there's a strong narrative around capex avoidance and water-reuse compliance.</p>
        <p>I'll draft a 12-slide structure with the cover, problem, market, product, traction, team, ask. Here's the cover to start:</p>
      </>,
      artifact: { kind: 'preso', title: 'Northwind', sub: 'A new shape for industrial water.', tag:'Series A · 2026' },
    }
  },
  // step 2 — user refines
  {
    user: { text: "Cover's too philosophical. Make the headline confident — \"We replace cooling-tower capex with software\" — and drop the 'future of water' bit.", files: [] },
    ai: {
      text: <p>Sharper. Updated below. I also tightened the tag to "Seed → Series A · Feb 2026".</p>,
      artifact: { kind: 'preso', title: 'Northwind', sub: 'A water-reuse OS for industrial cooling.', tag:'Series A · Feb 2026', headline:'replaced' },
    }
  },
  // step 3 — user finalizes
  {
    user: { text: "Perfect. Pin this as the Coverslide and call the folder \"Northwind Series A\".", files: [] },
    ai: {
      text: <p>Pinning slide 1 as the Coverslide. The folder will hold all 12 slides plus your three source files. Anyone in the folder can <b>peek behind</b> to see this thread.</p>,
      artifact: { kind: 'preso', title: 'Northwind', sub: 'A water-reuse OS for industrial cooling.', tag:'Series A · Feb 2026', headline:'replaced', pinned:true },
      finalPin: true,
    }
  },
];

function CreateThread({ onClose, onPin }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState('');
  const [attached, setAttached] = useState([]);
  const [dragover, setDragover] = useState(false);
  const [format, setFormat] = useState('preso');
  const [title, setTitle] = useState('New folder');
  const dragCounter = useRef(0);
  const composerRef = useRef(null);
  const messagesRef = useRef(null);

  // Sync title with format choice in empty state
  useEffect(() => {
    if (step === 0) {
      setTitle({
        doc:'New doc folder', sheet:'New spreadsheet folder', preso:'New deck folder',
        app:'New app folder', notebook:'New notebook folder'
      }[format] || 'New folder');
    }
  }, [format, step]);

  // Real OS file drag handling
  useEffect(() => {
    const onDragEnter = (e) => {
      if (e.dataTransfer && [...(e.dataTransfer.types||[])].includes('Files')) {
        dragCounter.current += 1;
        setDragover(true);
        e.preventDefault();
      }
    };
    const onDragLeave = (e) => {
      dragCounter.current -= 1;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setDragover(false);
      }
    };
    const onDragOver = (e) => { if (e.dataTransfer && [...(e.dataTransfer.types||[])].includes('Files')) e.preventDefault(); };
    const onDrop = (e) => {
      e.preventDefault();
      dragCounter.current = 0;
      setDragover(false);
      const files = [...(e.dataTransfer?.files || [])];
      if (files.length) {
        const next = files.slice(0, 6).map(f => ({
          name: f.name,
          type: inferType(f.name),
          size: humanSize(f.size),
        }));
        setAttached(a => [...a, ...next]);
      }
    };
    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('drop', onDrop);
    };
  }, []);

  // Scroll to bottom on step change
  useEffect(() => {
    requestAnimationFrame(() => {
      if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    });
  }, [step]);

  function advance() {
    // Move to next scripted step; consume the composer's current text/attachments visually
    if (step >= THREAD_SCRIPT.length - 1) return;
    setStep(s => s + 1);
    setDraft('');
    setAttached([]);
  }

  // Build live "artifact" state from latest step
  const latestArtifact = useMemo(() => {
    for (let i = step; i > 0; i--) {
      if (THREAD_SCRIPT[i]?.ai?.artifact) return THREAD_SCRIPT[i].ai.artifact;
    }
    return null;
  }, [step]);

  const messages = THREAD_SCRIPT.slice(1, step + 1);
  const finalPin = step >= 1 && messages.at(-1)?.ai?.finalPin;
  const showPreview = step >= 1; // show preview only after first turn

  return (
    <div className={`ct-overlay`}>
      <div className="ct-top">
        <button className="btn ghost" onClick={onClose}><I.arrowLeft /> Drive</button>
        <div className="crumbs">
          <span>My Drive</span>
          <span className="sl">/</span>
          <b><input className="title-input" value={title} onChange={e => setTitle(e.target.value)} /></b>
        </div>
        <div className="ct-actions">
          <span className="kbd-small" style={{marginRight:8}}>Autosaving · Just now</span>
          <button className="btn ghost"><I.shared /> Share</button>
          <button className="btn"><I.more /></button>
        </div>
      </div>

      <div className={`ct-stage${showPreview ? ' with-preview' : ''}`}>
        {/* Thread / compose column */}
        <div className="ct-thread">
          <div className="ct-messages" ref={messagesRef}>
            {step === 0 && (
              <div className="ct-hero">
                <div className="eyebrow"><span className="dot"></span> New folder</div>
                <h1>What do you want to make?</h1>
                <p>Pick a format, drop your sources, and tell me what you're going for. Everything from this conversation stays inside the folder.</p>
                <div className="format-chips">
                  <FormatChip k="doc"      label="Doc"          on={format==='doc'}      onClick={()=>setFormat('doc')} />
                  <FormatChip k="sheet"    label="Spreadsheet"  on={format==='sheet'}    onClick={()=>setFormat('sheet')} />
                  <FormatChip k="preso"    label="Presentation" on={format==='preso'}    onClick={()=>setFormat('preso')} />
                  <FormatChip k="app"      label="App"          on={format==='app'}      onClick={()=>setFormat('app')} />
                  <FormatChip k="notebook" label="Notebook"     on={format==='notebook'} onClick={()=>setFormat('notebook')} />
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div className="ct-inner" key={i}>
                <Message role="user" text={m.user.text} files={m.user.files} />
                <div style={{height:22}}></div>
                <Message role="ai" text={m.ai.text} />
              </div>
            ))}

            {finalPin && (
              <div className="pin-bar">
                <div className="pinkit">
                  <span className="hint">Slide 1 looks ready.</span>
                  <button className="btn" onClick={onClose}>Keep editing</button>
                  <button className="btn blue" onClick={() => onPin({ title:'Northwind Series A', kind:'preso' })}>
                    <I.pin /> Pin as Coverslide
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          {!finalPin && (
            <div className="composer-wrap">
              <div className="ct-inner">
                <div className={`composer${dragover ? ' dragover' : ''}`} ref={composerRef}>
                  {step === 0 && attached.length === 0 && (
                    <ComposerHint />
                  )}
                  {attached.length > 0 && (
                    <div className="attached">
                      {attached.map((f, i) => (
                        <span className="attach-chip" key={i}>
                          <TypeTile t={f.type} size={22} />
                          <span>
                            <div>{f.name}</div>
                            <div className="size">{f.size}</div>
                          </span>
                          <button className="rm" onClick={() => setAttached(a => a.filter((_,j) => j !== i))}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <textarea
                    rows="1"
                    placeholder={step === 0 ? "Tell me what you're making…  (drop files here or anywhere)" : "Reply or refine…"}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); advance(); }
                    }}
                  />
                  <div className="crow">
                    <div className="left">
                      <button className="icon-btn" title="Attach file"><I.paperclip /></button>
                      <button className="icon-btn" title="Mention"><I.at /></button>
                      <button className="icon-btn" title="Reference doc"><I.doc /></button>
                    </div>
                    <div className="right">
                      <span className="ctx-hint">
                        {attached.length > 0 ? `${attached.length} file${attached.length>1?'s':''} attached` : 'Try dragging a file from your desktop'}
                      </span>
                      <button className="send-btn" onClick={advance} disabled={step === 0 && draft.length === 0 && attached.length === 0 ? false : false}>
                        <I.send />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview column */}
        {showPreview && (
          <aside className="ct-preview">
            <div className="phd">
              <span className="pulse"></span>
              <span className="label">Live preview · Slide 1</span>
              <div className="right">
                <span className="kbd-small">Auto-update</span>
                <button className="btn ghost" style={{padding:'4px 8px'}}><I.more /></button>
              </div>
            </div>
            <div className="pbody">
              <div style={{borderRadius:14, overflow:'hidden', boxShadow:'var(--sh-3)', border:'1px solid var(--border)'}}>
                {latestArtifact && (
                  latestArtifact.headline === 'replaced'
                    ? <DeckSlideReplaced title={latestArtifact.title} sub={latestArtifact.sub} tag={latestArtifact.tag} />
                    : <DeckSlide1 title={latestArtifact.title} subtitle={latestArtifact.sub} tag={latestArtifact.tag} />
                )}
              </div>
              <div style={{display:'flex', gap:8, marginTop:14, alignItems:'center', color:'var(--ink-dim)', fontSize:12.5}}>
                <I.spark /> 11 more slides outlined · click to expand
              </div>
              <SlideOutline />
            </div>
            <div className="pfoot">
              <span className="meta">12 slides · 3 sources · 2 collaborators ready</span>
              <button className="btn" style={{marginLeft:'auto'}}><I.peekIcon /> Preview deck</button>
            </div>
          </aside>
        )}
      </div>

      {/* OS file drop overlay */}
      <div className={`drag-overlay${dragover ? ' on' : ''}`}>
        <div className="panel">
          <div className="big">Drop to add to this thread</div>
          <div className="small">PDFs, sheets, images, anything. Up to 6 files.</div>
        </div>
      </div>
    </div>
  );
}

function ComposerHint() {
  return (
    <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:8}}>
      {['Use these research files →', 'Match this brand →', 'Outline first →'].map(s => (
        <span key={s} style={{
          fontSize:11.5, padding:'4px 9px',
          background:'var(--surface-2)', color:'var(--ink-dim)',
          borderRadius:99, cursor:'pointer', border:'1px solid var(--border-faint)'
        }}>{s}</span>
      ))}
    </div>
  );
}

function FormatChip({ k, label, on, onClick }) {
  const bg = { doc:'var(--doc)', sheet:'var(--sheet)', preso:'var(--preso)', app:'var(--app)', notebook:'var(--notebook)' }[k];
  const letter = { doc:'D', sheet:'S', preso:'P', app:'A', notebook:'N' }[k];
  return (
    <button className={`fchip${on?' on':''}`} onClick={onClick}>
      <span className="tile" style={{background: on ? 'rgba(255,255,255,.15)' : bg}}>{letter}</span>
      {label}
    </button>
  );
}

// A second cover variant — "replaced" headline
function DeckSlideReplaced({ title, sub, tag }) {
  return (
    <div className="slide slide-1">
      <div className="eyebrow">{tag}</div>
      <div className="mark"></div>
      <h2>We replace<br />cooling-tower<br /><em>capex</em> with software.</h2>
      <div className="sub">{sub}</div>
      <div className="foot">
        <span>{title?.toUpperCase()}</span>
        <span>· Series A</span>
      </div>
    </div>
  );
}

function SlideOutline() {
  const slides = [
    '01 · Cover',
    '02 · Industrial water is a $480B blind spot',
    '03 · Why cooling-tower capex stalls',
    '04 · How Northwind works',
    '05 · The water-reuse OS, demo',
    '06 · Customer story · Granite Foods',
    '07 · ROI math',
    '08 · Market sizing',
    '09 · Traction',
    '10 · Team',
    '11 · Use of funds',
    '12 · Ask',
  ];
  return (
    <div style={{
      marginTop:16, background:'var(--surface)', borderRadius:12,
      border:'1px solid var(--border)', overflow:'hidden'
    }}>
      {slides.map((s, i) => (
        <div key={s} style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'8px 12px',
          borderTop: i === 0 ? 0 : '1px solid var(--border-faint)',
          fontSize:12.5,
          color: i === 0 ? 'var(--ink)' : 'var(--ink-dim)',
          background: i === 0 ? 'var(--blue-soft)' : 'transparent',
        }}>
          <span style={{
            width:16, height:16, borderRadius:4,
            background: i === 0 ? 'var(--blue)' : 'var(--surface-3)',
            opacity: i === 0 ? 1 : 1,
          }}></span>
          <span>{s}</span>
          {i === 0 && <span style={{marginLeft:'auto', fontSize:10.5, color:'var(--blue-ink)', fontWeight:500}}>EDITING</span>}
        </div>
      ))}
    </div>
  );
}

function Message({ role, text, files }) {
  return (
    <div className={`msg ${role}`}>
      <div className="avt">{role === 'user' ? 'DW' : <I.spark />}</div>
      <div className="body">
        <div className="role"><b>{role === 'user' ? 'You' : 'Drive'}</b> · just now</div>
        <div className="text">{typeof text === 'string' ? <p>{text}</p> : text}</div>
        {files && files.length > 0 && (
          <div className="files-row">
            {files.map((f, i) => (
              <span className="attach-chip" key={i}>
                <TypeTile t={f.type} size={22} />
                <span>
                  <div>{f.name}</div>
                  <div className="size">{f.size}</div>
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function inferType(name) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (['pdf'].includes(ext)) return 'pdf';
  if (['csv','tsv'].includes(ext)) return 'csv';
  if (['xls','xlsx','gsheet'].includes(ext)) return 'sheet';
  if (['doc','docx','gdoc','md','txt'].includes(ext)) return 'doc';
  if (['ppt','pptx','gpreso','key'].includes(ext)) return 'preso';
  if (['png','jpg','jpeg','gif','webp','svg'].includes(ext)) return 'img';
  if (['ipynb'].includes(ext)) return 'notebook';
  return 'doc';
}
function humanSize(b) {
  if (!b) return '—';
  if (b < 1024) return b + ' B';
  if (b < 1024*1024) return (b/1024).toFixed(0) + ' KB';
  return (b/1024/1024).toFixed(1) + ' MB';
}

// ───────── Peek viewer ─────────
function PeekViewer({ folder, onClose, peekStyle = 'tilt' }) {
  const [peeking, setPeeking] = useState(false);
  return (
    <div className={`peek${peeking ? ' peeking' : ''}`} data-peek={peekStyle}>
      <div className="peek-top">
        <button className="btn" onClick={onClose}><I.arrowLeft /></button>
        <div>
          <div className="crumb">My Drive · Folder</div>
          <div className="ttl">{folder.title}</div>
        </div>
        <div className="right">
          <button className="btn"><I.shared /> Share</button>
          <button className="btn" onClick={() => setPeeking(p => !p)}>
            <I.peekIcon /> {peeking ? 'Close thread' : 'Peek behind'}
          </button>
          <button className="btn primary"><I.doc /> Open deck</button>
        </div>
      </div>

      <div className="peek-stage">
        {/* Thread behind */}
        <div className="peek-thread-wrap">
          <div className="peek-thread">
            <div className="pthd">
              <I.threads />
              <span style={{color:'var(--ink)', fontWeight:500}}>Behind the Coverslide</span>
              <span>·</span>
              <span>The conversation that built this folder</span>
              <span style={{marginLeft:'auto'}}><I.spark /></span>
            </div>
            <div className="pbody">
              {THREAD_SCRIPT.slice(1).map((m, i) => (
                <div className="ct-inner" key={i}>
                  <Message role="user" text={m.user.text} files={m.user.files} />
                  <div style={{height:22}}></div>
                  <Message role="ai" text={m.ai.text} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cover in front */}
        <div className="peek-cover" onClick={() => setPeeking(p => !p)}>
          {!peeking && (
            <button className="peek-curl" onClick={(e)=>{ e.stopPropagation(); setPeeking(true); }}>
              <I.peekIcon /> Peek behind
            </button>
          )}
          <DeckSlideReplaced title="Northwind" sub="A water-reuse OS for industrial cooling." tag="Series A · Feb 2026" />
        </div>
      </div>
    </div>
  );
}

// ───────── Thread view (inside folder, shows collab history) ─────────
function ThreadView({ onPeek }) {
  return (
    <div className="thread-view">
      <div className="th-head">
        <span className="pulse"></span>
        <b>Behind the Coverslide</b>
        <span>· 22 events · 3 collaborators</span>
        <div className="right">
          <div className="who-stack">
            <div className="a" style={{background: PEOPLE.me.color}}>{PEOPLE.me.short}</div>
            <div className="a" style={{background: PEOPLE.linh.color}}>{PEOPLE.linh.short}</div>
            <div className="a" style={{background: PEOPLE.sam.color}}>{PEOPLE.sam.short}</div>
            <div className="a" style={{background: PEOPLE.ai.color}}>{PEOPLE.ai.short}</div>
          </div>
          <button className="btn ghost" style={{padding:'4px 10px'}} onClick={onPeek}><I.peekIcon /> Peek behind cover</button>
        </div>
      </div>
      <div className="thread-body">
        {RICH_THREAD.map((ev, i) => <ThreadEvent ev={ev} key={i} />)}
      </div>
    </div>
  );
}

function ThreadEvent({ ev }) {
  if (ev.day) {
    return <div className="tg-day"><span>{ev.day}</span><div className="ln"></div></div>;
  }
  const person = PEOPLE[ev.who] || PEOPLE.ai;

  if (ev.type === 'msg') {
    return (
      <div className={`tev msg ${ev.who}`}>
        <div className="col-line"></div>
        <div className="avt" style={{background: person.color}}>{person.short}</div>
        <div className="body">
          <div className="who">
            {person.name}
            {ev.who === 'ai' && <span className="role">Assistant</span>}
          </div>
          <div>{ev.text}</div>
          {ev.files && ev.files.length > 0 && (
            <div className="files-row">
              {ev.files.map((f, i) => (
                <span className="attach-chip" key={i}>
                  <TypeTile t={f.type} size={22} />
                  <span>
                    <div>{f.name}</div>
                    <div className="size">{f.size}</div>
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="when">{ev.when}</div>
      </div>
    );
  }

  if (ev.type === 'comment') {
    return (
      <div className="tev comment">
        <div className="col-line"></div>
        <div className="avt" style={{background: person.color}}>{person.short}</div>
        <div className="body">
          <div className="who">{person.name} commented</div>
          {ev.quote && <div className="quote">{ev.quote}</div>}
          <div>{ev.text}</div>
        </div>
        <div className="when">{ev.when}</div>
      </div>
    );
  }

  if (ev.type === 'action') {
    return (
      <div className="tev action">
        <div className="col-line"></div>
        <div className="avt" style={{background: person.color}}>{person.short}</div>
        <div className="body">
          <b>{person.name}</b>
          <span>{ev.actionText}</span>
          {ev.target && <span className="pill target">{ev.target}</span>}
        </div>
        <div className="when">{ev.when}</div>
      </div>
    );
  }

  if (ev.type === 'artifact') {
    return (
      <div className="tev artifact">
        <div className="col-line"></div>
        <div className="avt sys"><I.spark /></div>
        <div className="body">
          <div className="hd">
            <I.doc />
            <b>{ev.title}</b>
            {ev.pinned && <span className="pin-applied" style={{marginLeft:6}}><I.pin /> Pinned as Coverslide</span>}
            <div className="right">
              <button className="btn ghost" style={{padding:'2px 8px', fontSize:11.5}}>Open</button>
            </div>
          </div>
          <div style={{padding: 0}}>
            {ev.variant === 'replaced'
              ? <DeckSlideReplaced title="Northwind" sub="A water-reuse OS for industrial cooling." tag="Series A · Feb 2026" />
              : <DeckSlide1 title="Northwind" subtitle="A new shape for industrial water." tag="Series A · 2026" />}
          </div>
        </div>
        <div className="when">{ev.when}</div>
      </div>
    );
  }
  return null;
}

function countThreadEvents() {
  return RICH_THREAD.filter(e => !e.day).length;
}

function ItemsTable({ items }) {
  return (
    <div className="items">
      <div className="hd">
        <span>Name</span>
        <span>Owner</span>
        <span>Modified</span>
        <span>Size</span>
        <span></span>
      </div>
      {items.map((it, i) => (
        <div className="row" key={i}>
          <div className="name-cell">
            {it.type === 'folder' ? (
              <div style={{width:28, height:32, display:'grid', placeItems:'center', color:'#C2A246'}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              </div>
            ) : (
              <TypeTile t={it.type} />
            )}
            <div className="name">
              <span>{it.name}</span>
              {it.pinned && <span className="pin-tag"><I.pin /> Cover</span>}
            </div>
          </div>
          <div className="muted">{it.owner}</div>
          <div className="muted">{it.when}</div>
          <div className="muted">{it.size}</div>
          <div className="actions-col"><I.more /></div>
        </div>
      ))}
    </div>
  );
}

// ───────── Folder Detail view ─────────
// ───────── AGENTS.md content (portable agent instructions) ─────────
// Per-folder content. Drive maintains AGENTS.md automatically.
const NORTHWIND_AGENTS_MD = {
  filename: 'AGENTS.md',
  updatedBy: 'Drive',
  updatedAt: 'today, 2:36 PM',
  bytes: '4.2 KB',
  rendered: (
    <>
      <div className="yaml-front">
        <div>---</div>
        <div><b>artifact:</b> Northwind Series A · pitch deck (12 slides)</div>
        <div><b>cover:</b> Cover.slide</div>
        <div><b>owners:</b> david@northwind.io, linh@northwind.io, sam@northwind.io</div>
        <div><b>updated:</b> 2026-05-22T14:36-07:00</div>
        <div><b>schema:</b> agent-md/0.4 · <a href="#" style={{color:'var(--blue)'}}>spec</a></div>
        <div>---</div>
      </div>

      <h1>Northwind Series A</h1>
      <p>A pitch deck for industrial-water tech. The folder bundles the deck, three source files, and the conversation that produced them. This file is the brief — any agent (Drive, Claude, Cursor, a local script) can read it and pick up where the last one left off.</p>

      <h2>Goal</h2>
      <p>Win a Series A on the thesis: <i>"We replace cooling-tower capex with software."</i> Confident, plainspoken, ~12 slides, decision-ready.</p>

      <h2>Tone &amp; voice</h2>
      <ul>
        <li>Confident over poetic. Lead with the business model, not the philosophy.</li>
        <li>Plain industrial English; no "future of water" rhetoric (decided 2026-05-05, see Timeline e2).</li>
        <li>Small-caps treatment for eyebrows; never all-caps (Sam, 2026-05-06).</li>
      </ul>

      <h2>Sources</h2>
      <ul>
        <li><code>northwind-water-market.pdf</code> — 47-page market doc. Cite for TAM/SAM math (slides 02, 08).</li>
        <li><code>industrial-buyer-interviews.csv</code> — 22 transcripts. Cite for buyer pain quotes (slides 03, 06).</li>
        <li><code>logo-marks-v3.png</code> — brand marks. The orange dot is the locked element — keep warm gradient around it.</li>
      </ul>

      <h2>Decisions log</h2>
      <ul>
        <li><b>2026-05-05</b> — Cover headline locked to "We replace cooling-tower capex with software." (was: "The future of water doesn't come from the tap.")</li>
        <li><b>2026-05-06</b> — Brand: orange dot reserved for seal/cover/ask. Type tokens: <code>type-tokens.smallCaps</code> on eyebrows.</li>
        <li><b>2026-05-22</b> — v2 cover pinned as Coverslide.</li>
      </ul>

      <h2>Open questions</h2>
      <ul>
        <li>Granite Foods case study — waiting on customer signoff (slide 06).</li>
        <li>Final ROI math: 36-month payback or 24-month? Linh has a spreadsheet draft.</li>
      </ul>

      <h2>How to edit</h2>
      <p>This folder accepts edits from any agent that reads this file. Suggested protocol:</p>
      <pre>{`1. Read AGENTS.md (this file) + the Coverslide
2. Make changes via the file APIs (Drive REST,
   the .gpreso XML, or a Google Drive MCP)
3. Append a decision to the log above
4. Update the Timeline by writing to .timeline.jsonl`}</pre>

      <h2>Compatible agents</h2>
      <p>Tested with:</p>
      <div className="ext-agents">
        <div className="ag"><div className="logo" style={{background:'conic-gradient(from 200deg,#4F8DFF,#8C5BFF,#E55A8A,#4F8DFF)'}}>G</div>Gemini in Drive</div>
        <div className="ag"><div className="logo" style={{background:'#D97757'}}>C</div>Claude (via API + MCP)</div>
        <div className="ag"><div className="logo" style={{background:'#000'}}>⌘</div>Cursor</div>
        <div className="ag"><div className="logo" style={{background:'#16A34A'}}>$</div>Local CLI (drive-cli)</div>
      </div>

      <h2>Constraints</h2>
      <ul>
        <li>Don't rewrite slides 02–05 without re-reading the interview CSV. The numbers are quoted directly.</li>
        <li>Slide 10 (Team) is hand-authored. Leave alone.</li>
        <li>Keep total slide count ≤ 12.</li>
      </ul>

      <p style={{marginTop:24, fontSize:11.5, color:'var(--ink-faint)'}}>
        AGENTS.md is updated automatically by Drive after every accepted change. To edit by hand, just edit this file — Drive will reconcile on next agent run.
      </p>
    </>
  ),
};

const MATH_AGENTS_MD = {
  filename: 'AGENTS.md',
  updatedBy: 'Drive',
  updatedAt: 'today, 9:14 AM',
  bytes: '2.6 KB',
  rendered: (
    <>
      <div className="yaml-front">
        <div>---</div>
        <div><b>artifact:</b> Math Adventures · bilingual word-problem worksheet</div>
        <div><b>cover:</b> Math Adventures.gdoc</div>
        <div><b>audience:</b> Andre (Grade 1) &amp; Lucía (Grade 1)</div>
        <div><b>owner:</b> david@home</div>
        <div><b>updated:</b> 2026-05-25T09:14-07:00</div>
        <div><b>schema:</b> agents-md/0.4</div>
        <div>---</div>
      </div>

      <h1>Math Adventures · weekly worksheet</h1>
      <p>A bilingual EN/ES word-problem worksheet for my twin first-graders. I make a new one every Sunday night. This file is the brief — any agent (Drive, Claude, a local script) can use it to spin up next week's edition.</p>

      <h2>Goal</h2>
      <p>A six-problem warmup that makes math feel like a small adventure. Should be solvable in 10–15 minutes. Strong on context and characters, light on numbers.</p>

      <h2>Audience &amp; tone</h2>
      <ul>
        <li>Twin first-graders, ages 6. Andre likes animals, Lucía likes art supplies.</li>
        <li>Bilingual: English on top in bold, Spanish below in italic. Always both.</li>
        <li>Use names of family + classmates (Andre, Lucía, Maria, Pedro). Rotate so no one feels left out.</li>
        <li>Add one emoji per problem. Pick the most concrete one (a duck, not water).</li>
      </ul>

      <h2>Math constraints</h2>
      <ul>
        <li>Addition and subtraction only. <b>Numbers ≤ 20.</b> Never produce a negative answer.</li>
        <li>Mix of plus / minus / compare problems — roughly 3 / 2 / 1.</li>
        <li>Aligned to Common Core <code>1.OA.A.1</code> (see <code>first-grade-math-standards.pdf</code>).</li>
      </ul>

      <h2>Layout</h2>
      <ul>
        <li>Warm orange header bar with an abacus on the right.</li>
        <li>Numbered cards alternating blue → pink left-border.</li>
        <li>Always include Name / Date blanks and an Answer / Respuesta line per problem.</li>
      </ul>

      <h2>Decisions log</h2>
      <ul>
        <li><b>2026-05-18</b> — First version. Six problems was the right count — ten was too long, four felt thin.</li>
        <li><b>2026-05-20</b> — Moved Spanish UNDER each English line (not side-by-side). The twins read top-to-bottom; side-by-side split their attention.</li>
        <li><b>2026-05-20</b> — Added one emoji per problem. Andre said it makes it feel like a picture book.</li>
        <li><b>2026-05-25</b> — Pinned v3 as the Coverslide. Added Answer Key as a separate file so the kids don't see it.</li>
      </ul>

      <h2>Open questions</h2>
      <ul>
        <li>Should there be a small “show your work” box per problem? Lucía likes drawing; Andre prefers blank lines.</li>
        <li>Worth adding a coloring section on the back?</li>
      </ul>

      <h2>How to make next week's</h2>
      <pre>{`1. Read AGENTS.md (this file)
2. Pick 6 new contexts (rotate characters, swap emoji)
3. Keep all constraints above
4. Save as: Math Adventures · v{n}.gdoc
5. Generate matching answer key`}</pre>

      <h2>Compatible agents</h2>
      <p>Tested with:</p>
      <div className="ext-agents">
        <div className="ag"><div className="logo" style={{background:'conic-gradient(from 200deg,#4F8DFF,#8C5BFF,#E55A8A,#4F8DFF)'}}>G</div>Gemini in Drive</div>
        <div className="ag"><div className="logo" style={{background:'#D97757'}}>C</div>Claude (via API)</div>
        <div className="ag"><div className="logo" style={{background:'#16A34A'}}>$</div>Local CLI (drive-cli)</div>
      </div>

      <p style={{marginTop:24, fontSize:11.5, color:'var(--ink-faint)'}}>
        Drive keeps this file in sync. To change the format permanently, edit this file — next week's worksheet will follow it.
      </p>
    </>
  ),
};

const GENERIC_AGENTS_MD = (title) => ({
  filename: 'AGENTS.md',
  updatedBy: 'Drive',
  updatedAt: 'recently',
  bytes: '1.4 KB',
  rendered: (
    <>
      <div className="yaml-front">
        <div>---</div>
        <div><b>artifact:</b> {title}</div>
        <div><b>schema:</b> agents-md/0.4</div>
        <div>---</div>
      </div>
      <h1>{title}</h1>
      <p>Drive maintains this file automatically. Any agent that reads it can pick up the work in progress.</p>
      <h2>Status</h2>
      <p>Active. See the timeline on the back of this folder for context.</p>
      <h2>How to edit</h2>
      <pre>{`1. Read AGENTS.md (this file) + the Coverslide
2. Make changes via the file APIs
3. Append a decision to the log below
4. Update the Timeline by writing to .timeline.jsonl`}</pre>
      <h2>Compatible agents</h2>
      <div className="ext-agents">
        <div className="ag"><div className="logo" style={{background:'conic-gradient(from 200deg,#4F8DFF,#8C5BFF,#E55A8A,#4F8DFF)'}}>G</div>Gemini in Drive</div>
        <div className="ag"><div className="logo" style={{background:'#D97757'}}>C</div>Claude</div>
      </div>
    </>
  ),
});

function getAgentsMd(folder) {
  if (folder.id === 'fmath') return MATH_AGENTS_MD;
  if (folder.id === 'f1' || folder.isNew) return NORTHWIND_AGENTS_MD;
  return GENERIC_AGENTS_MD(folder.title);
}

// ───────── Per-folder summarized timelines ─────────
const NORTHWIND_TIMELINE = [
  {
    id: 'e1',
    when: '9:42 AM',
    day: 'Tuesday · May 5',
    who: ['me', 'ai'],
    summary: <><b>You</b> kicked off a thread to draft a Series A pitch from <b>Northwind</b> market research and interviews.</>,
    files: [
      { name: 'northwind-water-market.pdf', type: 'pdf' },
      { name: 'industrial-buyer-interviews.csv', type: 'csv' },
    ],
    detail: [
      { who: 'me', when: '9:42 AM', type: 'msg', text: "Draft a Series A pitch deck for Northwind. Use the attached market research and interviews — confident, plainspoken.", files: [
        { name:'northwind-water-market.pdf', type:'pdf', size:'2.4 MB' },
        { name:'industrial-buyer-interviews.csv', type:'csv', size:'88 KB' },
      ]},
      { who: 'ai', when: '9:42 AM', type: 'msg', text: "I read the 47-page market doc and the 22 interview transcripts. Strong narrative around capex avoidance and water-reuse compliance. Drafting a 12-slide structure now." },
      { who: 'ai', when: '9:43 AM', type: 'action', text: 'generated', target: 'Cover.slide + 11 outline slides' },
      { who: 'ai', when: '9:43 AM', type: 'artifact', title: 'Northwind · v1 (cover)', variant: 'philosophical' },
    ],
  },
  {
    id: 'e2',
    when: '10:19 AM',
    day: 'Tuesday · May 5',
    who: ['linh', 'me', 'ai'],
    summary: <><b>Linh</b> reviewed the cover and pushed for a sharper, business-led headline. The cover was rewritten as <b>v2</b>.</>,
    detail: [
      { who: 'linh', when: '10:18 AM', type: 'action', text: 'joined the thread' },
      { who: 'linh', when: '10:19 AM', type: 'comment', quote: '"The future of water doesn\u2019t come from the tap."', text: "Beautiful, but a Series A room won't sit through poetry. Lead with the business model." },
      { who: 'me', when: '10:24 AM', type: 'msg', text: 'Agreed. Make the headline confident — "We replace cooling-tower capex with software" — and drop the future-of-water bit.' },
      { who: 'ai', when: '10:24 AM', type: 'msg', text: 'Sharper. Updated below. I also tightened the tag to "Seed → Series A · Feb 2026."' },
      { who: 'ai', when: '10:25 AM', type: 'artifact', title: 'Northwind · v2 (cover)', variant: 'replaced' },
    ],
  },
  {
    id: 'e3',
    when: '8:51 AM',
    day: 'Wednesday · May 6',
    who: ['sam', 'ai'],
    summary: <><b>Sam</b> added the brand marks and locked the orange dot into the cover, ask, and system slides.</>,
    files: [{ name: 'logo-marks-v3.png', type: 'img' }],
    detail: [
      { who: 'sam', when: '8:51 AM', type: 'action', text: 'added', target: 'logo-marks-v3.png' },
      { who: 'sam', when: '8:52 AM', type: 'msg', text: 'Brand marks attached. The orange dot is the locked element; the cover should breathe around it.' },
      { who: 'ai', when: '8:53 AM', type: 'msg', text: "Got it — I'll keep the warm tone in the cover gradient and reserve the orange dot for the seal. Threading the mark through slide 03 (System) and the ask slide too." },
      { who: 'ai', when: '8:54 AM', type: 'action', text: 'edited', target: 'Cover.slide, 03 — System.slide, 12 — Ask.slide' },
    ],
  },
  {
    id: 'e4',
    when: '9:15 AM',
    day: 'Wednesday · May 6',
    who: ['sam', 'ai'],
    summary: <><b>Sam</b> requested the small-caps treatment on the eyebrow. The AI applied <b>type-tokens.smallCaps</b>.</>,
    detail: [
      { who: 'sam', when: '9:14 AM', type: 'comment', quote: 'tag: "Series A · Feb 2026"', text: '+1 from brand. Use the small-caps treatment from the type tokens though, not all-caps.' },
      { who: 'ai', when: '9:15 AM', type: 'action', text: 'applied', target: 'type-tokens.smallCaps to cover eyebrow' },
    ],
  },
  {
    id: 'e5',
    when: '2:36 PM',
    day: 'Today · May 22',
    who: ['me', 'ai', 'linh'],
    summary: <><b>You</b> pinned <b>v2</b> as the Coverslide. The folder became its face.</>,
    pinned: true,
    detail: [
      { who: 'me', when: '2:36 PM', type: 'msg', text: 'This is the one. Pin v2 as the Coverslide for the folder.' },
      { who: 'ai', when: '2:36 PM', type: 'msg', text: 'Pinned. Slide 1 is now the face of Northwind Series A. Anyone in the folder can peek behind to read this thread.' },
      { who: 'ai', when: '2:36 PM', type: 'artifact', title: 'Northwind · v2 (cover)', variant: 'replaced', pinned: true },
      { who: 'linh', when: '2:48 PM', type: 'action', text: 'reacted 🔥 to the pinned cover' },
    ],
  },
];

const MATH_TIMELINE = [
  {
    id: 'm1',
    when: '8:14 PM',
    day: 'Sunday · May 18',
    who: ['me', 'ai'],
    summary: <><b>You</b> asked for a bilingual addition/subtraction worksheet for Andre &amp; Lucía.</>,
    files: [{ name: 'first-grade-math-standards.pdf', type: 'pdf' }],
    detail: [
      { who: 'me', when: '8:14 PM', type: 'msg', text: "Make a math worksheet for Andre and Lucía. First grade level — addition and subtraction within 20, no negatives. Bilingual English and Spanish so they can practice both.", files: [
        { name: 'first-grade-math-standards.pdf', type: 'pdf', size: '420 KB' },
      ]},
      { who: 'ai', when: '8:14 PM', type: 'msg', text: "Got it. I cross-checked against the standards PDF (1.OA.A.1) and drafted six word problems with kid-friendly contexts — apples, birds, balloons, crayons, ducks, stickers." },
      { who: 'ai', when: '8:15 PM', type: 'action', text: 'generated', target: 'Math Adventures · v1.gdoc' },
      { who: 'ai', when: '8:15 PM', type: 'artifact', title: 'Math Adventures · v1', variant: 'math' },
    ],
  },
  {
    id: 'm2',
    when: '10:32 AM',
    day: 'Tuesday · May 20',
    who: ['me', 'ai'],
    summary: <><b>You</b> moved Spanish under each English line and asked for emoji on every problem.</>,
    detail: [
      { who: 'me', when: '10:30 AM', type: 'msg', text: "Two things: stack Spanish below the English, not side-by-side. And add an emoji to each problem — the kids respond way better when there's a picture." },
      { who: 'ai', when: '10:31 AM', type: 'msg', text: "Done. Spanish is now italic under each English line. I picked the most concrete emoji per problem: apple, bird, balloon, crayon, duck, star." },
      { who: 'ai', when: '10:32 AM', type: 'action', text: 'edited', target: 'Math Adventures · v2.gdoc' },
      { who: 'ai', when: '10:32 AM', type: 'artifact', title: 'Math Adventures · v2', variant: 'math' },
    ],
  },
  {
    id: 'm3',
    when: '7:42 AM',
    day: 'Wednesday · May 21',
    who: ['me', 'ai'],
    summary: <><b>You</b> added a warm orange header and a name/date strip after printing v2 felt too plain.</>,
    detail: [
      { who: 'me', when: '7:40 AM', type: 'msg', text: "Printed it last night — felt a little plain. Can you give the top a warm header with a fun title and a name/date strip? Add an abacus on the right corner." },
      { who: 'ai', when: '7:41 AM', type: 'msg', text: "Warm orange gradient added with 'Math Adventures ✨ Aventuras de Matemáticas' as the title. Name / Nombre and Date / Fecha blanks underneath, abacus on the right." },
      { who: 'ai', when: '7:42 AM', type: 'action', text: 'edited', target: 'Math Adventures · v3.gdoc' },
    ],
  },
  {
    id: 'm4',
    when: '9:14 AM',
    day: 'Today · May 25',
    who: ['me', 'ai'],
    summary: <><b>You</b> pinned v3 as the Coverslide and asked for a separate answer key the kids can't see.</>,
    pinned: true,
    detail: [
      { who: 'me', when: '9:12 AM', type: 'msg', text: "This one's it. Pin as the cover. Also generate an answer key as a separate file — don't put the answers on the same sheet, I want them to work it out." },
      { who: 'ai', when: '9:13 AM', type: 'msg', text: "Pinned. Answers (12, 8, 14, 9, 16, 13) generated as a separate doc. Logged in AGENTS.md so next week's draft keeps both habits." },
      { who: 'ai', when: '9:14 AM', type: 'artifact', title: 'Math Adventures · v3', variant: 'math', pinned: true },
      { who: 'ai', when: '9:14 AM', type: 'action', text: 'created', target: 'Math Adventures · Answer key.gdoc' },
    ],
  },
];

const GENERIC_TIMELINE = (title, kind) => [
  {
    id: 'g1',
    when: 'last week',
    day: 'Last week',
    who: ['me', 'ai'],
    summary: <><b>You</b> kicked off a thread to draft {title.toLowerCase()}.</>,
    detail: [
      { who: 'me', when: 'last week', type: 'msg', text: `Let's build ${title.toLowerCase()}. Use the attached source files and match our existing style.` },
      { who: 'ai', when: 'last week', type: 'msg', text: 'Read the sources, sketched a first draft. Below is v1.' },
      { who: 'ai', when: 'last week', type: 'action', text: 'generated', target: `${title} · v1` },
    ],
  },
  {
    id: 'g2',
    when: 'a few days ago',
    day: 'A few days ago',
    who: ['me', 'linh', 'ai'],
    summary: <><b>Linh</b> joined and pushed for a sharper hook. Two iterations later you landed on v3.</>,
    detail: [
      { who: 'linh', when: 'a few days ago', type: 'action', text: 'joined the thread' },
      { who: 'linh', when: 'a few days ago', type: 'comment', text: 'The hook is too soft. Lead with a number.' },
      { who: 'ai', when: 'a few days ago', type: 'action', text: 'revised', target: `${title} · v3` },
    ],
  },
  {
    id: 'g3',
    when: 'recently',
    day: 'Recently',
    who: ['me', 'ai'],
    summary: <><b>You</b> pinned the latest version as the Coverslide.</>,
    pinned: true,
    detail: [
      { who: 'me', when: 'recently', type: 'msg', text: 'Pin this as the cover for the folder.' },
      { who: 'ai', when: 'recently', type: 'msg', text: 'Pinned.' },
    ],
  },
];

function getTimeline(folder) {
  if (folder.id === 'fmath') return MATH_TIMELINE;
  if (folder.id === 'f1' || folder.isNew) return NORTHWIND_TIMELINE;
  return GENERIC_TIMELINE(folder.title, folder.kind);
}

// Per-folder collaborator stack + meta on the cover
function getFolderMeta(folder) {
  if (folder.id === 'fmath') return {
    collaborators: ['me', 'ai'],
    builtBy: 'you and Drive',
    pinnedWhen: 'pinned today',
  };
  if (folder.id === 'f1' || folder.isNew) return {
    collaborators: ['me', 'linh', 'sam', 'ai'],
    builtBy: 'you, Linh, Sam with Drive',
    pinnedWhen: 'pinned today',
  };
  if (folder.id === 'f2') return {
    collaborators: ['me', 'linh', 'ai'],
    builtBy: 'you and Linh with Drive',
    pinnedWhen: 'pinned yesterday',
  };
  if (folder.id === 'f3') return {
    collaborators: ['me', 'sam', 'ai'],
    builtBy: 'you and Sam with Drive',
    pinnedWhen: 'pinned Tuesday',
  };
  if (folder.id === 'f4') return {
    collaborators: ['me', 'linh', 'ai'],
    builtBy: 'you and Linh with Drive',
    pinnedWhen: 'pinned Monday',
  };
  return {
    collaborators: ['me', 'ai'],
    builtBy: 'you with Drive',
    pinnedWhen: 'pinned recently',
  };
}

function kindWord(kind) {
  return { preso: 'deck', doc: 'doc', sheet: 'sheet', app: 'app', notebook: 'notebook' }[kind] || 'file';
}

// ───────── Folder Canvas view (Lovable-style: chat + canvas) ─────────
function FolderView({ folder, onClose, onPeek, onOpenFolder, onOpenFile, metaphor }) {
  const openRow = (it) => onOpenFile && onOpenFile({ name: it.name, kind: it.type, folderId: folder.id, folderTitle: folder.title });
  const [canvasTab, setCanvasTab] = useState('cover'); // 'cover' | 'files' | 'agents' | 'timeline'
  const [agentMdOpen, setAgentMdOpen] = useState(false);
  const [artifactOpen, setArtifactOpen] = useState(false);
  const hasArtifact = !!(window.__hasArtifact && window.__hasArtifact(folder.kind));
  const contents = getFolderContents(folder.id, folder.isNew);
  const isLegacy = !folder.hasThread;
  const agentsMd = useMemo(() => getAgentsMd(folder), [folder.id, folder.isNew]);
  const folderTimeline = useMemo(() => getTimeline(folder), [folder.id, folder.isNew]);
  const folderMeta = useMemo(() => getFolderMeta(folder), [folder.id, folder.isNew]);

  const chatBodyRef = useRef(null);
  // Flatten the per-folder timeline into a continuous chat stream
  const chatItems = useMemo(() => flattenChat(folderTimeline), [folderTimeline]);
  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [folder.id]);

  const grouped = useMemo(() => {
    const outputs = contents.items.filter(i => ['doc','sheet','preso','app','notebook'].includes(i.type));
    const sources = contents.items.filter(i => ['pdf','csv','img'].includes(i.type));
    const folders = contents.items.filter(i => i.type === 'folder');
    return { outputs, sources, folders };
  }, [contents]);

  if (isLegacy) {
    return (
      <>
        <Topbar />
        <div className="fc-shell">
          <div className="fc-crumbs">
            <span className="step" onClick={onClose}>My Drive</span>
            <span className="sl">/</span>
            <span className="step current">{folder.title}</span>
            <div className="actions">
              <button className="btn ghost"><I.shared /> Share</button>
              <button className="btn ghost"><I.more /></button>
            </div>
          </div>
          <div className="fv-legacy-stage">
            <div className="fv-legacy-card">
              <div className="folder-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              </div>
              <div className="side">
                <h2 className="ttl">{folder.title}</h2>
                <div className="sub-line">{folder.sub} · {folder.items} items</div>
                <div className="convert-cta">
                  <I.spark />
                  <div>
                    <div><b>No Coverslide yet.</b></div>
                    <div style={{color:'var(--ink-dim)', fontSize:12.5, marginTop:2}}>Start a thread to spin up the contents of this folder.</div>
                  </div>
                  <button className="btn blue">Start thread</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar />
      <div className="fc-shell">
        <div className="fc-crumbs">
          <span className="step" onClick={onClose}>My Drive</span>
          <span className="sl">/</span>
          <span className="step current">{folder.title}</span>
          <div className="actions">
            <button className="btn ghost"><I.shared /> Share</button>
            <button className="btn ghost"><I.starred /></button>
            <button className="btn ghost"><I.more /></button>
          </div>
        </div>

        {/* Single canvas pane with tabs */}
        <div className="fc-canvas">
          <div className="fc-canvas-tabs">
            <button className={`fc-tab${canvasTab==='cover'?' on':''}`} onClick={() => setCanvasTab('cover')}>
              <I.doc /> Cover
            </button>
            <button className={`fc-tab${canvasTab==='chat'?' on':''}`} onClick={() => setCanvasTab('chat')}>
              <GemGlyph size={14} /> AI Conversation
            </button>
            <button className={`fc-tab${canvasTab==='timeline'?' on':''}`} onClick={() => setCanvasTab('timeline')}>
              <I.threads /> History <span className="ct">{folderTimeline.length}</span>
            </button>
            <button className={`fc-tab${canvasTab==='files'?' on':''}`} onClick={() => setCanvasTab('files')}>
              <FolderGlyph /> Files <span className="ct">{contents.items.length}</span>
            </button>
            <div className="right">
              <div className="who-stack-sm">
                {folderMeta.collaborators.slice(0, 4).map((id, i) => {
                  const p = PEOPLE[id];
                  if (!p) return null;
                  return <div className="a" key={i} style={{ background: p.color }}>{id === 'ai' ? <I.spark /> : p.short}</div>;
                })}
              </div>
              <button className="btn"><I.shared /> Share</button>
              <button className="btn primary" onClick={() => hasArtifact ? setArtifactOpen(true) : null}><I.doc /> Open {kindWord(folder.kind)}</button>
            </div>
          </div>

          <div className="fc-canvas-body">
            {canvasTab === 'cover' && (
              hasArtifact && !artifactOpen ? (
                /* The Coverslide IS the live, interactive artifact */
                <div className="fc-canvas-cover live">
                  <div className="fc-cover-live">
                    {React.createElement(window.ArtifactBody, { kind: folder.kind })}
                  </div>
                  <button className="fc-ask-fab" onClick={() => setCanvasTab('chat')}>
                    <GemGlyph size={16} />
                    <span>Ask Gemini</span>
                  </button>
                </div>
              ) : (
                <div className="fc-canvas-cover">
                  <div className="fc-cover-frame">
                    {folder.isNew
                      ? <DeckSlideReplaced title="Northwind" sub="A water-reuse OS for industrial cooling." tag="Series A · Feb 2026" />
                      : <DocPreview kind={folder.kind} title={folder.title} folderId={folder.id} />
                    }
                    <div className="fc-edit-badge">
                      <span className="dot"></span> Live · last edit just now
                    </div>
                  </div>
                  <button className="fc-ask-fab" onClick={() => setCanvasTab('chat')}>
                    <GemGlyph size={16} />
                    <span>Ask Gemini</span>
                  </button>
                </div>
              )
            )}

            {canvasTab === 'chat' && (
              <div className="fc-canvas-chat">
                <div className="fc-chat-head">
                  <div className="gem-mark"><GemGlyph size={22} /></div>
                  <div className="left">
                    <div className="title">Editing with Gemini</div>
                    <div className="sub">
                      <span>Reading folder · {contents.items.length} files</span>
                      <span>·</span>
                      <span className="pill" onClick={() => setAgentMdOpen(true)}>AGENTS.md</span>
                    </div>
                  </div>
                </div>
                <div className="fc-chat-body" ref={chatBodyRef}>
                  <div className="fc-chat-inner">
                    {chatItems.map((it, i) => (
                      it.type === 'day'
                        ? <div className="fc-chat-day" key={'d'+i}><span>{it.text}</span><div className="ln"></div></div>
                        : <DetailEvent d={it} key={i} />
                    ))}
                  </div>
                </div>
                <div className="fc-chat-foot">
                  <div className="fc-chat-inner">
                    <div className="model-row">
                      <button className="model-pill active">
                        <GemGlyph size={12} /> Gemini 3 Pro
                      </button>
                      <button className="model-pill">Claude</button>
                      <span style={{marginLeft:'auto', color:'var(--ink-faint)'}}>
                        Reading folder · {contents.items.length} files
                      </span>
                    </div>
                    <div className="composer">
                      <input placeholder={`Ask Gemini to edit this ${kindWord(folder.kind)}…`} />
                      <span className="ctx" onClick={() => setAgentMdOpen(true)}><I.spark /> AGENTS.md</span>
                      <button className="gem-send"><I.send /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {canvasTab === 'timeline' && (
              <div className="fc-canvas-files">
                <FolderTimeline folderTimeline={folderTimeline} />
              </div>
            )}

            {canvasTab === 'files' && (
              <div className="fc-canvas-files">
                {grouped.outputs.length > 0 && <FileGroup title="Outputs" items={grouped.outputs} onFileOpen={openRow} />}
                {grouped.folders.length > 0 && <FileGroup title="Subfolders" items={grouped.folders} />}
                {grouped.sources.length > 0 && <FileGroup title="Sources" items={grouped.sources} onFileOpen={openRow} />}
                <FileGroup title="Agent context" items={[{ name: 'AGENTS.md', type: 'md', owner: 'Drive', when: agentsMd.updatedAt, size: agentsMd.bytes }]} onItemClick={() => setAgentMdOpen(true)} />
              </div>
            )}
          </div>
        </div>
      </div>

      {agentMdOpen && <AgentsMDModal agentsMd={agentsMd} onClose={() => setAgentMdOpen(false)} />}
      {artifactOpen && window.ArtifactViewer && (
        <window.ArtifactViewer folder={folder} onClose={() => setArtifactOpen(false)} />
      )}
    </>
  );
}

// Flatten timeline into a chat-style stream with day separators
function flattenChat(timeline) {
  const out = [];
  let lastDay = null;
  for (const ev of timeline) {
    if (ev.day && ev.day !== lastDay) {
      out.push({ type: 'day', text: ev.day });
      lastDay = ev.day;
    }
    for (const d of (ev.detail || [])) {
      out.push(d);
    }
  }
  return out;
}

function FolderGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    </svg>
  );
}

function FileGroup({ title, items, onItemClick, onFileOpen }) {
  return (
    <div className="fc-files-group">
      <h4>{title}</h4>
      <div className="fc-files-list">
        {items.map((it, i) => (
          <div className="fc-file-row" key={i} onClick={() => {
            if (it.type === 'md') onItemClick && onItemClick();
            else if (it.type !== 'folder') onFileOpen && onFileOpen(it);
          }}>
            <div className="name-cell">
              {it.type === 'folder' ? (
                <div style={{width:22, height:26, display:'grid', placeItems:'center', color:'#C2A246'}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                </div>
              ) : it.type === 'md' ? (
                <div className="agent-md-icon" style={{ width: 22, height: 26, fontSize: 9 }}>MD</div>
              ) : (
                <TypeTile t={it.type} size={22} />
              )}
              <div className="name">
                <span>{it.name}</span>
                {it.pinned && <span className="pin-tag"><I.pin /> Cover</span>}
              </div>
            </div>
            <div className="muted">{it.owner}</div>
            <div className="muted">{it.when}</div>
            <div className="actions"><I.more /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FolderTimeline({ folderTimeline }) {
  const [expandedEvent, setExpandedEvent] = useState(null);
  const byDay = useMemo(() => {
    const out = []; let cur = null;
    for (const ev of folderTimeline) {
      if (!cur || cur.day !== ev.day) { cur = { day: ev.day, events: [] }; out.push(cur); }
      cur.events.push(ev);
    }
    return out;
  }, [folderTimeline]);
  return (
    <div style={{ padding: '4px 8px' }}>
      {byDay.map((day, di) => (
        <React.Fragment key={di}>
          <div className="tl-day"><span>{day.day}</span><div className="ln"></div></div>
          {day.events.map(ev => (
            <TimelineEvent
              key={ev.id}
              ev={ev}
              expanded={expandedEvent === ev.id}
              onToggle={() => setExpandedEvent(e => e === ev.id ? null : ev.id)}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

function kindLabel(kind) {
  return { preso:'deck', doc:'doc', sheet:'sheet', app:'app', notebook:'notebook' }[kind] || 'file';
}

function FlipIcon() {
  return (
    <span className="ic">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
        <path d="M21 4v4h-4"/>
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
        <path d="M3 20v-4h4"/>
      </svg>
    </span>
  );
}

function FileRow({ it }) {
  return (
    <div className={`file-row${it.type === 'folder' ? ' folder-row' : ''}`}>
      {it.type === 'folder' ? (
        <div className="ficon" style={{background:'transparent', color:'#C2A246', display:'grid', placeItems:'center'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        </div>
      ) : (
        <TypeTile t={it.type} size={22} />
      )}
      <span className="name">{it.name}</span>
      {it.pinned && <span className="pin-tag"><I.pin /> Cover</span>}
    </div>
  );
}

function TimelineEvent({ ev, expanded, onToggle }) {
  const stack = ev.who.map(w => PEOPLE[w]).filter(Boolean);
  return (
    <div
      className={`tl-event${expanded ? ' expanded' : ''}${ev.pinned ? ' pinned' : ''}`}
      onClick={onToggle}
    >
      <span className="dot"></span>
      <div className="head">
        <div className="who-stack">
          {stack.map((p, i) => (
            <div key={i} className="a" style={{background: p.color, fontSize: p.short.length > 1 ? 9.5 : 10}}>
              {p.short}
            </div>
          ))}
        </div>
        <div className="summary">
          {ev.summary}
          {ev.pinned && <span className="pin-applied"><I.pin /> Pinned as Coverslide</span>}
          {ev.files && ev.files.length > 0 && (
            <div className="files">
              {ev.files.map((f, i) => (
                <span className="file-pill" key={i}>
                  <TypeTile t={f.type} size={14} />
                  {f.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="when">{ev.when}</div>
      </div>

      {expanded && (
        <div className="tl-detail" onClick={(e) => e.stopPropagation()}>
          <div className="det-evs">
            {ev.detail.map((d, i) => <DetailEvent d={d} key={i} />)}
          </div>
          <div className="det-foot">
            <span>The actual messages between {ev.who.map(w => PEOPLE[w]?.name).filter(Boolean).slice(0, -1).join(', ') + (ev.who.length > 1 ? ' and ' + PEOPLE[ev.who[ev.who.length-1]]?.name : '')}</span>
            <button className="btn ghost">Open in thread →</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ───────── Gemini dock + chat ─────────
function GemGlyph({ size = 22 }) {
  const id = 'gem-rg-' + size;
  return (
    <svg className="gem-glyph" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id={id} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#FFD86B"/>
          <stop offset="40%" stopColor="#E55A8A"/>
          <stop offset="80%" stopColor="#8C5BFF"/>
          <stop offset="100%" stopColor="#4F8DFF"/>
        </radialGradient>
      </defs>
      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill={`url(#${id})`}/>
    </svg>
  );
}

function GeminiDock({ onExpand, onOpenAgentMd, placeholder = 'Ask Gemini to edit this…' }) {
  return (
    <div className="gemini-dock">
      <GemGlyph size={22} />
      <div className="gem-models">
        <button className="gem-chip active">Gemini 3 Pro</button>
        <button className="gem-chip">Claude</button>
      </div>
      <input
        className="gem-input"
        placeholder={placeholder}
        onFocus={onExpand}
      />
      <button className="gem-send" onClick={onExpand} title="Send">
        <I.send />
      </button>
    </div>
  );
}

function GeminiChat({ onClose, onOpenAgentMd, folder }) {
  return (
    <div className="gemini-chat" onClick={(e) => e.stopPropagation()}>
      <div className="gc-hd">
        <GemGlyph size={22} />
        <div>
          <div className="title">Gemini · editing in Drive</div>
          <div className="sub">
            Reading <a href="#" onClick={(e) => { e.preventDefault(); onOpenAgentMd(); }} style={{ color: 'var(--blue)' }}>AGENTS.md</a>
            {' · '}{folder.title} · 12 slides + 3 sources
          </div>
        </div>
        <div className="right">
          <button className="close" onClick={onClose} title="Close"><I.close /></button>
        </div>
      </div>

      <div className="gc-body">
        <div className="gc-msg user">
          <div className="avt" style={{ background: 'linear-gradient(135deg,#E55934,#F8B58A)' }}>DW</div>
          <div className="text">Tighten slide 02. The "$480B" stat is doing too much work — break it into market size, addressable, and reachable.</div>
        </div>

        <div className="gc-msg gem">
          <div className="avt"><i /></div>
          <div className="text">
            Reading <code>northwind-water-market.pdf</code> (pp. 12–14) and the existing <b>02 — Industrial water blind spot.slide</b>. The PDF supports a TAM/SAM/SOM split — I'll redo the bar chart and rewrite the headline. Working in slide 02 now.
          </div>
        </div>

        <div className="gc-edit-card">
          <div className="ic"><I.doc /></div>
          <div>
            <b>02 — Industrial water blind spot.slide</b>
            <div style={{ color: 'var(--ink-dim)', fontSize: 11.5 }}>3 edits · headline · stat block · chart</div>
          </div>
          <div className="right">
            <button className="btn ghost" style={{ padding: '4px 10px', fontSize: 11.5 }}>Diff</button>
            <button className="btn primary" style={{ padding: '4px 10px', fontSize: 11.5 }}>Accept</button>
          </div>
        </div>

        <div className="gc-msg gem">
          <div className="avt"><i /></div>
          <div className="text">
            Logged this decision in <b onClick={onOpenAgentMd} style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>AGENTS.md</b>. Other agents (Claude, Cursor) will see the new constraint on their next read.
          </div>
        </div>
      </div>

      <div className="gc-foot">
        <GemGlyph size={18} />
        <input placeholder="Ask Gemini to make another change…" />
        <span className="ctx"><I.spark /> AGENTS.md</span>
        <button className="gem-send" title="Send"><I.send /></button>
      </div>
    </div>
  );
}

// ───────── AGENTS.md modal ─────────
function AgentsMDModal({ agentsMd, onClose }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="md-overlay" onClick={onClose}>
      <div className="md-modal" onClick={(e) => e.stopPropagation()}>
        <div className="md-hd">
          <div className="agent-md-icon">MD</div>
          <div className="info">
            <div className="name">{agentsMd.filename}</div>
            <div className="sub">Updated by {agentsMd.updatedBy} · {agentsMd.updatedAt} · {agentsMd.bytes}</div>
          </div>
          <div className="actions">
            <button className="btn ghost"><I.doc /> Raw</button>
            <button className="btn"><I.paperclip /> Copy</button>
            <button className="close-x" onClick={onClose}><I.close /></button>
          </div>
        </div>

        <div className="md-explainer">
          <span className="badge">AGENTS.md</span>
          <span>
            <b>Drive maintains this file automatically.</b> Any AI agent that reads it — Gemini, Claude, Cursor, a local CLI — has full context to keep editing this folder. Take the folder anywhere; the brief travels with it.
          </span>
        </div>

        <div className="md-body">
          {agentsMd.rendered}
        </div>

        <div className="md-foot">
          <span className="meta">Schema: agents-md / 0.4 · readable by any model</span>
          <button className="btn">Download .md</button>
          <button className="btn primary"><I.spark /> Run an agent on this folder</button>
        </div>
      </div>
    </div>
  );
}

function DetailEvent({ d }) {
  const person = PEOPLE[d.who] || PEOPLE.ai;
  if (d.type === 'msg') {
    return (
      <div className="det-ev msg">
        <div className="avt" style={{background: person.color}}>{person.short}</div>
        <div className="det-body">
          <div className="who">{person.name}</div>
          <div className="det-text">{d.text}</div>
          {d.files && d.files.length > 0 && (
            <div className="files-row">
              {d.files.map((f, i) => (
                <span className="attach-chip" key={i}>
                  <TypeTile t={f.type} size={20} />
                  <span>
                    <div>{f.name}</div>
                    <div className="size">{f.size}</div>
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  if (d.type === 'comment') {
    return (
      <div className="det-ev comment">
        <div className="avt" style={{background: person.color}}>{person.short}</div>
        <div className="det-body">
          <div className="who">{person.name} commented</div>
          {d.quote && <div className="quote">{d.quote}</div>}
          <div className="det-text">{d.text}</div>
        </div>
      </div>
    );
  }
  if (d.type === 'action') {
    return (
      <div className="det-ev action">
        <div className="avt" style={{background: person.color}}>{person.short}</div>
        <div className="det-body">
          <div className="det-text">
            <b style={{color:'var(--ink)'}}>{person.name}</b> {d.text}
            {d.target && <> <span className="pill target">{d.target}</span></>}
          </div>
        </div>
      </div>
    );
  }
  if (d.type === 'artifact') {
    return (
      <div className="det-ev artifact">
        <div className="avt sys"><I.spark /></div>
        <div className="det-body">
          <div className="who">{d.title}{d.pinned && <span className="pin-applied" style={{marginLeft:6}}><I.pin /> Pinned</span>}</div>
          <div className="det-mini-slide">
            {d.variant === 'math'
              ? <MathWorksheet />
              : d.variant === 'replaced'
                ? <DeckSlideReplaced title="Northwind" sub="A water-reuse OS for industrial cooling." tag="Series A · Feb 2026" />
                : <DeckSlide1 title="Northwind" subtitle="A new shape for industrial water." tag="Series A · 2026" />}
          </div>
        </div>
      </div>
    );
  }
  return null;
}

// ═══════════ In-Drive file preview + contextual AI side panel ═══════════
// File mode → the AI panel answers questions about the open file's content.
// Folder mode → the AI panel manages the folder's AI artifact (the Coverslide).

const PV_FILE_SUMMARY = {
  sheet: "This sheet tracks five quarters of financials.\n• Revenue: $1.2M → $4.0M (+233%)\n• NRR climbed 108% → 131%\n• Churn fell 4.2% → 2.4%\nBlended FY: $12.5M at 119% NRR.",
  pdf: "47-page industrial-water market report.\n• ~$480B spent annually cooling industrial equipment\n• Water-reuse compliance now mandatory in 14 states\n• TAM $480B · SAM $92B · SOM $11B",
  doc: "Engineering Principles, v2 — three tenets:\n1. Optimize for read-through (code is read 10× more than written)\n2. Ship small, ship often\n3. Own the seam — whoever defines the interface owns the system",
  preso: "Northwind Series A deck — “We replace cooling-tower capex with software.”\n12 slides: problem → market → product → ROI → traction → team → ask ($14M).",
  csv: "22 buyer-interview transcripts. Recurring themes:\n• Capex-approval friction\n• Water-reuse compliance pressure\n• No real-time visibility into cooling systems",
  img: "Brand-mark exploration. The orange dot is the locked element — keep a warm gradient around it.",
  notebook: "Cluster analysis of the interviews → 4 personas.\nLargest cluster: compliance-driven plant managers (38%).",
  app: "Onboarding monitor — 2,418 signups today, 49% activated, 3:42 avg time-to-value.",
};
const PV_FILE_SUGGEST = ["Summarize this", "Pull out the key numbers", "What should I take away?", "Draft a follow-up email"];
const PV_FOLDER_SUGGEST = ["Update the Coverslide", "Change the tone", "Add a section", "Regenerate from sources"];

function pvFileAnswer(file, q) {
  const t = (q || '').toLowerCase();
  const base = PV_FILE_SUMMARY[file.kind] || "Here's a quick read of this file.";
  if (/number|metric|stat|kpi|figure|revenue/.test(t)) {
    if (file.kind === 'sheet') return "Key numbers:\n• FY revenue $12.5M (+233%)\n• Latest NRR 131%\n• Churn 2.4% (down from 4.2%)\n• Q1’26 revenue $4.0M";
    return base;
  }
  if (/email|draft|message|send|write/.test(t)) return "Draft:\n\nSubject: Quick read on " + file.name + "\n\nHi team — highlights from this file:\n" + base + "\n\nHappy to walk through it live. — DW";
  if (/take ?away|takeaway|important|matter|so what/.test(t)) return "Biggest takeaway: " + base.split("\n")[0];
  return base;
}
function pvFolderAnswer(folder, q) {
  const t = (q || '').toLowerCase();
  if (/tone|voice|style/.test(t)) return "Shifting the voice more confident and plainspoken across the cover and slides 02–05. I've logged the change in AGENTS.md so other agents keep the same tone.";
  if (/add|section|slide/.test(t)) return "Added a new slide after ROI — “Customer story · Granite Foods” — pulling the strongest quote from the interview CSV. It's slotted as slide 06.";
  if (/regen|source|rebuild|refresh from/.test(t)) return "Re-reading the 3 source files and regenerating. Cover headline and the market math (slides 02 & 08) are refreshed from northwind-water-market.pdf; everything else left untouched.";
  if (/update|cover|pin|refresh/.test(t)) return "Updated the Coverslide with the latest Q1’26 numbers and re-pinned it as the folder face. Want me to notify Linh and Sam?";
  if (/summar|what.?s in|contents|inside/.test(t)) return "This folder holds the Coverslide (Cover.slide), 11 more slides, 3 source files, and AGENTS.md — built by you, Linh, and Sam with Drive.";
  return "I maintain the AI artifact in this folder. I can update the cover, change the tone, add sections, or regenerate from the sources — and I keep AGENTS.md in sync so any agent can pick up where I left off.";
}

function PvPdf({ name }) {
  return (
    <div className="pv-pdf">
      <div className="ttl">The Industrial Water Opportunity</div>
      <div className="meta">{name} · PDF · page 1 of 47</div>
      <p>Industrial cooling consumes more freshwater than any other commercial process, yet the systems that manage it remain analog, bespoke, and invisible to the teams that run them.</p>
      <div className="stat">
        <div><b>$480B</b><span>spent annually on cooling</span></div>
        <div><b>14</b><span>states mandating reuse</span></div>
        <div><b>31%</b><span>water recoverable today</span></div>
      </div>
      <h4>1 · The blind spot</h4>
      <p>Cooling-tower capex is approved in 18-month cycles with little operational telemetry. Plant engineers cannot see make-up water draw in real time, so reuse opportunities go unmeasured.</p>
      <h4>2 · Why now</h4>
      <p>Compliance deadlines and rising water costs are converging. The market is ready for a software layer that standardizes reuse across heterogeneous equipment.</p>
    </div>
  );
}
function PvCsv() {
  const rows = [
    ["#", "Persona", "Plant size", "Top pain", "Buying trigger"],
    ["1", "Compliance lead", "Large", "Reuse reporting", "State mandate"],
    ["2", "Plant engineer", "Mid", "No live data", "Tower failure"],
    ["3", "VP Ops", "Large", "Capex avoidance", "Budget cycle"],
    ["4", "Sustainability", "Mid", "Water targets", "Board pressure"],
    ["5", "Facilities mgr", "Small", "Maintenance cost", "Utility spike"],
  ];
  return (
    <div className="pv-csvwrap">
      <table className="pv-csv">
        <thead><tr>{rows[0].map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
        <tbody>{rows.slice(1).map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
function PvImg({ name }) {
  return <div className="pv-img"><div className="dot"></div><div className="cap">{name} · 2400 × 1600</div></div>;
}

// Classic "it still works like Drive" detailed file list (the Files tab).
function ClassicFiles({ folder, onOpenFile }) {
  const contents = typeof getFolderContents === 'function' ? getFolderContents(folder.id, folder.isNew) : { items: [] };
  return (
    <div className="pv-doc files">
      <div className="cf">
        <div className="cf-head">
          <span>Name</span><span>Owner</span><span>Last modified</span><span>File size</span>
        </div>
        {contents.items.map((it, i) => (
          <div className="cf-row" key={i}
            onClick={() => it.type !== 'folder' && onOpenFile && onOpenFile({ name: it.name, kind: it.type, folderTitle: folder.title })}>
            <span className="cf-name">
              {it.type === 'folder'
                ? <span className="cf-ic folder"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg></span>
                : <TypeTile t={it.type} size={18} />}
              <span className="t">{it.name}{it.pinned && <span className="cf-pin">Cover</span>}</span>
            </span>
            <span className="cf-cell">{it.owner || 'Me'}</span>
            <span className="cf-cell">{it.when}</span>
            <span className="cf-cell">{it.size || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PvBody({ item }) {
  if (item.mode === 'folder') {
    const folder = item.folder;
    // Legacy folder with no Coverslide → friendly empty cover (the classic file list lives in the Files tab).
    if (!folder.hasThread) return (
      <div className="pv-doc create">
        <div className="pv-create">
          <div className="pv-create-eyebrow"><span className="dot"></span> Classic folder</div>
          <h1>No Coverslide yet</h1>
          <p>This folder still works exactly like Drive always has — browse everything in the <b>Files</b> tab above. Or ask your sidekick to turn it into an AI artifact.</p>
        </div>
      </div>
    );
    const live = window.__hasArtifact && window.__hasArtifact(folder.kind);
    // The artifact fills all available real estate (full-bleed), like the live apps.
    return (
      <div className="pv-doc art">
        {live
          ? React.createElement(window.ArtifactBody, { kind: folder.kind })
          : <DocPreview kind={folder.kind} title={folder.title} folderId={folder.id} />}
      </div>
    );
  }
  const k = item.kind;
  let inner;
  if (['doc', 'sheet', 'preso', 'app', 'notebook'].includes(k)) inner = <DocPreview kind={k} title={item.name} folderId={item.folderId} />;
  else if (k === 'pdf') inner = <PvPdf name={item.name} />;
  else if (k === 'csv') inner = <PvCsv />;
  else if (k === 'img') inner = <PvImg name={item.name} />;
  else inner = <div style={{ padding: 24 }}>Preview</div>;
  // The file fills all available space — full-bleed editor surface, both axes.
  return (
    <div className="pv-doc fill">
      <div className="pv-editorbar">
        <span className="docname">{item.name}</span>
        <span className="tools">
          {['↶', '↷', '|', 'B', 'I', 'U', '|', '🔗', '“', '•', '⎘'].map((c, i) =>
            c === '|' ? <i className="sep" key={i}></i> : <button key={i} tabIndex={-1}>{c}</button>)}
        </span>
        <span className="present-chip">Editing</span>
      </div>
      <div className="pv-filecanvas">{inner}</div>
    </div>
  );
}

// ── AI sidekick: proactive recommendations, actions, and live working agents ──
function baseName(n) { return (n || '').replace(/\.[a-z0-9]+$/i, ''); }
const SK_FILE_ACTIONS = [
  { k: 'summary', label: 'Summarize for the team', verb: 'Summarizing', done: (f) => '5-bullet summary of ' + f.name + ' is ready. Send it to #team?' },
  { k: 'deck', label: 'Turn this into a deck', verb: 'Building a deck', done: (f) => 'Created “' + baseName(f.name) + ' · deck” (6 slides) in this folder.' },
  { k: 'tasks', label: 'Pull out action items', verb: 'Extracting action items', done: () => 'Found 4 action items and dropped them into a checklist doc.' },
  { k: 'related', label: 'Find related files', verb: 'Searching your Drive', done: () => '3 related files: market-research.pdf, interviews.csv, brand-tokens.gsheet.' },
  { k: 'email', label: 'Draft a follow-up email', verb: 'Drafting an email', done: (f) => 'Draft ready — subject “Re: ' + f.name + '.” Review before sending?' },
];
const SK_FILE_EXTRA = {
  sheet: [{ k: 'chart', label: 'Chart this data', verb: 'Charting', done: () => 'Added a revenue-by-quarter bar chart to the sheet.' }, { k: 'forecast', label: 'Forecast next quarter', verb: 'Forecasting', done: () => 'Q2’26 projected at $4.9M (+23%) on the current trend.' }],
  doc: [{ k: 'tighten', label: 'Tighten the writing', verb: 'Editing for clarity', done: () => 'Trimmed 18% of words; meaning intact. Review the diff?' }],
  pdf: [{ k: 'quotes', label: 'Extract key quotes', verb: 'Reading the PDF', done: () => 'Pulled 5 quotable lines with page references.' }],
  csv: [{ k: 'clean', label: 'Clean & dedupe rows', verb: 'Cleaning data', done: () => 'Removed 3 duplicates and normalized 12 fields.' }],
};
const SK_FOLDER_ACTIONS = [
  { k: 'update', label: 'Update the Coverslide', verb: 'Updating the cover', done: () => 'Cover refreshed with the latest numbers and re-pinned.' },
  { k: 'tone', label: 'Change the tone', verb: 'Rewriting for tone', done: () => 'Voice is now confident & plainspoken across slides 02–05. Logged in AGENTS.md.' },
  { k: 'add', label: 'Add a section', verb: 'Drafting a slide', done: () => 'Added “Customer story · Granite Foods” as slide 06.' },
  { k: 'regen', label: 'Regenerate from sources', verb: 'Re-reading sources', done: () => 'Cover and market math refreshed from the source PDF.' },
];
const SK_FILE_RECS = [
  { t: 'Share with Linh', d: "You haven't shared this yet.", verb: 'Sharing', done: () => 'Shared with Linh T. (can edit).' },
  { t: 'Fix 2 stale links', d: 'Two links 404 in this file.', verb: 'Fixing links', done: () => 'Repointed 2 broken links to current docs.' },
];
// Legacy folder (no Coverslide) — the sidekick offers to create one + tidy the folder.
const SK_LEGACY_ACTIONS = [
  { k: 'cover', label: 'Create a Coverslide', verb: 'Drafting a Coverslide', done: () => 'Drafted a Coverslide from the files in this folder. Pin it as the cover?' },
  { k: 'summarize', label: 'Summarize this folder', verb: 'Reading the folder', done: () => 'This folder holds 5 files (3 docs, 1 sheet, 1 image), last touched in Jan.' },
  { k: 'organize', label: 'Organize & rename files', verb: 'Organizing', done: () => 'Grouped the files into Drafts / Data / Assets and proposed clearer names.' },
  { k: 'dupes', label: 'Find duplicate files', verb: 'Scanning for duplicates', done: () => 'Found 1 likely duplicate: “Notes.gdoc” ≈ “Draft v3.gdoc”.' },
];
const SK_LEGACY_RECS = [
  { t: 'No Coverslide yet', d: 'Turn this folder into an AI artifact.', verb: 'Starting a thread', done: () => 'Started a thread and drafted a Coverslide. Review it?' },
];
// New-folder creation — the sidekick builds the chosen format.
const SK_CREATE_ACTIONS = [
  { k: 'draft', label: 'Draft from my files', verb: 'Reading your files', done: () => 'Drafted a first version from 3 source files — review it on the left.' },
  { k: 'outline', label: 'Outline first', verb: 'Outlining', done: () => 'Sketched a structure. Tell me a section to expand.' },
  { k: 'template', label: 'Start from a template', verb: 'Loading a template', done: () => 'Started from a template and adapted it to your prompt.' },
  { k: 'generate', label: 'Generate now', verb: 'Generating', done: () => 'Created a starting draft and pinned it as this folder’s Coverslide.' },
];
const FMT_LABEL = { doc: 'doc', sheet: 'spreadsheet', preso: 'presentation', app: 'app', notebook: 'notebook' };

const FILE_HISTORY = [
  { who: ['me'], summary: 'You opened this file', when: 'just now' },
  { who: ['linh'], summary: 'Linh T. edited 3 sections', when: '2h ago' },
  { who: ['sam'], summary: 'Sam K. left a comment', when: 'Yesterday' },
  { who: ['ai'], summary: 'Drive AI indexed it for search', when: 'Yesterday' },
  { who: ['me'], summary: 'You created this file', when: 'May 24' },
];

function SkHistory({ item }) {
  const isFolder = item.mode === 'folder';
  const tl = isFolder && typeof getTimeline === 'function' ? getTimeline(item.folder) : null;
  const rows = isFolder && tl
    ? tl.map(ev => ({ who: ev.who || ['ai'], summary: ev.summary, when: ev.when, day: ev.day, pinned: ev.pinned }))
    : FILE_HISTORY.map(r => ({ ...r, day: null }));
  let lastDay = null;
  return (
    <div className="sk-history">
      {rows.map((r, i) => {
        const showDay = r.day && r.day !== lastDay; lastDay = r.day || lastDay;
        return (
          <React.Fragment key={i}>
            {showDay && <div className="sk-day">{r.day}</div>}
            <div className="sk-hrow">
              <div className="who-stack-sm">
                {(r.who || []).slice(0, 3).map((w, j) => {
                  const pp = PEOPLE[w] || PEOPLE.ai;
                  return <div className="a" key={j} style={{ background: pp.color }}>{w === 'ai' ? <I.spark /> : pp.short}</div>;
                })}
              </div>
              <div className="bd">{r.summary}{r.pinned && <span className="sk-pin"><I.pin /> Pinned</span>}</div>
              <div className="when">{r.when}</div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function SkFiles({ item, onOpenFile }) {
  const contents = typeof getFolderContents === 'function' ? getFolderContents(item.folder.id, item.folder.isNew) : { items: [] };
  return (
    <div className="sk-files">
      {contents.items.map((it, i) => (
        <div className={`sk-file${it.type === 'folder' ? ' folder' : ''}`} key={i}
          onClick={() => it.type !== 'folder' && onOpenFile && onOpenFile({ name: it.name, kind: it.type, folderTitle: item.folder.title })}>
          {it.type === 'folder'
            ? <span className="fi folder">▸</span>
            : <span className="fi"><TypeTile t={it.type} size={20} /></span>}
          <span className="nm">{it.name}{it.pinned && <span className="sk-pin"><I.pin /> Cover</span>}</span>
          <span className="meta">{it.when}</span>
        </div>
      ))}
    </div>
  );
}

const PV_CREATE_FMTS = [['doc', 'Doc'], ['sheet', 'Spreadsheet'], ['preso', 'Presentation'], ['app', 'App'], ['notebook', 'Notebook']];
function guessFmt(text) {
  const t = (text || '').toLowerCase();
  if (/deck|pitch|present|slide/.test(t)) return 'preso';
  if (/sheet|budget|model|spreadsheet|forecast|number|data/.test(t)) return 'sheet';
  if (/app|dashboard|tool|monitor|tracker/.test(t)) return 'app';
  if (/notebook|analysis|colab|python|code/.test(t)) return 'notebook';
  return 'doc';
}
function PvSidekick({ item, onOpenFile, createFmt, onGenerate, onSetFmt, asked, onAsk }) {
  const isFolder = item.mode === 'folder';
  const isCreate = item.mode === 'create';
  const isLegacy = isFolder && !item.folder.hasThread;
  const ctx = isFolder || isCreate ? item.folder : item;
  const [tab, setTab] = useState('sidekick'); // 'sidekick' | 'history' | 'files'
  const [agents, setAgents] = useState(() => isCreate
    ? []
    : isLegacy
      ? [{ id: 0, label: 'Scanning folder contents', pct: 55, status: 'running' }, { id: 1, label: 'Checked for duplicates', pct: 100, status: 'done' }]
      : isFolder
        ? [{ id: 0, label: 'Keeping AGENTS.md in sync', pct: 100, status: 'done' }, { id: 1, label: 'Watching 3 sources for changes', pct: 46, status: 'running' }]
        : [{ id: 0, label: 'Summarizing this document', pct: 64, status: 'running' }, { id: 1, label: 'Indexed for instant search', pct: 100, status: 'done' }]);
  const [msgs, setMsgs] = useState([]);
  const [draft, setDraft] = useState('');
  const nextId = useRef(2);
  const bodyRef = useRef(null);
  useEffect(() => { if (bodyRef.current && tab === 'sidekick' && msgs.length) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [msgs, tab]);
  useEffect(() => {
    const t = setInterval(() => {
      setAgents(prev => {
        const finished = [];
        const next = prev.map(a => {
          if (a.status !== 'running') return a;
          const pct = a.pct + 9 + (a.id % 4) * 2;
          if (pct >= 100) { if (a.doneMsg) finished.push(a.doneMsg); return { ...a, pct: 100, status: 'done' }; }
          return { ...a, pct };
        });
        if (finished.length) setMsgs(m => [...m, ...finished.map(text => ({ role: 'ai', text }))]);
        return next;
      });
    }, 650);
    return () => clearInterval(t);
  }, []);

  // Live-streaming greeting — generic on first load, then reacts once the user describes what they want.
  const STREAM = isCreate
    ? (asked
      ? `Got it — a ${FMT_LABEL[createFmt] || 'doc'} sounds right. Pick a starting point below, or just say “go.”`
      : `Hey — what do you want to create? Describe it in a sentence and I'll suggest the best format and draft it live, right here in the folder.`)
    : '';
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!isCreate) return undefined;
    setShown(0);
    let i = 0;
    const t = setInterval(() => { i += 2; setShown(i); if (i >= STREAM.length) clearInterval(t); }, 26);
    return () => clearInterval(t);
  }, [STREAM, isCreate]);

  const actions = isCreate ? SK_CREATE_ACTIONS : isLegacy ? SK_LEGACY_ACTIONS : isFolder ? SK_FOLDER_ACTIONS : [...(SK_FILE_EXTRA[item.kind] || []), ...SK_FILE_ACTIONS];
  const recs = isCreate ? [] : isLegacy ? SK_LEGACY_RECS : isFolder ? [] : SK_FILE_RECS;
  const running = agents.filter(a => a.status === 'running').length;

  function run(a) {
    const id = nextId.current++;
    const doneMsg = typeof a.done === 'function' ? a.done(ctx) : a.done;
    setAgents(prev => [{ id, label: a.verb + '…', pct: 6, status: 'running', doneMsg }, ...prev]);
    setTab('sidekick');
  }
  function doAction(a) {
    run(a);
    if (isCreate && onGenerate) setTimeout(() => onGenerate(), 1500);   // build the artifact
  }
  function send(text) {
    text = (text || '').trim(); if (!text) return;
    if (isCreate) {
      setDraft('');
      if (!asked) { if (onAsk) onAsk(guessFmt(text)); return; }  // first message: reveal format + suggestion
      if (onGenerate) setTimeout(() => onGenerate(), 1400);       // later messages: build it
      return;
    }
    const reply = isFolder ? pvFolderAnswer(item.folder, text) : pvFileAnswer(item, text);
    setMsgs(m => [...m, { role: 'user', text }, { role: 'ai', text: reply }]);
    setDraft('');
  }

  const tabs = isCreate ? ['sidekick'] : ['sidekick', 'history'];
  const tabLabel = { sidekick: 'Sidekick', history: 'History' };

  return (
    <aside className="pv-ai sk">
      <div className="pv-ai-hd">
        <GemGlyph size={22} />
        <div className="t">AI sidekick</div>
        <div className="s">{isCreate ? 'New folder · creating' : isFolder ? item.folder.title + (isLegacy ? ' · folder' : ' · artifact') : item.name}</div>
        <span className={`mode ${running ? 'busy' : 'ready'}`}>{running ? <><span className="dotpulse" />{running} agent{running > 1 ? 's' : ''} working</> : '✓ all caught up'}</span>
      </div>
      <div className="sk-tabs">
        {tabs.map(tb => (
          <button key={tb} className={`sk-tab${tab === tb ? ' on' : ''}`} onClick={() => setTab(tb)}>{tabLabel[tb]}</button>
        ))}
      </div>

      {tab === 'sidekick' && (
        <div className="pv-ai-body" ref={bodyRef}>
          {isCreate && (
            <div className="sk-stream">
              <span className="ai-av ai"><I.spark /></span>
              <div className="bubble">{STREAM.slice(0, shown)}{shown < STREAM.length && <span className="sk-cursor" />}</div>
            </div>
          )}
          {isCreate && asked && (
            <div className="sk-sect">
              <h5>Format</h5>
              <div className="sk-formats small">
                {PV_CREATE_FMTS.map(([k, label]) => (
                  <FormatChip key={k} k={k} label={label} on={createFmt === k} onClick={() => onSetFmt && onSetFmt(k)} />
                ))}
              </div>
            </div>
          )}
          {agents.length > 0 && (
            <div className="sk-sect">
              <h5>{running ? 'Working now' : 'Recently done'}</h5>
              {agents.slice(0, 6).map(a => (
                <div className={`sk-agent ${a.status}`} key={a.id}>
                  <span className="ic">{a.status === 'running' ? <span className="spin" /> : '✓'}</span>
                  <div className="bd">
                    <div className="lb">{a.label}</div>
                    {a.status === 'running' ? <div className="prog"><i style={{ width: a.pct + '%' }} /></div> : <div className="st">done</div>}
                  </div>
                  {a.status === 'running' && <span className="pct">{a.pct}%</span>}
                </div>
              ))}
            </div>
          )}
          {recs.length > 0 && (
            <div className="sk-sect">
              <h5>Recommended</h5>
              {recs.map(r => (
                <div className="sk-rec" key={r.t}>
                  <I.spark />
                  <div className="bd"><b>{r.t}</b><span>{r.d}</span></div>
                  <button className="go" onClick={() => run(r)}>Do it</button>
                </div>
              ))}
            </div>
          )}
          {(!isCreate || asked) && (
            <div className="sk-sect">
              <h5>{isCreate ? 'Create with AI' : isLegacy ? 'Get started' : isFolder ? 'Manage this artifact' : 'Take action'}</h5>
              {actions.map(a => (
                <button className="sk-action" key={a.k} onClick={() => doAction(a)}>
                  <span>{a.label}</span><span className="arr">→</span>
                </button>
              ))}
            </div>
          )}
          {msgs.length > 0 && (
            <div className="sk-sect">
              <h5>Activity</h5>
              {msgs.map((m, i) => (
                <div className={`pv-msg ${m.role}`} key={i}>
                  <div className="avt">{m.role === 'user' ? 'DW' : <I.spark />}</div>
                  <div className="bubble">{m.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'history' && <div className="pv-ai-body"><SkHistory item={item} /></div>}

      {tab === 'sidekick' && (
        <div className="pv-ai-foot">
          <div className="pv-compose">
            <input value={draft} onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send(draft); } }}
              placeholder={isCreate ? 'Describe what to build…' : isFolder ? 'Tell your sidekick what to change…' : 'Tell your sidekick to do something…'} />
            <button className="pv-send" onClick={() => send(draft)}><I.send /></button>
          </div>
        </div>
      )}
    </aside>
  );
}

function PvCreate({ fmt, created }) {
  if (created && fmt) {
    const live = window.__hasArtifact && window.__hasArtifact(fmt);
    return (
      <div className="pv-doc art">
        {live ? React.createElement(window.ArtifactBody, { kind: fmt })
          : <DocPreview kind={fmt} title={'Untitled ' + (FMT_LABEL[fmt] || 'doc')} folderId={null} />}
      </div>
    );
  }
  return (
    <div className="pv-doc create">
      <div className="pv-create">
        <div className="pv-create-eyebrow"><span className="dot"></span> New folder</div>
        <h1>What do you want to make?</h1>
        <p>Tell your AI sidekick on the right what you have in mind — it’ll suggest a format and draft it here.</p>
        {fmt && (
          <div className="pv-create-canvas">
            <TypeTile t={fmt} size={44} />
            <div className="cn">Untitled {FMT_LABEL[fmt]}</div>
            <div className="cn-sub">Your AI sidekick will draft this here →</div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilePreview({ item, onClose, onOpenFile }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const isFolder = item.mode === 'folder';
  const isCreate = item.mode === 'create';
  const isLegacyFolder = isFolder && !item.folder.hasThread;
  const [createFmt, setCreateFmt] = useState(null);   // no default selection
  const [asked, setAsked] = useState(false);          // user has described what they want
  const [created, setCreated] = useState(false);
  const [mainTab, setMainTab] = useState(isLegacyFolder ? 'files' : 'cover');
  const title = item.mode === 'file' ? item.name : item.folder.title;
  return (
    <>
      <Topbar />
      <div className="pv-shell">
        <div className="pv-crumbs">
          <span className="step" onClick={onClose}>My Drive</span>
          {item.folderTitle && <><span className="sl">/</span><span className="step" onClick={onClose}>{item.folderTitle}</span></>}
          <span className="sl">/</span>
          <span className="step current">{title}</span>
          <div className="actions">
            <span className="pv-inplace">{isCreate ? '● New · creating in Drive' : '● Previewing inside Drive'}</span>
            <button className="btn ghost" title="The old behavior — opens a separate browser tab">Open in new tab ↗</button>
            <button className="btn ghost"><I.shared /> Share</button>
            <button className="btn ghost"><I.more /></button>
          </div>
        </div>
        <div className="pv-split">
          <div className="pv-maincol">
            {isFolder && (
              <div className="pv-maintabs">
                <button className={mainTab === 'cover' ? 'on' : ''} onClick={() => setMainTab('cover')}>{isLegacyFolder ? 'Overview' : 'Cover'}</button>
                <button className={mainTab === 'files' ? 'on' : ''} onClick={() => setMainTab('files')}>Files</button>
              </div>
            )}
            <div className="pv-maincontent">
              {isCreate
                ? <PvCreate fmt={createFmt} created={created} />
                : isFolder
                  ? (mainTab === 'files'
                    ? <ClassicFiles folder={item.folder} onOpenFile={onOpenFile} />
                    : <PvBody item={item} />)
                  : <PvBody item={item} />}
            </div>
          </div>
          <PvSidekick
            item={item}
            onOpenFile={onOpenFile}
            createFmt={createFmt}
            onSetFmt={setCreateFmt}
            asked={asked}
            onAsk={(guess) => { setAsked(true); setCreateFmt(f => f || guess); }}
            onGenerate={() => setCreated(true)}
            key={isCreate ? 'create' : isFolder ? ('folder-' + item.folder.id) : ('file-' + item.name)}
          />
        </div>
      </div>
    </>
  );
}

// ═══════════ Search results — AI answer from sources + typed results ═══════════
// (distilled from the "Drive Search Lab" exploration)
const SR_SOURCES = [
  { n: 1, title: 'Atlas security review — May 18', meta: '🎙 Meet transcript · 11:30–12:04', type: 'meeting' },
  { n: 2, title: 'Q3 Board Deck — slide 9', meta: '📊 Slides · Dana Okafor', type: 'preso' },
  { n: 3, title: 'Re: Atlas press embargo', meta: '✉ Gmail · Sofia Reyes · May 24', type: 'doc' },
];
const SR_FILES = [
  { name: 'Atlas launch plan', type: 'doc', owner: 'Linh T.', when: '2d ago', snippet: 'Launch set for Sept 15 after the security review surfaced two blockers…' },
  { name: 'Q3 Board Deck', type: 'preso', owner: 'Dana O.', when: 'May 22', snippet: 'Slide 9 — Atlas timeline and the revised launch date.' },
  { name: 'Atlas security review', type: 'doc', owner: 'Sam K.', when: 'May 18', snippet: 'Two blockers: SSO token scope, audit-log retention.' },
  { name: 'Contractor Spend 2026', type: 'sheet', owner: 'Me', when: 'May 10', snippet: 'Monthly contractor spend, Jan–May 2026.' },
];
const SR_PEOPLE = [
  { name: 'Linh T.', role: 'PM · Atlas', meta: 'owns 14 files · 3 shared with you' },
  { name: 'Dana Okafor', role: 'VP Product', meta: 'shared the Q3 Board Deck' },
  { name: 'Sam K.', role: 'Security', meta: 'authored the review' },
];
const SR_FOLDERS = [
  { id: 'f1', name: 'Brand Refresh ’26', kind: 'preso', meta: '14 items · Coverslide' },
  { id: 'f2', name: 'Q2 Financial Model', kind: 'sheet', meta: '9 items · Coverslide' },
];
const SR_MEETINGS = [
  { name: 'Atlas security review', when: 'May 18 · 11:30–12:04', snippet: '“…we can’t ship until the token scope is fixed.”' },
  { name: 'Q2 Planning Sync', when: 'Mon · 9:00', snippet: 'Reviewed launch-date options for Atlas.' },
];
const SR_BARS = [['Jan', 42, '$38k'], ['Feb', 55, '$49k'], ['Mar', 38, '$34k'], ['Apr', 100, '$89k'], ['May', 83, '$74k']];

function srSearch(q, sources) {
  window.dispatchEvent(new CustomEvent('nd-search', { detail: { q, sources: sources || [] } }));
}

function SearchResults({ query, sources, onClose, onOpenFolder, onOpenFile }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const isData = /how much|spend|cost|budget|revenue|\$|number|burn/i.test(query);
  const personAv = (n) => <span className="sr-av">{n.split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase()}</span>;
  return (
    <>
      <Topbar />
      <div className="sr">
        <div className="sr-crumbs">
          <span className="step" onClick={onClose}>My Drive</span>
          <span className="sl">/</span>
          <span className="step current">Results for “{query}”</span>
          {sources && sources.length > 0 && <span className="sr-scope">scoped to {sources.join(', ')}</span>}
        </div>
        <div className="sr-body">
          <div className="sr-main">
            {isData ? (
              <div className="sr-answer chart">
                <div className="sr-answer-badge"><GemGlyph size={15} /> Answer · computed from your sheets</div>
                <div className="sr-chartcard">
                  <div className="sr-chart-head">
                    <div>
                      <div className="sr-chart-sub">CONTRACTOR SPEND · JAN–MAY 2026</div>
                      <div className="sr-bignum">$284,500 <span className="sr-delta">▲ 31% vs ’25</span></div>
                    </div>
                    <div className="sr-chart-cap">monthly · USD</div>
                  </div>
                  <div className="sr-bars">
                    {SR_BARS.map(([m, h, v], i) => (
                      <div className="sr-col" key={m}>
                        <div className="sr-bar" style={{ height: h + '%' }}><span className="v">{v}</span></div>
                        <span className="m">{m}</span>
                      </div>
                    ))}
                  </div>
                  <div className="sr-chart-foot">Computed from <span className="pill"><TypeTile t="sheet" size={14} /> Contractor Spend 2026</span> <span className="pill">📎 18 invoices</span></div>
                </div>
              </div>
            ) : (
              <div className="sr-answer">
                <div className="sr-answer-badge"><GemGlyph size={15} /> Answer · drawn from 3 sources</div>
                <p className="sr-answer-text">
                  The Atlas launch is set for <b>September 15, 2026</b>. The team moved it back from August after the
                  security review surfaced two blockers<sup className="sr-cite">1</sup>. Dana confirmed the new date in the
                  latest board update<sup className="sr-cite">2</sup>, and marketing aligned to a <b>September 8 press
                  embargo</b><sup className="sr-cite">3</sup>.
                </p>
                <div className="sr-follow">
                  {['What were the two blockers?', 'Who owns the launch?', 'Show the full timeline'].map(f => (
                    <button key={f} className="sr-followchip" onClick={() => srSearch(f, sources)}>{f}</button>
                  ))}
                </div>
                <div className="sr-sources">
                  <div className="sr-sources-h">Sources</div>
                  {SR_SOURCES.map(s => (
                    <div className="sr-src" key={s.n}>
                      <span className="sr-src-n">{s.n}</span>
                      <span><span className="sr-src-t">{s.title}</span><span className="sr-src-m">{s.meta}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="sr-group">
              <h4>Files</h4>
              {SR_FILES.map((f, i) => (
                <div className="sr-row" key={i} onClick={() => onOpenFile && onOpenFile({ name: f.name, kind: f.type })}>
                  <TypeTile t={f.type} size={26} />
                  <div className="sr-row-bd"><div className="nm">{f.name}</div><div className="snip">{f.snippet}</div></div>
                  <div className="sr-row-meta">{f.owner} · {f.when}</div>
                </div>
              ))}
            </div>

            <div className="sr-group">
              <h4>Meetings</h4>
              {SR_MEETINGS.map((m, i) => (
                <div className="sr-row" key={i}>
                  <span className="sr-mtg"><I.recent /></span>
                  <div className="sr-row-bd"><div className="nm">{m.name}</div><div className="snip">🎙 {m.snippet}</div></div>
                  <div className="sr-row-meta">{m.when}</div>
                </div>
              ))}
            </div>

            <div className="sr-group">
              <h4>Folders</h4>
              {SR_FOLDERS.map((f, i) => (
                <div className="sr-row" key={i} onClick={() => onOpenFolder && onOpenFolder({ id: f.id })}>
                  <span className="sr-folder"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg></span>
                  <div className="sr-row-bd"><div className="nm">{f.name}</div><div className="snip">{f.meta}</div></div>
                </div>
              ))}
            </div>
          </div>

          <aside className="sr-side">
            <div className="sr-people">
              <h4>People</h4>
              {SR_PEOPLE.map((p, i) => (
                <div className="sr-person" key={i}>
                  {personAv(p.name)}
                  <div><div className="nm">{p.name}</div><div className="role">{p.role}</div><div className="meta">{p.meta}</div></div>
                </div>
              ))}
            </div>
            <div className="sr-refine">
              <h4>Refine</h4>
              {['Type', 'People', 'Modified', 'Source'].map(r => <button className="sr-facet" key={r}>{r} <I.plus /></button>)}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

Object.assign(window, {
  DriveHome, CreateThread, PeekViewer, FolderView, FilePreview, SearchResults,
  SEED_FOLDERS, CLASSIC_FOLDERS, RECENT_FILES,
  DRIVE_TREE, BUCKETS, bucketFor, PEOPLE, RICH_THREAD,
  NORTHWIND_TIMELINE, MATH_TIMELINE,
  getFolderContents, countThreadEvents, getAgentsMd, getTimeline,
});
