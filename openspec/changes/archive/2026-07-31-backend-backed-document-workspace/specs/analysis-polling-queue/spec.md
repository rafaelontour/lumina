## Purpose

Track backend documents whose uploaded releases are still being analyzed so Lumina can notify the current browser when analysis becomes available.

## ADDED Requirements

### Requirement: Pending Analysis Id Queue
The application SHALL keep a browser-local IndexedDB queue containing only backend document ids whose analysis is pending.

#### Scenario: Uploaded document is still pending
- **WHEN** a PDF upload completes and the backend release does not contain a non-empty `check_tree`
- **THEN** the backend document id is stored in the pending analysis id queue

#### Scenario: IndexedDB queue content is inspected
- **WHEN** the pending analysis id queue is read
- **THEN** each queued item contains only the backend document id required to check analysis status

### Requirement: Global Analysis Polling
The application SHALL poll pending backend document ids from a global application context regardless of the currently active page.

#### Scenario: User navigates away from Documentos
- **WHEN** the browser has queued pending document ids and the user opens another application page
- **THEN** the application continues checking those document ids for completed analysis

### Requirement: Completed Analysis Notification
The application SHALL remove a backend document id from the pending analysis id queue when analysis is available and notify the user in the current browser.

#### Scenario: Analysis becomes ready
- **WHEN** polling finds a release for a queued document id with a non-empty `check_tree`
- **THEN** the document id is removed from the pending analysis id queue and the user sees a notification that the analysis is ready

#### Scenario: Analysis is still pending
- **WHEN** polling finds no release with a non-empty `check_tree`
- **THEN** the document id remains in the pending analysis id queue

#### Scenario: Document is deleted
- **WHEN** the user confirms deletion for a document that has queued backend document ids
- **THEN** those backend document ids are removed from the pending analysis id queue so polling stops for that deleted document in the current browser
