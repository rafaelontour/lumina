## 1. Authentication foundation

- [x] 1.1 Add typed tuple-style operations for explicit sign-in, current-user lookup, and sign-out through `/api/backend`.
- [x] 1.2 Remove fixed credentials and all automatic sign-in/retry behavior from shared and feature services.
- [x] 1.3 Add in-memory session state that checks the current backend user and handles later unauthorized responses.

## 2. Login and protected platform

- [x] 2.1 Add the public Portuguese login route with accessible credential fields, pending state, backend error feedback, and a responsive Lumina-branded animated visual panel.
- [x] 2.2 Protect platform routes until the session check confirms an authenticated user, and redirect anonymous visitors to login.
- [x] 2.3 Redirect successful login and already authenticated login visitors to `/`.
- [x] 2.4 Add a visible sign-out action that ends the backend session and returns the user to login.

## 3. Security and verification

- [x] 3.1 Confirm credentials and returned access tokens are never written to browser-accessible storage or rendered in the UI.
- [x] 3.2 Verify the existing account can sign in, survive a reload, access protected routes, and sign out through the proxy.
- [x] 3.3 Verify invalid credentials and expired/absent sessions keep protected content hidden and provide the expected login flow.
- [x] 3.4 Run `pnpm lint`, `pnpm build`, and `openspec validate add-user-login --type change`.
