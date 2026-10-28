## ADDED Requirements

### Requirement: Single typification selector for study material
When an authorized administrator configures a `TYPIFICATION` study attachment, the application SHALL present the available typifications in a single selector and SHALL NOT present a separate typification-search field.

#### Scenario: Administrator adds a typification material
- **WHEN** an administrator selects `Tipificação` as the material type
- **THEN** the application presents one selector containing the available typifications
- **AND** does not display a separate “Buscar tipificação” field
