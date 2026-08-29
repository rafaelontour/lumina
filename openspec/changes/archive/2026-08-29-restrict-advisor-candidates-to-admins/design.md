## Context

See `proposal.md` for the motivation. The required advisor-onboarding dialog already requests the authenticated user directory, excludes the current user, and creates a `MAIN_ADVISOR` relationship after selection. User records expose `access_level`.

## Goals / Non-Goals

**Goals:**

- Make administrator accounts the exclusive source of advisor candidates.
- Preserve the existing non-dismissible onboarding and error/retry behavior.

**Non-Goals:**

- Changing existing advisor relationships, account permissions, or the backend relationship endpoint.

## Decisions

### Filter candidates by access level in the orientation service

The existing candidate query will retain the authenticated request and then filter the returned records by `access_level === "ADMIN"` as well as the current-user exclusion. This keeps the UI and service consumers from seeing invalid candidates without requiring a new backend endpoint. Showing every user and validating only on submission was rejected because it can lead a new user to select an ineligible orientador.

## Risks / Trade-offs

- [The API returns more than the configured list limit] → The current interface preserves its list limit; backend-side filtering or pagination can be introduced later if the directory outgrows it.
- [No administrator exists] → Keep the required dialog blocked with its existing retry and explanatory empty state.

## Migration Plan

1. Deploy the service filter with the existing onboarding dialog.
2. Verify that mixed account levels show only administrators and that an empty administrator list remains blocking.
3. Roll back the frontend change to restore the prior candidate filter if needed; no migration state is stored in the browser.
