## Context

See `proposal.md` for the motivation and the delta specs for the behavior contract. Today `/cadastro` calls the public `POST /user` operation with arbitrary `DEFAULT` account data, while the advisor relationship is created later by mandatory onboarding. The frontend is not a security boundary: preventing unauthorized accounts requires the backend to validate and consume invitations during registration.

The invitation UI fits the existing administrator-only “Meus orientandos” workspace. Backend calls must continue through `/api/backend/*`, authenticated operations use the backend-managed `HttpOnly` session, and services preserve tuple-style results and normalized errors.

## Goals / Non-Goals

**Goals:**

- Give an authenticated advisor a compact action for creating an email-bound registration invitation and copying its link.
- Welcome the invited visitor on the login screen with the issuing advisor's identity, photo or avatar fallback, and concise account-creation guidance.
- Ensure direct registration access cannot create an account without backend-confirmed invitation authority.
- Create the invited account, its `MAIN_ADVISOR` relationship, and invitation consumption atomically.
- Let the invited person create and confirm their own password through the existing registration interaction.
- Keep the invitation token transient and minimize its exposure in URLs, logs, and browser storage.
- Preserve the current standard-account fields, credential privacy, success notification, and return to login.

**Non-Goals:**

- Send invitation email, SMS, or another outbound message from Lumina.
- Add a general invitation-management history, resend, revoke, or bulk-invite experience.
- Authorize registration solely because an advisor previously entered an email outside an invitation flow.
- Let the invited person choose or replace the advisor established by the invitation.
- Generate, reveal, or transmit a provisional password on behalf of the invited person.
- Remove the existing onboarding safety net for legacy `DEFAULT` accounts that still lack an active advisor.

## Decisions

### Place invitation creation in “Meus orientandos”

Add a “Convidar orientando” action to `/documentos/orientandos`. It opens a focused accessible dialog containing the email field, submission state, backend errors, and the generated link with a copy action. This keeps the action beside the advisor's existing read-only roster without turning the list itself into a mutation workflow.

A separate top-level route was rejected for the initial scope because the change has only one creation action and no invitation catalog to manage.

### Use a friendly invitation route and a temporary HttpOnly authorization

Represent the shareable link as `/convite/<opaque-token>`. A public Next.js route handler receives the token, exchanges it with the backend for a short-lived invitation authorization carried by an `HttpOnly`, `SameSite=Lax` cookie, relays any backend cookie safely, and redirects to `/login`. The login and registration clients inspect invitation state through backend operations without reading the raw token. This removes the credential from the visible URL immediately after entry and preserves it when navigating from login to registration without `localStorage`, `sessionStorage`, IndexedDB, or JavaScript-managed cookies.

The backend stores only a secure representation of the raw token where its platform permits, associates it with the normalized email, issuing advisor, creation time, expiration, and consumption state, and returns the raw token only when creating the invitation. Tokens must have sufficient entropy to resist guessing. The temporary authorization must expire no later than the invitation and must be cleared when the invitation is consumed or found unusable.

Keeping the token in a query string or fragment throughout login and registration was rejected because it would remain visible or browser-readable longer than necessary. Persisting it in browser-accessible storage was rejected because it would unnecessarily widen access to a bearer credential.

### Introduce explicit backend invitation operations

The frontend will integrate with three backend behaviors through the existing proxy:

- an authenticated create-invitation operation receiving the recipient email and returning the raw token, invited email, and expiration metadata;
- a public invitation-acceptance operation receiving the raw token from the friendly route and establishing the temporary `HttpOnly` invitation authorization;
- a public current-invitation operation using that authorization and returning only the data needed by login and registration, including the invited email and a display-safe advisor identity and invitation-scoped photo reference;
- an updated public registration operation using the same invitation authorization with the existing account fields.

Exact endpoint paths and generated response names must follow the backend's published OpenAPI contract at implementation time. The frontend must not simulate validation locally or interpret a token payload.

### Keep the invited email visible but immutable

After successful validation, show the email in the registration form as a read-only value. The registration request relies on the temporary invitation authorization rather than a browser-authoritative email override. The backend resolves the canonical invited email from the invitation and rejects any conflicting submitted value.

Allowing email editing with a client-side comparison was rejected because it adds ambiguity and cannot enforce authorization.

### Keep password creation with the invited person

Preserve the current password and confirmation fields after the invitation has been validated. The invited person enters both values normally, the frontend checks that they match, and only the password is submitted through the internal backend proxy as part of registration. Neither the advisor nor the invitation creation response receives, defines, or exposes a password.

A provisional password generated by the platform or chosen by the advisor was rejected because it would introduce an unnecessary credential-delivery flow, weaken privacy, and diverge from the existing registration experience.

### Present the invitation on the login screen before registration

After `/convite/<token>` establishes invitation authorization and redirects, `/login` requests the current invitation summary. A valid response opens an accessible modal above the existing login UI with the advisor name, an invitation-authorized profile photo rendered through the backend proxy, and the explanation that the visitor was invited and only needs to create an account normally. Reuse the existing avatar behavior so missing or failed photos fall back to readable initials without hiding the advisor identity.

The modal provides a visible “Entendi” action that closes it and leaves the visitor on login. Dismissal state remains component-local and is not persisted; the invitation authorization remains active. The login page's create-account link leads to `/cadastro`, where the backend-confirmed invitation is read from the same `HttpOnly` authorization. A direct link from the modal to registration was rejected for this requested interaction because “Entendi” is meant only to acknowledge and close the welcome message.

The backend must not make an advisor's general private profile publicly readable. It may return an invitation-scoped photo reference or authorize the existing image response only while the valid invitation authorization is present.

### Make registration and relationship creation one backend transaction

The registration request is the only operation that consumes the invitation. Within one transaction, the backend revalidates token state and expiration, verifies email uniqueness, creates the `DEFAULT` user, creates the active `MAIN_ADVISOR` relationship to the issuing advisor, and marks the invitation consumed. Concurrent submissions for the same token must result in at most one account.

Creating the user and relationship through separate frontend requests was rejected because network or validation failures could leave an unauthorized account, an account without its intended advisor, or a consumed invitation without a usable account.

### Treat all unusable invitation states as blocked registration

While invitation acceptance or validation is pending, show a neutral loading state rather than advisor identity or the registration form. Missing, malformed, expired, consumed, revoked if supported, and unknown invitations do not disclose advisor data and produce Portuguese guidance to request a valid link. Detailed backend diagnostics may be normalized for the user so the interface does not reveal whether a specific token ever existed.

The direct-access notice may mention that prior authorization by email could become another route later, but it must not imply that this unsupported flow currently permits registration.

### Preserve onboarding as a compatibility safety net

A successfully invited account already has a main advisor, so the existing authenticated startup check will complete without showing the selection dialog. The onboarding dialog remains for legacy or administratively repaired accounts without an active relationship; removing it would broaden this change and weaken an existing invariant.

## Risks / Trade-offs

- [Backend support is required before the frontend can enforce the gate] -> Treat the backend contract and transactional behavior as implementation prerequisites; never ship only the visual block while `POST /user` remains publicly usable without a token.
- [Invitation links are bearer credentials and can be forwarded] -> Bind the token to the invited email, use high entropy, enforce expiration and one-time consumption, and avoid persistent browser storage.
- [The friendly path can appear briefly in access logs] -> Exchange it immediately for a short-lived `HttpOnly` authorization, avoid logging route parameters in application diagnostics, and scrub the token through redirect to `/login`.
- [Advisor photos are needed before authentication] -> Scope photo access to the active invitation authorization and retain initials as a non-sensitive failure fallback.
- [A copied link may expire before use] -> Show a generic actionable message and let the recipient request a new link from the advisor.
- [Clipboard APIs may be unavailable or denied] -> Keep the generated link visible and selectable as a manual-copy fallback.
- [Two submissions may race] -> Enforce single consumption with a backend transaction and uniqueness/locking semantics rather than client state.
- [The advisor's account may become unavailable before registration] -> Revalidate that the issuing advisor can own the relationship when consuming the invitation and fail without partial writes.

## Migration Plan

1. Add the backend invitation model, authenticated creation, public acceptance, temporary invitation authorization, current-invitation summary, and scoped advisor-photo behavior without yet disabling legacy registration.
2. Extend registration to consume the temporary invitation authorization and atomically create the user, relationship, and consumption record.
3. Deploy the frontend invitation creator, friendly invitation entry route, login popup, and invite-aware registration route.
4. After the invite-aware frontend is available, make the backend reject every public `DEFAULT` registration request without a valid invitation.
5. Verify direct API requests, expired and reused tokens, concurrent submissions, email mismatch, and rollback behavior before considering the gate active.

Rollback must restore the prior frontend and backend registration policy together. Re-enabling the old frontend alone is insufficient if the backend requires tokens, and removing the frontend gate alone must never reopen unrestricted backend registration accidentally.
