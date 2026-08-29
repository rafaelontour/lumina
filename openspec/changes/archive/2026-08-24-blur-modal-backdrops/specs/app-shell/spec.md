## ADDED Requirements

### Requirement: Blurred modal backdrops

The application SHALL apply a subtle backdrop blur behind every modal dialog that overlays an already visible platform page. The backdrop SHALL retain sufficient translucent contrast to distinguish the inactive page from the dialog, while preserving the dialog's existing behavior and stacking order. Toasts, non-modal floating notices, and full-page blocking states without an underlying platform page SHALL not receive this treatment.

#### Scenario: User opens a modal dialog

- **WHEN** a modal dialog opens over a platform page
- **THEN** the inactive page behind its translucent backdrop appears subtly blurred
- **AND** the dialog remains clear and interactive

#### Scenario: User receives a non-modal notice

- **WHEN** the application shows a toast or floating status notice
- **THEN** it does not blur the platform page

#### Scenario: User sees a full-page blocking state

- **WHEN** the application replaces protected content with a full-page blocking state
- **THEN** it does not add a modal backdrop blur without an underlying visible page
