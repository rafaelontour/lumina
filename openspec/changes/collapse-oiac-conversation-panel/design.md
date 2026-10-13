## Context

See `proposal.md` for the motivation and `specs/oiac-ia-chat/spec.md` for the behavior contract. `OiacIaChat` currently owns a fixed 320-pixel first grid column containing the internal “Oiac IA” heading, conversation creation, tabs, and lists. The second column owns the selected PDF and chat workspace. All selected-conversation state already lives above those two layout regions.

## Goals / Non-Goals

**Goals:**

- Toggle the entire internal conversation panel without unmounting or clearing conversation state.
- Keep an obvious compact expansion control available when the panel is collapsed.
- Give the selected conversation workspace the released horizontal space.
- Preserve the existing fixed-height shell and internal scrolling behavior.
- Restore the internal panel preference without briefly rendering the opposite layout.

**Non-Goals:**

- Change the global application sidebar or its “Oiac IA” navigation entry.
- Share the global sidebar cookie or persist this preference in JavaScript storage.
- Change conversation loading, creation, selection, grouping, rename, deletion, messages, or PDF behavior.

## Decisions

### Initialize from a dedicated cookie and keep interaction state local

Read `lumina-oiac-conversas-recolhido` in the server route and pass the resolved initial boolean to `OiacIaChat`. A missing or invalid value resolves to expanded. The client keeps that value in local React state and updates the same cookie with `path=/`, a long lifetime, and `SameSite=Lax` whenever the user toggles the panel.

Reading only from `document.cookie` after mount was rejected because it would first render the default width and then shift the complete workspace. Sharing `lumina-menu-recolhido` was rejected because the global and internal panels are independent. `localStorage` and other JavaScript storage were rejected to preserve the shell preference convention.

### Collapse the first workspace grid column into a compact rail

Switch the outer grid between the existing 320-pixel column and a narrow rail. In the expanded state, render the current panel unchanged except for a header row containing the internal title and orange collapse button. In the collapsed state, hide all list controls and content while retaining an accessible orange expand button and compact Oiac IA identity. Removing the column entirely was rejected because it would leave no stable in-context way to reopen it.

### Use explicit accessible control semantics

The button exposes whether the controlled panel is expanded and uses distinct accessible labels for “Recolher lista de conversas” and “Expandir lista de conversas”. Directional panel icons communicate the action visually, while the orange treatment distinguishes it from the global sidebar control.

## Risks / Trade-offs

- [The compact rail competes with workspace width on very narrow screens] -> Keep the rail at the smallest usable width and avoid retaining hidden panel padding.
- [Conditional rendering resets nested list UI] -> Hide only the panel presentation while preserving parent-owned active tab and conversation data.
- [Users confuse the control with the global sidebar] -> Position it beside the internal “Oiac IA” label, use scoped accessible text, and leave the global navigation untouched.
- [An absent or malformed cookie produces an inconsistent initial layout] -> Treat only the explicit value `true` as collapsed and default every other value to expanded.

## Migration Plan

1. Read the dedicated preference cookie in the Oiac IA route and pass the resolved state to the client workspace.
2. Add the local panel state, cookie update, and responsive grid-column classes.
3. Add the orange toggle beside the internal title and the compact collapsed rail.
4. Verify preference restoration, state preservation, independent global-sidebar behavior, accessibility, and viewport layout.

Rollback removes the cookie read/write, local state, compact rail, and toggle, restoring the fixed 320-pixel conversation column. The obsolete preference cookie may be ignored safely; no data or backend migration is involved.
