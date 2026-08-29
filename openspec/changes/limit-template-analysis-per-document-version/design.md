## Context

See proposal.md for motivation. Template conformity currently treats all executions for a persistent project-document UUID as one undifferentiated history and enables a new start whenever the visible result is not processing. The ABNT workspace already scopes its eligibility to the selected release version by comparing execution and release timestamps.

## Goals / Non-Goals

**Goals:**

- Apply the same release-version eligibility model to template conformity.
- Surface the analyzed state in the document selector with the established ABNT badge treatment.
- Preserve the in-memory result cache and polling behavior.
- Notify the user reliably when an analysis they started concludes.

**Non-Goals:**

- Delete or alter existing template-conformity executions.
- Change the backend endpoint contract or add browser persistence.
- Notify merely because a historic completed result is opened.

## Decisions

### Scope executions to the selected release version

The template result collection will be associated with the selected release by its returned file path when available, falling back to its upload timestamp. Any execution for that version, including an error, consumes its one allowed attempt. A newly uploaded release resets eligibility because it has a later upload timestamp once its main analysis is ready; its upload does not dispatch a template or ABNT conformity request.

This matches ABNT and avoids adding a backend migration. Treating all results for the persistent document UUID as current was rejected because it blocks valid new versions or allows duplicate starts for the same version.

### Fall back to history for report display

The current-version filter is used exclusively for starting eligibility. If it returns no execution, the displayed report falls back to the latest historic result, preferably a terminal one. This preserves a completed report in the workspace even when backend timestamps cannot be matched to the selected release.

When an eligible newer execution starts while that fallback report is visible, the workspace keeps the completed report in place during polling. It tracks the new execution separately and atomically replaces the displayed report after its terminal completion.

### Preload and reuse the existing analyzed badge language

The selector will obtain only the eligibility state for all available targets during its initial loading phase, then present the same “Analisado” badge already used by ABNT. The badge reflects whether the target has a returned analysis in its history; it is intentionally separate from the current-version eligibility that controls the start action. This makes analyzed targets identifiable without an extra click while keeping the report panel inactive. The selected target obtains and displays its full result only after the person clicks it, retaining the regular refresh and polling behavior.

### Refresh pending main-analysis targets

Both conformity workspaces periodically refresh their target list only while one or more targets are marked as a new version under main analysis. This lets the badge and Template start-action eligibility change as soon as the backend reports completion, without opening a report or requiring a manual page reload.

### Identify the result being viewed in history

The reduced primary-result types retain the backend execution identifier. The history popup compares that identifier to each returned history entry and gives the matching entry a distinct surface and the “Em visualização” badge. If a just-accepted result does not yet have an identifier, the fallback comparison uses its timestamp and status.

### Keep success notifications tied to session-started executions

The workspace will retain a per-execution notification key for analyses accepted during the current session. It will emit success both when the accepted response is terminal and when polling first observes the terminal completion. Historic reports loaded during normal selection remain silent.

Using a per-document completion flag was rejected because it suppresses notifications after a new version is analyzed during the same visit.

## Risks / Trade-offs

- [Backend timestamps are absent or invalid] → retain the returned result as relevant rather than incorrectly enabling a duplicate start.
- [A new release remains under main analysis] → keep template conformity disabled until that analysis completes, while ABNT may retain its independent eligibility behavior.
- [Multiple result reads observe the same completion] → deduplicate by result timestamp or identifier for the current execution.

## Migration Plan

1. Deploy the frontend-only eligibility and notification update.
2. Verify one template execution is allowed for an existing release, then upload a new version and verify exactly one new execution becomes available.
3. Roll back by reverting the frontend changes; no stored data is migrated.
