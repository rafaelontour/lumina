## Context

See `proposal.md` for motivation and the delta specs for the behavior contract. The published backend already exposes creation and listing at `/invitations`, public inspection at `/invitations/{token}`, one-step registration at `/invitations/{token}/register`, authenticated acceptance at `/invitations/{token}/accept`, and refusal at `/invitations/{token}/reject`.

The backend calls the opaque invitation code a `token`, but it is not an authentication/session token. The code is part of the shared link and is required by the current endpoint paths. The OpenAPI contract does not yet expose public lookup or registration using only an authorized email, so that second entry path requires a coordinated backend addition.

Frontend requests continue through `/api/backend/*`; authenticated state remains in backend-managed `HttpOnly` cookies. Services preserve tuple-style results and normalized Portuguese errors.

## Goals / Non-Goals

**Goals:**

- Let an advisor authorize one email and copy the link returned for that pending invitation.
- Warn the advisor and avoid creating another invitation when the normalized email already belongs to one of that advisor's active advisees.
- Let an advisor inspect and cancel their pending, unexpired links in a “Links ativos” section.
- Give a link recipient a dedicated invitation page with advisor identity and invitation context.
- Route new recipients to invited registration and existing users to login followed by authenticated acceptance.
- Block invitation actions when the browser already has an authenticated session on entry, while preserving the pending link for later anonymous use.
- Let an invited person reject a pending invitation.
- Add direct registration by an email previously authorized by an advisor when the backend publishes the required operation.
- Create invited accounts without collecting a password during registration and require the authenticated user to define the first password before onboarding or protected content.
- Ensure invited registration creates the relationship before protected content loads, so advisor onboarding is not displayed after the password gate.
- Keep passwords, access tokens, and session state out of browser-accessible persistence.

**Non-Goals:**

- Send invitation email, SMS, or another outbound message from Lumina.
- Add historical invitation browsing, resend, or bulk management to the first frontend delivery.
- Let the recipient change the invited email, role, project, topic, or issuing advisor.
- Generate, expose, or let the advisor define a provisional password.
- Remove onboarding for legacy accounts that genuinely have no active main advisor.

## Decisions

### Create the authorization and link in “Meus orientandos”

Add an administrator-only “Convidar orientando” action to `/documentos/orientandos`. Its accessible dialog collects the recipient email and initially uses `MAIN_ADVISOR`; optional project and topic fields can be represented when their valid values are available. `POST /invitations` returns the pending invitation and code. The client constructs an absolute `/convite?token=<encoded-code>` link from the current application origin and keeps it visible and selectable.

The action neither sends an email nor mutates the active-advisee list, because a pending invitation is not yet a relationship.

Before submission, the dialog normalizes the entered email and compares it with the active advisee emails already loaded by the workspace. A match produces the inline warning “Já existe um vínculo ativo com esta conta” and does not call `POST /invitations`. Backend duplicate-relationship or stale-data errors remain authoritative and are still presented through the existing normalized error path.

### Manage only active links in the advisor workspace

Place a “Links ativos” action beside “Convidar orientando”. It opens an accessible dialog and calls authenticated `GET /invitations` with `inviter_id` set to the current advisor and `status=PENDING`. The client still filters by issuing advisor, pending status, and future `expires_at` so an over-broad or stale response never exposes another advisor's link as active.

The dialog explains that a link disappears after use. Each item shows the authorized email, expiration, complete selectable link, and copy action. Empty, loading, refresh, and failure states remain inside the dialog.

Deleting an item requires explicit confirmation and calls `DELETE /invitations/{invitation_id}`. The item is removed only after backend success. In backend terms this cancels the invitation; “Excluir link” is the user-facing action because the link immediately stops being usable. Accepted, rejected, cancelled, and expired records may remain stored for auditing, but are not part of “Links ativos”.

### Treat the invitation code as URL data, not session state

The invitation code remains in the shared `/convite?token=...` URL and is forwarded in navigation to `/cadastro?convite=...` or `/login?convite=...` only while needed. It is encoded as a path segment when calling backend invitation operations. It is never interpreted as a JWT, authentication cookie, or authenticated identity and is not stored in local storage, IndexedDB, or JavaScript-managed cookies.

A frontend `HttpOnly` exchange was rejected because the existing backend contract explicitly addresses invitation operations by code and the user clarified that the code is not a session credential.

### Use a dedicated invitation landing page

`/convite` first waits for the existing `AuthProvider` session check. When the browser is anonymous, it reads the query code and calls `GET /invitations/{token}` through the proxy. A usable pending invitation displays the inviter name, authorized email, expiration, and optional project/topic. Invalid or terminal invitations show a generic blocked state.

When that initial session check reports an authenticated user, the landing page presents an unavailable state and does not inspect, accept, or reject the invitation. This is a client interaction guard only: it does not mutate the invitation, so the pending link remains valid for a later visit without an authenticated session.

When `user_exists` is false, the primary action opens `/cadastro?convite=...`. When true, it opens `/login?convite=...`. A confirmed refusal calls the public reject endpoint and replaces the available actions with a terminal state.

### Register new recipients with the invitation endpoint

`/cadastro?convite=...` revalidates the invitation before rendering the full form and fixes the email to the backend value. Submission sends only username and phone number to `POST /invitations/{token}/register`; it does not send a password, `access_level`, or a browser-selected advisor.

The backend creates an account without a usable password, marks it with `password_setup_required: true`, creates the relationship, consumes the invitation, and establishes the session atomically. If the response still includes an access token in JSON, the frontend must not store or render it. The internal proxy relays the backend's `Set-Cookie` session response, and the client restores the user through `GET /user/my`. If the deployed backend does not actually set the authenticated cookie, that is a backend contract defect and must not be compensated by persisting the returned bearer token.

After session restoration, the password gate runs before advisor onboarding. Once the first password is defined and `/user/my` reports that the requirement is cleared, the existing `AuthProvider` checks `/advisorship/my-advisors`. Because invited registration already created the active relationship, onboarding resolves to `concluida`; the selection modal remains only for legacy or inconsistent accounts without a relationship.

### Gate the authenticated application until the first password is defined

Extend the authenticated user contract with the backend-authoritative boolean `password_setup_required`. `AuthProvider` obtains it from `GET /user/my` on every full page load. `AppShell` gives this state precedence over advisor onboarding and protected content and renders an accessible, non-dismissible password popup while the value is true. Close controls are omitted, and Escape or backdrop interaction cannot bypass the gate.

The popup validates a new password and confirmation, then calls authenticated `PUT /auth/password` through `/api/backend`. The request uses the authenticated user's id, `current_password: null`, and `new_password`. The backend must accept a null current password only when that same authenticated account is marked for first-password setup; it stores the password and clears the flag in one transaction. Ordinary password changes continue to require their existing authorization rules.

After success, the frontend reloads `GET /user/my` and releases the gate only after the server reports `password_setup_required: false`. On failure it keeps the popup open, clears both password inputs, and shows a normalized error. Refreshing or reopening the page before success reconstructs the same mandatory stage from `/user/my`; no password-gate state is persisted in browser storage.

### Accept after login for existing accounts

`/login?convite=...` keeps ordinary login behavior only when the route was entered anonymously. After a successful login performed in that flow, the client verifies that the authenticated email matches the invitation email and calls `POST /invitations/{token}/accept` with the backend-managed session cookie. Acceptance failure keeps the user informed without retrying credentials. Success redirects to protected content with the new relationship available.

If `/login?convite=...` is entered while a session is already authenticated, the page blocks invitation inspection and acceptance instead of treating that pre-existing session as a completed invitation login. It does not sign the user out automatically and does not change the pending invitation.

### Add email-only registration as a backend-coordinated entry

Direct `/cadastro` first asks for an email. The backend must provide a public operation that finds a usable pending authorization for the normalized email without exposing other invitations, then a registration operation that consumes that exact authorization atomically. Exact paths and schemas must follow the published OpenAPI contract.

The frontend must not approximate this by calling authenticated `GET /invitations?email=...`, because an anonymous visitor cannot use that operation, nor by downloading invitation lists. Link registration can ship independently, but the change is not complete until email-only registration is backed by an authoritative backend contract.

### Preserve email ownership limitations explicitly

The current link proves possession of the shared code. Email-only registration proves only knowledge of an authorized address unless the backend adds email verification. The first implementation follows the requested authorization semantics, but the backend remains responsible for preventing ambiguous multiple pending invitations and consuming exactly one authorization. Adding email delivery or verification is a separate security enhancement unless the backend requires it for the new operation.

## Risks / Trade-offs

- [The invitation code remains visible in URLs and may enter browser history or infrastructure logs] -> Use an opaque expiring code, encode it correctly, never log it in application diagnostics, and avoid browser storage.
- [The current OpenAPI lacks email-only lookup and consumption] -> Implement and verify the link flow first; keep email-only completion blocked until the backend publishes the authoritative operations.
- [The registration schema returns an access token in JSON] -> Never persist or render it; rely on the backend-managed `HttpOnly` session cookie promised by the authenticated registration behavior.
- [The current invited-registration schema requires a password and `/user/my` has no setup flag] -> Coordinate the backend schema and authenticated-user contract before enabling the passwordless registration UI.
- [Allowing `current_password: null` could weaken ordinary password changes] -> Permit it only for the authenticated user whose server-side first-password flag is true, then clear that flag atomically.
- [The user refreshes during first-password setup] -> Rebuild the blocking popup from `/user/my` on every full load and never use browser storage as the source of truth.
- [The new user loses the session before defining a password] -> Keep account recovery behavior explicit in the backend contract so the account is not permanently inaccessible.
- [A registered user may log in with the wrong account] -> Compare the authenticated email for immediate feedback and rely on backend validation as the security boundary.
- [A pre-existing authenticated session could auto-accept a shared link] -> Record the entry authentication state, block invitation operations for that visit, and allow acceptance only after login from an initially anonymous invitation flow.
- [The loaded advisee list is stale while an advisor creates a link] -> Block known active-email matches locally and preserve normalized backend conflict feedback as the authoritative fallback.
- [The advisor relationship may not be visible immediately after registration] -> Restore `/user/my` and `/advisorship/my-advisors` before protected content, retaining onboarding only if the canonical relationship is actually absent.
- [Clipboard APIs may fail] -> Keep the complete link visible and selectable for manual copying.
- [An administrator-level listing may return invitations from other issuers] -> Send `inviter_id` and defensively filter every item against the authenticated advisor before rendering its link.

## Migration Plan

1. Update invited registration to create a passwordless flagged account, relationship, consumed invitation, and `HttpOnly` session atomically.
2. Publish `password_setup_required` through `/user/my` and secure first-password definition through the authenticated password endpoint.
3. Implement invitation types/services, the advisor creation dialog, and “Links ativos” listing/cancellation.
4. Implement `/convite`, the pre-existing-session guard, passwordless invited registration, the mandatory first-password gate, existing-account login/acceptance from an anonymous entry, refusal, and relationship restoration.
5. Publish backend operations for validation and atomic registration by authorized email using the same passwordless gate.
6. Enable the email-first `/cadastro` path and then reject unrestricted `POST /user` registration.
7. Verify both paths, terminal invitation states, session and gate restoration after refresh, and absence of advisor onboarding after first-password setup.

Rollback must keep the frontend registration policy aligned with backend enforcement. The unrestricted `/user` route must not remain a bypass once authorization becomes mandatory.
