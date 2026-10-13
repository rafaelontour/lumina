## MODIFIED Requirements

### Requirement: Compact advisor monitoring in Documentos
The Documentos workspace SHALL provide `ADMIN` accounts a separate “Meus orientandos” orientation page at `/documentos/orientandos`, visually distinct from the personal document workspace at `/documentos`. The orientation page SHALL use a compact monitoring presentation to list the active advisees associated with the authenticated professor and their accessible document work grouped by academic project and document group, without replacing or restricting the administrator's personal document workspace.

#### Scenario: Administrator opens advisee monitoring
- **WHEN** an authenticated administrator opens `/documentos/orientandos`
- **THEN** the application lists only active advisees associated with that administrator
- **AND** presents each advisee's returned documents within that advisee's own project and group structure
- **AND** presents the results in the compact advisor-monitoring layout rather than the personal document workspace layout

#### Scenario: Administrator opens personal documents
- **WHEN** an authenticated `ADMIN` account opens `/documentos`
- **THEN** the application renders that administrator's personal document workspace
- **AND** leaves “Meus orientandos” available as a separate navigation destination

#### Scenario: Administrator has no advisees with documents
- **WHEN** an administrator has no active advisees or the active advisees have no returned documents
- **THEN** the orientation page presents a readable empty state
- **AND** the administrator's separate personal document workspace remains available
- **AND** the orientation page does not show document groups belonging to another advisor
