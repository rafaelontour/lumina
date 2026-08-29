## Context

See [proposal.md](proposal.md). Both conformity workspaces already retrieve the selected document's result and poll it only while it is processing. The selector indicator is an immediate feedback state for an analysis started during the current page visit, not a persisted execution monitor.

## Goals / Non-Goals

**Goals:**

- Make a user-started in-progress analysis visible directly in either selector during the current page visit.
- Keep the selection state readable while adding a lightweight status treatment.
- Clear the indicator reliably when that locally started analysis reaches a terminal state.

**Non-Goals:**

- Persist result state in browser storage or introduce backend endpoints.
- Restore or infer a processing indicator after a reload or a later route visit.
- Change result lifecycle, polling interval, notifications, or report rendering.

## Decisions

- Each workspace will maintain a separate in-memory set of document UUIDs for the selector. It adds a UUID only after the same page receives an accepted start response and removes it when the selected-result lifecycle observes a terminal or absent outcome. Starting with a page-load status scan was rejected because it produces indicators for analyses the person did not initiate in that visit.

- The selector item will use a light processing surface/border and a compact “Em análise” badge with a spinning loader or pulse. The badge text is always present; `motion-reduce` disables the nonessential animation. This is more immediately legible than color alone and does not compete with the selected-state treatment.

- A reload, unmount, or route revisit creates a fresh empty set. The existing selected-result lifecycle retains its detailed processing and error presentation, but it is not used to infer selector badges for pre-existing executions.

## Risks / Trade-offs

- [A user reloads while the backend continues processing] → The selector badge intentionally disappears; only an analysis started in the new page visit gets that transient feedback.
- [A locally started result completes between polls] → The badge is removed on the next selected-result refresh, alongside the existing terminal presentation.

## Migration Plan

1. Add session-only selector status state and reusable visual treatment to both workspaces.
2. Verify the badge appears only after a start in the current visit and disappears after reload and completion.
3. Roll back by removing the selector-only state and styling; no persisted data or API migration is involved.
