## Purpose

Make every interactive button's purpose discoverable on pointer hover without requiring users to infer an icon or a terse label.

## ADDED Requirements

### Requirement: Buttons explain their action on hover
Every application button SHALL provide a concise, context-specific `title` that explains the action it performs or the state it will switch to. This title MUST complement, and MUST NOT replace, the visible label or accessible name. Icon-only and stateful buttons SHALL describe the specific action available in their current state.

#### Scenario: User hovers an action button
- **WHEN** a user points to an enabled button in the application
- **THEN** the browser displays a title explaining the button's action in its current context

#### Scenario: User hovers an icon-only button
- **WHEN** a button's visible content does not name its action
- **THEN** its title clearly describes the action without relying on the icon alone

#### Scenario: Button toggles between states
- **WHEN** a button changes its action based on the current state
- **THEN** the title describes the action that will occur if activated now

#### Scenario: Button already has an accessible name
- **WHEN** a button has visible text or an `aria-label`
- **THEN** the title supplements that name and does not remove or weaken it
