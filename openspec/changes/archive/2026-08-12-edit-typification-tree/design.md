## Context

See `proposal.md` for motivation and the `typification-browser` delta spec for the behavior contract. The existing page displays nested typification data and already has a modal pattern plus creation-draft state. The backend requires complete record payloads for separate `PUT /typification`, `PUT /taxonomy`, and `PUT /branch` operations.

## Goals / Non-Goals

**Goals:**

- Let a user edit each record where it is displayed, without a large tree-wide form.
- Add and remove taxonomies from their typification context and branches from their taxonomy context, with explicit confirmation for persisted-data removal.
- Persist the affected record only, then reload canonical data.
- Reuse the authenticated tuple-style service pattern, normalized errors, and canonical reload policy.

**Non-Goals:**

- Editing source associations or document-group relations.
- Automatically rolling back a partial save; backend operations are not transactional.

## Decisions

### Use small, record-scoped forms

The typification card opens a compact form for its name. A taxonomy card exposes its own edit action and opens a compact title-and-description form. Selecting the taxonomy card keeps opening the existing modal, which displays its branches and their actions; every branch card can open a compact title-and-description form.

The single complete-tree editor was considered, but makes a simple change difficult to find and separates each item from the card where users already see it.

### Persist a single contextual mutation

The page validates the form in the current context, then uses one `POST`, `PUT`, or `DELETE` operation for the relevant record. Adding a taxonomy is launched from its parent typification card; adding a branch is launched from the taxonomy modal. Existing-record deletion keeps the explicit confirmation step.

The client prevents deleting the last taxonomy or last branch in its parent. Deleting an entire typification still removes branches, then taxonomies, then the root to avoid reliance on undocumented cascade behavior.

Reconciling and submitting a complete tree was considered, but creates unnecessary writes and makes partial multi-record failures more likely.

### Confirm destructive actions separately

Removing a saved branch or taxonomy asks for confirmation before calling the backend. Deleting a typification uses a separate confirmation dialog and deletes its branches, then taxonomies, then the typification itself. Canceling either confirmation does not alter the backend.

Immediate deletion from an edit control was considered, but makes a mistaken click destructive before the user can review the complete tree.

### Refresh canonical data after either outcome

After success or failure, the form closes or resets and the page reloads typifications. If a taxonomy modal remains open, it is refreshed from canonical data or closes if its taxonomy no longer exists.

Optimistic in-place reconciliation was considered, but increases the risk of showing a mixed local/server tree after a multi-request failure.

## Risks / Trade-offs

- A later nested write can fail after an earlier create, update, or delete succeeded → Stop further requests, report the normalized failure, and reload the backend tree.
- A form can be outdated if another user edits the same tree → Reload after save or failure; the backend has no versioning field in the available API contract.
- Editing a large tree requires several sequential requests → Disable the form while saving and provide lifecycle feedback.
- Deleting a parent with nested records can depend on backend cascade rules → Explicitly delete children before parents.

## Migration Plan

Deploy the edit dialog and CRUD service operations without migration. Rollback removes the edit action and client write calls; records already changed or removed in the backend cannot be restored automatically.
