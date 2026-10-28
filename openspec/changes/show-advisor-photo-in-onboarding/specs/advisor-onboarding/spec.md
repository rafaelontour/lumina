## ADDED Requirements

### Requirement: Advisor selection shows name and profile image only
Each advisor candidate in the mandatory onboarding selection SHALL display the candidate's profile image or initials fallback and name, without displaying the candidate's email address. Selecting and saving a candidate SHALL continue to use the candidate's backend identity and SHALL not depend on the email being displayed.

#### Scenario: User reviews available advisor candidates
- **WHEN** a default account without an active advisor views available candidates
- **THEN** each candidate option displays the advisor's profile image or initials fallback and name
- **AND** no candidate email address is displayed

#### Scenario: User selects an advisor candidate
- **WHEN** the user selects and confirms an advisor candidate
- **THEN** the application creates the relationship with that candidate using the candidate's backend identity
- **AND** the selection does not require the email to be visible
