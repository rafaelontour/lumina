## ADDED Requirements

### Requirement: Filled Active Navigation Item
The app shell SHALL present the active sidebar navigation item with a filled brand-colored background and high-contrast foreground.

#### Scenario: User views the current route in the sidebar
- **WHEN** a sidebar navigation item matches the current route
- **THEN** the item uses a filled brand-colored background
- **AND** the item icon and label use a high-contrast foreground color

#### Scenario: User hovers the active navigation item
- **WHEN** the user hovers the active sidebar navigation item
- **THEN** the active styling remains unchanged

#### Scenario: User hovers an inactive navigation item
- **WHEN** the user hovers an inactive sidebar navigation item
- **THEN** the item may use the standard inactive hover styling
