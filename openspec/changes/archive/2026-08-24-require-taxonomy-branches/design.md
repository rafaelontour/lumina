## Context

See proposal.md for motivation. The contextual taxonomy form currently creates a taxonomy immediately after only its own title and description have been validated. A branch can therefore be added later, leaving a persisted taxonomy without any branch.

## Goals / Non-Goals

**Goals:**

- Collect the first branch with a new contextual taxonomy and validate all required values before issuing a request.
- Keep the existing edit-taxonomy and add/edit-branch flows unchanged.
- Avoid leaving an orphaned taxonomy if branch creation fails after the taxonomy is accepted.

**Non-Goals:**

- Changing existing taxonomies or their removal behavior.
- Altering backend endpoints or adding batch API support.

## Decisions

### Add first-branch data only to the new-taxonomy form

The contextual form state will include first-branch title and description only when adding a taxonomy. Editing an existing taxonomy continues to expose only its own fields, and the taxonomy modal remains responsible for later branch additions. This presents the required structure at the point where it is created without expanding unrelated forms.

### Persist new taxonomy and branch as one client-side operation

The service will validate trimmed taxonomy and first-branch values before creating anything. It will create the taxonomy and then its first branch; if the latter fails, it will attempt to remove the newly created taxonomy before returning the normalized error. The backend has separate taxonomy and branch endpoints, so this compensating action preserves the UI-level structural invariant as closely as the available API permits.

## Risks / Trade-offs

- [Rollback deletion fails after branch creation fails] → reload canonical backend data and present the normalized error; the backend cannot provide an atomic transaction through its current endpoints.
- [Users expect to add a taxonomy before deciding its branches] → the form starts with one explicit branch, making the required relationship visible and editable before saving.

## Migration Plan

1. Deploy the contextual form and compound persistence helper together.
2. Existing taxonomies remain unchanged; future contextual additions include their first branch.
3. Roll back by restoring the previous contextual form; no data migration is required.
