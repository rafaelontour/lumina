## Context

See `proposal.md` for motivation and the `searchable-pdf-viewer` delta spec for the behavior contract. `PdfDocumentViewer` currently renders a single page from `react-pdf`, hides its text layer, and changes the page number with previous/next controls. `OiacIaChat` already resolves the selected release's PDF into an object URL and passes it to this viewer; that handoff must remain unchanged.

## Goals / Non-Goals

**Goals:**

- Render the selected PDF as an ordered continuous page sequence in the existing document panel.
- Enable exact textual search, result highlighting, count, navigation, and scrolling within the reader.
- Retain responsive page width, zoom, document loading, and error handling.
- Reset reader-local state when the PDF source changes without changing the selected conversation or chat state.

**Non-Goals:**

- Do not add semantic, fuzzy, or AI-based document search.
- Do not search chat messages, release analysis, or PDFs that are not currently open.
- Do not add persistent search history or change backend PDF endpoints.
- Do not add annotations, editing, or OCR for image-only PDFs.

## Decisions

### Use the existing PDF renderer's text layer

Each rendered page will expose its text layer alongside the canvas, using the stylesheet required by the installed PDF rendering library. The reader will derive literal search matches from that rendered/extracted text and decorate matching segments with safe markup so highlights remain aligned with their source text.

This retains the existing PDF worker, object URL, and credential behavior. A separate PDF viewer package was considered but would duplicate PDF loading configuration and enlarge the application for a capability already supported by the installed renderer.

### Render the full document inside the existing scroll container

After the document reports its page count, the viewer will render a page component for each page number in ascending order. The existing panel remains the scrolling boundary, preventing document-level scrolling and preserving the fixed application shell.

Virtualized page rendering was considered for very large PDFs, but it conflicts with the requirement to keep all pages available in one continuous reading surface and complicates reliable full-document highlighting. This change favors direct rendering; performance can be revisited with a compatible virtualization strategy if real documents demonstrate a need.

### Keep search state local and navigate DOM highlights

The viewer will keep the query, the ordered result collection, and the active result index in component state. It will escape user/PDF text before adding highlighting markup, assign stable result markers to rendered matches, and scroll the active marker into the panel view. Repeating next/previous controls will wrap through the result collection.

The browser's native find interface was considered, but it cannot provide a consistent in-application result count, controls, or highlighting behavior within the embedded renderer. Search state will not be persisted because it applies only to the currently opened PDF.

### Treat unavailable text as zero searchable results

The PDF canvas must stay readable even if its text layer cannot be extracted, as occurs with scanned documents. A non-empty query in that case produces the same visible no-result feedback, without presenting a reader-level error or blocking zoom and scrolling.

## Risks / Trade-offs

- Rendering every page can increase memory use and initial render time for large PDFs → retain per-page loading states and keep the work scoped to the currently selected PDF.
- PDF text can be split across positioned text items → search literal text contained in the available text layer and document the lack of OCR/semantic matching.
- Text-layer markup can expose HTML-injection risks → escape all dynamic text and use only fixed highlight elements before passing content to the renderer.
- Zoom rerenders the text layer and can recreate highlight nodes → derive highlights from the query and rebuild the result collection after each relevant render.

## Migration Plan

Deploy the viewer replacement without backend or stored-data migration. Existing conversations and Documentos handoffs continue supplying the same PDF object URL. Rollback restores the previous single-page rendering component; no data cleanup is required.
