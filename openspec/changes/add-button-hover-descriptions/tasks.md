## 1. Inventory and implementation

- [x] 1.1 Audit all native application buttons under `app/`, including shared shell, route pages, dialogs, and icon-only controls.
- [x] 1.2 Add a shared wrapper that renders native buttons with title fallback to existing accessible or visible text, then migrate all application buttons and add explicit context-aware titles where necessary.
- [x] 1.3 Search the application again to confirm every app button uses the wrapper and icon-only/stateful actions have descriptive titles.

## 2. Validation

- [x] 2.1 Run `pnpm lint`, TypeScript checking, `openspec validate add-button-hover-descriptions --type change`, and `git diff --check`.
- [ ] 2.2 Run `pnpm build`; this environment currently cannot fetch the configured Google Fonts during production builds.
