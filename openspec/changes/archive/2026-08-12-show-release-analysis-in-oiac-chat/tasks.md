## 1. Release Analysis Data

- [x] 1.1 Resolve the selected conversation release metadata for Oiac IA, prioritizing the handoff release id and preserving the current fallback selection rule.
- [x] 1.2 Add explicit frontend types and normalization for every displayed `check_tree` level: typification, taxonomy, branch, evaluation, and source.
- [x] 1.3 Derive a client-only complete-analysis item when the selected release has a non-empty `check_tree`, with `description` as an optional summary.
- [x] 1.4 Reset or ignore stale initial-analysis results when the selected document or release context changes, without blocking saved message loading.
- [x] 1.5 Derive an analysis-pending state when the exact selected release has no completed `check_tree`.
- [x] 1.6 Poll the exact selected release while analysis is pending, clearing timers and ignoring stale results after completion, context changes, or unmount while tolerating transient lookup errors.

## 2. Chat Presentation

- [x] 2.1 Render the derived complete-analysis item as an Oiac IA response before chronologically ordered saved messages.
- [x] 2.2 Present release description headings and paragraph boundaries legibly as plain text, without rendering raw HTML or adding a Markdown dependency.
- [x] 2.3 Render all check-tree typifications in backend order, including their taxonomies, branches, sources, evaluation status, score, and feedback.
- [x] 2.4 Preserve existing chat behavior while a release analysis is pending, including message sending, pending responses, PDF preview, and Documentos handoff.
- [x] 2.5 Render a non-persisted animated Oiac IA processing response before saved messages until the selected release analysis is complete.

## 3. Verification

- [x] 3.1 Verify a selected release with `check_tree` and `description` shows the summary and every analyzed typification before saved messages.
- [x] 3.2 Verify a selected release with `check_tree` and no `description` shows the complete structured analysis.
- [x] 3.3 Verify a Documentos handoff with a release id shows that release's complete analysis and never substitutes analysis from another release.
- [x] 3.4 Verify a selected release without `check_tree` shows the animated processing response, polls only that release, and replaces it with the complete analysis when it arrives.
- [x] 3.5 Verify changing the conversation or release stops pending-analysis polling and does not show stale analysis.
- [x] 3.6 Run `pnpm lint` and `pnpm build`.
