## Context

See [proposal.md](proposal.md). The backend's result endpoint returns a wrapper with `count` and `results`, while the current client type expects an individual result. The template catalog also returns structured template records rather than names. The workspace already represents a missing result as a non-error state and keeps the accepted-processing state while polling.

## Goals / Non-Goals

**Goals:**

- Translate the backend collection into the existing single-result UI contract.
- Preserve structured template catalog records through the service and the selector.
- Preserve the existing distinction between an absent result and a failed request.
- Select deterministic current state when a document has result history.

**Non-Goals:**

- Change PDF upload, analysis submission, backend persistence, or the main IA analysis.
- Persist result history in the browser.

## Decisions

- Validate the collection wrapper and return the item with the greatest `updated_at`; use `created_at` as a fallback timestamp. This exposes the backend's latest state without changing the workspace component contract. Choosing the first result was rejected because collection order is not a stable API contract.
- Map an empty `results` array to the same nullable value used for HTTP 404. The workspace already knows how to render that value as “nenhuma análise iniciada” and how to continue a just-accepted polling state.
- Keep malformed nonempty responses as normalized errors. Silent fallback could hide a breaking backend contract instead of making it diagnosable.
- Keep the template object's `id` as the select value because the conformity endpoint requires `template_id`; render its `name` as the human-readable label. Flattening the object to a name-only list was rejected because it loses the identifier required by the request contract.
- Expose the unnormalized result collection through a dedicated service function for the history popup while retaining the existing latest-result adapter for the primary workspace. Order history locally by `updated_at` descending, because API response order is not treated as a presentation contract.
- Restore a previously observed result from the page-memory cache when its PDF is selected, but always revalidate it with the result endpoint in the background. This avoids a stale report after a new analysis while preserving immediate feedback when navigating between PDFs.
- Translate only the known backend method-summary sentence into user-facing language. Keep all other report content intact, while replacing implementation-oriented labels with plain comparison labels.

## Risks / Trade-offs

- [Backend returns timestamps in an unexpected format] → Fall back to `created_at` and retain deterministic input order if timestamps cannot be parsed.
- [A result history contains an older completed item and a newer processing item] → The latest timestamp intentionally wins so the user sees current processing.
- [History is requested while a new result is still processing] → The popup reflects the latest response at the time it is opened; the primary workspace remains responsible for polling the current execution.
- [Reselecting PDFs adds result requests] → The cache remains the immediate visual state and only the newly selected target is queried; requests for a target that is left are cancelled.
- [Backend text changes] → Apply the friendly replacement only when the known technical summary is identified; other backend descriptions remain visible.

## Migration Plan

1. Deploy the client-side response normalizer.
2. Deploy the structured template catalog mapping with the same release.
3. Verify a selected PDF with no prior template analysis shows the empty state.
4. Roll back by restoring the prior service response mapping if the backend contract changes to a singleton.
