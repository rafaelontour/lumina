## ADDED Requirements

### Requirement: Processing conformity target indicator

The Conformidade Template and Conformidade ABNT document selectors SHALL visibly distinguish a target whose analysis was explicitly started by the user during the current page visit and remains `processing`. The distinction SHALL combine a subtly different surface treatment with an “Em análise” indicator, and SHALL remain recognizable when that target is also the selected document.

#### Scenario: A listed target is processing

- **WHEN** the latest template or ABNT result for a listed document reports `status` as `processing`
- **THEN** that document's selector item displays the “Em análise” indicator
- **AND** its surface is visually distinct from idle, completed, absent, and errored targets

#### Scenario: Processing ends

- **WHEN** the latest result for a previously highlighted target becomes `completed`, `error`, or absent
- **THEN** the selector removes the processing indicator and treatment

#### Scenario: Selected target is processing

- **WHEN** the user selects a target that is currently processing
- **THEN** the selector preserves its selected state
- **AND** keeps the processing indicator visible

### Requirement: Session-only processing indicator

The processing indicator SHALL be kept only in the current in-memory page state. The route SHALL add it after the user receives an accepted start response, keep it while that user-started result is processing, and remove it when the result becomes terminal or the page is reloaded, left, or revisited. The route SHALL NOT query result endpoints solely to restore indicators on page load.

#### Scenario: User starts an analysis

- **WHEN** the user receives an accepted processing response after activating the start action
- **THEN** the route adds the processing indicator to that selected target

#### Scenario: User reloads or revisits a route

- **WHEN** the page is reloaded or the user leaves and later returns to a conformity route
- **THEN** no target shows a processing indicator until the user starts an analysis during that page visit

#### Scenario: User-started analysis ends

- **WHEN** the current page observes that the user-started result becomes `completed`, `error`, or absent without an accepted start awaiting it
- **THEN** the route removes the processing indicator from that target

### Requirement: Accessible processing motion

The “Em análise” indicator SHALL include a small nonessential motion cue while processing and SHALL remain understandable without motion.

#### Scenario: Reduced motion is preferred

- **WHEN** the user has enabled a reduced-motion preference
- **THEN** the motion cue is reduced or removed
- **AND** the static text and visual treatment still identify the target as processing
