## Context

See `proposal.md` for motivation. The current Documentos page stores projects and versions in the browser, while the production API already exposes backend project and document relationships:

```text
/project
  -> /project-document/by-project/{project_id}
    -> /doc/by-project-document/{project_document_id}
      -> /doc/{doc_id}/release
```

`DocumentCreate` accepts `project_document_id`, and Oiac IA message APIs already use the backend document id through `/doc/{doc_id}/messages` and `/doc/{doc_id}/message/ai`.

## Goals / Non-Goals

**Goals:**
- Make backend data the source of truth for Documentos.
- Remove `localStorage` from Documentos and shell preference persistence.
- Restrict IndexedDB to a set of pending backend document ids used by global analysis polling.
- Keep the user notified in the current browser when a queued document analysis becomes ready.
- Preserve existing backend proxy and demo login retry behavior.
- Keep the initial implementation scoped to behavior migration before broader UI decomposition.

**Non-Goals:**
- Add backend notification endpoints, server-sent events, or websocket delivery.
- Persist unread notification state across devices.
- Store project snapshots, release data, or analysis results in IndexedDB.
- Redesign Oiac IA conversations beyond using the canonical backend document id for handoff.

## Decisions

### Backend project model drives Documentos

Use backend entities directly:

```text
Project
  id
  name
  document_group_id

ProjectDocument
  id
  project_id
  name
  type?
  typification_ids?

Document
  id
  project_document_id
  typifications
  source

Release
  id
  check_tree
```

Creating a workspace becomes:

1. Create `/project` with the chosen title and `document_group_id`.
2. Create one `/project-document` for each selected document group item.
3. Uploading a PDF creates or reuses `/doc` linked with `project_document_id`.
4. Upload the PDF to `/doc/{doc_id}/release`.

Alternative considered: keep the current local project model and synchronize later. Rejected because it preserves two sources of truth and does not solve production reload/device consistency.

### Render state is derived from backend responses

The Documentos UI should reconstruct cards and status from backend projects, project documents, linked documents, and releases. Component status is derived from the latest relevant release and whether any release has a non-empty `check_tree`.

Alternative considered: store a denormalized UI model in IndexedDB. Rejected because the user explicitly wants only pending document ids in IndexedDB.

### Documentos refreshes are scoped after initial load

The first Documentos load may show the page-level loading state. Later refreshes caused by uploads, deletion, or analysis-ready events should fetch fresh backend data in the background and update the rendered workspace without replacing the whole page with a loading placeholder. This keeps the current document list mounted and avoids visual jumps while still making the backend the source of truth.

### Pending component UX is local to the component

Upload and analysis waiting states are per project-document component. When a single component is uploading or waiting for analysis, only that component hides its action controls and displays a friendly progress animation. Other document components remain interactive. Uploaded files are displayed using the original filename sent by the user, not generated ids or timestamp-prefixed labels.

### IndexedDB stores only pending document ids

Create a small pending analysis queue whose records are only backend document ids. The queue is operational state, not product state.

```text
pending-analysis-doc-ids
  key: docId
  value: docId
```

When a release upload returns without `check_tree`, add the document id. When polling finds `check_tree`, delete the document id.

When a project document is explicitly deleted, collect its linked backend document ids and remove those ids from the pending queue before or alongside the backend deletion, so polling stops for deleted documents in the current browser.

Alternative considered: use memory-only React state. Rejected for this change because the desired behavior benefits from surviving page refresh in the same browser. Alternative considered: use `localStorage`. Rejected because the architecture forbids localStorage.

### Global poller lives outside DocumentosPage

The poller should mount under the application shell/provider layer so it continues while the user navigates between feature pages. It reads the IndexedDB id set, polls `/doc/{doc_id}/release`, deletes completed ids, and raises a global notification.

Alternative considered: keep polling in DocumentosPage. Rejected because the user must be notified even when another page is active.

### Cookies are the only persistent shell preference store

The sidebar cookie remains valid. Any persistent shell preference must use cookies or be intentionally session-only. Because `next-themes` normally persists via localStorage, implementation must either configure it to avoid localStorage or replace persistence with cookie-backed behavior.

Alternative considered: allow `next-themes` localStorage for theme only. Rejected because the agreed rule is no localStorage.

### Root layout does not scroll

The application shell owns the viewport height. `html` and `body` should not create their own vertical scrolling context; only the main content area should scroll. This prevents duplicate scrollbars and layout movement outside the active page content.

### Oiac IA handoff uses backend document id

The backend document id returned by `/doc` is the canonical id for message loading and AI message submission. `projectId`, `projectDocumentId`, and `releaseId` can remain optional URL context, but they cannot replace the document id for chat.

## Risks / Trade-offs

- Backend fan-out on page load can create many requests -> Mitigate with scoped loading, batching helpers, and conservative parallelism.
- The API lacks an explicit `document_group_item_id` on `ProjectDocumentPublic` -> Mitigate by using project document name/type from group items and typification mapping; revisit backend contract if exact item identity becomes required.
- Polling can continue forever for deleted or failed documents -> Mitigate with explicit handling for 404/403, removal of deleted document ids from the queue, and a bounded error policy during implementation.
- Cookie-backed theme persistence may be less convenient than `next-themes` defaults -> Mitigate by keeping theme behavior simple and validating hydration.

## Migration Plan

1. Add backend project/project-document service methods and types.
2. Add the pending analysis id queue backed by IndexedDB.
3. Add the global polling provider and notification UI.
4. Refactor Documentos data loading and creation to backend APIs.
5. Refactor upload flow to link docs to `project_document_id`, queue only pending `docId`s, and derive status from releases.
6. Refine Documentos UX so upload and polling refresh only the affected workspace state, while per-component controls remain hidden until analysis is ready.
7. Remove Documentos localStorage and project-state IndexedDB usage.
8. Remove shell/theme localStorage persistence and keep root layout overflow constrained to the app shell.
9. Validate with lint/build and manual backend-backed flows.

Rollback: the change is frontend-only. Reverting the branch restores the previous browser-backed Documentos behavior. No backend data migration is required.
