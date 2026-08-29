## Context

Oiac IA displays avulsa conversations from backend documents with source `oiac-ia-avulsa`. Grouped conversations are derived from Documentos-backed projects, document groups, project documents, backend documents, and releases.

## Approach

Add explicit rename actions for the selected avulsa conversation and grouped project rows. Persist avulsa names through the existing backend document record and grouped project names through the existing backend project record. After successful persistence, update the current React state and refresh derived labels without changing selected ids.

## Data Contracts

- Avulsa conversation rename targets the selected backend document id.
- Grouped project rename targets the backend project id.
- The UI should use the backend-returned `title` when present, falling back to `name` for compatibility with the current `ConversaOiac` shape.
- Message APIs continue to use `/doc/{id}/messages` and `/doc/{id}/message/ai`.
- PDF preview APIs continue to use release `filePath`.

## UI

- Use compact icon buttons near the current conversation/project title for edit/save/cancel actions.
- Rename mode should use a single-line input with validation for non-empty names.
- Disable save while the update request is in flight.
- Keep Portuguese labels and error messages.

## Risks

- The backend may expose document title as `title` while the frontend currently uses `name`; normalize both fields in the Oiac IA type/service layer.
- If the backend update endpoint differs between documents and projects, keep separate service functions rather than over-generalizing.
- Avoid renaming grouped component labels when only the parent project title changes.
