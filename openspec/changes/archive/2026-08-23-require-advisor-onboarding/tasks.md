## 1. Advisory API integration

- [x] 1.1 Add typed tuple-style client operations for listing user candidates, checking the authenticated user's active advisors, and creating a `MAIN_ADVISOR` relationship through `/api/backend`.
- [x] 1.2 Add a typed tuple-style operation for the authenticated administrator's advisor summary through `/api/backend/advisorship/my-advisees`.
- [x] 1.3 Add shared advisory and user-directory types that retain the backend identity, access level, relationship role, project context, and review counts needed by the onboarding and advisee flows.
- [x] 1.4 Normalize advisory and user-directory backend errors for readable retry feedback without persisting advisory or session data in browser storage.

## 2. Required onboarding gate

- [x] 2.1 Review the relevant local Next.js 16 documentation before editing the client-side session and shell components.
- [x] 2.2 Extend authenticated session restoration to check active advisors for `DEFAULT` users, bypass the check for non-default accounts, and reset the advisory state on logout or unauthorized session loss.
- [x] 2.3 Implement the accessible Portuguese advisor-selection dialog with candidate loading, self-exclusion, selection, save pending state, and retryable empty/error states.
- [x] 2.4 Create the selected `MAIN_ADVISOR` relationship for the authenticated user and unblock protected content only after the backend confirms it.
- [x] 2.5 Integrate the gate with the fixed protected shell so it cannot be dismissed by close controls, backdrop interaction, Escape, direct navigation, or a full-page reload.

## 3. Administrator advisee workspace

- [x] 3.1 Add the `/orientandos` route and its Portuguese loading, empty, error, and advisee-summary states using only the authenticated advisor summary endpoint.
- [x] 3.2 Expose the “Orientandos” navigation entry and route content only to `ADMIN` accounts, including protection against direct navigation by other authenticated roles.

## 4. Verification

- [ ] 4.1 Verify that an administrator opens protected routes without the advisor dialog and sees only its own advisees at `/orientandos`.
- [ ] 4.2 Verify that a default account without an active advisor cannot use protected content until it selects and saves an advisor, including save failure and no-candidate cases.
- [ ] 4.3 Verify that an account with an active advisor stays unblocked after reload, that non-admin users cannot use `/orientandos`, and that no onboarding or session completion data is written to browser-accessible storage.
- [x] 4.4 Run `pnpm lint`, `pnpm build`, and `openspec validate require-advisor-onboarding --type change`.
