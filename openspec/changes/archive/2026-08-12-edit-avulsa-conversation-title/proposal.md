## Why

Users need to correct or clarify display names after creating documents. Today an avulsa Oiac IA conversation name is derived from the uploaded PDF, and grouped conversations inherit the project name from Documentos, but neither can be edited from the conversation context.

## What Changes

- Allow the user to edit the display name of an avulsa Oiac IA conversation.
- Persist the avulsa conversation name through the backend document title/name field so the sidebar, chat header, and PDF preview title stay consistent.
- Allow the user to edit the project name used by grouped conversations from Documentos-backed projects.
- Refresh visible conversation/project labels after a successful rename without changing the selected backend document id or message history.
- Keep grouped component names unchanged when only the project name is edited.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `oiac-ia-chat`: Oiac IA supports renaming avulsa conversations and grouped project labels while preserving document ids and chat continuity.
- `document-workspace`: Documentos-backed projects expose an editable project title that remains the source label for grouped Oiac IA conversations.

## Impact

- Affected UI: Oiac IA conversation sidebar/header and grouped project labels; Documentos project title display if the shared project rename action is surfaced there.
- Affected services: backend document update for avulsa conversation title/name; backend project update for grouped project name.
- Affected state: selected conversation and grouped conversation list must update in memory after successful persistence.
- No new browser storage is introduced.
