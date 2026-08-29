## MODIFIED Requirements

### Requirement: Feature Navigation

The sidebar SHALL expose navigation entries for Inicio, Oiac IA, Documentos, Tipificacoes, Conformidade Template, and Conformidade ABNT. It SHALL additionally expose the user-management entry only to accounts with `access_level: ADMIN`.

#### Scenario: User selects a menu item

- **WHEN** the user clicks a sidebar item
- **THEN** the application navigates to that feature route and highlights the active route

#### Scenario: Administrator views navigation

- **WHEN** an authenticated administrator views the sidebar
- **THEN** the application displays the user-management entry

#### Scenario: Non-administrator views navigation

- **WHEN** an authenticated account without `access_level: ADMIN` views the sidebar
- **THEN** the application does not display the user-management entry
