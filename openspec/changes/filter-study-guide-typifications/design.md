## Context

The material manager requests typifications with the entered text but renders the returned response unchanged. The published list endpoint may not apply the optional search parameter, so the UI needs a deterministic client-side filter over the loaded options.

## Goals / Non-Goals

**Goals:**
- Make the existing search control visibly narrow the typification selector.
- Preserve a selected value while editing.
- Handle an empty result without changing attachment submission behavior.

**Non-Goals:**
- Change typification ownership, authorization, or backend list contracts.
- Add a new typification creation flow inside the guide modal.

## Decisions

- Load the existing typification catalog through the current authenticated service and normalize/filter names locally, ignoring accents and case.
- Derive selector options from the catalog and current query; retain the selected item as an explicit option when necessary.
- Add a disabled no-result option so the selector communicates why no selection is available.

## Risks / Trade-offs

- The existing service returns a bounded list; client filtering is reliable for the loaded catalog, while the backend remains responsible for exposing the complete authorized catalog.

## Migration Plan

No migration is needed. Rollback restores the direct rendering of the API response.
