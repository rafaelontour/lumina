## ADDED Requirements

### Requirement: Search typifications when configuring study material
When an authorized administrator configures a `TYPIFICATION` study attachment, the application SHALL filter the loaded typification options by the entered search text without relying exclusively on backend query filtering. The administrator SHALL see an explicit empty state when no option matches. A typification already selected for an attachment being edited SHALL remain selectable even when it does not match the active search text.

#### Scenario: Administrator searches typifications
- **WHEN** an administrator enters text in “Buscar tipificação”
- **THEN** the selector presents only loaded typifications whose names match the text without case or accent sensitivity

#### Scenario: Search has no result
- **WHEN** no loaded typification matches the entered search text
- **THEN** the selector presents a readable no-results option
- **AND** the administrator cannot accidentally submit an unselected typification

#### Scenario: Administrator edits a typification attachment
- **WHEN** an administrator edits an existing typification attachment whose name does not match the current search text
- **THEN** the existing typification remains available as the selected value
