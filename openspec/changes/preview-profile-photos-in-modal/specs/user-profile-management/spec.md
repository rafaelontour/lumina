## ADDED Requirements

### Requirement: User can enlarge their profile photo
The personal profile page SHALL allow the authenticated user to open their profile photo in an accessible modal. The modal SHALL show the currently displayed photo, including a selected temporary preview that has not yet been saved, and SHALL close through a visible close control, Escape, or activating the backdrop. When no photo is available, the initials fallback SHALL remain visible and SHALL NOT open an empty photo modal.

#### Scenario: User opens their profile photo
- **WHEN** an authenticated user activates their displayed profile photo
- **THEN** the application shows that same photo enlarged in a modal without leaving `/perfil`
- **AND** the modal identifies the photo as belonging to the user

#### Scenario: User previews an unsaved profile photo
- **WHEN** the user has selected a temporary profile-photo preview and activates the displayed photo
- **THEN** the modal shows the temporary preview rather than the previously saved photo

#### Scenario: User closes the photo modal
- **WHEN** the user activates the close control, presses Escape, or activates the modal backdrop
- **THEN** the modal closes and the profile page remains available

#### Scenario: User has no profile photo
- **WHEN** the profile displays initials instead of a photo
- **THEN** the initials remain a non-interactive fallback
- **AND** no empty photo modal is opened
