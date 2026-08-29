## Purpose

Fornecer retorno operacional transitório, consistente e acessível para as ações executadas nas telas do Lumina.

## ADDED Requirements

### Requirement: Global Transient Notifications
The application SHALL provide a single global notification surface for transient operational feedback on every application route.

#### Scenario: User triggers an operation with feedback
- **WHEN** a user action starts, succeeds, fails, or is rejected by client-side validation
- **THEN** the application presents a transient notification with the outcome and an appropriate semantic severity
- **AND** the notification does not alter the current route, selected document, or persisted state

#### Scenario: Multiple notifications are triggered
- **WHEN** more than one operation produces feedback
- **THEN** each notification is presented without blocking interaction with the application
- **AND** a completed or failed operation replaces its own in-progress notification when applicable

### Requirement: Preserve Persistent Feedback States
The application SHALL retain persistent on-screen feedback when the user needs it to understand or recover from the current view.

#### Scenario: A resource cannot be displayed or loaded
- **WHEN** a page cannot display required content such as a PDF, a data list, or an initial workspace
- **THEN** the page retains its contextual loading, empty, or error state
- **AND** a transient notification may supplement but does not replace that state

#### Scenario: A destructive action requires confirmation
- **WHEN** a user requests deletion or another destructive action
- **THEN** the application retains an explicit confirmation interaction before executing the action
- **AND** it uses a transient notification only to report the resulting success or failure
