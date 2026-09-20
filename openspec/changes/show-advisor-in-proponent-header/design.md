## Context

See `proposal.md` for the motivation and `specs/app-shell/spec.md` for the observable behavior. `AuthProvider` already calls `listarMeusOrientadoresAtivos()` before rendering protected content for a `DEFAULT` account, but currently reduces the result to an onboarding status and discards the returned advisor identity. `Cabecalho` is already a client component inside that provider and can consume session-scoped identity without introducing server/client boundary changes.

## Goals / Non-Goals

**Goals:**

- Retain the authenticated orientando's active main-advisor card in memory alongside the existing onboarding state.
- Present that advisor's name in the top header only for the orientando interface.
- Preserve the fixed 72-pixel header, existing theme/logout controls, and usability on narrow screens.
- Clear the retained advisor whenever the session ends, expires, becomes inapplicable, or fails verification.

**Non-Goals:**

- Display advisor contact details, relationship metadata, or actions for changing the advisor.
- Display co-advisors or evaluators in the header.
- Add a second advisor request after every route navigation or persist the relationship in browser storage.
- Change the backend advisory contract or the mandatory onboarding experience.

## Decisions

### Retain the advisor returned by the onboarding request

Extend the authentication context with `orientadorPrincipal`, derived from the active cards returned by `listarMeusOrientadoresAtivos()`. Prefer the card whose `role_type` is `MAIN_ADVISOR`; do not substitute a co-advisor or evaluator as the principal identity. The same request continues to determine whether onboarding is complete.

This avoids a duplicate fetch owned by the header and ensures the identity and the onboarding gate use the same authenticated response. A header-local request was rejected because it would duplicate network and error state. Passing the value through several `AppShell` props was rejected because the header already consumes `useAuth`.

### Revalidate after creating the relationship

After `criarOrientacaoPrincipal()` succeeds, run the existing advisor verification again instead of setting only the completion flag. This fills `orientadorPrincipal` from the canonical backend summary before the protected shell appears. If the follow-up cannot confirm the relationship, preserve the existing error gate rather than rendering an unconfirmed advisor name.

Using the selected candidate's client-side name immediately was rejected because it could diverge from the canonical relationship returned by the backend.

### Render a bounded identity chip in the header action area

Add a non-interactive identity element before the theme control. It carries an advisor icon, the label “Orientador” and the advisor username. Its width is bounded, the visible name truncates when needed, and the full name is exposed through a title and accessible label. On narrow viewports, reduce decorative/secondary text before allowing the chip to displace the theme or logout actions.

The identity is rendered only when the authenticated account is not `ADMIN` and `orientadorPrincipal` is available. The header does not invent an empty placeholder because the existing shell gate prevents an orientando without a confirmed active relationship from reaching protected content.

## Risks / Trade-offs

- [The endpoint returns several active relationships] → Select only `MAIN_ADVISOR` deterministically and do not imply that another role is the principal advisor.
- [A long advisor name competes with the logo and actions] → Bound and truncate the visible chip while retaining the complete accessible name and fixed action sizes.
- [The relationship is created but the follow-up summary is briefly stale] → Keep the existing verification/error experience and allow its retry path to fetch canonical state again.
- [Stale identity survives authentication changes] → Clear `orientadorPrincipal` on logout, expiration, anonymous state, administrator state, and request failure.

## Migration Plan

1. Extend the in-memory authentication context with the canonical main-advisor card and lifecycle cleanup.
2. Revalidate advisor state after relationship creation.
3. Add the orientando-only advisor identity to the responsive header.
4. Verify role isolation, long-name behavior, logout/session expiration, onboarding creation, lint, and production build.
5. Roll back the context field and header element if necessary; no persisted data or backend migration is involved.
