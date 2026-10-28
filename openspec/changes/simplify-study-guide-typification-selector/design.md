## Context

The study-material form currently contains a text search and a typification selector. The requested interaction uses only the selector.

## Goals / Non-Goals

**Goals:**
- Remove the redundant search control and related local filtering state.
- Preserve typification selection and attachment saving.

**Non-Goals:**
- Change available typifications or backend contracts.

## Decisions

- Render the loaded catalog directly in the existing selector.
- Remove search-specific imports, state, normalization, and editing fallback no longer needed by filtering.

## Risks / Trade-offs

- Larger catalogs rely on native selector navigation rather than a text filter, as requested.

## Migration Plan

No migration is required. The search control can be restored if catalog size later demands it.
