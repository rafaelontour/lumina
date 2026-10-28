## Context

The guide component currently applies its accent presentation only when `readOnly` is false, leaving advisor monitoring neutral.

## Goals / Non-Goals

**Goals:**
- Apply one consistent, theme-compatible visual emphasis in both contexts.

**Non-Goals:**
- Change read-only behavior or group-material permissions.

## Decisions

- Use the existing accent card and divider classes without conditioning them on `readOnly`.

## Risks / Trade-offs

- A shared presentation keeps the guide easy to identify but does not imply additional advisor editing rights.

## Migration Plan

No migration is needed. Restore the conditional classes to return to a neutral advisor view.
