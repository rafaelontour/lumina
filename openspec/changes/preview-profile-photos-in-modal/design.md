## Context

Profile and advisee images are already rendered by the shared `AvatarUsuario` component, including authenticated backend image URLs, temporary blob URLs for the user's unsaved photo preview, and an initials fallback. The new interaction belongs at the avatar level so the same behavior works consistently in the personal profile, advisee cards, and advisee profile header.

## Goals / Non-Goals

**Goals:**
- Enlarge an available photo without changing the current page or closing an underlying advisee profile modal.
- Keep the image source and identity label consistent with the avatar that was activated.
- Make the modal dismissible by close control, Escape, and backdrop, with an accessible dialog label.
- Preserve existing avatar appearance and initials behavior when the feature is not enabled or no photo exists.

**Non-Goals:**
- Changing photo upload, persistence, backend endpoints, or authentication behavior.
- Opening a modal for initials when a user has no photo.
- Enabling the interaction on every avatar in the application; only the requested profile surfaces need it.

## Decisions

- Add an opt-in preview property to `AvatarUsuario`; leave other avatar instances unchanged.
- Render the avatar as a titled button only when preview is enabled and a valid image source is available. Preserve the current non-interactive image and initials fallback otherwise.
- Render a viewport-bounded, high-z-index modal from the avatar component, reusing its resolved image URL. Ensure closing the nested modal does not bubble to or close the advisor profile modal beneath it.
- Use the current `imagemTemporaria` source when present, so the user can inspect an unsaved image selection.

## Risks / Trade-offs

- The photo modal is nested above the existing advisee-profile dialog. A distinct higher stacking level and isolated Escape/backdrop handling are needed to avoid dismissing both dialogs at once.
- Profile images use authenticated proxy URLs; reusing the already rendered source avoids introducing a separate unauthenticated fetch path.

## Migration Plan

No data or API migration is required. Enable the opt-in interaction only in the personal profile and the two requested advisee surfaces. Rollback by disabling the opt-in property or removing the modal behavior while keeping the existing image/fallback presentation.

## Open Questions

None.
