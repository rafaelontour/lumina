# user-authentication Specification

## Purpose
Provide explicit and secure user access to the Lumina platform through the backend-managed session, without exposing session credentials to application storage.
## Requirements
### Requirement: Explicit user login

The application SHALL provide a public login route that accepts a username or email and password and submits them to the backend sign-in endpoint through the internal proxy.

#### Scenario: Credentials are accepted

- **WHEN** an anonymous visitor submits valid credentials on the login route
- **THEN** the application establishes the backend-managed session
- **AND** presents a transient success notification
- **AND** redirects the visitor to the platform home route `/`

#### Scenario: Credentials are rejected

- **WHEN** an anonymous visitor submits invalid credentials
- **THEN** the application remains on the login route
- **AND** presents a readable authentication error without revealing the password

### Requirement: Animated login presentation

The public login route SHALL present a simple full-height authentication experience with the form and a separate Lumina-branded visual area containing a non-essential ambient animation, following the visual composition of the supplied login reference while preserving Lumina identity.

#### Scenario: Desktop visitor opens login

- **WHEN** a visitor opens the login route on a desktop viewport
- **THEN** the route presents the simple credential form beside the animated visual area
- **AND** the animation does not obscure or prevent use of the form

#### Scenario: Reduced or narrow presentation

- **WHEN** the visitor uses a narrow viewport or requests reduced motion
- **THEN** the login form remains fully usable without depending on the animation
- **AND** any animated visual presentation is reduced, repositioned, or omitted as needed

### Requirement: Temporary password preview

The login form SHALL let a visitor view the entered password only while deliberately holding the password-preview control; it MUST hide the password immediately when that interaction ends.

#### Scenario: Visitor holds the password-preview control

- **WHEN** a visitor presses and holds the password-preview control
- **THEN** the password field displays the entered characters while it remains pressed

#### Scenario: Visitor releases the password-preview control

- **WHEN** the visitor releases, cancels, or moves focus away from the password-preview control
- **THEN** the password field immediately masks the entered characters again

### Requirement: Session restoration and route protection

The application SHALL call the backend current-user endpoint on every full page load to determine session validity before presenting protected platform content. The browser MUST NOT use a cached or persisted authentication state as a substitute for that request.

#### Scenario: Valid session opens the platform

- **WHEN** a visitor opens or reloads a protected route with a valid backend session
- **THEN** the application calls the backend current-user endpoint for that page load
- **AND** restores the authenticated session from its response
- **AND** presents the requested protected platform content

#### Scenario: Anonymous visitor opens a protected route

- **WHEN** a visitor without a valid backend session opens a protected route
- **THEN** the application calls the backend current-user endpoint for that page load
- **AND** redirects the visitor to the login route when the response is unauthorized
- **AND** does not present protected platform content before the session check completes

#### Scenario: Authenticated visitor opens the login route

- **WHEN** a visitor with a valid backend session opens the login route
- **THEN** the application redirects the visitor to the platform home route `/`

### Requirement: User logout

The application SHALL offer an authenticated user an action to end the current backend session.

#### Scenario: User signs out

- **WHEN** an authenticated user chooses to sign out
- **THEN** the application requests backend sign-out
- **AND** clears the active in-memory user state
- **AND** redirects to the login route

### Requirement: Browser authentication privacy

The application SHALL rely on the backend-managed `HttpOnly` session cookie and MUST NOT persist access tokens, passwords, or authentication state in browser-accessible storage.

#### Scenario: Login response is received

- **WHEN** the backend returns a successful sign-in response
- **THEN** the application does not render or persist its access token or the submitted password
- **AND** authentication continues through the backend-managed session cookie

#### Scenario: Browser storage is inspected

- **WHEN** a user signs in, refreshes the application, or signs out
- **THEN** `localStorage`, `sessionStorage`, IndexedDB, and JavaScript-managed cookies contain no password, access token, or persisted authentication state

### Requirement: In-memory authenticated profile refresh

The application SHALL replace its in-memory authenticated user data only after the backend confirms a personal-profile update or after it re-reads the current user. It MUST NOT persist the updated profile as an authentication substitute in browser storage.

#### Scenario: Profile update is confirmed

- **WHEN** the backend confirms an update to the authenticated user's personal profile
- **THEN** the application updates its in-memory authenticated user data for shared UI
- **AND** does not write authentication state, credentials, or access tokens to browser storage

### Requirement: Public authentication navigation

The public authentication area SHALL let an anonymous visitor navigate between sign-in and standard-user registration without exposing protected platform content.

#### Scenario: Visitor chooses to create an account

- **WHEN** an anonymous visitor chooses the registration action from the login experience
- **THEN** the application presents the standard-user registration experience
- **AND** keeps the visitor outside the authenticated application shell

#### Scenario: Registered visitor returns to sign-in

- **WHEN** a visitor chooses to sign in after completing or leaving registration
- **THEN** the application presents the login experience
- **AND** does not assume that registration established an authenticated session

