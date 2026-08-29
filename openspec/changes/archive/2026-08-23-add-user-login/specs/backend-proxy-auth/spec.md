## MODIFIED Requirements

### Requirement: Development Login Retry

Frontend services SHALL NOT attempt to sign in automatically after an unauthorized backend response.

#### Scenario: Backend request is unauthorized

- **WHEN** a frontend service request receives HTTP 401
- **THEN** the service does not submit fixed or stored credentials to `/auth/sign-in`
- **AND** the application treats the active session as absent or expired
