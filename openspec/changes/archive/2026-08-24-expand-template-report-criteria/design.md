## Context

See [proposal.md](proposal.md). The Template workspace renders expanded section criteria in a two-column desktop grid. The completed report presentation already owns the summary and report layout, so this is a scoped visual adjustment without a data-contract change.

## Goals / Non-Goals

**Goals:**

- Give criterion content, including wide comparison tables and long justifications, the whole report-panel width.
- Create a visually even top information area when metadata and summary have different heights.

**Non-Goals:**

- Change the backend report contract, content order, status badges, collapsible sections, or mobile readability.
- Add, omit, or reinterpret backend report fields.

## Decisions

- Replace the expanded-section two-column criterion grid with a single-column layout at every viewport. A two-column layout is rejected because it produces unused space when a criterion has no companion card and constrains wide comparison tables.

- Place metadata and summary in a shared responsive top-level grid and stretch both blocks to the same height on desktop. This gives their top and bottom edges a stable alignment despite different content volume, while narrow viewports retain independent stacked heights.

- Preserve available metadata and the summary compliance boolean from the existing report object in the presentation model and render them as separate, translated top-level content. Ignoring metadata or exposing API field names is rejected because the layout cannot align omitted content and the report would remain technical to its audience.

- Preserve existing overflow handling for deterministic comparison tables; the wider card simply gives it more usable space before horizontal scrolling is needed.

## Risks / Trade-offs

- [Multiple short criteria produce a longer report] → The existing independent result-panel scrolling contains the added vertical length.
- [Reports omit metadata or summary] → The top grid renders only available blocks and collapses naturally to one item.

## Migration Plan

1. Adjust the report layout classes in the Template workspace.
2. Verify a report with long checks, visual criteria, metadata, and summary at desktop and narrow widths.
3. Roll back the layout classes if the report density is not acceptable; no data migration is needed.
