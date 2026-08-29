## Context

See `proposal.md` for motivation and the delta specs for the behavior contract. Documentos currently builds the personal workspace from project, project-document, document, and release endpoints. The administrator's new `/orientandos` workspace provides an authenticated list of advisees, while Lumina Back provides a dedicated endpoint to obtain the documents of one selected advisee.

## Goals / Non-Goals

**Goals:**

- Make the compact, read-only “Meus orientandos” page the only Documentos experience available to administrators, without disrupting the existing personal workspace for non-administrators.
- Present the backend's current statuses and academic grouping metadata for each advisee's documents.
- Keep advisor and advisee scoping exclusively backend-driven and avoid browser persistence.

**Non-Goals:**

- Changing document visibility policy, ownership, editors, project creation, uploads, releases, or Oiac IA handoff.
- Reusing the advisee-facing Documentos workspace, its upload UI, or any document/project mutation control in the orientation page.
- Polling continuously or inventing a local document-status cache.

## Decisions

### Give administrators only the orientation workspace

Documentos will direct `ADMIN` accounts to the orientation page. Non-administrators will continue to use the existing personal workspace. The administrator navigation will expose “Meus orientandos” instead of the personal Documentos entry, so uploads, rename, delete, and analysis polling remain unavailable to the advisor role.

Keeping a separate personal workspace for administrators was rejected because `ADMIN` represents the advisor role at this stage and must not receive document-owner actions.

### Use a compact monitoring presentation with no owner actions

The orientation page will use compact rows or summary cards focused on student, project, group, document status, archival state, and latest update. It will deliberately omit the personal-workspace affordances: project/group creation, PDF upload, document deletion, metadata editing, archive toggles, release/version generation, and analysis/conformity actions.

Adapting the existing personal project-card layout was rejected because that layout carries owner-oriented controls and would make the advisor's monitoring role appear to grant permissions it does not have.

### Filter the returned advisory data by student and project

The advisor view will expose an advisee selector, with an “all students” option, and a text search field that matches the project name associated with the returned advisee documents. These controls refine only the current authenticated advisor's data already obtained from advisory endpoints; they do not cause a global project query or alter backend authorization.

Server-side project search was not selected because the documented advisee-document endpoint does not expose a project-name search parameter. The entire current result is already required to show the grouped monitoring view and is refreshed from the backend when the view opens or the advisor requests it.

### Use advisory endpoints as the only advisee source

The orientation view will first obtain the authenticated professor's active advisees, then request each advisee's documents through `/advisorship/advisees/{advisee_id}/documents`. It will not use global project listing or client-side ownership filtering. Returned document metadata will be grouped by `projeto_nome` and `grupo`, with stable fallback labels for absent values.

Using `/project` and inferring which projects belong to an advisee was rejected because that contract does not encode the authenticated advisory relationship and would reproduce the existing global-project ambiguity.

### Refresh on entry and explicit demand

Opening the orientation view and pressing its update control both reload the advisor summary and advisee document calls. Existing rows remain visible while an explicit refresh is in flight; if a reload fails, the view shows scoped retry feedback while retaining any prior successful data.

Continuous polling was rejected because the backend supplies current data on demand and the request fan-out grows with the number of advisees.

### Make the orientation view read-only

Rows/cards will communicate processing and archival state, but use no controls that mutate an advisee's project, group, document, release, or analysis. Any future document-reading detail experience must be separately specified.

## Risks / Trade-offs

- [An administrator has many advisees] → Load summary first and use bounded, scoped document requests with a clear loading state; add pagination or selection only if backend volume requires it.
- [Returned document metadata lacks project or group values] → Use clear fallback labels instead of dropping the document from the monitoring view.
- [One advisee request fails while others succeed] → Retain successful groups and identify the affected advisee with a retry path.
- [Backend relationship changes during an open view] → The next explicit refresh re-derives both advisees and documents from the backend.
- [An advisor enters a broad project search] → Filtering remains local to the already authorized, current advisory result and never reveals projects outside the advisor's active advisees.

## Migration Plan

1. Deploy the administrator-only redirect and navigation entry without changing the non-administrator personal Documentos data path.
2. Validate the view with an administrator having zero, one, and multiple active advisees, including processing and archived document states.
3. Roll back by removing the orientation view; no persisted data migration is necessary.
