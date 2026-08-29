## 1. Document Preview Data

- [x] 1.1 Add `react-pdf`/PDF.js dependency and configure the PDF.js worker in the client viewer module.
- [x] 1.2 Add Oiac IA state for release loading, selected preview release, preview URL, preview errors, page count, current page, and zoom level.
- [x] 1.3 Reuse or wrap the existing document release listing service to fetch releases for the selected conversation document id.
- [x] 1.4 Prefer the route `releaseId` when present and otherwise select the newest available release for preview.
- [x] 1.5 Derive a browser-loadable PDF URL through the internal backend proxy and provide an unavailable state when no release or file path exists.

## 2. Split Workspace UI

- [x] 2.1 Refactor the Oiac IA main content area into a document panel and chat panel while preserving the existing conversation sidebar.
- [x] 2.2 Render the document panel with `react-pdf` loading, PDF page preview, error, unavailable, and fallback-open states.
- [x] 2.3 Add embedded PDF controls for previous/next page, current page indicator, zoom out, zoom in, and reset/fit behavior where practical.
- [x] 2.4 Keep the chat header, message list, pending-response indicator, composer, upload, selection, and delete behavior working as before.
- [x] 2.5 Apply desktop layout rules so the document and chat panels use approximately equal columns without horizontal overflow in the desktop workspace.
- [x] 2.6 Refine message widths so short messages fit their content and long messages use the available line width.
- [x] 2.7 Fix the Documentos handoff to pass the external document id and preserve the selected conversation on the chat page.
- [x] 2.8 Confirm upload completion only after the backend returns document/release identifiers.
- [x] 2.9 Avoid reloading all project sections immediately after upload; queue checktree polling only after the release ID is confirmed.
- [x] 2.10 Avoid fetching external documents immediately after project creation; render the project from the successful project/project-document POST responses.
- [x] 2.11 Preserve newly queued analysis IDs when an initial workspace load finishes concurrently with an upload.

## 3. Verification

- [x] 3.1 Verify a standalone uploaded PDF conversation shows the document preview beside the chat.
- [x] 3.2 Verify a Documentos handoff with `documentId` and optional `releaseId` selects the correct conversation document and preview release.
- [x] 3.3 Verify switching conversations updates both messages and document preview.
- [x] 3.4 Verify PDF previous/next page controls and zoom controls.
- [x] 3.5 Verify no-selection, loading, empty-message, PDF-unavailable, and desktop overflow states.
- [x] 3.6 Run the project lint/build checks used by this repository.
