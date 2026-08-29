## Why

Oiac IA currently lists only standalone conversations created directly from `/oiac-ia`, while documents created through `/documentos` belong to backend document groups and can only be resumed through handoff links. Users need one place in Oiac IA to browse both standalone conversations and grouped document conversations while preserving the distinction between avulsa documents and document-group-backed documents.

## What Changes

- Add a tabbed conversation browser in Oiac IA with separate views for avulsa conversations and grouped conversations.
- Keep avulsa conversations sourced from documents created directly in Oiac IA with source `oiac-ia-avulsa`.
- Add a grouped conversation view that reconstructs projects, document groups, project documents, backend documents, and releases.
- Show grouped components even when they do not have an uploaded PDF, but disable chat selection for unavailable components.
- Allow selectable grouped components to resume Oiac IA using the component backend document id as the conversation id and the release file path for PDF preview.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `oiac-ia-chat`: Oiac IA gains a tabbed conversation browser with avulsa and grouped views, and grouped items can resume conversations by backend document id.
- `document-workspace`: Documentos-created documents remain the source for grouped conversation structure and availability state.

## Impact

- Affected UI: Oiac IA sidebar conversation list.
- Affected data loading: Oiac IA must load standalone conversations and grouped project/document data.
- Affected services/types: Oiac IA conversation browsing may need grouped conversation DTOs derived from existing project, document group, project document, document, and release data.
- No backend API changes are required if existing project, document group, project document, document, and release endpoints are sufficient.
