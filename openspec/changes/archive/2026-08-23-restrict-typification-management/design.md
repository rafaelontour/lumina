## Context

The Tipificacoes page currently exposes a shared browser and management controls for the complete knowledge tree. Authentication already provides the current account's `access_level`, where `ADMIN` currently represents the professor/orientador role.

## Goals / Non-Goals

**Goals:**

- Keep the typification browser readable to all authenticated users.
- Ensure only ADMIN accounts can reach any client-side management control or write path.
- Preserve the existing management experience for professors.

**Non-Goals:**

- Change backend authorization rules or the typification data model.
- Hide typifications from DEFAULT accounts.
- Change how documents consume typifications.

## Decisions

### Gate management UI from the authenticated role

The page will derive a single administrator flag from the authenticated account and conditionally render every management entry point: create, edit, add nested entries, remove nested entries, delete, confirmation dialogs, and forms. The read-only cards and taxonomy detail modal remain available to all authenticated users.

Hiding only the header creation button was rejected because edit and deletion actions also appear within cards and the taxonomy modal.

### Guard write handlers in addition to controls

Every handler that would open or submit a management flow will verify the administrator role before acting. This prevents stale client state or a direct interaction from issuing a write request after the visible controls have been removed.

Relying only on visual hiding was rejected because it does not protect in-memory event paths.

## Risks / Trade-offs

- [Backend has broader permissions than the UI] → The frontend guards all known write entry points, while backend authorization remains the authority for direct API callers.
- [New management control is added later] → Centralizing the role flag and handler guards makes the required restriction visible in the page implementation.

## Migration Plan

1. Deploy the role-gated Tipificacoes interface.
2. Verify DEFAULT accounts can browse and open taxonomy details but cannot access mutation controls.
3. Verify ADMIN accounts retain full management behavior.
4. Roll back by removing the client-side role guards; no data migration is needed.
