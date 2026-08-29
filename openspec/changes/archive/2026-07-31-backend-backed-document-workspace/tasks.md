## 1. Preparation

- [x] 1.1 Read the relevant Next.js 16 App Router documentation in `node_modules/next/dist/docs/` before editing application code.
- [x] 1.2 Review current `DocumentosPage`, document services, Oiac IA handoff, theme provider, and shell storage usage.

## 2. Backend Models and Services

- [x] 2.1 Add TypeScript types for backend projects, project documents, linked backend documents, and backend release-derived workspace rows.
- [x] 2.2 Add service methods for `/project`, `/project/{id}`, `/project-document`, `/project-document/by-project/{id}`, and `/doc/by-project-document/{id}` with existing auth retry/error conventions.
- [x] 2.3 Extend backend document creation to accept `project_document_id` and keep backend `doc.id` as the canonical analysis/chat id.
- [x] 2.4 Add a workspace loading helper that reconstructs Documentos from backend projects, project documents, linked docs, and releases.

## 3. Pending Analysis Queue

- [x] 3.1 Add an IndexedDB utility that stores only pending backend document ids.
- [x] 3.2 Add functions to list, add, and remove pending analysis document ids without storing project, release, or status payloads.
- [x] 3.3 Add tests or focused validation hooks for duplicate id handling and completed id removal.

## 4. Global Analysis Polling

- [x] 4.1 Add a global analysis polling provider mounted under the app shell.
- [x] 4.2 Poll queued document ids through backend release checks and remove ids when any release has a non-empty `check_tree`.
- [x] 4.3 Add a global notification/toast when a queued document analysis becomes ready.
- [x] 4.4 Handle missing/deleted documents or repeated polling errors with a bounded queue policy.

## 5. Documentos Backend Migration

- [x] 5.1 Replace local project hydration with backend workspace loading.
- [x] 5.2 Replace document creation with `/project` plus `/project-document` records for selected document group items.
- [x] 5.3 Replace component upload state with create-or-reuse backend `/doc` linked by `project_document_id`, then upload release to `/doc/{id}/release`.
- [x] 5.4 Queue only the backend `doc.id` when the uploaded release has no non-empty `check_tree`.
- [x] 5.5 Derive displayed component status and available Oiac IA links from backend docs and releases.
- [x] 5.6 Remove Documentos localStorage usage and remove IndexedDB project-state storage.
- [x] 5.7 Keep post-initial Documentos refreshes partial so upload and analysis-ready updates do not replace the whole page with a loading state.
- [x] 5.8 Scope upload/pending-analysis UX to the affected component, hide that component's buttons while pending, and keep other components interactive.
- [x] 5.9 Preserve the original uploaded PDF filename in the displayed document version.
- [x] 5.10 Add delete confirmation and remove deleted document ids from the pending analysis queue.

## 6. Shell Preferences and Oiac IA

- [x] 6.1 Ensure shell preferences persist only through cookies or remain session-only.
- [x] 6.2 Remove or replace any theme persistence that writes to localStorage.
- [x] 6.3 Update Oiac IA route handling so `documentId` or `externalDocumentId` maps to the backend document id used for messages.
- [x] 6.4 Update Documentos handoff links to pass backend `doc.id` as the canonical chat id and keep other ids as optional context.
- [x] 6.5 Prevent vertical scrolling on the root layout while preserving scrolling in the main content area.
- [x] 6.6 Keep destructive modal actions legible in light and dark themes.

## 7. Verification

- [x] 7.1 Run `rg "localStorage|lumina-projects|lumina-pending-analysis" app` and confirm no forbidden Documentos or shell localStorage usage remains.
- [x] 7.2 Run lint/build checks available for the project.
- [x] 7.3 Manually validate creating a project, uploading a PDF, queued polling, ready notification, reload restoration from backend, and Oiac IA handoff.
- [x] 7.4 Run `openspec validate backend-backed-document-workspace --strict` and fix any proposal/spec validation issues.
