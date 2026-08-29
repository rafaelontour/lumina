## Context

See [proposal.md](../proposal.md). The release analysis contains an evaluation status and score only on taxonomy branches, while the taxonomy header currently shows only its title and disclosure control.

## Goals / Non-Goals

**Goals:**

- Present immediate, readable counts of attended, partially attended, and non-attended branches beside each taxonomy title using the existing criterion data.
- Preserve the existing expandable taxonomy interaction and all criterion-level detail.

**Non-Goals:**

- Altering backend analysis payloads or adding a taxonomy-level evaluation field.
- Computing a taxonomy score or changing backend analysis results.

## Decisions

### Classify branch outcomes by score

The taxonomy counters and criterion status labels will prioritize each branch score: scores below 5 increment “Não atendidos”; scores from 5 through 7 increment “Parcialmente atendidos”; scores above 7 increment “Atendidos”. A legacy branch without a numeric score falls back to its boolean `fulfilled` value. Branches without either result are excluded from all counters.

### Reuse the criterion status visual treatment for counters

The title will remain on the left, while its green attended, orange partially attended, and soft-red non-attended counters are grouped on the right before the expansion control. This keeps status colors and accessible text aligned with the branch labels in both themes. Individual branch badges use the same score ranges.

## Risks / Trade-offs

- [Taxonomy mixes evaluated and unevaluated criteria] → Only branches with a score or legacy boolean outcome contribute to the counters.
- [No criterion contains an evaluation] → All three counters remain zero without an unsupported conclusion.

## Migration Plan

This is a frontend-only presentation change. It is compatible with existing stored release analyses and can be reverted without data migration.
