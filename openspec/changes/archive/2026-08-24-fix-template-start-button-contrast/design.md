## Context

The dark theme maps the shared brand color to a light value, while the template start button currently forces white text, producing insufficient contrast.

## Goals / Non-Goals

**Goals:**

- Make the enabled action legible in dark mode.
- Preserve existing action states and layout.

**Non-Goals:**

- Redesigning the Conformidade Template workspace or changing theme tokens globally.

## Decisions

The button will use the existing dark text utility already used by other brand-primary actions, scoped to dark mode. This keeps light mode unchanged and makes the text contrast with the light dark-theme brand token.

## Risks / Trade-offs

- [Theme token changes later] → The button continues to use the established brand/text token pairing rather than a hard-coded color.
