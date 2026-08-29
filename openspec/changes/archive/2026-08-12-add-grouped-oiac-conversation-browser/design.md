## Context

See proposal.md for motivation. Oiac IA currently has one sidebar list for avulsa conversations, loaded from backend documents with source `oiac-ia-avulsa`. Documentos-created content is represented as backend projects, document groups, project documents, backend documents, and releases, and Oiac IA already knows how to resume a document conversation when it receives a backend document id plus optional release/file path handoff context.

## Goals / Non-Goals

**Goals:**

- Add an Oiac IA browsing model that distinguishes avulsa conversations from grouped document conversations.
- Keep grouped documents visible in their project/group/component structure even when a component has no uploaded PDF.
- Reuse the existing backend document id contract for messages and the release file path contract for PDF previews.
- Preserve the ability to create new avulsa PDF conversations from Oiac IA.

**Non-Goals:**

- Change the backend data model or require new backend endpoints.
- Move Documentos upload/edit workflows into Oiac IA.
- Allow chat on grouped components that do not have a PDF-backed backend document/release.
- Store grouped conversation state in localStorage or IndexedDB.

## Decisions

### Sidebar uses two tabs

The Oiac IA sidebar should expose two modes: avulsa conversations and grouped conversations. The avulsa mode keeps the current behavior and list source. The grouped mode presents a hierarchy derived from backend project/document group data.

Alternative considered: merge all conversations into a single flat list. That would hide the important difference between standalone PDF conversations and document-group-backed project components, and would make unavailable group components invisible.

### Grouped view mirrors project/group/component structure

Grouped conversations should be organized by project and document group, then show the group components/project documents. This mirrors the mental model from `/documentos` while keeping the action focused on resuming AI conversations.

The grouped entry shape should contain at least:

- Project id and title.
- Document group id/name when available.
- Project document/component id and label.
- Backend document id when a component has an uploaded backend document.
- Latest release id and PDF file path when available.
- Availability state for selection.

### Disabled components remain visible

Components without a backend document, release, or PDF file path should remain visible but disabled. This preserves the group structure and communicates that the section exists but cannot yet start or resume a PDF-backed chat.

Alternative considered: hide unavailable components. That was rejected because it makes grouped documents appear incomplete or reordered and prevents users from seeing which expected sections still need uploads.

### Selection reuses current handoff contract

Selecting an available grouped component should set the selected conversation to that component's backend document id, load messages through `/doc/{id}/messages`, and use the release file path for the PDF preview when available. This keeps the same split already used by Documentos handoff: ids are for JSON/message operations, file paths are for binary PDF download.

### Data loading can reuse Documentos reconstruction logic

The grouped view can reuse or extract the backend-backed workspace reconstruction already used by Documentos. If shared, the data should be shaped into an Oiac IA-specific view model rather than coupling the chat UI directly to Documentos card rendering.

## Risks / Trade-offs

- Loading grouped conversations may require multiple backend requests -> keep loading states scoped to the sidebar and avoid replacing the whole chat surface unnecessarily.
- Backend project/document group data may be incomplete -> show fallback labels and keep unavailable entries disabled.
- Very large grouped workspaces can make the sidebar dense -> use collapsible or compact grouped sections if needed during implementation.
- Reusing Documentos reconstruction directly could couple two features too tightly -> prefer a shared service/data mapper with separate UI components.

## Migration Plan

No data migration is required. Existing avulsa conversations remain listed in the avulsa tab. Existing Documentos projects become visible in the grouped tab after the grouped data loader is added.
