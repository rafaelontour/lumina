## Context

See `proposal.md` for motivation and the `typification-browser` delta spec for the behavior contract. The current Tipificacoes page loads and presents the nested tree through `GET /typification`, but its service has no write operations. The backend API exposes separate authenticated creation endpoints rather than one nested payload: `POST /typification`, `POST /taxonomy`, and `POST /branch`.

## Goals / Non-Goals

**Goals:**

- Let a user compose and submit a complete typification tree from the Tipificacoes page.
- Keep the existing browse, search, summary, and taxonomy-detail interactions intact.
- Use the existing backend proxy, cookie authentication retry pattern, tuple-style service results, and Sonner lifecycle feedback.
- Present the creation entry point opposite the page title without changing the fixed application shell.

**Non-Goals:**

- Do not edit or delete existing typifications, taxonomies, or branches.
- Do not introduce source selection, document-group association, or browser persistence for a new tree.
- Do not change backend endpoints or attempt OCR/AI-generated branches.

## Decisions

### Use one modal hierarchical editor

The header action opens a dialog that holds the typification name and an editable sequence of taxonomy sections. Each taxonomy section exposes title and description fields plus an editable sequence of branch title/description fields. The client creates temporary keys for stable React rendering; no draft leaves component state before saving.

An inline editor was considered, but it would compete with the existing dense browse cards and taxonomy detail modal. A dedicated dialog lets the user finish or cancel a complete hierarchy without altering the current result list.

### Validate the complete draft before contacting the backend

The client validates a non-empty typification name, at least one taxonomy, at least one branch per taxonomy, and non-empty title/description values. It associates validation feedback with the affected field or structural section. This avoids creating a root record from a draft known to be incomplete.

Creating records opportunistically as fields are added was considered, but cancellation and removal would then require destructive backend cleanup and make partially edited drafts visible to other users.

### Persist the tree in dependency order

The service first posts `/typification` with its name and an empty `source_ids` array, then posts each taxonomy with the returned typification id and an empty `source_ids` array, then posts each taxonomy's branches with its returned taxonomy id. Empty source arrays are valid according to the current API schema and source selection is outside this change.

Submitting a single nested payload was considered, but the API contract exposes three dependent endpoints and does not define a nested creation DTO.

### Handle non-transactional failures explicitly

The endpoints do not offer a transaction for the full tree. On any failed dependent request, the client stops the remaining requests, reports the normalized error, closes or resets the draft, and reloads backend typifications before a new attempt. It does not automatically delete already-created records because cascade behavior is not specified by the API.

Automatic rollback was considered, but a failed rollback or unspecified cascade could remove previously valid data and conceal the actual backend state from the user.

### Refresh from backend after save or failure

After a complete save, and after a failed multi-step save, the page reloads the canonical list rather than constructing nested cards from optimistic local data. This guarantees that counts, search results, and taxonomy detail modal reflect the backend state.

## Risks / Trade-offs

- A network failure after a parent resource is created can leave a partial tree → Stop the sequence, show the failure, and refresh the canonical backend list.
- Large drafts produce many sequential requests → Disable duplicate submission and show one lifecycle notification for the operation.
- Required descriptions make quick entry more verbose → Keep the fields compact and clearly label their requirement.
- A refreshed list can reorder cards after creation → Rely on the backend's canonical order instead of retaining stale local ordering.

## Migration Plan

Deploy the creation dialog and service functions with no data migration. Existing trees remain browseable. Rollback removes the creation action and write calls; any trees already created remain valid backend data.
