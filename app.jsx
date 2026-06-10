// app.jsx — root: view routing + tweaks integration

const { useState: useState_, useEffect: useEffect_ } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "metaphor": "replace",
  "peekStyle": "tilt",
  "accent": "#1F6FEB"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = useState_('home');           // 'home' | 'create' | 'folder' | 'preview'
  const [folders, setFolders] = useState_(SEED_FOLDERS);
  const [currentFolder, setCurrentFolder] = useState_(null);
  const [previewItem, setPreviewItem] = useState_(null);
  const [search, setSearch] = useState_(null);   // { q, sources } when showing results
  const [peeking, setPeeking] = useState_(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState_(false);

  // Ask Drive bar → search results
  useEffect_(() => {
    const onSearch = (e) => { setSearch({ q: e.detail.q, sources: e.detail.sources || [] }); setView('search'); setPeeking(false); };
    window.addEventListener('nd-search', onSearch);
    return () => window.removeEventListener('nd-search', onSearch);
  }, []);

  // Apply accent
  useEffect_(() => {
    document.documentElement.style.setProperty('--blue', t.accent);
  }, [t.accent]);

  function openCreate() {
    // New folder at the top of My Drive, opened in the unified viewer's "create" mode.
    const nf = { id: 'new-' + Date.now(), title: 'New folder', kind: 'preso', isNew: true, hasThread: false, items: 0, sub: 'Created just now' };
    setFolders(f => [nf, ...f]);
    openPreview({ mode: 'create', folder: nf });
  }
  function closeCreate() { setView('home'); }

  function handlePin({ title, kind }) {
    const newId = 'new-' + Date.now();
    const newFolder = {
      id: newId, title, sub: 'Created just now', items: 15, kind,
      isNew: true, hasThread: true,
    };
    const next = [newFolder, ...folders];
    setFolders(next);
    setView('home');
    setTimeout(() => {
      setFolders(curr => curr.map(f => f.id === newId ? { ...f, isNew: false } : f));
    }, 2500);
  }

  function resolveFolder(f) {
    const full = folders.find(x => x.id === f.id)
      || CLASSIC_FOLDERS.find(x => x.id === f.id)
      || {
        id: f.id, title: f.name || f.title,
        sub: 'Edited recently', items: 0,
        kind: f.kind, hasThread: !!f.cs,
      };
    return { ...full, hasThread: full.hasThread || !!f.cs };
  }
  // Folders open into the unified preview layout (artifact + Sidekick on the side).
  function openFolder(f) { openPreview({ mode: 'folder', folder: resolveFolder(f) }); }

  function backToHome() {
    setView('home');
    setCurrentFolder(null);
    setSearch(null);
    setPeeking(false);
  }

  // In-Drive preview: open a file (inquire) or a folder (manage its AI artifact)
  function openPreview(it) {
    setPreviewItem(it);
    setView('preview');
    setPeeking(false);
    // Keep the sidebar in whatever state the user left it — don't force-collapse.
  }
  function closePreview() {
    const ret = previewItem && previewItem.returnFolder;
    setPreviewItem(null);
    if (ret) openFolder(ret); else backToHome();
  }

  // Keyboard shortcut
  useEffect_(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (view === 'home' || view === 'folder') openCreate();
      }
      if (e.key === 'Escape') {
        if (peeking) { setPeeking(false); return; }
        if (view === 'create') closeCreate();
        else if (view === 'folder') backToHome();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, peeking]);

  // Build dynamic tree: newly created folders prepended to top of My Drive
  const dynamicTree = React.useMemo(() => {
    const baseRoot = DRIVE_TREE.find(t => t.id === 'mydrive');
    const newFolders = folders
      .filter(f => f.id.startsWith('new-'))
      .map(f => ({
        id: f.id, name: f.title, kind: f.kind, cs: true,
        updatedAt: 'today',
      }));
    return [{
      ...baseRoot,
      children: [...newFolders, ...baseRoot.children],
    }];
  }, [folders]);

  return (
    <div className={`app${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <Sidebar
        tree={dynamicTree}
        onCreate={openCreate}
        currentView={view}
        currentFolderId={previewItem?.mode === 'folder' ? previewItem.folder.id : currentFolder?.id}
        onSelectFolder={openFolder}
        onSelectHome={backToHome}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(c => !c)}
      />
      <div className="main">
        {view === 'search' && search ? (
          <SearchResults
            query={search.q}
            sources={search.sources}
            onClose={backToHome}
            onOpenFolder={openFolder}
            onOpenFile={(file) => openPreview({ mode: 'file', ...file })}
          />
        ) : view === 'preview' && previewItem ? (
          <FilePreview
            item={previewItem}
            onClose={closePreview}
            onOpenFile={(file) => openPreview({ mode: 'file', ...file, returnFolder: previewItem.mode === 'folder' ? previewItem.folder : previewItem.returnFolder })}
          />
        ) : view === 'folder' && currentFolder ? (
          <FolderView
            folder={currentFolder}
            onClose={backToHome}
            onPeek={() => setPeeking(true)}
            onOpenFolder={openFolder}
            onOpenFile={(file) => openPreview({ mode: 'file', ...file, returnFolder: currentFolder })}
            metaphor={t.metaphor}
          />
        ) : (
          <DriveHome
            folders={folders}
            onOpenFolder={openFolder}
            onOpenFile={(file) => openPreview({ mode: 'file', ...file })}
            onPreviewFolder={(folder) => openPreview({ mode: 'folder', folder })}
            onCreate={openCreate}
            metaphor={t.metaphor}
          />
        )}
      </div>

      {view === 'create' && (
        <CreateThread onClose={closeCreate} onPin={handlePin} />
      )}

      {peeking && currentFolder && (
        <PeekViewer
          folder={currentFolder}
          onClose={() => setPeeking(false)}
          peekStyle={t.peekStyle}
        />
      )}

      <TweaksPanel>
        <TweakSection label="Coverslide as object" />
        <TweakRadio
          label="Folder metaphor"
          value={t.metaphor}
          options={['replace', 'nest', 'stack']}
          onChange={(v) => setTweak('metaphor', v)}
        />
        <div style={{fontSize:11, color:'rgba(41,38,27,.55)', marginTop:-4, lineHeight:1.4}}>
          {{
            replace: 'The folder IS the doc — full thumbnail replaces folder icon.',
            nest: 'Classic folder shape with the doc tucked inside.',
            stack: 'Top sheet of a paper stack — peek hint at the edges.',
          }[t.metaphor]}
        </div>

        <TweakSection label="Peek interaction" />
        <TweakRadio
          label="Style"
          value={t.peekStyle}
          options={['tilt', 'slide', 'flip']}
          onChange={(v) => setTweak('peekStyle', v)}
        />

        <TweakSection label="Theme" />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={['#1F6FEB', '#17171C', '#E55934', '#0F8F5A']}
          onChange={(v) => setTweak('accent', v)}
        />

        <TweakSection label="Jump to" />
        <TweakButton label="Create thread" onClick={openCreate} />
        <TweakButton label="Open a folder with a Coverslide" onClick={() => openFolder({ id:'f1' })} />
        <TweakButton label="Open a legacy folder" onClick={() => openFolder({ id:'c1', name:'2024 Archive' })} />

        <TweakSection label="In-Drive preview" />
        <TweakButton label="Preview a file — inquire with AI" onClick={() => openPreview({ mode:'file', name:'Q2 Financial Model.gsheet', kind:'sheet', folderTitle:'My Drive' })} />
        <TweakButton label="Preview a research PDF" onClick={() => openPreview({ mode:'file', name:'northwind-water-market.pdf', kind:'pdf', folderTitle:'My Drive' })} />
        <TweakButton label="Manage a folder's AI artifact" onClick={() => openPreview({ mode:'folder', folder: SEED_FOLDERS.find(f => f.id === 'f1') })} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
