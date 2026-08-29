## ADDED Requirements

### Requirement: Persistent Feature Page Headers
The application SHALL keep the page header visible while the user scrolls the content of every feature route that renders a page title or primary page action, including Oiac IA, Documentos, Tipificações, Conformidade Template, and Conformidade ABNT.

#### Scenario: User scrolls a feature route
- **WHEN** the content of a feature route extends beyond the visible main content area and the user scrolls it
- **THEN** that route's page header remains visible within the main content area
- **AND** the fixed application shell remains visible and functional

#### Scenario: Feature route has no page header
- **WHEN** a route does not render a page header
- **THEN** the application does not introduce an empty persistent header solely for this behavior
