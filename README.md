# New Drive — a reimagining of Google Drive

A single-file interactive prototype exploring an agent-native, Finder-style Google Drive.

**Live preview:** https://dwurtz.github.io/new-drive/

Highlights:
- Collapsible nav (auto-collapses on narrow screens); list / cover-gallery / carousel views.
- A live preview pane with real document, Google Doc, Google Sheet, image, and a fully interactive HTML app rendered inline.
- Figma-style live presence + collaborator cursors in the preview.
- Per-folder agents **by source** — a global **Gemini agent** and folder-scoped **Claude agents** — with a roster, task assignment, and a record of completed tasks.
- Right-click any folder → **"New agent in this folder…"** spawns an agent scoped to that folder (organize / draft-files presets); folders with agents show a provider mark.
- **Cover slides**: right-click any item → "Set as cover" promotes it to the folder's face (per-folder; a live-rendered `index.html` web app can be the cover). Sharing a folder opens a dialog where recipients land on the cover, with a full-bleed **"Preview as recipient"** view.
- A right-hand activity panel ("who did what", every event attributed to a human or an agent with its provider mark) with a vertical **time-machine** scrubber — scrub back and **Restore this version** to actually revert, logged as a new history event with the undone changes kept visible as struck-through history.

Open `index.html` (identical to `drive.html`) — no build step.
