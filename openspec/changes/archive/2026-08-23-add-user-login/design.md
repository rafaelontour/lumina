## Context

See `proposal.md` for the motivation. The application already proxies backend cookies through its own origin, but services currently hide unauthenticated responses by using a fixed demonstration account. The API exposes a cookie-oriented sign-in endpoint, a sign-out endpoint, and an authenticated current-user endpoint.

## Goals / Non-Goals

**Goals:**

- Establish and restore an explicit user session through the backend cookie.
- Prevent protected application content from being used without a valid session.
- Remove fixed credentials and automatic re-authentication from frontend services.
- Keep credentials, access tokens, and session state out of browser storage.

**Non-Goals:**

- User registration, password recovery, password reset, profile editing, or refresh-token management.
- Persisting the authenticated user profile across a browser reload.
- Replacing the backend's session or token issuance implementation.

## Decisions

### Use the cookie session, never browser token storage

The login form sends credentials as `application/x-www-form-urlencoded` to `/api/backend/auth/sign-in` with credentials enabled. The browser stores only the `HttpOnly` session cookie forwarded by the proxy; the client ignores the API's `access_token` response field and never writes authentication data to `localStorage`, `sessionStorage`, IndexedDB, cookies created by JavaScript, or URL parameters. This keeps session secrets inaccessible to application JavaScript.

The alternative of storing the returned access token in browser storage was rejected because it would make the credential recoverable by scripts and browser inspection of storage.

### Verify authentication with the current-user endpoint

An in-memory authentication provider starts in a checking state and calls `GET /api/backend/user/my` on every full page load. A successful response establishes the current user for the mounted application; an unauthorized or failed response establishes an anonymous state. Protected route content waits for this decision and redirects anonymous visitors to `/login` rather than briefly rendering the application shell.

Server-only routing based only on cookie presence was rejected because a stale or invalid cookie does not prove that the backend session is valid. The authenticated endpoint remains the authority.

### Redirect only to the platform home after successful sign-in

After a successful sign-in, the client obtains the current user and navigates to `/`. The login route redirects an already authenticated visitor to `/`. This release does not preserve or replay a requested deep link, which keeps the first authentication flow deterministic.

### Give the public route an independent animated presentation

The `/login` route sits outside the authenticated application shell and uses a simple two-area, full-height composition inspired by the supplied reference: an accessible credential form and a separate Lumina-branded visual panel. The motion is implemented with Lumina's existing UI tooling and identity rather than reusing another product's assets or source. It remains decorative; narrow layouts and `prefers-reduced-motion` keep the form usable without it.

### Treat 401 as an expired or absent session, not as a reason to log in automatically

Shared service handling removes `entrarComCredenciaisFixas` and every retry that posts credentials after a 401. A protected request that receives 401 makes the in-memory session anonymous and directs the user to login; other errors retain existing tuple-style normalization. Sign-out calls `/auth/sign-out`, clears in-memory identity after a successful response, and navigates to `/login`.

The old automatic retry was rejected because it silently authenticates every visitor as the same account and embeds a password in the frontend bundle.

## Risks / Trade-offs

- [Backend cookie attributes or proxy forwarding are incompatible in a deployed origin] → Validate sign-in, reload, and sign-out through `/api/backend` in HTTPS and local development before release.
- [A protected request returns 401 after initial session validation] → Clear the in-memory identity, stop exposing protected UI, and show the login route instead of retrying with credentials.
- [Decorative motion hinders accessibility or small-screen use] → Respect reduced-motion preferences and allow the visual panel to reduce, reposition, or disappear without changing login behavior.
- [The API returns an access token in the login response] → Do not store, expose, or use the field in the frontend; session authorization continues via the backend cookie.

## Migration Plan

1. Deploy the login route and session provider together with removal of the fixed credentials.
2. Validate the existing account through the login form, then confirm `/user/my`, a full reload, and sign-out.
3. Roll back by restoring the previous frontend release if the backend session cookie cannot be established; no browser-stored migration data is involved.
