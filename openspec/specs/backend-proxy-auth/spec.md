## Purpose
Document the baseline API proxy and development authentication behavior used by the frontend services.
## Requirements
### Requirement: Internal Backend Proxy
The application SHALL route frontend API calls through `/api/backend/*` and forward them to the configured external backend base URL.

#### Scenario: Frontend calls a backend endpoint
- **WHEN** a service calls `/api/backend/<path>`
- **THEN** the route handler forwards the request to `API_BASE_URL/<path>` while preserving method, query string, headers, and request body where applicable

### Requirement: Missing Backend Configuration Error
The proxy SHALL return a server error when no external backend base URL is configured.

#### Scenario: API_BASE_URL is absent
- **WHEN** a proxied API request is received and `API_BASE_URL` is not set
- **THEN** the proxy returns HTTP 500 with a message explaining that `API_BASE_URL` was not configured

### Requirement: Cookie Proxying
The proxy SHALL preserve backend cookies in responses and normalize cookie attributes for local non-HTTPS development.

#### Scenario: Backend returns Set-Cookie
- **WHEN** the upstream response includes cookies
- **THEN** the proxy forwards them to the browser, removes upstream domain binding, and relaxes Secure/SameSite=None for non-HTTPS requests

### Requirement: Development Login Retry

Frontend services SHALL NOT attempt to sign in automatically after an unauthorized backend response.

#### Scenario: Backend request is unauthorized

- **WHEN** a frontend service request receives HTTP 401
- **THEN** the service does not submit fixed or stored credentials to `/auth/sign-in`
- **AND** the application treats the active session as absent or expired

### Requirement: Service Error Normalization
Frontend services SHALL return tuple-style results and normalize backend error messages for UI display.

#### Scenario: Backend request fails
- **WHEN** an API operation fails
- **THEN** the service returns a null or empty result plus an Error with the best available backend message

