## Context

See `proposal.md` for the motivation and `specs/advisee-document-monitoring/spec.md` for the behavior contract. The active `/documentos/orientandos` workspace fetches the authenticated administrator's active advisees and documents, renders a compact card grid without list-level filters, and opens a profile modal that must separate OIAC IA conversations from grouped-document monitoring.

The advisee summary endpoint provides the relationship UUID but not its creation date. The existing `GET /advisorship` operation returns `AdvisorshipPublic.created_at` and accepts `advisor_id` and `status` filters, so the date can be added without a backend contract change.

## Goals / Non-Goals

**Goals:**

- Make the initial list easy to scan by reducing each orientando to a compact card containing the circular avatar, name, email address, relationship date, and “Ver perfil”.
- Open a substantially wider, viewport-bounded profile modal that repeats the orientando identity, email address, and relationship date and separates “OIAC IA” from “Grupo de documentos” through accessible primary tabs.
- Present stored OIAC IA conversations from standalone and group documents in a read-only transcript.
- Present “Total de documentos” as the sum of every document loaded for every orientando in the current collection.
- Animate that aggregate visually from zero through every consecutive integer to its final value while preserving a stable accessible total and reduced-motion behavior.
- Separate each project's history into tabs for every document type required by its backend document group, including required types that have not received a document yet.
- Present each non-empty required-type history as a reverse-chronological vertical timeline.
- Show a clearly labeled mean analysis score for each returned document and pair its PDF with the typification result from the exact same release.
- Keep the modal and its close behavior keyboard-accessible and understandable to assistive technology.
- Preserve refresh behavior, partial-failure feedback, authorization, and read-only boundaries while removing the student and project filters.

**Non-Goals:**

- Change backend endpoint contracts or document response types.
- Add editing, analysis, conformity, archive, upload, or other mutation actions.
- Add pagination, server-side search, sorting controls, or browser persistence.
- Add document download, project navigation outside the modal, or mutation actions.
- Add evidence-to-PDF navigation or define a new backend-wide aggregate score.
- Rework the separate legacy `OrientandosWorkspace` route component.
- Add message composition, message sending, or synthetic conversation content.

## Decisions

### Keep one selected profile in component-local state

Track the selected `MonitoramentoOrientando` in component-local state. Activating “Ver perfil” selects that item and opens one modal; closing clears the selection. A successful refresh replaces the selected item with its updated counterpart or closes the modal if the orientando is no longer returned.

Persisting the selection was rejected because the modal is transient UI state and browser persistence would conflict with the workspace constraints.

### Use an accessible modal following existing workspace patterns

The existing “Ver perfil” button opens a fixed, centered dialog with a blurred backdrop, `role="dialog"`, `aria-modal="true"`, and an associated title. The modal closes through a visible button, backdrop interaction, or Escape. Opening focuses the modal title so keyboard and screen-reader users receive context immediately.

Navigation to a new route was rejected because the requested experience is explicitly modal and the required data is already loaded in memory.

### Limit the collapsed summary to avatar, name, email, relationship date, and profile action

The collapsed card will reuse `AvatarUsuario` beside the orientando's name so authenticated backend images keep using the established proxy and cookie behavior, with initials as the existing failure or absence fallback. Display `orientando.advisee.email`, already returned by `GET /advisorship/my-advisees`, with the name and a compact “Vínculo desde DD/MM/AAAA” line, followed by the separate “Ver perfil” button. The modal repeats the avatar at a larger size beside the same name, email, and relationship text. Long email addresses remain readable through safe wrapping or an equivalent full-value affordance without widening the card or modal.

Showing status distributions and multiple relationship attributes on the collapsed card was rejected because it would recreate the visual density this change is meant to reduce.

### Separate conversations from grouped-document monitoring

Add an accessible primary tab list inside the profile modal with “OIAC IA” first and selected initially, followed by “Grupo de documentos”. Keep primary-tab state local to the mounted profile modal and reset nested project and document-type selection independently so switching sections cannot mix their content.

Extend the frontend `DocumentoOrientando` representation with the optional backend `source` field. Use every document returned for the selected advisee as an OIAC IA conversation candidate because both standalone and group documents may have stored messages. For grouped-document monitoring, exclude `source === "oiac-ia-avulsa"`; include current `documentos:` sources and retain legacy documents that expose group or project metadata even without the current prefix. This source-aware split prevents standalone OIAC documents from being looked up in `GET /document-group` while preserving older grouped records.

When a conversation is selected, call the existing `listarMensagensDocumento(documentId)` service backed by `GET /doc/{id}/messages`. Cache loading, success, empty, and failure state per document for the life of the profile modal. Render saved messages from oldest to newest, classify a message as IA when one of its mentions has `type === "AI"`, and classify the remaining messages as orientando content. The transcript has no composer or mutation control and shows independent loading, empty, and error states.

### Derive a distinct project list from the selected advisee's group documents

Build the “Grupo de documentos” project collection from non-empty `projeto_nome` values in the source-aware group-document subset. Normalize duplicate names case- and accent-insensitively while preserving a readable returned label, and sort the resulting names with the `pt-BR` locale. Do not include standalone OIAC IA documents in this collection or attempt to associate them with the document-group catalog.

Fetching projects again was rejected because the workspace already has the advisee-scoped document response needed for this read-only list.

### Keep project search local to the modal

Store the search text inside the mounted modal and filter only the distinct group-document project list with the existing accent-insensitive normalization approach. Reset the search naturally when the modal unmounts. Show separate readable states for no projects and no matches.

### Use a wide master-detail layout for project documents

Increase the modal to a substantially wider desktop width, up to the same `max-w-[96rem]` scale used by the document preview while preserving viewport margins, and divide its scrollable body into a project selector on the left and a document-history panel on the right. On narrow viewports, stack both areas so the project buttons remain usable without horizontal scrolling. No project is selected initially; activating a project button marks it as selected and fills the detail panel, while the unselected state explains what to do next.

Represent each distinct project as its readable name plus the documents whose normalized `projeto_nome` matches that name. The project search filters only the selector and does not discard the current selection. This keeps the visible document history stable while the administrator refines or clears the search.

### Partition project history by required document type

Load the document-group catalog through the existing `listarGruposDocumento()` service while the profile modal is mounted. For the selected project, use the returned documents' `grupo` value to find the corresponding `GrupoDocumento` with the existing case- and accent-insensitive normalization. Build the tab list from every `items` entry of that matched group, preserving backend order, so the number of tabs represents the complete set of required types rather than only types that already have uploads.

Select the first required type initially and reset that selection when the administrator changes projects. Each tab panel filters the selected project's documents by normalized `tipo_documento`, keeps the existing reverse-chronological ordering, and renders the existing score and document-preview controls only for matching documents. A required type with no matching document remains selectable and shows only “Nenhum arquivo enviado ainda”. The tab list uses `tablist`, `tab`, `tabpanel`, `aria-selected`, and `aria-controls` semantics and may scroll horizontally when its labels do not fit.

If the catalog request fails or the project group cannot be matched, derive the tabs from the project's distinct returned `tipo_documento` values so the available history remains usable, and show non-blocking feedback that the complete required-type catalog is unavailable. This fallback cannot reveal missing required types, but it still isolates the returned documents by type and never merges their histories.

### Present returned-document history read-only

Sort the selected project's documents by `updated_at`, falling back to `created_at`, from newest to oldest. Each document summary shows the returned name, optional group and type, creation and update dates, archived state, and a release-analysis score explicitly labeled “Nota média”. The panel represents the history of documents sent and therefore omits processing status and processing-history events. Force long project names to wrap anywhere within the detail header so unbroken content cannot exceed the modal width.

Reuse the already loaded `DocumentoOrientando` data for grouping and document history. When a project is selected, load each document's releases concurrently and cache the resolved result by document id for the lifetime of the mounted profile modal. Select the newest release containing `file_path`; do not fall back to an analysis from a different release. Keep loading and failure state isolated per document so one failed request does not hide sibling cards.

Render the active required type's non-empty history as a semantic list with a relative timeline container. Indent each document card beside a circular marker and draw one absolute vertical connector behind the markers only when at least two entries exist. Bound the connector between the first and last marker centers so it creates neither a leading nor trailing segment; an empty or single-entry history has no connector. This treatment changes only presentation and preserves each card's absolute-positioned score badge and “Ver documento” action.

### Derive and label the release mean score

Flatten the selected release's normalized `check_tree` criteria and calculate the arithmetic mean using only finite numeric `evaluation.score` values. Format the result with one decimal place in the `pt-BR` locale and render it as “Nota média: N,N”. If no numeric criterion score exists, show “Sem nota”; if releases cannot be resolved, show “Nota indisponível”. Do not use `fulfilled` as a numeric substitute and do not combine scores across releases.

This client-side consolidation is necessary because the release contract exposes criterion scores but no overall score. Labeling it as a mean makes that derivation explicit to the administrator.

### Open the latest available PDF in a second modal

Each returned-document card includes a “Ver documento” button. Activating it keeps the profile modal mounted and opens a higher-layer document modal for that `DocumentoOrientando`, carrying the same newest file-bearing `ReleaseExterno` already used for its mean score. The document modal downloads that release's PDF through the authenticated `/api/backend` proxy, creates a temporary object URL, and passes it to the existing `PdfDocumentViewer` loaded dynamically with `ssr: false`.

The document-modal body uses a wide two-column layout: the PDF viewer occupies the larger left region and a separately scrollable analysis panel occupies the right. On narrow viewports the regions stack. The analysis panel renders the non-empty release `description` followed by the normalized `check_tree` hierarchy with typifications, taxonomies, criteria, classification, score, feedback, and sources. An empty tree produces a readable unavailable-analysis state and never falls back to another release.

The document modal owns loading, unavailable, and request-error states. It closes through its visible control, backdrop, or Escape; keyboard events in the top modal do not reach the profile-modal focus trap. Closing releases the object URL and restores focus to the originating button when it remains mounted. Closing the profile modal also unmounts and cleans up any open document preview.

Opening a browser tab or exposing the backend file path directly was rejected because the existing viewer and proxied blob flow preserve cookie-based authentication and keep the user in context. Adding release selection was rejected for this iteration; the newest file-bearing release is the deterministic default.

### Load relationship dates in one advisor-scoped request

Alongside the active advisee summary, request `GET /advisorship` once with the authenticated user's UUID as `advisor_id`, `ACTIVE` status, and the existing bounded page size. Match each returned `created_at` to its card through `advisorship_id`. A failed or unmatched relationship lookup does not block the list: the card shows “Data do vínculo não informada” and the workspace exposes non-blocking failure feedback.

Using `advisee.created_at` was rejected because that timestamp belongs to the user account, not the advisory relationship. Fetching each relationship individually was rejected because the filtered collection endpoint avoids an additional request per orientando.

### Remove the list filters and filter-dependent summary

Remove the student select, project search, their local state and filtering computation, and the “Exibidos” summary that depended on those controls. Keep the active-advisee total, rename “Documentos retornados” to “Total de documentos”, and calculate it with the sum of `documentos.length` across every entry in the current `monitoramento` collection. This describes the combined loaded documents of all listed orientandos and does not use a per-card backend metadata total.

### Count the aggregate document total through every integer

Keep the calculated document total as the source of truth and render it through a small local counter component. Whenever that total changes, reset the visible value to zero and use a `requestAnimationFrame` loop paced by an elapsed-time interval until the counter reaches the total. Target roughly two seconds for usual totals, keep each value visible for at least 60 milliseconds, and increment by exactly one whenever the interval elapses so the visual sequence does not skip an integer. Cancel any pending frame before restarting and when the component unmounts so refreshes cannot leave overlapping animation loops.

Use `useReducedMotion` from the existing `motion` dependency. When reduced motion is preferred, display the final total immediately and do not schedule animation frames. Keep the animated numeral hidden from assistive technology and expose a stable accessible label containing the calculated final total, preventing screen readers from announcing every intermediate number.

## Risks / Trade-offs

- [Refresh removes the orientando displayed in the modal] → Reconcile the selected UUID against refreshed monitoramento and close when it no longer exists.
- [Several documents repeat the same project name] → Deduplicate normalized names before rendering the modal list.
- [The modal project list is long] → Confine vertical overflow to the modal content area and keep its header visible.
- [The project and document panels compete for space] → Use a wider bounded modal, a narrower project column, and stack the panels on small viewports.
- [The required-type tab labels exceed the available width] → Keep the tab list horizontally scrollable without expanding the modal beyond the viewport.
- [Returned group or type labels differ only by accents or case] → Compare normalized values while displaying the backend's readable labels.
- [The document-group catalog fails or cannot be matched] → Derive isolated tabs from returned document types, keep the history usable, and show non-blocking feedback about the incomplete catalog.
- [Standalone OIAC documents trigger a false group-catalog warning] → Remove `oiac-ia-avulsa` documents from group/project resolution and reserve the catalog fallback for actual group-document records.
- [A document has no stored OIAC messages] → Keep the candidate selectable and show a conversation-specific empty state without fabricating analysis or chat content.
- [The timeline connector extends into empty space] → Render it only for multiple entries and bound it to the first and last marker centers.
- [A project name contains a very long uninterrupted segment] → Give the detail header a shrinkable width and force wrapping anywhere within that title.
- [A PDF request fails or a document has no file-bearing release] → Keep the second modal open with a readable failure state and allow it to be closed normally.
- [One document's release request fails while the project history loads] → Keep independent per-document states and preserve every successful sibling score.
- [A release contains several criterion scores] → Calculate and explicitly label the one-decimal arithmetic mean instead of presenting it as a backend-provided overall grade.
- [A newer release lacks analysis while an older release has it] → Show “Sem nota” and an unavailable-analysis state for the newer PDF; never mix versions.
- [Escape or Tab is handled by both stacked modals] → Capture keyboard interaction in the document modal so only the top layer responds while it is open.
- [Blob URLs leak across previews] → Revoke the previous object URL before replacement and during modal cleanup.
- [An advisee image is absent or cannot be loaded] → Reuse `AvatarUsuario` so the card falls back to readable initials without breaking the layout.
- [The relationship collection cannot be loaded or has no matching id] → Keep the card usable, show a readable unavailable-date fallback, and present non-blocking feedback.
- [Long names can enlarge cards] → Reuse truncation-safe layout patterns and preserve the complete name for assistive technologies or native title affordances where appropriate.
- [A long email address can exceed the identity area] → Allow safe wrapping or expose the complete value through an equivalent accessible affordance without expanding the container.
- [A very large aggregate takes longer because every integer must be visible] → Advance at most once per eligible animation frame, keep the final target available to assistive technology, and cancel stale loops when the data changes.

## Migration Plan

1. Add the primary “OIAC IA” and “Grupo de documentos” tabs and classify the selected advisee's returned documents by source without sending standalone OIAC entries to group resolution.
2. Load and cache stored messages for each selected conversation and render a read-only chronological transcript with loading, empty, and error states.
3. Build the searchable project list from group-associated documents only and partition the selected project's history into ordered tabs for every required type, preserving empty tabs and a returned-type fallback.
4. Render only the selected type's returned-document history without processing details, use “Nenhum arquivo enviado ainda” for an empty required type, and connect multiple cards as a bounded vertical timeline.
5. Preserve loading and caching of the newest file-bearing release for each document, its explicitly labeled mean criterion score, and the document modal containing the exact release's PDF and typification analysis.
6. Verify both primary tabs, conversation actor labels and states, source separation, master-detail layout, nested type tabs, empty required types, timeline, catalog fallback, and document modal across narrow and desktop viewports.
7. Reverify the sequential aggregate counter, relationship-date fallback, refresh, partial failures, authorization, read-only behavior, and strict release matching.
8. Roll back the component presentation if necessary; no persisted data, backend state, or migration cleanup is involved.
