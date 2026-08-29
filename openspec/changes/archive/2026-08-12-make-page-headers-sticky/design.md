## Context

The fixed application shell owns the viewport and the main content region owns vertical scrolling. Feature routes currently compose their own headers, so persistence must be applied without changing the shell's scroll model. See proposal.md for motivation and the delta specs for behavioral requirements.

## Goals / Non-Goals

**Goals:**

- Keep each existing feature-page header available during that route's content scrolling.
- Use the existing Tipificações creation action as the visual reference for the Documentos add action.
- Preserve the layout, interactions, and data flows owned by each route.

**Non-Goals:**

- Creating a header for the home page or routes that do not already have one.
- Changing the fixed shell, navigation, backend calls, or browser persistence.
- Changing the meaning or availability rules of document creation.

## Decisions

### Keep sticky positioning route-local

Each feature route will make its existing header sticky inside the shell's scrollable content area, with an opaque token-based background and a stacking layer above the route's scrolling content. This keeps spacing and route-specific controls local, rather than adding a generic shell header that would need to understand every page's actions.

The alternative, a shared header rendered by the shell, is rejected because feature routes own different titles, controls, and loading states.

### Reuse the Tipificações primary-action treatment

The Documentos add action will share the existing primary button's size and visual treatment rather than introduce another route-specific variant. Its label and document-creation behavior remain unchanged.

The alternative, increasing only the Documentos action's dimensions, is rejected because it would not guarantee the requested visual consistency.

## Risks / Trade-offs

- [A route's scroll container or background differs from the others] → Verify sticky position, layering, and contrast in each affected route in both themes.
- [A sticky header obscures content at the top of a route] → Preserve header spacing and confirm the first interactive content remains reachable.
