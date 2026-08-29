## Context

See `proposal.md` for the motivation. The application already restores the backend-managed session in `AuthProvider`, conditionally filters sidebar items by access level, and uses `/api/backend/*` as the browser-facing proxy. The published API exposes authenticated `GET /user` with text-query support, `PUT /user` with the complete `UserUpdate` payload, and `DELETE /user/{user_id}`, which returns `204` on success.

## Goals / Non-Goals

**Goals:**

- Provide an administrator-only workspace that makes test accounts easy to find, remove, and adjust their access level.
- Keep destructive actions deliberate, recoverable from request errors, and synchronized with confirmed backend state.
- Reuse the project’s in-memory session state and tuple-style service error handling.

**Non-Goals:**

- Creating users, editing another user’s username, email, or telephone number, bulk deletion, deletion recovery, or managing advisory relationships directly.
- Client-side authorization as a substitute for backend authorization.

## Decisions

### Use a protected `/usuarios` workspace and sidebar entry

The workspace will be shown in navigation only for `ADMIN` accounts and the shell will redirect non-administrators who reach the route directly before the workspace loads data. This matches the established role-aware UI pattern. A public or profile-embedded control was rejected because deletion is an administrative concern and must not be discoverable to regular users.

### Query the backend directory and keep confirmed results in component state

The user service will request the backend list through the internal proxy, passing a search query when entered. The workspace will show loading, empty, error, and retry states; it will mutate the visible list only after a successful `204` deletion. Persisting a directory cache in browser storage was rejected because user records and access levels can change elsewhere.

### Require a dedicated confirmation dialog and block self-removal

Selecting removal opens a modal that names the target account and offers an explicit destructive confirmation. The current authenticated user has no removal control, even if they are an administrator. Immediate deletion from a row was rejected because test cleanup is destructive and prone to mistaken clicks; allowing self-removal was rejected because it can invalidate the active session and remove the administrator’s recovery path.

### Update the two platform access levels with the complete API payload and block self-changes

The workspace will offer only `DEFAULT` (orientando) and `ADMIN` (orientador) for another user and ask for explicit confirmation before submitting the change. Although the API exposes additional enum values, they are not part of the platform's role model and must not be presented or sent by this experience. Since `PUT /user` requires username, email, telephone number, and id as well as `access_level`, the service will construct the request from the selected directory record, changing only its level. It will replace the row's user record only after the backend returns the updated user. Reusing the personal-profile editor was rejected because it is scoped to the active account and would expose unrelated profile edits; updating the current administrator’s level was rejected to prevent accidental loss of administrative access during a session.

### Treat the API as final authority for deletion integrity

The interface sends one delete request and displays normalized errors without assuming that related records can be deleted. The backend decides whether a user is eligible for deletion and enforces authorization. Automatically retrying a failed delete was rejected because a repeated destructive request can make its outcome ambiguous.

## Risks / Trade-offs

- [A user may have related data that the backend refuses to delete] → Keep the record visible and show the backend’s normalized explanation.
- [A directory with many users may be slow to load] → Use the API’s query support and maintain clear loading and retry states; pagination can be added in a later change if needed.
- [An administrator could delete another administrator] → Require a target-specific confirmation and rely on API authorization; the initial scope blocks only self-removal.
- [An outdated directory record may overwrite a user’s profile field in the API's full update] → Reload the directory after an update error and restrict the UI to changing only the access level; a partial-update endpoint can be adopted later if the API provides one.
- [The backend accepts additional levels] → Keep `ANALYST` and `AUDITOR` out of the administrative selector so the interface enforces the two-role platform model.

## Migration Plan

1. Deploy the protected route, navigation entry, service, and both confirmation experiences together.
2. Verify with an administrator that a test account can be located, cancelled, removed, and have its access level changed, and that a regular account cannot access the workspace.
3. Roll back the frontend deployment to remove the management entry and route if the backend deletion behavior is incompatible; no client-persisted migration state is used.
