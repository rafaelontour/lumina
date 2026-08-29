## Context

See `proposal.md` for the product motivation. The Documentos workspace currently exposes only its newest release to conformity-target mapping, although it already reads the release collection and can identify an analyzed release. Both conformity pages use the same mapped targets, while the ABNT selector also keeps an in-memory state marking an accepted analysis as already analyzed.

## Goals / Non-Goals

**Goals:**

- Preserve a ready release for temporary use in Conformidade while its replacement is under main analysis.
- Make the pending replacement visible and prevent either conformity action from using a stale target during that interval.
- Keep ABNT processing and terminal visual states mutually exclusive.

**Non-Goals:**

- Poll the Documentos analysis status from conformity pages.
- Persist release or conformity state in browser storage.
- Change backend APIs, release creation, or automatic conformity dispatch.

## Decisions

### Expose one ready fallback release per component

The document workspace mapping will retain the current newest `versions` entry and optionally expose the most recent ready release separately. This avoids changing Documentos UI behavior that intentionally treats the first version as current, while giving conformity mapping enough information to choose the prior source.

Alternatives considered:

- Returning every historical release in `versions` would alter existing Documents consumers and risks surfacing outdated versions in unrelated controls.
- Refetching releases separately from each conformity page would duplicate backend calls and selection rules.

### Map pending state on the conformity target

The shared conformity target will use the fallback release's file identity when one exists and carry an explicit pending-new-version flag. Each workspace will render that state, guard its start handler, and disable its start button. On a later page load after the main analysis completes, normal mapping naturally selects the newest release.

### Prioritize active ABNT processing

The ABNT selector will calculate the terminal “Analisado” badge only when the target is not currently in its local processing set. The accepted state continues to block duplicate starts but no longer produces two conflicting badges.

## Risks / Trade-offs

- [The conformity page does not poll main analysis] → The user sees the newer release after a reload or ordinary data refresh, matching the existing backend-backed workspace lifecycle without introducing background requests.
- [A component has no previous ready release] → The interface retains a disabled target and explains that its source is being prepared.
- [ABNT start has been accepted but no result is materialized yet] → The existing accepted-processing tracking remains the source of truth for disabling duplicate starts and showing only the processing badge.

## Migration Plan

Deploy as a frontend-only compatible change. Rolling back removes the optional fallback fields and restores current-target mapping; no stored data or API migration is required.
