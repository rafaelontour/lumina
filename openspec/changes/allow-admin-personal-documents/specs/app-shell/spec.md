## MODIFIED Requirements

### Requirement: Feature Navigation

The sidebar SHALL expose navigation entries for Inicio, Oiac IA, Meus documentos, Tipificacoes, Conformidade Template, and Conformidade ABNT to every authenticated account. It SHALL additionally expose “Meus orientandos” and the user-management entry only to accounts with `access_level: ADMIN`.

#### Scenario: User selects a menu item

- **WHEN** the user clicks a sidebar item
- **THEN** the application navigates to that feature route and highlights the active route

#### Scenario: Administrator views navigation

- **WHEN** an authenticated administrator views the sidebar
- **THEN** the application displays both “Meus documentos” and “Meus orientandos” as distinct entries
- **AND** displays the user-management entry

#### Scenario: Non-administrator views navigation

- **WHEN** an authenticated account without `access_level: ADMIN` views the sidebar
- **THEN** the application displays “Meus documentos”
- **AND** does not display “Meus orientandos” or the user-management entry
