## Context

See `proposal.md` for motivation. The “Meus orientandos” workspace already receives `advisorship_id` in every `AdviseeCardPublic`, and the published backend exposes authenticated `DELETE /advisorship/{advisorship_id}`. The monitoring page keeps its rendered collection in component state and derives the orientando and document totals from that collection.

The main capability currently describes academic monitoring as read-only. This change preserves that boundary for user accounts and all academic content while introducing one explicit mutation of the relationship itself.

## Goals / Non-Goals

**Goals:**

- Make relationship removal available directly on the corresponding advisee card.
- Prevent accidental or duplicate destructive requests.
- Reconcile the card grid, selected profile, warnings, failures, and derived totals after success.
- Provide fast local discovery by advisee name or email without another backend request.
- Keep search and both summary cards in one compact layout region.
- Preserve the existing tuple-style service and normalized Portuguese error conventions.

**Non-Goals:**

- Delete or deactivate the advisee's user account.
- Delete projects, documents, releases, analyses, or conversations.
- Add bulk removal, undo, relationship history, or a new backend operation.
- Change who the backend authorizes to remove a relationship.

## Decisions

### Delete the relationship identified by the card

Add a tuple-style `removerVinculoOrientacao(advisorshipId)` service that calls `DELETE /advisorship/{advisorship_id}` through `/api/backend/*` with the backend-managed cookie. The UI uses the `advisorship_id` already returned in the selected card rather than deriving a relationship from user ids. This prevents ambiguity when one person has multiple roles or project-specific relationships.

Updating the relationship to `CANCELLED` was considered, but the user asked for the backend's explicit remove operation and the published contract names the `DELETE` endpoint “Remover vínculo de orientação”. The frontend does not infer account deletion from that operation.

### Confirm before the request and scope pending state to one relationship

The card action first presents an explicit confirmation containing the advisee name and stating that only the link is removed. Cancelling is side-effect free. While a confirmed request is pending, the affected card shows progress and its “Ver perfil” and removal actions are disabled; other cards remain usable.

A page-wide loading state was rejected because it would unnecessarily block monitoring of unrelated advisees. A relationship id in component state is sufficient to prevent duplicate submission and represent the single in-flight destructive action.

### Remove local monitoring data only after backend success

On success, remove the matching item from both the rendered collection and its ref, clear a matching selected profile if necessary, discard warnings scoped to the removed advisee, and let the existing derived values recalculate from the new collection. Show one success notification. A later explicit refresh remains authoritative.

Optimistic removal was rejected because a failed destructive request would briefly misrepresent the active relationship. On failure, preserve all data, clear pending state, and show the normalized service error.

### Filter a derived card collection without changing totals

Keep the complete backend-loaded `monitoramento` collection canonical and add only a local search string. Derive the visible collection with `useMemo`, matching normalized advisee name or email. Reuse the existing accent-insensitive normalization helper and render a dedicated no-results state when the canonical collection is non-empty but the derived collection is empty.

The “Orientandos ativos” and “Total de documentos” values remain derived from the complete canonical collection. Changing totals while typing was rejected because those cards describe the advisor's overall monitoring state rather than the current search subset.

Place the two existing summary cards and the search field in one responsive grid container. Wide layouts use one row with two compact summaries and a flexible search column; narrow layouts may wrap to preserve input and text legibility without horizontal overflow. A separate search section was rejected because the user requested that the control remain beside the quantities.

## Risks / Trade-offs

- [A stale card references a relationship already removed elsewhere] → Treat the backend response as authoritative, retain the card on failure, and let refresh reconcile external changes.
- [The advisor confuses relationship removal with account deletion] → State the scope in the confirmation and success feedback.
- [Removing a main relationship affects the advisee's next startup] → Preserve the backend relationship semantics; the existing advisor-onboarding check handles accounts without an active main advisor.
- [A profile modal is open for the relationship being removed] → Close that profile after successful removal so stale details are not left visible.
- [A removal changes the collection while a search is active] → Recompute the derived visible cards from the updated canonical collection and keep the search term intact.

## Migration Plan

1. Add the authenticated orientation service operation.
2. Add local name/email search beside the existing summary cards and derive the visible card collection.
3. Add the card action, confirmation, per-card pending state, and success/error reconciliation.
4. Verify search, no-results and responsive layout plus removal, cancellation, backend failure, repeated activation prevention, totals, and empty state.

Rollback removes the frontend action and service function. No data migration or backend rollback is required.
