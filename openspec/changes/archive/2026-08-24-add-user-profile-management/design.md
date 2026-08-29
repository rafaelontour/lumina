## Context

See `proposal.md` for the motivation. `GET /user/my` already supplies the in-memory authentication provider with user data. The backend contract provides `PUT /user` for user fields and `POST /user/{user_id}/icon` for the profile image, both through the existing authenticated proxy.

## Goals / Non-Goals

**Goals:**

- Reuse the authenticated user context for the sidebar and profile view.
- Keep profile data current in memory after a confirmed save.
- Offer a safe fallback avatar whenever no usable profile image is available.

**Non-Goals:**

- Allowing the user to change their own access level or password.
- Persisting profile or session data in browser storage.
- Introducing an external image host or dependency.

## Decisions

### Keep profile mutations in the authentication service and context

The existing authenticated request and tuple-error conventions will serve profile updates. The provider will expose an explicit confirmed-user replacement action so the sidebar changes immediately after successful update or icon upload.

Alternatives considered:

- A separate profile state store would duplicate session data and risk stale identification.
- Reloading the full page after save would work but interrupts editing and is unnecessary.

### Use a reusable browser avatar component

A small client component will render the profile image through the backend proxy and fall back to initials when the user has no icon or the image cannot load. It avoids remote-image configuration and does not reveal backend file paths in visible UI.

### Send photo only after text fields are accepted

The profile page will first save valid text information, then upload a selected image and re-read the user. This makes backend errors attributable and avoids reflecting an unconfirmed image in shared UI.

## Risks / Trade-offs

- [The icon path may not be a directly usable image URL] → Render through the authenticated proxy and fall back to initials on load failure.
- [Text update succeeds but icon upload fails] → Preserve confirmed textual data, retain the selected image for retry, and show the upload error.
- [Backend rejects a field] → Retain the form input and show normalized backend feedback.

## Migration Plan

Deploy as an additive frontend change. Removing the route and sidebar block leaves existing session behavior intact; no persisted data or backend migration is required.
