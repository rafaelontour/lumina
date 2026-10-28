## Context

The required advisor-onboarding dialog already loads `UsuarioAutenticado` candidates and selects them by ID. Its option currently renders username and email as text. The shared avatar component resolves authenticated profile-image URLs and presents initials when no photo is available.

## Goals / Non-Goals

**Goals:**
- Let advisees recognize advisor candidates by profile photo and name.
- Avoid presenting candidate email in this selection step.
- Preserve the existing selection state and relationship-save behavior.

**Non-Goals:**
- Changing candidate eligibility, backend responses, or relationship authorization.
- Removing email from other screens where it is separately required.

## Decisions

- Render the shared `AvatarUsuario` next to the candidate's name and keep the existing selected-state indicator.
- Remove only the email text from the candidate option; do not change how the selected candidate ID is stored or submitted.
- Keep the avatar non-interactive here; photo enlargement was not requested for this selection flow.

## Risks / Trade-offs

- Candidates without an uploaded photo are identified by initials rather than an image; the existing avatar fallback keeps the option readable.

## Migration Plan

No API or data migration is required. Roll back by restoring the previous email text and removing the avatar from the candidate row.
