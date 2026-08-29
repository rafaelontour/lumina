## Context

See proposal.md. Filename displays are distributed across cards, selectors, report metadata, and template upload controls. Several displays already truncate text, but some lack a shrinkable flex parent or any overflow handling.

## Goals / Non-Goals

**Goals:**

- Audit every user-facing filename display in the application routes and shared components.
- Apply a consistent contained single-line presentation when space is constrained.
- Preserve the complete filename for accessible inspection.

**Non-Goals:**

- Renaming files, changing upload behavior, or modifying backend values.
- Truncating non-file business labels such as document, project, or taxonomy titles.

## Decisions

### Use container-aware single-line truncation

Each filename will have a shrinkable containing element and the ellipsis presentation only where the surrounding layout has finite horizontal space. This keeps controls and status badges in the same row without relying on character-count truncation, which fails across responsive widths and fonts.

### Preserve the native full-text affordance

The full filename will remain available in a `title` and, where the surrounding control has an accessible label, in that label. This avoids a duplicate visual line or hidden browser state while retaining the original value.

### Audit known filename surfaces

The implementation will cover Documentos version cards; Documentos-backed selectors and selected-file labels in ABNT and Template conformity; grouped Oiac conversation entries; and selected/new/replacement template file labels. Existing safe report-metadata badges will be checked and retained where already compliant.

## Risks / Trade-offs

- [A filename is inside a flex row without a shrinkable parent] → Add the minimum width constraint before applying ellipsis.
- [A text label is not actually a filename] → Keep it unchanged rather than applying generic truncation to unrelated content.
- [Long names are inaccessible after truncation] → Preserve the full native title or accessible label.

## Migration Plan

This is a frontend-only layout improvement. It deploys without data migration and can be reverted by restoring presentation classes without affecting stored filenames.
