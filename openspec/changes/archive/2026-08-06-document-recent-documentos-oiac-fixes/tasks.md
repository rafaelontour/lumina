## 1. Documentos Workspace

- [x] 1.1 Preserve component card order according to document group/project-document order after uploads and analysis updates.
- [x] 1.2 Carry the selected release PDF file path in the Documentos-to-Oiac IA handoff link when available.
- [x] 1.3 Keep Documentos workspace state backend-backed without adding browser persistence.

## 2. Oiac IA Handoff

- [x] 2.1 Accept PDF file path handoff context on the Oiac IA route.
- [x] 2.2 Use the backend document id for conversation message loading and AI message sending.
- [x] 2.3 Use the handoff PDF file path for preview download when available, with release lookup fallback when absent.
- [x] 2.4 Keep release analysis metadata separate from saved chat messages.

## 3. App Shell Navigation

- [x] 3.1 Render the active sidebar navigation item with filled brand background and high-contrast foreground.
- [x] 3.2 Keep active item styling unchanged on hover.
- [x] 3.3 Preserve standard hover styling for inactive sidebar navigation items.

## 4. Verification

- [x] 4.1 Run lint verification.
- [x] 4.2 Run production build verification.
- [x] 4.3 Validate the OpenSpec change.
