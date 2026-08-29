## Context

See `proposal.md` for motivation. The current Oiac IA page renders `OiacIaChat` as a two-column screen: a fixed conversation sidebar and a single main chat panel. Conversations are backend documents, messages are loaded by document id, and uploaded PDFs create backend releases. Existing services already know how to list releases for a document and releases expose `file_path`.

## Goals / Non-Goals

**Goals:**
- Keep the existing conversation sidebar and chat behavior intact.
- Add a document viewing panel for the selected conversation without introducing a new backend contract unless implementation proves the current release/file proxy path is insufficient.
- Render PDFs with `react-pdf` and provide first-party controls for page navigation and zoom.
- Use a desktop split where the document panel and chat panel each occupy about half of the selected conversation workspace.

**Non-Goals:**
- Add PDF annotation, text selection synchronization, page citations, or AI answer highlighting.
- Add PDF text search or keyword highlighting.
- Change message APIs, upload semantics, or the definition of standalone Oiac IA conversations.
- Persist PDF bytes in browser storage.
- Support mobile or small-screen layouts for this workspace.

## Decisions

1. Rework only the selected conversation workspace inside `OiacIaChat`.

   Keep the outer sidebar/main structure because the conversation list is already stable and independent of document preview. The main area should become a nested workspace: top header, then document/chat content, then the chat composer attached to the chat side.

   Alternative considered: create a new dedicated route for "chat PDF" and leave Oiac IA unchanged. That would duplicate conversation state and make the Documentos handoff less direct.

2. Drive the document preview from the selected backend document id and its latest/preferred release.

   When a conversation is selected, load its releases using the existing release-listing behavior. Prefer an explicit `releaseId` route parameter when present from Documentos; otherwise use the newest available release. The preview source should be a proxied backend URL derived from the release `file_path` or an equivalent existing file-serving path.

   Alternative considered: preview the original uploaded `File` object. That only works immediately after upload and fails for restored conversations or Documentos handoff.

3. Render the document with `react-pdf` instead of a browser-native iframe.

   Use `react-pdf` to render the selected release PDF and build a compact Lumina-styled toolbar for previous/next page, current page, total pages, zoom out, zoom in, and reset/fit behavior if practical. Configure the PDF.js worker in the same client module that renders the `Document`/`Page` components, following `react-pdf`'s Next.js guidance.

   Alternative considered: use `@react-pdf-viewer/default-layout`, which includes search and zoom out of the box, but its commercial licensing is not ideal for this project decision. Another alternative was iframe/object preview, but that would not give reliable custom controls.

4. Exclude text search from the first implementation.

   `react-pdf` can expose text layers, but a polished search experience would require extracting page text, indexing matches, navigating results, and highlighting occurrences across zoom/page changes. That work is intentionally out of scope so the first version focuses on reading, page navigation, and zoom.

   Alternative considered: implement search now. That increases complexity without being required for the current desktop split.

5. Use a desktop-only split layout.

   Render document and chat as two equal `minmax(0, 1fr)` columns inside the selected conversation workspace. The implementation should ensure the fixed application shell and both panels fit the intended desktop viewport without horizontal overflow.

   Alternative considered: add responsive stacking or a compact mobile toggle. That is unnecessary for this change because the workflow is explicitly desktop-only.

## Risks / Trade-offs

- Backend file URL shape is not fully documented in the frontend -> Verify `file_path` can be fetched through `/api/backend/*`; if not, add a small frontend service helper around the backend's actual file-serving endpoint.
- PDF.js worker configuration can fail under Next.js if configured in the wrong module -> Configure it where `react-pdf` is rendered and verify the production build.
- Large PDFs may render slowly at high zoom -> Render only the active page initially and keep zoom limits reasonable.
- Loading releases for every selection adds a request -> Fetch only for the selected conversation and reset preview state when the selection changes.
- The main workspace may become visually dense -> Keep the document panel quiet and reserve strong visual emphasis for the active chat composer and messages.

## Migration Plan

1. Add `react-pdf`/PDF.js dependency and configure the worker for the Oiac IA viewer.
2. Add document preview state and release loading to Oiac IA for the selected conversation.
3. Refactor the main Oiac IA layout into a desktop document/chat workspace.
4. Preserve existing message lifecycle behavior and deletion/upload flows.
5. Validate desktop rendering, PDF navigation/zoom, selected conversation, no selection, loading, empty messages, and PDF unavailable states.
6. Rollback is limited to reverting the Oiac IA component/service changes and removing the PDF dependency because no data migration is required.
