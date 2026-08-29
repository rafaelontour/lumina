## Context

See [proposal.md](proposal.md). The backend exposes an asynchronous ABNT flow: `POST /abnt/{docId}/conformidade` accepts one multipart PDF and returns a processing acceptance; `GET` returns a `count` and a collection of executions with common processing fields and an optional object report. The frontend already has the equivalent document-target discovery, stored-PDF retrieval, polling, history, notification, and page-memory-cache patterns in the Template workspace. The ABNT route currently renders only `PaginaEmConstrucao`.

## Goals / Non-Goals

**Goals:**

- Make the ABNT backend capability usable through an explicit, authenticated workspace flow over documents uploaded by the current user.
- Preserve the backend document UUID as the analysis handoff identifier and retrieve the already stored release PDF only when starting an analysis.
- Give the result panel a stable lifecycle regardless of whether the API has not materialized a result yet, is processing one, returns a terminal failure, or returns a completed report.
- Keep the desktop selector stationary while a long ABNT report scrolls independently in the result panel.

**Non-Goals:**

- Change PDF upload, release creation, template conformity, or the main IA analysis.
- Persist ABNT reports, status, or history in browser storage.
- Infer ABNT compliance client-side or alter the backend's report content.
- Define a backend report schema beyond the OpenAPI contract's optional object.

## Decisions

- Add ABNT-specific tuple-style service operations for start, latest result, and history, sharing the existing protected-request and document-target helpers. The response collection will be validated and ordered by `updated_at` with `created_at` as fallback. When a user has not started an ABNT analysis during the current page visit, the primary view will select the most recent terminal result so an abandoned processing record does not hide a persisted report; a user-started processing result keeps priority for its active lifecycle. A singleton-result contract is rejected because the backend explicitly returns history.

- Retrieve the release PDF immediately before an explicit start and send it as multipart `file` to the selected target's persistent `projectDocumentId`. The selector is populated only from the authenticated user's eligible stored workspace documents. This preserves the canonical backend handoff and avoids a new upload or release. Sending a file as part of Documentos upload is rejected because the workflow must remain user initiated.

- Omit a template selector and template identifier entirely from the ABNT workspace. The ABNT reference is fixed in the backend, unlike the user-managed catalog used by Template conformity; surfacing an editable selection would imply a choice the API neither accepts nor supports.

- Build a dedicated `ConformidadeAbntWorkspace` rather than adding ABNT conditionals to the template component. Both share domain primitives but their reports have different shapes; a separate component prevents the template's section/criteria renderer from becoming an implicit, invalid ABNT contract.

- Use the same state-machine semantics as Template: after `202`, render processing immediately with the familiar spinning loading icon and concise status text; its motion uses the existing reduced-motion-aware styling. If an early GET is empty or 404, remain processing and poll every five seconds. Poll only the active selected target while it is processing; cancel timers and stale effects on selection change or unmount. The accepted start, completion, backend error, start failure, and request failure each produce at most one contextual Sonner notification per execution/event key.

- Keep a ref-backed in-memory map keyed by persistent document UUID for observed states. Switching back to an absent, completed, or error target restores it without a loading flash and refreshes in the background; a processing target continues polling. No `localStorage`, IndexedDB, or cookie storage is used for this cache.

- Render the known ABNT `metadata`, `summary`, and `criteria` shape in a dedicated layout: translated same-height metadata and summary blocks followed by full-width criteria cards. Retain defensive generic rendering as a fallback for a report that lacks that shape, and show the completed execution metadata with an explicit no-details state when neither layout is usable. Treating every arbitrary object as a template report is rejected because ABNT has no published nested schema.

- The History action always requests the current collection and sorts it locally by update timestamp descending. It appears in a dismissible popup and never changes the currently visible primary report, matching the established conformity interaction.

## Risks / Trade-offs

- [The ABNT report schema changes or is irregular] → Use defensive type guards and generic readable rendering; retain a completed-without-details state instead of throwing or fabricating findings.
- [The API temporarily returns 404 after start] → Keep the accepted processing state and continue polling until the result materializes or a terminal/request failure occurs.
- [A user starts multiple analyses for one document] → The primary panel and polling use the newest `updated_at` execution; the History popup exposes all returned executions.
- [Repeated polling causes duplicate notifications] → Deduplicate start, request, backend-error, and completion notices by target and result identity/status transition.
- [Long reports impair selector access] → Confine vertical report scrolling to the right-hand panel on desktop.

## Migration Plan

1. Deploy the typed ABNT service adapter and workspace with the existing backend proxy configuration.
2. Replace the ABNT placeholder route with the workspace in the same release.
3. Verify an accepted analysis, transient empty-result polling, completed report, error report, cached target restoration, and history against an authenticated backend account.
4. Roll back by restoring the placeholder route; no client-side persisted data or backend migration requires cleanup.
