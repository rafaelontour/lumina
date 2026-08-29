## MODIFIED Requirements

### Requirement: Fresh advisee document state
The orientation view SHALL request the current document data from the backend when opened and when the administrator explicitly refreshes it. It MUST display the latest analysis state represented by the returned document history, the operational processing state when no completed analysis is recorded, archival state, and latest update information returned by the backend. When the latest history records a completed analysis, the view MUST present the document as concluded even if the operational processing state is `FAILED`. The view MUST present known backend states with readable Portuguese labels and MUST NOT expose raw technical status values. It MUST NOT persist advisee documents in browser storage.

#### Scenario: Administrator refreshes advisee documents
- **WHEN** an administrator requests an update in the orientation view
- **THEN** the application reloads the active advisees and their accessible documents from the backend
- **AND** replaces the displayed status information with the latest returned state

#### Scenario: Completed analysis has a failed operational state
- **WHEN** an advisee document's latest returned history records `COMPLETED` and its `processing_status` is `FAILED`
- **THEN** the orientation view presents the document as having a concluded analysis
- **AND** does not present the document as failed

#### Scenario: Backend document request fails
- **WHEN** the backend cannot return an advisee's document data
- **THEN** the application preserves any previously rendered monitoring data where available
- **AND** presents readable retry feedback scoped to the failed monitoring view
