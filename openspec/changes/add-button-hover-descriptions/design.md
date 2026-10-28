## Context

See `proposal.md` and `specs/button-action-descriptions/spec.md`. The app uses native HTML buttons across route pages, feature workspaces, dialogs, and the shared shell. Existing text and `aria-label` values remain the source of accessible names.

## Goals / Non-Goals

**Goals:**

- Give every native application button a useful browser `title`.
- Keep titles aligned with conditional behavior, current state, and nearby object context.
- Preserve visible labels, keyboard behavior, disabled states, and existing accessible names.

**Non-Goals:**

- Replace native buttons with a shared design-system component.
- Introduce custom tooltip overlays, timing behavior, or new dependencies.
- Add titles to links, inputs, or non-interactive decorative icons.

## Decisions

### Use a shared native-button wrapper with explicit overrides

Replace application button elements with one shared button component that renders a native `<button>` and supplies a `title`. It uses an explicit title when supplied, otherwise the existing `aria-label`, otherwise normalized visible child text. This keeps repeated markup consistent and ensures conditional labels remain current. Add explicit titles for icon-only controls whose accessible label is missing or not sufficiently descriptive, and for stateful controls where the action changes with state. A DOM observer or global event listener was rejected because it would add titles only after interaction and could show stale or generic text.

### Keep accessible names independent

Retain visible text, `aria-label`, and other existing accessibility attributes. The native title is supplemental hover guidance, not the sole accessible name. Icon-only buttons receive a meaningful title that matches their existing `aria-label` where present.

### Describe the action in the current state

For toggles and conditional actions, explicit title text describes what activation will do now (for example, “Expandir menu” or “Recolher menu”), not a static generic label. For record actions, include enough context when it helps distinguish the affected item. Keep verbose option-card descriptions concise when used as a fallback.

## Risks / Trade-offs

- **Repeated visible and hover labels can feel redundant** → keep titles concise and action-oriented; the browser only shows them on pointer hover.
- **A title may become inaccurate after conditional state changes** → derive titles from the same conditions as the button's current action.
- **Native title behavior is not a touch interaction** → preserve visible and accessible button names; this change supplements rather than replaces them.

## Migration Plan

1. Audit native button elements in `app/` and add specific titles, including conditionally rendered actions.
2. Search again for native buttons and review each for a title and meaningful action wording.
3. Run lint, build, OpenSpec validation, and a diff whitespace check.

Rollback consists of removing the supplemental `title` attributes; no stored data or APIs change.
