## Context

The affected flows already use backend documents and releases as the source of truth. Documentos reconstructs its workspace from projects, project documents, backend documents, and releases; Oiac IA loads messages by backend document id and renders a PDF preview by downloading a PDF file. The fixes in this change clarify the contract between those two routes and stabilize the UI around backend-returned ordering and navigation state.

## Goals / Non-Goals

**Goals:**

- Preserve a stable visual order for Documentos components after uploads and analysis updates.
- Keep the Oiac IA handoff explicit about the difference between a conversation document id and a PDF file download path.
- Make the active sidebar navigation item visually distinct without hover changing its active state.

**Non-Goals:**

- Persist Documentos workspace state in browser storage.
- Create a new backend API contract.
- Convert release analysis data into chat messages.
- Redesign the application shell or route structure.

## Decisions

### Sort Documentos components by document group order

Documentos should normalize backend project document order before rendering components. The primary ordering source is the document group's item order because that is the user-facing structure selected when the project is created. If group item order is unavailable, project document number and creation date are fallback ordering signals.

Alternative considered: preserve the backend response order exactly. That was rejected because backend response order can shift after releases or analysis updates, causing cards with no PDF to move ahead of cards with PDFs.

### Pass file path as handoff context

Documentos should include the selected release `filePath` in the Oiac IA link when available. Oiac IA should continue using the backend document id as the canonical conversation id for `/messages` and `/message/ai`, while using `filePath` only for the PDF preview download.

Alternative considered: pass only document and release ids and let Oiac IA rediscover the release file path. That was rejected because metadata lookup and binary PDF download are distinct operations, and reselecting the release can fail or choose a different release than the user clicked.

### Keep release analysis out of chat messages

Release analysis data remains part of release metadata and is not synthesized into the Oiac IA message list in this change. The chat view continues to render saved messages from the backend messages endpoint.

Alternative considered: render release analysis as an initial synthetic Oiac IA message when no saved messages exist. That was rejected for now because it introduced extra metadata fetching in the preview path and blurred the boundary between release analysis and saved conversation messages.

### Scope active navigation hover to inactive items

The sidebar item component should apply filled active styling when the current route matches the item and only apply hover styling to inactive items. The active icon and label should use a high-contrast foreground.

Alternative considered: keep a border-only active state. That was rejected because it did not provide enough contrast for the selected item.

## Risks / Trade-offs

- Backend group item ordering may be absent or incomplete -> fallback ordering uses project document number and creation date.
- Query-string `filePath` increases handoff URL length -> acceptable because it avoids ambiguity and does not alter the canonical conversation id.
- Existing open Documentos state created before `filePath` is loaded may need a page refresh -> workspace reconstruction from backend restores the supporting handoff context.
- Release analysis remains separate from chat -> users will not see automatic analysis as a chat message until a separate, explicit behavior change defines that contract.

## Migration Plan

No backend or data migration is required. Existing backend documents and releases continue to work because `filePath` is optional supporting context and Oiac IA still falls back to release lookup when it is absent.
