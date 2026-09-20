## 1. Backend contract and security prerequisite

- [ ] 1.1 Define and publish in the backend OpenAPI contract the authenticated invitation-creation operation, public invitation acceptance and current-invitation operations, scoped advisor-photo response, and invite-aware registration behavior.
- [ ] 1.2 Implement backend persistence for opaque email-bound invitations with issuing advisor, expiration, consumption state, and secure token handling.
- [ ] 1.3 Implement a short-lived `HttpOnly`, `SameSite=Lax` invitation authorization established from the raw token, cleared when unusable or consumed, and never exposed to browser JavaScript.
- [ ] 1.4 Implement transactional invited registration that revalidates the temporary authorization, creates the `DEFAULT` account, creates its active `MAIN_ADVISOR` relationship, and consumes the invitation atomically.
- [ ] 1.5 Make the backend reject registration without a valid invitation and cover missing, malformed, expired, consumed, email-mismatched, concurrent, and unauthorized invitation requests without disclosing advisor data for unusable invitations.

## 2. Frontend integration layer

- [ ] 2.1 Read the relevant local Next.js 16 App Router and route-handler guidance before changing the public invitation, login, or registration routes.
- [ ] 2.2 Add invitation request and response types for recipient, expiration, advisor name, and invitation-scoped photo metadata without exposing raw token values through logs or browser-accessible storage.
- [ ] 2.3 Add tuple-style service operations for authenticated invitation creation, public current-invitation lookup, and invited registration through `/api/backend/*`, using the backend OpenAPI contract and normalized Portuguese errors.
- [ ] 2.4 Update standard registration data handling so the temporary `HttpOnly` invitation authorization accompanies account creation automatically and the backend remains authoritative for the invited email and advisor.

## 3. Advisor invitation experience

- [ ] 3.1 Add an administrator-only “Convidar orientando” action to `/documentos/orientandos` without exposing it to non-administrator accounts.
- [ ] 3.2 Implement an accessible invitation dialog with recipient email validation, submission state, normalized failure feedback, and safe reset and close behavior.
- [ ] 3.3 Build the friendly `/convite/<opaque-token>` link from a successful backend response and present its recipient and expiration information where available.
- [ ] 3.4 Add a copy action with confirmation plus a visible, selectable manual-copy fallback when the Clipboard API is unavailable or denied.
- [ ] 3.5 Verify that creating an invitation does not send email, mutate the current advisee list, request a password, or persist the invitation token in browser storage.

## 4. Invitation entry and login popup

- [ ] 4.1 Add the public `/convite/[token]` route handler that exchanges the opaque token for temporary backend invitation authorization, relays the `HttpOnly` cookie, avoids application logging of the token, and redirects to `/login`.
- [ ] 4.2 Load the current invitation summary on `/login` and keep the existing login usable while handling invitation loading, valid, invalid, expired, and consumed states.
- [ ] 4.3 Implement an accessible welcome popup with the advisor's name, invitation-authorized photo through the backend proxy, initials fallback, invitation message, normal-account-creation instruction, and an “Entendi” close action.
- [ ] 4.4 Keep popup dismissal in component-local state, preserve the backend invitation authorization after dismissal, and make the login create-account action navigate to `/cadastro` without exposing or requiring the raw token.
- [ ] 4.5 Ensure unusable invitations disclose neither advisor name nor photo and instead present readable Portuguese guidance to request a new invitation.

## 5. Invite-gated registration experience

- [ ] 5.1 Update `/cadastro` to load the current invitation authorization before displaying the registration form.
- [ ] 5.2 Present distinct loading, valid-invitation, and blocked-registration states without briefly exposing an enabled form before validation completes.
- [ ] 5.3 Show the Portuguese invitation-required notice for direct access and invalid, expired, or consumed invitations, including the future email-authorization guidance without presenting it as currently available.
- [ ] 5.4 Prefill the backend-confirmed invited email as a visible immutable value while letting the invited person create and confirm their own password with the existing mismatch validation.
- [ ] 5.5 Submit invited registration using the `HttpOnly` invitation authorization, clear password fields after every response, preserve only non-sensitive values on recoverable failure, and return successful registrations to `/login` with an appropriate Sonner notification.
- [ ] 5.6 Ensure authenticated visitors still leave the public registration route and that a newly registered user restores the pre-created advisor relationship on first login without seeing advisor selection.

## 6. Verification and rollout

- [ ] 6.1 Verify successful invitation creation, automatic and manual link copying, long emails, invalid email, backend failure, keyboard interaction, focus handling, responsive layout, and light and dark themes.
- [ ] 6.2 Verify friendly-link entry, immediate token removal from the visible URL, popup identity and copy, advisor photo and initials fallback, “Entendi” dismissal, invitation-preserving navigation, and popup accessibility.
- [ ] 6.3 Verify direct `/cadastro` access, malformed and unknown tokens, expiration, reuse, email mismatch, concurrent submission, unavailable advisor, existing username or email, successful account creation, and automatic advisor association.
- [ ] 6.4 Verify through direct backend requests that the frontend cannot be bypassed to create a `DEFAULT` account without a valid invitation and that failed transactions leave no partial account, relationship, or consumed invitation.
- [ ] 6.5 Verify that invitation credentials and passwords never enter `localStorage`, `sessionStorage`, IndexedDB, JavaScript-managed cookies, rendered errors, or application logs.
- [ ] 6.6 Verify that only the invited person defines and confirms the account password and that invitation creation never requests, generates, displays, or returns a password to the advisor.
- [ ] 6.7 Run `pnpm lint` and `pnpm build` after the frontend implementation.
- [ ] 6.8 Run `openspec validate require-advisor-invitation-for-registration --type change` after implementation and confirm the coordinated frontend/backend rollout order.
