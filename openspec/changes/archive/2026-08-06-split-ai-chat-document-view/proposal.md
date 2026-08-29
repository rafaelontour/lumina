## Why

Users need to inspect the PDF while asking questions about it. The current Oiac IA flow focuses on the message thread, which forces users to switch context when they need to compare an AI answer with the source document.

## What Changes

- Split the selected Oiac IA conversation workspace into a document viewing area and a chat area.
- Show the selected conversation's PDF viewer beside the AI conversation in a desktop-only workspace.
- Include embedded PDF viewing controls for zoom and page navigation.
- Preserve the existing conversation list, upload, message loading, message sending, and deletion behavior.
- Scope the layout to desktop usage; mobile and small-screen behavior are out of scope for this change.

## Capabilities

### New Capabilities

### Modified Capabilities
- `oiac-ia-chat`: Add requirements for showing the selected conversation document together with the AI chat.

## Impact

- Affected UI: Oiac IA page, chat component layout, and embedded PDF viewer controls.
- Affected data flow: document preview must use the selected backend document/release identifiers already available to the conversation.
- Affected APIs: likely reuse existing backend document/release access through the internal `/api/backend/*` proxy; no new backend endpoint is assumed by this proposal.
- Affected dependencies: add `react-pdf`/PDF.js for rendering and viewer controls; text search is not part of this change.
