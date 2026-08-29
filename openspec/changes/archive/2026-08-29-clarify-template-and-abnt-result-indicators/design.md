## Context

See [proposal.md](../proposal.md). The current Template workspace normalizes both possible nested detail collections before choosing what to render, while the ABNT workspace normalizes no per-criterion `match` state. Both workspaces consume backend report objects through the authenticated proxy and must preserve backend order and text.

## Goals / Non-Goals

**Goals:**

- Normalize report fields with an explicit discriminant based on `is_visual` for template criteria.
- Represent the boolean result of each ABNT criterion and render its semantic visual state consistently.
- Preserve the existing report content, polling, history, and backend interactions while improving the ABNT and Template report layouts.

**Non-Goals:**

- Altering the backend report schema or the deterministic and IA analyses.
- Recalculating conformity in the frontend when a field is missing.
- Changing section-level or report-level outcome rules.

## Decisions

### Discriminate Template criterion details at normalization

The Template mapper will branch on `is_visual` before reading nested data: deterministic criteria map `checks`, and visual criteria map `criteria`. This makes the data origin unambiguous and prevents an unexpected payload from causing both renderers to receive data. Keeping two explicit normalized detail shapes is preferred to using a common loose array because their fields and presentation differ.

### Use `match` as the sole ABNT item outcome

The ABNT mapper will retain a criterion's boolean `match`, and the report row will render a labelled green or red indicator from that value. The frontend will not derive the result from the wording of the justification or the aggregate summary, because those can describe a different scope.

### Separate ABNT summary and disclosure levels

The two numeric/status indicators will occupy the first row of the ABNT summary, and the descriptive text will span the row beneath. Criteria will use native disclosure controls so their names remain scannable and their individual evidence is shown only on demand. Native disclosure preserves keyboard interaction and independent open state without client-side state management.

### Use the same summary hierarchy for Template

The Template summary will use the same two-level layout: conformity-general and sections-attended indicators share the first row, with the description below. Reusing the ABNT hierarchy improves scanability across both conformity workspaces without changing their independent report content.

### Leave incomplete data neutral

If a backend criterion lacks a usable boolean `match`, the presentation will preserve its textual data without inventing a compliance color. This is safer than treating absence as a failure and remains compatible with older completed reports.

### Align criterion and section indicators opposite their names

The ABNT criterion and Template section titles remain on the left of their disclosure controls. Their labelled conformity indicators are grouped at the opposite right edge beside the expansion icon, matching the scan pattern used in the detailed analysis.

### Constrain report workspaces before scrolling results

The desktop report workspace content row has an explicit bounded grid track, so the independent right result panel owns vertical overflow. Extra bottom padding inside that scroll panel keeps the final detail of an expanded ABNT criterion or Template section reachable above the panel edge.

### Keep long Template document selectors reachable

Within the same bounded Template workspace row, the left document selector stretches to the available height and scrolls internally when its grouped target list is longer. It remains visually stationary while either selector or result content is scrolled.

### Delineate document groups in the Template selector

Each backend document group in the left selector is enclosed in a subtle light panel with its group heading and member files. This creates a visible grouping boundary without competing with the selected-file state or report content.

## Risks / Trade-offs

- [An older or malformed payload lacks `match`] → Display the criterion text without a status indicator rather than making an unsupported compliance claim.
- [A payload contains detail arrays inconsistent with `is_visual`] → Trust the declared `is_visual` kind and display only the matching source, keeping data provenance clear.
- [Colour alone may not be accessible] → Pair every indicator with readable Portuguese text and a semantic icon.

## Migration Plan

The frontend-only change is deployed with the existing compatible report endpoints. No data migration is required. Reverting restores the previous renderers without affecting stored backend results.
