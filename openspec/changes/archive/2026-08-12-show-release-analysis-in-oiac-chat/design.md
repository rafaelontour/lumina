## Context

See `proposal.md` for motivation and `specs/oiac-ia-chat/spec.md` for the behavior contract. `OiacIaChat` currently loads saved messages from the document message endpoint and independently resolves releases for the PDF preview. `ReleaseExterno` exposes `description` and `check_tree`, but `check_tree` is currently typed as `unknown[]` and the chat only renders saved message records.

## Goals / Non-Goals

**Goals:**

- Resolve the selected release metadata for the conversation, present a processing response while its analysis is pending, and replace it with the complete analysis as the first Oiac IA response.
- Render all evaluated typifications, taxonomies, branches, sources, evaluation statuses, scores, and feedback in the selected release's `check_tree`.
- Keep the existing preview, message history, message submission, conversation selection, and Documentos handoff behavior intact.
- Preserve summary headings and paragraphs without interpreting arbitrary HTML from the backend.
- Poll only the release selected for the current conversation until its `check_tree` is available or the selection changes.

**Non-Goals:**

- Edit the release analysis or persist any part of it as a document message.
- Change the release selection rule, message endpoints, or PDF preview behavior.
- Expose UUIDs, null group identifiers, timestamps, or other backend-only fields as analysis content.
- Add a general-purpose Markdown renderer or a new dependency.

## Decisions

### Resolve the complete analysis from the selected release

The analysis source is the same release selected for the conversation context: use the release id supplied by the Documentos handoff when present; otherwise use the current release selection rule. `check_tree` is the completion signal and the source of detailed analysis. A non-empty `description` is an optional summary, not a prerequisite for rendering the tree.

The metadata lookup must still occur when the handoff provides a `filePath`, because the file path alone does not contain `description` or `check_tree`.

Alternative considered: select any release with analysis when the preferred release has none. This could show an analysis for a different PDF than the one being previewed, so it is rejected.

### Normalize the backend tree into explicit frontend types

Replace the `unknown[]` release field with TypeScript types that model a check-tree typification, taxonomy, branch, source, and branch evaluation. Normalize nullable or absent arrays to empty arrays at the presentation boundary so the tree can render partial backend results without runtime type assertions spread through the UI.

Alternative considered: traverse `unknown` values directly in JSX. This would make backend shape changes fail silently and prevents TypeScript from protecting the presentation contract.

### Compose a client-only complete analysis response

Model the release analysis as a distinct presentation-only chat item containing the optional summary and complete normalized tree. Compose it before chronologically ordered saved messages. It must not enter the persisted message state or invoke the message APIs.

Alternative considered: synthesize regular `MensagemDocumento` records for tree nodes. This would blur the distinction between backend history and derived release metadata, create arbitrary timestamps, and risk accidental persistence.

### Render a readable, complete hierarchy

Render the tree in its backend order: typification, taxonomy, then branch. For each branch, display its title and description plus the evaluation's fulfilled state, numeric score, and feedback. Render associated sources by name and description where available. Use text and semantic status styling rather than raw JSON or internal IDs.

Alternative considered: provide the raw JSON in a code block. It technically exposes the data but is not a usable analysis interface and includes implementation identifiers irrelevant to the user.

### Keep analysis loading non-blocking for conversation history

Saved message loading remains independently usable when release metadata fails or the release has no analysis. Release-analysis lookup failures should not replace the existing message error or hide the saved history; they only omit the optional opening response.

Alternative considered: make release metadata a prerequisite for rendering the chat. That would regress existing conversations when a release is unavailable while messages are still accessible.

### Poll the exact selected release while analysis is pending

When the selected release is known but its `check_tree` is empty, present a client-only Oiac IA processing item before saved messages and refresh release metadata every three seconds. Each refresh resolves the same selected release id; a handoff release id remains authoritative and polling must never substitute another release. On a non-empty tree, atomically replace the processing item with the summary and complete structured analysis.

The polling effect is cancelled when the selected document or release changes, when the component unmounts, or after the analysis completes. Transient lookup failures do not clear saved messages or create a persisted error message; the next scheduled refresh may retry.

Alternative considered: poll the document status or use a fixed timeout. The release's `check_tree` is the existing completion signal, and a timeout could report failure while a valid long-running analysis is still progressing.

Alternative considered: use a server-sent event channel. The backend exposes no event endpoint for release completion, so reusing the existing release lookup keeps the client compatible with the current API.

## Risks / Trade-offs

- Large trees can make the opening analysis long -> Preserve the scrollable chat area and group the hierarchy with clear visual separation.
- Release selection can change while asynchronous lookups are in flight -> Ignore stale results that no longer match the selected document and release context.
- Polling can remain active for a long-running backend analysis -> Scope timers to the current selection and clear them on completion, context change, and unmount.
- The backend can omit optional descriptions, sources, or evaluations -> Render available hierarchy data and omit absent optional fields without hiding other results.
- Backend check-tree fields can evolve -> Isolate data normalization in a small, typed boundary and render unrecognized optional data only after the contract is extended.

## Migration Plan

No data migration is required. Deploying the client update makes the complete presentation available for existing releases with a non-empty `check_tree`. Rollback consists of removing the derived opening response; saved messages and release data remain unchanged.
