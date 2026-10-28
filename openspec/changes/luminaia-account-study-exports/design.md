## Context

See `proposal.md` and the delta specs. The authenticated proxy forwards cookies and binary response bodies. `PerfilUsuarioWorkspace`, login, Documentos, advisee monitoring, and Tipificações are the established surfaces. Project restoration already returns `created_by` and `document_group_id`; the published guide returns ordered items, attachments, and project progress.

## Goals / Non-Goals

**Goals:**

- Keep credentials and recovery codes in transient form/query/request state only.
- Reuse the fixed application shell and backend tuple-result service conventions.
- Make study-material configuration group-scoped and progress project-scoped.
- Reuse the backend's returned ordering and counters as canonical.
- Keep current Oiac source identifiers and API routes compatible while changing the visible assistant name.

**Non-Goals:**

- Personalized study prescriptions for one advisee or project; current API attachments belong to a shared document group.
- Creating new document groups or document-group items; the frontend does not currently expose group management.
- Defining new backend password, export, or study-guide contracts.
- Renaming internal TypeScript symbols or backend identifiers as part of a visible product-name change.

## Decisions

### Password screens use the published request shapes

Add a protected password-change form to the profile and public `/esqueci-senha` and `/redefinir-senha` routes. The recovery page sends only email and always uses a generic confirmation. The reset page reads email/token from the recovery URL, submits those values with the new password, then removes token parameters from the visible URL after the response. Passwords and token stay only in component state and the request.

The authenticated change sends the current user's in-memory `usuario.id`, current password, and new password. This follows the published contract while allowing the backend to remain authoritative for ownership and current-password validation. The UI requires password confirmation and clears all password fields after either success or failure.

### Export PDF through the existing backend proxy

Create a tuple-style service requesting `/export/typifications/pdf`, with an optional `typification_id` and `responseType: "blob"`. Validate that the response is a non-empty PDF before creating an object URL, use a sanitized filename, click a temporary download link, and revoke the URL. Per-card export remains colocated with its card; export-all appears in the page header.

### Study configuration belongs to a group and is surfaced from projects

Add a group-material manager in the administrator's advisee-monitoring view for a matched project with `document_group_id`. It loads the group's items from the already restored catalog, then reads attachments per item and supports adding, editing, deleting, and ordering the supported types. Since a change affects every project in the group, the interface identifies this shared scope before saving. Reordering uses accessible move-up/move-down controls and submits all ids; no DnD dependency is introduced. The personal workspace exposes the project guide and progress, but does not let an advisee alter shared recommendations.

Add a project guide panel backed by `GET /project/{id}/study-guide`. The owner is determined only by comparing `project.created_by` with the authenticated user's id. Successful mark/unmark replaces the full guide from the mutation response. The advisor monitoring surface uses the same read-only viewer, receiving the actual project id from the advisor-scoped project catalog; it does not provide group mutation controls there.

The current personal Documentos route redirects administrators to advisee monitoring. Therefore the administrator sees read-only progress but can configure shared group materials from a matched advisee project; the interface explicitly warns that the change affects every project in that group. Personal users can view their guide and update only their own progress. This preserves the API's group-shared material model without presenting it as an individual prescription.

### Visible assistant identity changes without API migration

Replace visible Oiac IA/OiacIA labels in navigation, homepage, chat and analysis copy with LuminaIA. Keep filenames, module names, source strings such as `oiac-ia-avulsa`, route paths, and stored records unchanged because these are compatibility identifiers rather than visible branding.

### Scope remains aligned with current backend behavior

Do not implement per-advisee material management. The frontend states that group configuration is shared so an advisor cannot mistake it for an individual prescription. If a later backend API adds project-scoped material assignments, it can be introduced as a separate change.

## Risks / Trade-offs

- **Shared configuration can affect unrelated projects in the same group** -> show the shared-group impact before opening and saving configuration.
- **Reset-link query parameters may be removed by referrer/logging infrastructure outside the client** -> do not copy them into storage or telemetry, and clear them from browser history as soon as the request finishes.
- **PDF endpoint metadata may describe JSON despite returning a PDF** -> validate the blob signature and use a safe fallback filename rather than trusting a malformed filename.
- **Advisor monitoring currently aggregates documents and project catalog data separately** -> resolve project ids from the advisor's own project catalog and fail closed to read-only/empty UI if a document cannot be matched.
- **Crossref lookups can make DOI mutations slow** -> keep a visible per-form saving state and prevent duplicate submission.

## Migration Plan

1. Add typed services and public password routes; add profile password change and login navigation.
2. Add typification export service and page actions.
3. Add guide and attachment types/services, shared group manager, owner tracking panel, and advisor read-only panel.
4. Replace visible assistant labels with LuminaIA while preserving backend identifiers.
5. Validate the change artifacts and review the implementation diff; confirm deployed email delivery and backend authorization behavior with the service owner before release.

Rollback can remove the new UI entry points and components without changing stored data or identifiers. Password changes, exported files, and group guide edits are backend operations and are not rolled back by removing frontend code.
