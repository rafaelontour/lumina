## Context

See `proposal.md` for motivation. The Tipificações page already owns a complete administrator-only manual editor, but it is a large client component whose services create the hierarchy through individual typification, taxonomy, and branch operations. The backend now exposes authenticated `/tree-suggestion` sessions that accept a PDF, process asynchronously, return hierarchical suggestions and apply each item only after an explicit confirmation.

The backend uses `create` and `enrich` as session modes. These are distinct from the product-level choice between manual and document-assisted creation: manual remains the existing frontend editor, while document-assisted creation can either create a new tree or enrich an existing one. The internal backend proxy already forwards multipart request bodies and authenticated cookies.

## Goals / Non-Goals

**Goals:**

- Integrate the complete backend session lifecycle without duplicating the demonstration page's Bearer-token authentication.
- Keep the existing manual editor behavior unchanged behind a creation-mode choice.
- Make partial, immediate application of confirmed items understandable before mutations occur.
- Represent backend hierarchy and status as canonical rather than reconstructing applied state locally.
- Keep asynchronous processing usable across navigation within the page and across later visits through backend session restoration.

**Non-Goals:**

- Reimplement document interpretation or suggestion generation in the frontend.
- Add browser persistence for PDFs, sessions, review state, or credentials.
- Add a processing-cancellation action or session deletion without corresponding backend operations.
- Make session confirmation atomic or implement rollback for previously confirmed items.
- Change backend role authorization in this frontend change.
- Replace or simplify the existing manual creation, editing, or deletion flows.

## Decisions

### Add a mode chooser before opening either creation experience

The existing “Nova tipificação” action will first present “Criar manualmente” and “Gerar a partir de documento”. The manual choice opens the current form unchanged. The document choice opens a dedicated assistant rather than adding upload controls to the manual form.

Mixing both models in one form was rejected because manual drafts are submitted as a composed hierarchy, whereas document sessions are backend-owned, asynchronous and incrementally applied during review.

### Isolate the document workflow in dedicated components

The page will continue to own the canonical typification list and access-level decision, but document upload, session navigation and review will live in dedicated components. This avoids increasing the already large route component and keeps polling and mutation state separate from manual draft state.

Closing the document experience will not cancel backend processing. Reopening it reloads the session list and selected detail from the backend.

The typification card exposes an “Enriquecer” shortcut beside its taxonomy count. Its information icon is inside the same button, and the button tooltip explains that a PDF can suggest new elements or complements, keeping the help text visually and interactively attached to the action. The shortcut opens the same document-assisted workspace with `enrich` selected and the card's persistent typification id preselected, while the general “Gerar a partir de documento” entry continues to default to creating a new tree.

### Model the published session contract explicitly

New frontend types will cover session modes and statuses, item kinds, create/update operations, item statuses, evidence, excluded rules, target snapshots and confirmation edits. Service operations will preserve the project's tuple-style results and normalized errors for:

- creating a multipart session with an optional `typification_id`;
- listing sessions;
- reading one session detail;
- confirming one item with an optional edited title and description;
- discarding one item;
- discarding all pending items.

All calls use `/api/backend/*` with the backend-managed `HttpOnly` cookie. The standalone demo's `/auth/token` flow and visible Bearer token will not be copied.

### Treat backend sessions as the source of truth

The client may cache the selected detail in memory for responsiveness, but it reloads canonical detail after every confirmation or discard and obtains sessions again when the experience is opened. No session or review state is written to `localStorage`, IndexedDB or cookies.

Only the selected `processing` session polls, initially at the backend demonstration's three-second cadence. `ready`, `failed` and `completed` stop polling. A request failure stops the current polling cycle and exposes a retry rather than spinning indefinitely.

The previous-session list uses separate `Pendentes` and `Concluídas` tabs. The pending tab contains every session that is not `completed`, including `processing`, `ready` and `failed`, while the completed tab contains only `completed` sessions. Each tab preserves the backend order so the interface does not invent a secondary sort.

### Derive hierarchy from relationships instead of item order alone

The review tree will use `parent_item_id` for suggestions whose parent is also proposed and `parent_entity_id` for additions under an existing entity. `position` orders siblings. Kind-specific root groups can improve scanning, but must not overwrite the returned parent relationships.

A pending child whose `parent_item_id` is not confirmed will have confirmation disabled. The backend remains authoritative and any conflict response triggers a detail reload.

### Make every applied mutation explicit and reconcile both views

Confirm and discard controls require deliberate activation and disable duplicate requests. Destructive discard actions use confirmation. Before confirmation, the interface states that a successful confirmation immediately changes the real tree and is not rolled back when the remaining review is abandoned.

After successful confirmation, the client reloads both the session detail and the main typification list. This ensures existing cards, totals and enrichment target options reflect the backend's canonical tree. Discard reloads session detail but does not need to reload typifications because it creates no tree mutation.

### Reuse the safe rich-text presentation boundary

Identifiers, filenames, statuses and titles remain literal. Descriptive backend content such as proposed descriptions, rationales, evidence quotations and excluded-rule quotations will use the shared safe rich-text presentation where formatting is useful, without enabling raw HTML.

### Keep upload validation conservative

The file control accepts PDF and the client rejects an absent or clearly non-PDF selection. No client-side size ceiling will be invented because the published contract does not declare one; backend validation and its normalized error remain authoritative.

## Risks / Trade-offs

- **[Confirmed items leave a partially applied tree if review stops]** -> explain incremental application before confirmation and persist visible confirmed status through canonical session reloads.
- **[A stale session detail enables an invalid child action]** -> disable known invalid actions locally and reload detail after every backend conflict or mutation.
- **[Long AI output or many suggestions overwhelm a modal]** -> use a bounded, responsive workspace with independent session navigation and review scrolling, and collapse detailed evidence by default where appropriate.
- **[Polling continues after changing sessions or closing the experience]** -> bind one cancellable polling effect to the selected session id and visible experience.
- **[A backend session references a deleted enrichment target]** -> keep the session readable, show the returned identifier/name fallback and let backend errors govern further confirmation.
- **[The backend returns an internal file path]** -> do not expose `file_path`; use the original filename as the user-facing document identity.
- **[The current typification parser ignores sources]** -> model and display source suggestions inside review while allowing the existing browser to continue focusing on tipifications, taxonomies and branches.

## Migration Plan

1. Add typed tuple-style services for the published suggestion endpoints.
2. Add the creation-mode chooser while routing the manual choice to the unchanged existing form.
3. Add document upload and session list/detail restoration for administrators.
4. Add terminal-state polling and the hierarchical read-only review presentation.
5. Add explicit confirmation, editing and discard actions with canonical reconciliation.
6. Verify create and enrich sessions against the published backend using an administrator test account.

Rollback removes the document-assisted entry and components while leaving backend sessions and all already confirmed tree entities intact. The manual editor remains available throughout; no frontend data migration is required.
