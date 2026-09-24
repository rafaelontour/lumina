## MODIFIED Requirements

### Requirement: Monitoring is read-only and administrator-scoped
The orientation page SHALL be available only to `ADMIN` accounts and SHALL use the backend's authenticated advisory endpoints to determine both the professor and each advisee's documents. It SHALL allow the authenticated advisor to remove one of their returned active advisorships from an advisee card after explicit confirmation. It MUST NOT expose any control for creating projects or groups, uploading PDFs, editing metadata, triggering analyses or conformity, generating releases, archiving, deleting, or otherwise mutating an advisee's project, group, document, release, analysis, or user account.

#### Scenario: Non-administrator opens Documentos
- **WHEN** an authenticated account without `access_level: ADMIN` opens Documentos
- **THEN** the orientation monitoring view is unavailable
- **AND** the personal document workspace remains unchanged

#### Scenario: Administrator views advisee work
- **WHEN** an administrator opens an advisee's document group
- **THEN** the application presents the returned academic content as read-only monitoring data
- **AND** does not offer project/group creation, PDF upload, editing, analysis, release, archive, deletion, or other mutation actions for those records

#### Scenario: Advisor requests removal from a card
- **WHEN** the authenticated advisor activates “Remover orientando” on an active advisee card
- **THEN** the application requests explicit confirmation naming the selected advisee
- **AND** explains that the action removes only the academic relationship, not the account or academic content

#### Scenario: Advisor cancels removal
- **WHEN** the advisor does not confirm removal
- **THEN** the application sends no removal request
- **AND** leaves the card and monitoring totals unchanged

#### Scenario: Advisor confirms removal
- **WHEN** the advisor confirms removal of an active advisee relationship
- **THEN** the application requests deletion using that card's `advisorship_id`
- **AND** prevents duplicate removal submissions for that relationship while the request is pending
- **AND** removes the card and recalculates monitoring totals only after backend success
- **AND** does not delete the advisee account, projects, documents, releases, or analyses

#### Scenario: Relationship removal fails
- **WHEN** the backend rejects or cannot complete the removal
- **THEN** the application keeps the advisee card and monitoring totals unchanged
- **AND** restores the removal action
- **AND** presents readable failure feedback

## ADDED Requirements

### Requirement: Advisee card search beside monitoring summaries
The “Meus orientandos” workspace SHALL provide a local text search beside the “Orientandos ativos” and “Total de documentos” summaries in the same horizontal layout region on wide viewports. The search SHALL filter the loaded advisee cards by advisee name or email without case or accent sensitivity and SHALL NOT alter the aggregate summary values.

#### Scenario: Advisor searches by name or email
- **WHEN** the advisor enters a search term matching part of an advisee name or email
- **THEN** the workspace shows only loaded advisee cards matching that term without case or accent sensitivity
- **AND** does not request or display an advisee outside the authenticated advisor's loaded collection
- **AND** keeps both summary values based on the complete loaded collection

#### Scenario: Search has no match
- **WHEN** the search term matches no loaded advisee name or email
- **THEN** the card region presents a readable no-results state
- **AND** keeps the search field and aggregate summaries available

#### Scenario: Advisor clears the search
- **WHEN** the advisor clears the search term
- **THEN** the workspace restores every loaded advisee card

#### Scenario: Summary and search layout adapts to viewport
- **WHEN** the workspace has enough horizontal space
- **THEN** both summaries and the search field appear in one horizontal row
- **AND WHEN** the viewport is too narrow for usable controls
- **THEN** the region wraps responsively without horizontal overflow
