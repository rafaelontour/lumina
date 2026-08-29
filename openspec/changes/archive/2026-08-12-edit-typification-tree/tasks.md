## 1. Tree CRUD Service and Draft Types

- [x] 1.1 Define editable typification, taxonomy, and branch draft types that retain record and parent ids, distinguish new and removed records, and support comparison with the original tree.
- [x] 1.2 Add tuple-style authenticated update and deletion service functions for the typification, taxonomy, and branch endpoints with complete API-required payloads and normalized errors.
- [x] 1.3 Add a tree-save coordinator that creates new nested records, updates changed records, and deletes removed records in dependency-safe order, stopping on the first failure.
- [x] 1.4 Add a typification-deletion coordinator that deletes its branches, taxonomies, and root in safe order and stops on the first failure.

## 2. Contextual CRUD Interface

- [x] 2.1 Replace the whole-tree edit action with a compact typification-name action in each typification card, while retaining its deletion action.
- [x] 2.2 Add a taxonomy-card edit action and a compact form for its title and description without interfering with opening its branches.
- [x] 2.3 Add branch-card edit actions and compact forms in the taxonomy modal for their titles and descriptions.
- [x] 2.4 Add taxonomy creation and removal controls in the typification-card context, with confirmation and a minimum of one taxonomy.
- [x] 2.5 Add branch creation and removal controls in the taxonomy-modal context, with confirmation and a minimum of one branch.
- [x] 2.6 Remove the obsolete complete-tree draft editor and validate each compact form before its individual request.

## 3. Contextual Submission and Canonical Refresh

- [x] 3.1 Submit each valid contextual create or update request and prevent duplicate requests for that record while it is in progress.
- [x] 3.2 Submit confirmed contextual removals and complete typification deletions while preventing duplicate destructive requests.
- [x] 3.3 Provide lifecycle toasts for validation, saving, completion, deletion, and normalized backend failures.
- [x] 3.4 Reload typifications from the backend after every contextual write and update summaries, search results, and taxonomy-modal state from canonical data.

## 4. Verification

- [x] 4.1 Verify an edit form opens populated and cancellation causes no backend write.
- [x] 4.2 Verify added and removed taxonomies and branches persist correctly after confirmation and refresh.
- [x] 4.3 Verify the typification name, taxonomy title/description, and branch title/description persist and display correctly after refresh.
- [x] 4.4 Verify typification deletion requires confirmation and removes its nested tree from the refreshed list.
- [x] 4.5 Verify incomplete drafts do not submit and a nested endpoint failure shows the normalized error and reloads the list.
- [x] 4.6 Run `pnpm lint`, `pnpm build`, and `openspec validate edit-typification-tree --type change`.
