## Purpose

Permitir que usuários configurem materiais ordenados por etapa de um grupo documental e acompanhem, em cada projeto, o progresso individual de leitura.

## ADDED Requirements

### Requirement: Configure ordered study materials by document group
The application SHALL let an authorized administrator configure study attachments for each active document-group item using `TYPIFICATION`, `DOI`, or `LINK`, with an optional description, from a matched advisee project. The guide is shared by every project using the group; it is not personalized to an advisee or project. Attachment kind is immutable after creation. DOI metadata returned by the backend SHALL be displayed, and manual fallback metadata SHALL be explained when Crossref metadata is unavailable.

#### Scenario: User adds a typification, DOI, or link
- **WHEN** an authorized administrator submits all required fields for one supported attachment kind
- **THEN** the application creates the attachment through the backend
- **AND** displays the returned attachment and metadata in the group's study order

#### Scenario: DOI metadata is resolved or unavailable
- **WHEN** an attachment DOI is created or changed
- **THEN** the application shows a saving state while the backend resolves metadata
- **AND** displays returned authors, year, venue, DOI, and DOI link when available
- **AND** explains when metadata uses the manual fallback source

#### Scenario: User edits or removes an attachment
- **WHEN** an authorized administrator edits an attachment description or its same-kind fields, or confirms its removal
- **THEN** the application submits the complete editable attachment contract or deletes it
- **AND** reflects only the canonical backend response

#### Scenario: User reorders stages or materials
- **WHEN** an authenticated user changes the order of active group items or attachments
- **THEN** the application submits every active identifier in the new order
- **AND** replaces displayed order with the backend response

#### Scenario: Backend rejects duplicate or invalid material
- **WHEN** the backend returns a conflict, validation error, or missing-entity response
- **THEN** the application presents an actionable field or list error
- **AND** reloads the affected list when the submitted order is invalid or stale

### Requirement: Read project study guide and progress
The application SHALL display the backend study guide for a project with its returned item and attachment order, group name, and progress counters. It MUST use returned progress totals and MUST NOT persist guide or progress state in browser storage.

#### Scenario: Project has a study guide
- **WHEN** a user opens the guide for a project
- **THEN** the application displays each document-group item and its attachments in returned order
- **AND** displays `studied_attachments` out of `total_attachments`

#### Scenario: Project has no document group
- **WHEN** the guide response contains no group and no items
- **THEN** the application explains that the project has no document group yet
- **AND** displays a zero progress state

#### Scenario: A group item has no materials
- **WHEN** an item has an empty attachment list
- **THEN** the application displays the item and a clear empty-material message

### Requirement: Project owner tracks studied materials
The application SHALL allow only the project owner to mark a study attachment as studied or unstudied. It SHALL replace the displayed guide with the complete guide returned by each successful mutation, without an additional guide request.

#### Scenario: Project owner marks material studied
- **WHEN** the authenticated project owner marks an attachment
- **THEN** the application sends the mark request
- **AND** replaces guide state with the returned guide and displays the returned study date

#### Scenario: Project owner unmarks material
- **WHEN** the authenticated project owner clears a studied attachment
- **THEN** the application sends the unmark request
- **AND** replaces guide state with the returned guide

#### Scenario: Non-owner views project guide
- **WHEN** an advisor or administrator opens a project guide they do not own
- **THEN** the guide is presented in read-only mode without study controls

#### Scenario: Project or attachment was removed
- **WHEN** a guide request or mutation returns not found
- **THEN** the application reloads the guide and presents the current state
