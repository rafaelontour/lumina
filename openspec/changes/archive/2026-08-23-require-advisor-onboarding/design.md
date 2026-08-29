## Context

See `proposal.md` for the motivation and `specs/advisor-onboarding/spec.md` for the behavioral contract. The authenticated application currently restores the backend cookie session in memory before rendering protected routes, but it has no client for advisory relationships or user candidates. Lumina Back provides `GET /advisorship/my-advisors`, `GET /user`, and `POST /advisorship`; advisory roles are contextual to a relationship rather than a property exposed on the user model.

## Goals / Non-Goals

**Goals:**

- Gate only `DEFAULT` accounts that lack an active advisor.
- Establish the first relationship through the backend and use the backend as the source of truth on every full page load.
- Keep the existing cookie-only authentication privacy model intact.
- Provide administrators, temporarily acting as professors, a dedicated view of their own advisees.

**Non-Goals:**

- User registration, user-management screens, advisor invitations, approval workflows, or management of an existing advisor relationship.
- Requiring orientation for `ADMIN`, `ANALYST`, or `AUDITOR` accounts.
- Persisting onboarding completion in browser storage.
- A permanent separation between platform-administrator and professor roles, or administrative management of all advisory relationships.

## Decisions

### Gate from authenticated session state, not only after login navigation

The session layer will load the current user's active advisors after it has restored the user and will expose an advisor-onboarding state alongside authentication state. The protected shell will render the mandatory dialog while that state is unresolved or required, so reloads and direct links cannot bypass it.

Handling the dialog only in the login page was rejected because a valid cookie can enter through a reload or any protected URL without visiting that route.

### Treat the advisory relationship as the completion record

For `DEFAULT` users, `GET /advisorship/my-advisors?status=ACTIVE` determines whether onboarding is complete. After a successful `POST /advisorship`, the session layer reuses the accepted relationship or refreshes this list before unblocking the route. No completion flag is written to localStorage, sessionStorage, IndexedDB, or a JavaScript-managed cookie.

A local completion flag was rejected because it could become stale after relationship removal and would allow browser state to bypass the backend policy.

### Use the user directory as the current candidate source

The backend does not expose a separate advisor directory or a professor access level: the `MAIN_ADVISOR` role is assigned only when a relationship is created. The dialog will therefore load `GET /user`, remove the current user, and present the remaining users as selectable candidates. Saving posts the authenticated user as `advisee_id`, the selected user as `advisor_id`, and `MAIN_ADVISOR` as `role_type`.

Filtering candidates by `ADMIN` was rejected because the published API does not define administrators as advisors and would incorrectly exclude valid professors with another access level.

### Keep the modal unavoidable but recoverable

The dialog will not include a close action and will ignore backdrop and Escape dismissal. It will retain the selection on request failure, expose the backend-normalized error, and allow retry. When no candidates can be loaded, it will remain blocking with a retry action instead of claiming completion.

Redirecting the user to login on a failed save was rejected because it does not address the missing relationship and makes the required selection harder to complete.

### Treat administrators as professors for the current advisee workspace

Until the backend exposes a distinct professor role, the navigation and route gate will expose `/orientandos` only to `ADMIN` accounts. Its data source will be `GET /advisorship/my-advisees`, which derives the list from the authenticated advisor rather than accepting an advisor id from the browser. The screen will show its own loading, empty, and error states and will not use a general user or document listing to infer advisees.

Giving every account access to the professor workspace was rejected because the requested temporary policy explicitly makes administrators the professor accounts. Querying advisory relationships by an arbitrary advisor id was rejected because it would weaken the backend-owned association that identifies the current professor.

## Risks / Trade-offs

- [The directory contains users who are not appropriate advisors] → The current backend contract defines advisor status through `Advisorship`; future eligibility rules need a backend candidate endpoint before the frontend can enforce them.
- [Two tabs submit the first relationship simultaneously] → Recheck active advisors before showing the dialog and refresh after an accepted save; surface any backend duplicate rejection without unblocking the user.
- [The advisory endpoints fail or return an empty directory] → Keep the dialog visible with readable error/retry feedback so protected content remains inaccessible until the backend can establish the required relationship.
- [An existing default account has no relationship] → It receives the same required onboarding on its next authenticated page load, intentionally applying the rule consistently to new and existing accounts.
- [Professor and platform-administrator duties later diverge] → Keep the route gate isolated to one access-level decision so a future professor role can replace the temporary `ADMIN` check without changing advisory data ownership.

## Migration Plan

1. Deploy the session gate, advisory client, and dialog together.
2. Verify a new default account selects an advisor, reloads without another prompt, and cannot bypass the dialog through a deep link or a second tab.
3. Verify an administrator sees only its own advisor summary at `/orientandos`, while non-administrators cannot open the workspace.
4. Roll back the frontend release to remove the gate if the backend advisory endpoints are unavailable; no browser-stored migration state requires cleanup.
