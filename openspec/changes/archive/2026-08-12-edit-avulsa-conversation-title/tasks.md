## 1. Services and Types

- [x] 1.1 Add optional `title` support to Oiac IA document/conversation types and normalize display title fallback to `name`.
- [x] 1.2 Add a service function to update an avulsa backend document title/name.
- [x] 1.3 Add a service function to update a backend project title/name.

## 2. Avulsa Conversation Rename UI

- [x] 2.1 Add edit, save, and cancel controls for the selected avulsa conversation name.
- [x] 2.2 Persist valid avulsa name edits and update the selected conversation plus avulsa sidebar list.
- [x] 2.3 Keep the existing name and show an error if the avulsa rename fails.
- [x] 2.4 Prevent empty avulsa names from being saved.

## 3. Grouped Project Rename UI

- [x] 3.1 Add edit, save, and cancel controls for grouped project names in the grouped conversation browser.
- [x] 3.2 Persist valid grouped project name edits and update the grouped browser labels.
- [x] 3.3 Keep grouped component labels and backend document ids unchanged after project rename.
- [x] 3.4 Keep the existing project name and show an error if the project rename fails.

## 4. Verification

- [x] 4.1 Verify an avulsa conversation can be renamed and remains selected with the same message history.
- [x] 4.2 Verify a grouped project can be renamed and grouped components remain selectable/unavailable according to their previous state.
- [x] 4.3 Run `pnpm lint`.
- [x] 4.4 Run `pnpm build`.
