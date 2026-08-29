## MODIFIED Requirements

### Requirement: Advisor candidate selection and relationship creation
The dialog SHALL load only available user candidates with `access_level: ADMIN` from the backend, exclude the authenticated user, and let the user select one candidate. On confirmation, the application SHALL create an active `MAIN_ADVISOR` relationship with the selected candidate as advisor and the authenticated user as advisee.

#### Scenario: User saves a selected advisor
- **WHEN** a default account without an active advisor selects an administrator candidate and confirms the selection
- **THEN** the application creates the advisor relationship for the authenticated user
- **AND** closes the dialog only after the backend accepts the relationship
- **AND** makes the protected route usable

#### Scenario: Non-administrator is returned by the backend
- **WHEN** the backend user list contains accounts without `access_level: ADMIN`
- **THEN** the application does not present those accounts as advisor candidates
- **AND** only presents administrator accounts other than the authenticated user

#### Scenario: No administrator candidate is available
- **WHEN** the backend returns no administrator candidate after excluding the authenticated user
- **THEN** the dialog remains open with a readable explanation and a retry action
- **AND** does not make protected content usable
