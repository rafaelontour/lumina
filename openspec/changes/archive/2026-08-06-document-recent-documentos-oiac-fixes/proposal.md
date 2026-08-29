## Why

Recent fixes clarified several user-visible contracts that were not fully captured in the existing specs. Documentos-to-Oiac IA handoff needs to distinguish document identifiers from PDF file download paths, Documentos component cards must remain stable after uploads, and the sidebar active state should provide a clear filled contrast.

## What Changes

- Documentos preserves component order according to the document group/project-document order regardless of whether a component has a PDF, pending analysis, or ready analysis.
- Documentos includes the release `filePath` as supporting handoff context when linking a component to Oiac IA.
- Oiac IA uses the backend document id for conversation/messages and uses the provided `filePath` to download the PDF preview when available.
- The application shell renders the active sidebar item with a filled, lighter brand background and white foreground, and active items do not change on hover.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `document-workspace`: Document component ordering remains stable and Oiac IA handoff includes the PDF file path when available.
- `oiac-ia-chat`: Handoff context can include a PDF file path for preview download while preserving the backend document id as the conversation id.
- `app-shell`: Active sidebar navigation uses filled contrast styling and does not change on hover.

## Impact

- Affected UI surfaces: `/documentos`, `/oiac-ia`, and the fixed application sidebar.
- Affected frontend modules: Documentos workspace reconstruction/link generation, Oiac IA initial preview loading, and shared menu item styling.
- No backend API changes and no dependency changes.
