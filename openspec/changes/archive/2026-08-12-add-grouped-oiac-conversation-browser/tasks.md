## 1. Data Model and Services

- [x] 1.1 Define grouped conversation view types for projects, groups, components, availability, backend document ids, release ids, and PDF file paths.
- [x] 1.2 Add a service function that loads backend projects, document groups, project documents, linked backend documents, and releases for Oiac IA grouped browsing.
- [x] 1.3 Map grouped components without backend document, release, or PDF file path to a visible disabled state.
- [x] 1.4 Preserve avulsa conversation loading from source `oiac-ia-avulsa`.

## 2. Oiac IA Sidebar UI

- [x] 2.1 Add a tab control in the Oiac IA sidebar for avulsa and grouped conversation views.
- [x] 2.2 Render avulsa conversations with the existing standalone conversation list behavior.
- [x] 2.3 Render grouped conversations by project and document group, with visible project document components.
- [x] 2.4 Display unavailable grouped components as disabled and non-selectable.
- [x] 2.5 Display available grouped components as selectable conversation entries.

## 3. Conversation Selection and Preview

- [x] 3.1 Selecting an available grouped component sets the selected conversation to the component backend document id.
- [x] 3.2 Selecting an available grouped component loads messages from `/doc/{id}/messages`.
- [x] 3.3 Selecting an available grouped component uses the release PDF file path for preview when available.
- [x] 3.4 Sending a message from a grouped conversation posts to `/doc/{id}/message/ai` for the component backend document id.

## 4. Verification

- [x] 4.1 Verify avulsa conversations still load and can be selected.
- [x] 4.2 Verify grouped components with PDFs are selectable and resume the correct conversation.
- [x] 4.3 Verify grouped components without PDFs remain visible but disabled.
- [x] 4.4 Run `pnpm lint`.
- [x] 4.5 Run `pnpm build`.
