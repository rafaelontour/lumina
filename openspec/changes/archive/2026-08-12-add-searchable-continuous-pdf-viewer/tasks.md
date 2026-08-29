## 1. Continuous PDF Rendering

- [x] 1.1 Update the shared PDF viewer to render the loaded document's pages in ascending order inside its existing scrollable panel.
- [x] 1.2 Preserve responsive page sizing, zoom controls, per-page loading/error feedback, and reset reader-local page state when the PDF source changes.
- [x] 1.3 Enable and style the PDF text layer so text remains selectable and can receive search highlights.

## 2. Exact Text Search

- [x] 2.1 Add local query, match collection, and active-result state for literal text found in the rendered PDF text layer.
- [x] 2.2 Safely render all matching text segments with standard and active-result highlights, without injecting unescaped PDF or user content.
- [x] 2.3 Add an accessible search field, match count/no-result feedback, clear behavior, and previous/next result controls.
- [x] 2.4 Scroll the active result into the viewer panel and keep the active query when the user adjusts zoom.

## 3. Integration and Verification

- [x] 3.1 Verify a multi-page PDF remains fully readable by scrolling and resets correctly after selecting another conversation.
- [x] 3.2 Verify exact search highlights all occurrences, result navigation scrolls and activates the selected occurrence, and clearing removes highlights.
- [x] 3.3 Verify a scanned or textless PDF remains readable and reports no search results without blocking zoom or scrolling.
- [x] 3.4 Run `pnpm lint` and `pnpm build`.
