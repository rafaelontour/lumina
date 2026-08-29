## ADDED Requirements

### Requirement: Cookie-Scoped Browser Preferences
The application shell SHALL use browser cookies, not localStorage, for persistent lightweight browser preferences.

#### Scenario: Sidebar preference is saved
- **WHEN** the user changes the sidebar collapsed state
- **THEN** the selected state is persisted in a browser cookie

#### Scenario: Persistent browser preference is needed
- **WHEN** the application needs to persist a lightweight browser preference
- **THEN** the preference is stored through a cookie unless the preference is intentionally session-only

### Requirement: No localStorage Preference Persistence
The application shell SHALL NOT persist shell preferences in localStorage.

#### Scenario: Theme or shell preference changes
- **WHEN** a shell-level preference changes
- **THEN** the application does not write that preference to localStorage

### Requirement: Fixed Root Layout
The application shell SHALL prevent vertical scrolling on the root document layout.

#### Scenario: Page content is taller than the viewport
- **WHEN** a page needs vertical scrolling
- **THEN** scrolling occurs inside the main content area and not on the root `html` or `body` layout
