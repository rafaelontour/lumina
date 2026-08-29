## Context

See `proposal.md` for the motivation. The current public `/login` route already uses the authentication service and the internal `/api/backend/*` proxy, while protected content relies on the backend-managed cookie verified through `GET /user/my`. The API documentation exposes unauthenticated `POST /user`, which accepts `username`, `email`, `phone_number`, `password`, and an `access_level` that defaults to `DEFAULT`.

## Goals / Non-Goals

**Goals:**

- Add a public registration route or view consistent with the existing login presentation.
- Represent the registration payload and response in the authentication service with the established tuple-style error handling.
- Send a fixed `DEFAULT` access level and keep the client free of any elevated-access path.
- Preserve the existing cookie-based sign-in boundary: successful registration returns to login rather than creating client-managed session state.

**Non-Goals:**

- Managing users, permissions, invitation workflows, email verification, password recovery, or administrative account creation.
- Changing the authenticated profile update flow or allowing users to edit their access level.

## Decisions

### Use the documented public user-creation endpoint through the existing proxy

The authentication service will submit JSON to `POST /api/backend/user`, using the API's `UserCreate` shape. This retains a single browser-facing backend origin and the service's normalized tuple errors. Calling the API origin directly was rejected because it would bypass the existing proxy boundary and create a second request pattern.

### Fix the account level in the request and omit it from the UI

The registration form will contain no access-level input. Its request model will set `access_level: "DEFAULT"` as a constant, matching the API schema default. The backend remains authoritative for account creation; the interface never exposes `ADMIN`, `ANALYST`, or `AUDITOR`. Letting the visitor choose a value was rejected because it conflicts with the requested least-privilege self-registration flow.

### Keep account creation separate from sign-in

After a `201` response, the UI will show one success notification and take the visitor to `/login`, optionally carrying only a non-sensitive email/username convenience value in component state or route-local UI. It will not call sign-in automatically or store an API token. Automatic sign-in was rejected because it would blur the existing explicit-session boundary and add credential handling after registration.

### Validate inputs locally, treat backend validation as authoritative

The UI will require the documented account fields, validate email and password confirmation before submission, and show localized messages. Backend validation and duplicate-identity errors remain authoritative and are displayed through the existing normalization helper. Client-only validation was rejected because it cannot guarantee API acceptance.

## Risks / Trade-offs

- [The API accepts an access-level field and may change its default] → Always submit the explicit `DEFAULT` value and verify the created response before presenting success.
- [A public account-creation endpoint can be abused] → Keep the UI scope limited; server-side abuse protection, verification, and authorization enforcement remain backend responsibilities.
- [An account might be created although a client navigation or notification fails] → Never retry the creation request automatically; preserve the backend error or success outcome and let the visitor sign in manually.
- [Password fields can be exposed through UI state or logs] → Keep them only in transient component state, clear them after submission completes, and never include them in notifications or browser storage.

## Migration Plan

1. Deploy the registration service, public route/view, and login navigation together.
2. Verify a new account is created with `DEFAULT`, cannot select another level, remains anonymous after registration, and can then sign in normally.
3. Roll back the frontend release to remove the public entry point if the backend behavior is incompatible; no browser-stored migration state is involved.
