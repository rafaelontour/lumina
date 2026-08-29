## Context

See [proposal.md](proposal.md). The backend already exposes authenticated multipart CRUD endpoints and returns `PublicationTemplatePublic` objects. The frontend has a typed template object for the conformity selector but no management route. The app shell already resolves `access_level` before rendering protected feature content.

## Goals / Non-Goals

**Goals:**

- Provide a focused administrator workspace for template lifecycle management.
- Keep all backend calls behind the existing proxy and preserve tuple-style normalized errors.
- Enforce the administrator experience in both sidebar visibility and route rendering.

**Non-Goals:**

- Build a document preview/download experience for template PDFs.
- Change backend authorization, storage, template comparison, or default-account permissions.
- Add pagination beyond the backend's normal listing limit.

## Decisions

- Use `/templates` as the frontend route, matching the domain and backend resource, while all browser requests still use `/api/backend/templates` through the service URL builder.
- Keep a dedicated workspace with an inline create form and a single selected-template edit form. This minimizes navigation and makes name-only and file-replacement updates explicit.
- Build `FormData` conditionally for updates so omission means no change, matching the optional multipart backend fields.
- Gate the route in `AppShell` and the workspace. The shell avoids rendering the page for default accounts; the component guard protects data requests during client transitions. Backend authorization remains the security authority.
- Use the existing Sonner notifications and reload the authoritative list after mutations rather than mutating a local cached catalog.
- Derive the helper value in the client by removing only the final extension from the selected `File.name`; the name remains a normal editable field and no backend behavior changes.
- Provide a clear control next to populated name fields that only resets the text state, preserving the independently selected file state.
- Place the filename helper in the same horizontal control row as its name input and use a styled trigger for the hidden native file input, so field heights remain aligned and the file-selection action is obvious.
- Use the existing application content scroller as the sticky positioning boundary for the Templates header, with an opaque tokenized background and stacking context to keep scrolling cards from visually crossing it.

## Risks / Trade-offs

- [The backend accepts non-PDF files despite the UI accept attribute] → Validate the MIME/extension client-side for immediate feedback; backend remains responsible for final enforcement.
- [A template is deleted while it is referenced by a historical result] → Surface the backend rejection and keep the list unchanged.
- [The catalog grows beyond the initial request limit] → The service can add search/pagination later without changing the workspace ownership model.

## Migration Plan

1. Deploy the new protected route and navigation entry.
2. Create a test template as an administrator and confirm it becomes available in Conformidade Template.
3. Roll back by removing the frontend route and navigation entry; backend templates and API contract remain unchanged.
