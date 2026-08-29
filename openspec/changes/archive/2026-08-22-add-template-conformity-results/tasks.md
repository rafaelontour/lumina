## 1. Data access and domain modeling

- [x] 1.1 Add typed, tuple-style service support for listing templates, starting `POST /templates/{docId}/conformidade`, and reading `GET /templates/{docId}/conformidade`.
- [x] 1.2 Define shared conformity types for template lists, accepted processing, result envelopes, and backend-backed document targets.
- [x] 1.3 Derive the latest uploaded PDF of every workspace component from `carregarWorkspaceDocumentos` without browser persistence.
- [x] 1.4 Reuse the authenticated release-PDF download path to start an explicit analysis without creating a document or release.

## 2. Template conformity workspace

- [x] 2.1 Replace the Conformidade Template placeholder with a client workspace that lists uploaded PDF targets and selects a matching `documentId` query value when available.
- [x] 2.2 Load the available templates, let the user choose one, and start analysis only from the selected target's explicit action.
- [x] 2.3 Render loading, no-PDF, missing-source, absent-result, processing, request-error, backend-error, and completed states while retaining the selection.
- [x] 2.4 Poll only the selected template result while its backend status is `processing`, and stop on terminal status, selection change, or unmount.
- [x] 2.5 Render completed report summaries, sections, deterministic field comparisons, and visual evaluation items in backend order with safe text rendering.
- [x] 2.6 Remove automatic template and ABNT conformity dispatch, selection, result tracking, and controls from the Documentos upload workflow.
- [x] 2.7 Show deduplicated Sonner success and error notifications for template analysis completion and failures.

## 3. Verification

- [ ] 3.1 Verify every current workspace PDF appears without reading `localStorage` or IndexedDB and a valid `documentId` selects it.
- [ ] 3.2 Verify that Documentos upload creates its document, release, and main analysis without sending requests to template or ABNT conformity endpoints.
- [ ] 3.3 Verify that an explicit template selection sends the stored PDF and selected `template_name`, creates no new release, and presents the accepted processing state.
- [ ] 3.4 Verify absent, processing, backend-error, request-error, and completed result states; confirm polling targets only the selected processing document and cancels on selection change.
- [ ] 3.5 Verify deterministic and visual report criteria display all available details as text and divergent results remain distinguishable.
- [ ] 3.6 Verify completion emits one success notification and start, request, and backend errors each emit one error notification without suppressing the persistent result state.
- [x] 3.7 Run `pnpm lint`, `pnpm build`, and `openspec validate add-template-conformity-results --type change`.
