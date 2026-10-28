## ADDED Requirements

### Requirement: Advisor can enlarge an advisee's profile photo
The advisor SHALL be able to open an advisee's displayed profile photo in an accessible modal from both the compact advisee card and the advisee profile modal header. The modal SHALL show the same photo, identify the advisee, and close through a visible close control, Escape, or activating the backdrop. When no photo is available, the initials fallback SHALL remain visible and SHALL NOT open an empty photo modal.

#### Scenario: Advisor opens an advisee photo from a compact card
- **WHEN** the administrator activates an advisee's photo in a compact card
- **THEN** the application shows that advisee's photo enlarged in a modal without navigating away from the monitoring page

#### Scenario: Advisor opens an advisee photo from the profile header
- **WHEN** the administrator activates the photo in an open advisee profile modal
- **THEN** the application shows the same advisee's photo enlarged above the existing profile modal
- **AND** closing the photo modal returns the administrator to the still-open advisee profile

#### Scenario: Advisor closes the enlarged advisee photo
- **WHEN** the administrator activates the close control, presses Escape, or activates the photo modal backdrop
- **THEN** the enlarged-photo modal closes without closing the underlying advisee profile modal

#### Scenario: Advisee has no profile photo
- **WHEN** an advisee's card or profile header displays initials instead of a photo
- **THEN** the initials remain a non-interactive fallback
- **AND** no empty photo modal is opened
