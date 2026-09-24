## 1. Preparation and backend integration

- [x] 1.1 Read the relevant local Next.js 16 guidance and review the current “Meus orientandos” state, card, summary, and empty-state rendering before editing the component.
- [x] 1.2 Add a tuple-style authenticated `removerVinculoOrientacao(advisorshipId)` service using `DELETE /advisorship/{advisorship_id}` and normalized Portuguese errors.

## 2. Advisee search and summary layout

- [x] 2.1 Add local search state and derive visible cards by normalized advisee name or email without mutating the canonical monitoring collection.
- [x] 2.2 Place an accessible search field beside “Orientandos ativos” and “Total de documentos” in one responsive layout region, keeping one row on wide viewports and avoiding horizontal overflow on narrow ones.
- [x] 2.3 Keep aggregate summary values based on the complete loaded collection and add a readable no-results state that preserves the search and summaries.
- [x] 2.4 Preserve the active search term and correctly recompute visible cards after refresh or relationship removal.

## 3. Relationship removal from advisee cards

- [x] 3.1 Add a clearly labeled “Remover orientando” action to each card without obscuring identity, relationship date, or “Ver perfil”.
- [x] 3.2 Request explicit confirmation naming the advisee and explaining that only the academic relationship is removed, with cancellation producing no request or state change.
- [x] 3.3 Track the in-flight `advisorship_id`, show per-card progress, and prevent duplicate or conflicting actions for the affected card while leaving unrelated cards usable.
- [x] 3.4 After backend success, remove the relationship from rendered and ref-backed monitoring state, close its profile if open, clear related partial failures, recalculate totals, and show one success notification.
- [x] 3.5 On backend failure, preserve the card, profile, search results, and totals; clear pending state and present the normalized readable error.

## 4. Verification

- [ ] 4.1 Verify name and email matching with case and accents, clearing, no results, refresh, wide one-row placement, narrow responsive wrapping, and light/dark themes.
- [ ] 4.2 Verify confirmation cancellation, successful removal, backend failure, duplicate activation prevention, profile reconciliation, total recalculation, searched removal, and transition to the empty state.
- [x] 4.3 Verify that relationship removal never offers or performs deletion of the advisee account, projects, documents, releases, analyses, or conversations.
- [x] 4.4 Run `pnpm lint`, `pnpm build`, and `openspec validate remove-advisee-from-workspace --type change`.
