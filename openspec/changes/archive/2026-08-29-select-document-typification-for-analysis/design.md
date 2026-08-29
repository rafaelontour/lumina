## Context

See [proposal.md](../proposal.md). Documentos currently creates the external document immediately after a file input change and selects a typification automatically. The initial Oiac IA result receives the actual applied typifications through the release `check_tree`, but does not distinguish them as the analysis reference before its detailed tree.

## Goals / Non-Goals

**Goals:**

- Collect an explicit typification choice after selecting a component PDF and before any upload mutation.
- Associate exactly that selection with the external document created for the upload.
- Make the typification returned by the completed release immediately visible in Oiac IA.

**Non-Goals:**

- Altering project-creation associations, existing releases, or a completed analysis.
- Changing the conversation-avulsa upload flow.
- Persisting a pending file or selection in browser storage.

## Decisions

### Confirm selection in a transient upload dialog

After a user chooses a PDF, Documentos will retain the file only in component state and open an accessible dialog with the available typifications. Confirmation is disabled until the selected id is valid; cancelling clears the transient file and causes no backend request. This preserves the existing per-component upload action while preventing an implicit analysis choice.

### Use the selected id directly

The existing external-document creation request already supports one typification id. The upload flow will pass the dialog selection directly rather than applying matching heuristics. The automatic helper remains available for unrelated project setup behavior but is not used for component PDF uploads.

### Identify types from the completed release analysis

Oiac IA will display the names normalized from `check_tree`, rather than a query parameter or browser state. This identifies the type actually used by the backend and remains accurate after reload or a Documentos-to-Oiac handoff. The names appear only in that prominent identification block, rather than being repeated in the detailed taxonomy tree.

### Compact initial-analysis summary headings

The initial release description will recognize the headings “Apresentação da IA”, “Apresentação da análise”, “Pontos atendidos”, “Pontos a aprimorar”, and “Orientação final”. It will render them as compact bold labels, with positive emphasis for attended points, orange attention emphasis for points to improve in both themes, and a clear closing emphasis for the final orientation. Blank summary lines do not create empty paragraph spacing, keeping these sections visually close together.

## Risks / Trade-offs

- [The typification list fails to load] → Keep confirmation unavailable and show a readable retryable error; make no upload request.
- [The user cancels after choosing a file] → Clear the in-memory pending upload; require a fresh file selection.
- [An older release has no `check_tree`] → Do not infer or display an applied typification before an analysis exists.

## Migration Plan

The change affects only future component uploads. Existing documents and releases retain their backend associations; Oiac IA identifies typifications only when the selected release returns a completed analysis tree.
