## Context

See `proposal.md` for motivation. The application currently stores many transient messages in local page state and renders them inline, while loading and error states are already represented by contextual components. The application shell owns shared providers and theme behavior.

## Goals / Non-Goals

**Goals:**

- Provide one notification viewport for the whole application that follows the active theme.
- Route validation, success, failure, and in-progress feedback from user-triggered operations through a consistent toast API.
- Preserve contextual states that need to remain visible after a toast dismisses.

**Non-Goals:**

- Replace destructive-action confirmations with notifications.
- Persist notifications in browser storage or send them to the backend.
- Change API request, document polling, or form-validation behavior beyond its presentation.

## Decisions

### Mount one themed notification viewport in the application shell

Render the notification viewport once within the shared client-side shell so every route can produce a toast and theme changes are applied consistently. Individual feature components import the notification API directly rather than adding duplicate local providers.

Alternative considered: mount a viewport in each page. This would duplicate configuration, make cross-route feedback inconsistent, and risk multiple simultaneous viewports.

### Classify feedback by persistence and user action

Use transient notifications for validation, request outcomes, and short in-progress work initiated by the user. Keep contextual UI for loading, empty, and unrecoverable view states, because those remain relevant while the user works on the page. A destructive operation continues to require a confirmation before it can emit a result notification.

Alternative considered: replace every visible error with a toast. This would dismiss information required to recover a workspace or diagnose unavailable content.

### Replace in-progress notifications by identifier

Operations with an explicit lifecycle use one notification identifier so completion or failure updates the existing feedback instead of stacking a sequence of unrelated messages. Independent operations may produce independent notifications.

Alternative considered: render permanent status text beneath each form. This consumes dense workspace space and produces inconsistent feedback across features.

## Risks / Trade-offs

- Fast successive events can create visual noise -> Use severity consistently and update lifecycle notifications in place.
- Toast dismissal can hide important context -> Keep loading and resource-level errors in their existing contextual components.
- Theme changes can make notifications inconsistent -> Bind the shared viewport to the current application theme.

## Migration Plan

Deploy the shared viewport and migrate each feature's transient feedback in one change. Rollback consists of removing the viewport and restoring the existing inline status presentation; no data migration is required.
