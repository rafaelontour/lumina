## 1. Global Toast Infrastructure

- [x] 1.1 Add the Sonner dependency and mount one theme-aware notification viewport in the application shell.
- [x] 1.2 Define the shared toast configuration for placement, duration, accessible announcements, and visual consistency with existing tokens.

## 2. Feature Feedback Migration

- [x] 2.1 Replace transient Documentos validation, creation, upload, rename, and deletion status messages with semantic lifecycle toasts.
- [x] 2.2 Replace transient Oiac IA validation, conversation, message, and rename feedback with semantic lifecycle toasts.
- [x] 2.3 Apply the same toast conventions to transient Tipificacoes feedback while preserving its loading and backend-error states.
- [x] 2.4 Remove superseded inline transient status presentation without removing contextual loading, empty, PDF, or data-error states.

## 3. Verification

- [x] 3.1 Verify success, validation, and failure notifications appear once and do not block interaction on each affected route.
- [x] 3.2 Verify a lifecycle operation updates its in-progress notification instead of stacking duplicate notifications.
- [x] 3.3 Verify theme changes are reflected by notifications and persistent error/confirmation states remain available.
- [x] 3.4 Run `pnpm lint` and `pnpm build`.
