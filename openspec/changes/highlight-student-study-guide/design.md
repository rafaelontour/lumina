## Context

The shared study-guide component renders both the project owner's guide and the advisor's read-only guide. Its `readOnly` property differentiates those contexts.

## Goals / Non-Goals

**Goals:**
- Use existing theme tokens to visually emphasize the owner's guide.
- Preserve the neutral advisor-monitoring presentation.

**Non-Goals:**
- Change guide actions, progress rules, or permissions.

## Decisions

- Apply an accent-tinted surface, accent border, and subtle shadow only when `readOnly` is false.
- Keep existing structure and controls unchanged.

## Risks / Trade-offs

- Theme-token-based opacity keeps the contrast compatible with light and dark themes.

## Migration Plan

No migration is required. Revert the conditional classes to restore the prior neutral card.
