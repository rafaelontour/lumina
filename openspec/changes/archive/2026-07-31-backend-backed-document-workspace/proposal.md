## Why

The Documentos workspace currently stores project state in the browser, which makes the production workflow fragile across reloads, browsers, devices, and backend changes. Lumina needs the backend to be the source of truth for document projects while keeping only minimal browser-side state for UI preferences and analysis polling.

## What Changes

- **BREAKING** Remove localStorage as a supported persistence mechanism for Documentos.
- Move Documentos project, component, version, release, and analysis state to the backend using `/project`, `/project-document`, `/doc`, and `/doc/{id}/release`.
- Keep IndexedDB only as a technical queue of document ids currently awaiting analysis completion.
- Add a global analysis polling mechanism that checks queued document ids regardless of the current page and removes ids once analysis is ready.
- Keep Documentos updates scoped to the affected screen area: uploads and analysis-ready events must refresh data without replacing the whole page with a loading state.
- During upload or pending analysis, show progress only inside the affected document component, hide its action buttons until analysis is ready, and preserve the original uploaded PDF filename in the UI.
- When a document is deleted, require confirmation and remove its pending backend document ids from the analysis queue.
- Continue using cookies for lightweight browser preferences such as the collapsible sidebar and other small browser-scoped settings when needed.
- Keep the app shell fixed to the viewport so the root layout does not show a vertical scrollbar; scrolling belongs to the main content area.
- Update the Oiac IA handoff so backend document ids returned by `/doc` remain the canonical ids for messages and AI chat.
- Keep the current frontend proxy/auth pattern through `/api/backend/*`.

## Capabilities

### New Capabilities
- `analysis-polling-queue`: Browser-local pending analysis document id queue and global polling behavior.

### Modified Capabilities
- `document-workspace`: Documentos persistence and workflow move from browser project storage to backend-backed projects, project documents, docs, and releases.
- `app-shell`: Browser-side persistence is constrained to cookies for lightweight preferences, not localStorage.
- `oiac-ia-chat`: Handoff from Documentos uses the backend document id as the canonical message conversation id.

## Impact

- Affected UI: `app/(paginas)/documentos/page.tsx`, global shell/provider components, Oiac IA handoff links, root layout overflow behavior.
- Affected services/types: document project services, backend document/release services, pending analysis polling utilities, Oiac IA URL parameter handling.
- Affected browser storage: remove localStorage usage for Documentos and avoid localStorage for preferences; IndexedDB stores only pending analysis doc ids.
- Affected backend APIs: `/project`, `/project-document`, `/doc`, `/doc/by-project-document/{project_document_id}`, `/doc/{doc_id}/release`, `/doc/{doc_id}/messages`, `/doc/{doc_id}/message/ai`.
