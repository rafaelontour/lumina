## 1. Typification Creation Service

- [x] 1.1 Define typed draft and creation DTOs for typifications, taxonomies, and branches.
- [x] 1.2 Add tuple-style authenticated service functions for `POST /typification`, `POST /taxonomy`, and `POST /branch`, including normalized backend errors and required empty source-id arrays.
- [x] 1.3 Add a coordinator that creates a valid tree in typification, taxonomy, and branch dependency order and stops on the first failure.

## 2. Hierarchical Creation Interface

- [x] 2.1 Add a “Nova tipificação” button opposite “Árvore de verificação” in the Tipificacoes page header.
- [x] 2.2 Build a cancellable modal form with a typification name and dynamic taxonomy sections containing dynamic branch fields.
- [x] 2.3 Support adding and removing draft taxonomies and branches while keeping at least one editable taxonomy and branch in a new draft.
- [x] 2.4 Validate all required names and descriptions, taxonomy presence, and branch presence before allowing a save request.

## 3. Submission and Refresh

- [x] 3.1 Submit the valid draft through the hierarchical creation coordinator and prevent duplicate submissions while it is in progress.
- [x] 3.2 Use lifecycle toasts for validation, saving, completion, and backend failures.
- [x] 3.3 Reload typifications from the backend after a complete save or a failed partial creation, then update summaries, search results, and modal state from that canonical data.

## 4. Verification

- [x] 4.1 Verify the header action opens and cancellation closes the form without backend writes.
- [x] 4.2 Verify a typification with multiple taxonomies and branches is created and appears with correct counts after refresh.
- [x] 4.3 Verify incomplete drafts do not submit and an endpoint failure reports the normalized error and refreshes the list.
- [x] 4.4 Run `pnpm lint` and `pnpm build`.
