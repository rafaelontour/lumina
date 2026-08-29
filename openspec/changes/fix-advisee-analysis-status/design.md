## Context

See proposal.md for motivation. The orientation workspace currently renders only `processing_status`, although the same backend document resource also returns an ordered history whose latest item represents the document's analysis workflow state. The API models its operational state separately and can return `FAILED` after an analysis is available.

## Goals / Non-Goals

**Goals:**

- Present a completed analysis consistently in the read-only orientation workspace.
- Preserve operational processing feedback for documents without a completed analysis.
- Keep the backend response as the sole source of truth.

**Non-Goals:**

- Repair or mutate backend processing records.
- Add analysis actions, polling, browser persistence, or document details to the advisor workspace.

## Decisions

### Derive the displayed state from both backend signals

The client will include document history in its response type and inspect its most recent entry. A latest `COMPLETED` history state takes precedence over `processing_status`, because it is the backend's explicit workflow completion record. Otherwise the interface will show a translated operational state. This avoids treating a lower-level ingestion failure as the final academic-analysis outcome.

Using only `processing_status` was rejected because its API enum has no successful terminal value. Fetching releases to infer completion was rejected because the advisor endpoint already supplies the authoritative history and additional release calls would increase the request fan-out.

### Normalize labels at the display boundary

Known history and processing values will be mapped to Portuguese labels in the workspace. Unknown values will use a safe readable fallback rather than exposing the original API token.

## Risks / Trade-offs

- [A history array is not ordered] → select the most recent entry using its timestamps rather than trusting its array position.
- [A backend introduces a new status] → retain a readable fallback and avoid marking it concluded without an explicit completed history record.
- [The backend's operational status remains `FAILED`] → the UI reports the completed analysis while preserving no unsupported claim that the file-processing record was repaired.

## Migration Plan

1. Deploy the display-only normalization with no backend schema or data migration.
2. Confirm documents with completed history and `FAILED` processing display as concluded in “Meus orientandos”.
3. Roll back by reverting the frontend status derivation; backend records remain untouched.
