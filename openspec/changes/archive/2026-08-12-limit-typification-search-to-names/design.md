## Context

The current client-side filter includes names from the full nested tree. The page already presents taxonomy and branch content after the user opens a typification.

## Goals / Non-Goals

**Goals:**

- Make search results predictable by matching only typification names.
- Make the search field communicate its narrowed scope.

**Non-Goals:**

- Altering backend loading or the taxonomy-and-branch navigation flow.

## Decisions

### Filter the displayed roots only

The existing client-side filtered array will compare only the normalized tipification name. This keeps aggregate result counts aligned with visible root records and avoids a separate nested-result presentation.

Searching nested titles was considered, but it makes it unclear why a root is present and is unnecessary once a root is open.
