## 1. Backend contract prerequisites

- [x] 1.1 Confirm in the published OpenAPI the link-based invitation creation, public lookup, invited registration, authenticated acceptance, refusal, listing, and cancellation operations.
- [ ] 1.2 Verify that `POST /invitations/{token}/register` creates the account and relationship atomically and establishes the backend-managed `HttpOnly` authenticated session promised by the flow.
- [ ] 1.3 Define and publish public backend operations to validate one usable pending authorization by normalized email and register atomically from that authorization without requiring the invitation code.
- [ ] 1.4 Define deterministic backend behavior when the same email has multiple pending invitations and prevent disclosure of unrelated invitation records.
- [ ] 1.5 Reject unrestricted `DEFAULT` registration through `POST /user` after both invited-registration paths are available.
- [ ] 1.6 Change invited registration to omit the password and atomically create a passwordless account with `password_setup_required: true`, consume the invitation, create the relationship, and establish the `HttpOnly` session.
- [ ] 1.7 Expose the authoritative `password_setup_required` state in `GET /user/my` and keep it true across requests and page reloads until first-password setup succeeds.
- [ ] 1.8 Secure `PUT /auth/password` so `current_password: null` is accepted only for the authenticated account while `password_setup_required` is true, then store the password and clear the flag atomically.
- [ ] 1.9 Define and verify recovery behavior when the passwordless invited account loses its session before first-password setup completes.

## 2. Frontend integration layer

- [x] 2.1 Read the relevant local Next.js 16 App Router, dynamic route, query parameter, and route-handler guidance before changing public routes.
- [x] 2.2 Add types for invitation creation, public inspection, status, invited registration, acceptance, and refusal without modeling the invitation code as authentication state.
- [x] 2.3 Add tuple-style service operations for `POST /invitations`, `GET /invitations/{token}`, `POST /invitations/{token}/register`, `POST /invitations/{token}/accept`, and `POST /invitations/{token}/reject` through `/api/backend/*`.
- [ ] 2.4 Add email-authorization validation and registration services after their backend OpenAPI operations are published.
- [x] 2.5 Ensure invitation registration never stores or renders the returned access token and relies only on a relayed backend `HttpOnly` session cookie.
- [ ] 2.6 Extend authenticated-user types with `password_setup_required` and add a tuple-style service for authenticated first-password definition through `/api/backend/*`.

## 3. Advisor authorization and link experience

- [x] 3.1 Add an administrator-only “Convidar orientando” action to `/documentos/orientandos`.
- [x] 3.2 Implement an accessible dialog with recipient-email validation, submission state, normalized errors, and safe reset/close behavior.
- [x] 3.3 Create the pending authorization with `MAIN_ADVISOR` and build the absolute `/convite?token=<código>` link from the returned code.
- [x] 3.4 Present the authorized email and expiration plus a copy action with confirmation and a visible selectable manual-copy fallback.
- [x] 3.5 Verify that invitation creation sends no email, requests no password, creates no active advisee relationship, and persists no invitation code in browser storage.
- [x] 3.6 Add tuple-style invitation listing and cancellation services using `GET /invitations` scoped by current `inviter_id` and `DELETE /invitations/{invitation_id}`.
- [x] 3.7 Add the administrator-only “Links ativos” action and accessible dialog with loading, empty, refresh, and error states plus the used-link notice.
- [x] 3.8 Defensively show only invitations issued by the authenticated advisor that remain `PENDING` and unexpired, with recipient, expiration, selectable link, and copy action.
- [x] 3.9 Add confirmed “Excluir link” cancellation and remove an item only after backend success.
- [x] 3.10 Verify that used, rejected, cancelled, and expired invitations leave “Links ativos” while backend records may remain available for audit.
- [x] 3.11 Pass the active advisee emails to the invitation dialog, normalize the submitted email, and warn without calling `POST /invitations` when that account already has an active relationship with the authenticated advisor.

## 4. Invitation landing and terminal actions

- [x] 4.1 Add `/convite` as a public route that reads the query code and loads `GET /invitations/{token}` without logging or persisting the code.
- [x] 4.2 Present loading, valid, expired, rejected, cancelled, consumed, malformed, unknown, and backend-error states without disclosing unrelated data.
- [x] 4.3 Show inviter name, invited email, expiration, and optional project/topic for a usable invitation.
- [x] 4.4 Route `user_exists: false` to `/cadastro?convite=...` and `user_exists: true` to `/login?convite=...` while preserving the encoded code.
- [x] 4.5 Add a confirmed refusal action using `POST /invitations/{token}/reject` and replace actions with the terminal result after success.
- [x] 4.6 Wait for the session check on `/convite` and present an unavailable state without invitation inspection, acceptance, refusal, or mutation when the route was entered with an authenticated session.

## 5. Registration through the shared link

- [x] 5.1 Update `/cadastro?convite=...` to revalidate the invitation before showing the account form and keep the backend-confirmed email immutable.
- [ ] 5.2 Collect only username and telephone after invitation validation, while omitting password, browser-controlled email, advisor, and access-level values from submission.
- [ ] 5.3 Submit passwordless `POST /invitations/{token}/register`, preserve only non-sensitive values on recoverable failure, and normalize errors.
- [ ] 5.4 Restore the authenticated user after successful registration and keep protected content blocked while `password_setup_required` remains true, without exposing the returned access token.
- [ ] 5.5 After first-password setup, restore active advisors and verify that the created `MAIN_ADVISOR` relationship makes onboarding resolve to `concluida` without displaying the advisor-selection modal.
- [ ] 5.6 Add an accessible mandatory first-password popup ahead of onboarding and protected content, without close action and without Escape or backdrop dismissal.
- [ ] 5.7 Restore the mandatory popup after refresh or reopening from `GET /user/my` while the server flag remains true, without persisting gate state in browser storage.
- [ ] 5.8 Validate password and confirmation, call the authenticated password endpoint, clear sensitive inputs after every response, refresh `/user/my` after success, and release the gate only after the backend clears the flag.

## 6. Existing-account acceptance

- [x] 6.1 Update `/login?convite=...` to load the invitation while preserving ordinary login behavior and readable invalid-invitation feedback.
- [x] 6.2 After successful matching-account login, call `POST /invitations/{token}/accept` with the authenticated cookie and show one success or failure notification.
- [x] 6.3 Prevent frontend acceptance with a visibly mismatched authenticated email while retaining backend validation as the authority.
- [x] 6.4 Redirect successful acceptance to protected content with the new relationship available and without resubmitting credentials.
- [x] 6.5 Distinguish a pre-existing authenticated session from authentication completed inside an initially anonymous invitation flow, blocking the former without consuming the link while preserving acceptance after a fresh matching-account login.

## 7. Registration through an authorized email

- [x] 7.1 Change direct `/cadastro` access to request an email first and keep the full form hidden until backend authorization succeeds.
- [ ] 7.2 Validate the email through the new public backend operation and present generic unauthorized, expired, ambiguous, and unavailable states.
- [ ] 7.3 Register using the exact backend-confirmed authorization, immutable email, no registration password, and atomic account-and-relationship creation operation.
- [ ] 7.4 Restore the authenticated user into the same mandatory first-password gate, then restore the relationship and verify that advisor onboarding is not displayed.

## 8. Verification and rollout

- [ ] 8.1 Verify advisor link generation, already-linked-email warning without a creation request, active-link listing, copy and deletion, used-link removal, invalid and long emails, backend failures, focus behavior, responsive layout, and light/dark themes.
- [ ] 8.2 Verify invitation landing, pre-existing-session blocking without consuming the link, new/existing user branches, refusal, every terminal status, malformed codes, URL encoding, and absence of invitation persistence.
- [ ] 8.3 Verify passwordless link registration, mandatory first-password setup, refresh/reopen restoration, setup errors, existing-account acceptance only after an initially anonymous login flow, concurrent/reused invitations, mismatched accounts, session restoration, and relationship creation.
- [ ] 8.4 Verify email-only authorization, ambiguous/missing authorization, successful registration, and direct backend rejection of unrestricted account creation.
- [ ] 8.5 Verify that passwords, password-gate state, access tokens, invitation codes, and session state never enter browser-accessible storage or rendered errors.
- [ ] 8.6 Run `pnpm lint`, `pnpm build`, and `openspec validate require-advisor-invitation-for-registration --type change` after the passwordless-registration and mandatory-password implementation.
