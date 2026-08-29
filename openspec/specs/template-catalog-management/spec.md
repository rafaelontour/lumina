# template-catalog-management Specification

## Purpose
Permitir que professores administradores mantenham os PDFs institucionais que alimentam a análise de conformidade com template.
## Requirements
### Requirement: Administrator template catalog route

The application SHALL provide an authenticated `/templates` route for accounts with `access_level: ADMIN` and SHALL expose that route in the administrator sidebar as “Templates”. Accounts without that access level SHALL not see the navigation entry and SHALL be redirected away from a direct visit to the route without loading the catalog.

#### Scenario: Administrator opens the catalog

- **WHEN** an authenticated administrator opens `/templates`
- **THEN** the application displays the template catalog and its management actions

#### Scenario: Default account attempts the catalog

- **WHEN** an authenticated account without `access_level: ADMIN` navigates to `/templates`
- **THEN** the application redirects it to the home route
- **AND** does not request the template catalog

### Requirement: Template catalog listing

The administrator catalog SHALL obtain template objects from `GET /templates` through the authenticated backend proxy and display each template's name, original filename, and available update timestamp. An empty catalog SHALL present a clear empty state.

#### Scenario: Catalog has templates

- **WHEN** the authenticated catalog request returns one or more template objects
- **THEN** the route displays every returned template with its management actions

#### Scenario: Catalog is empty

- **WHEN** the authenticated catalog request returns an empty collection
- **THEN** the route explains that no template has been registered
- **AND** keeps the creation action available

### Requirement: Persistent template catalog header

The `/templates` route SHALL keep its page header visible at the top of the application content region while the catalog, forms, and template cards scroll beneath it.

#### Scenario: Administrator scrolls the template catalog

- **WHEN** the template catalog content exceeds the visible application content area and the administrator scrolls
- **THEN** the Templates page header remains visible at the top of that content area
- **AND** only the content below the header scrolls

### Requirement: Template creation and update

The administrator catalog SHALL allow an administrator to create a template with a nonempty name and PDF file through `POST /templates`, and to update an existing template's name and/or PDF through `PUT /templates/{template_id}`. The route SHALL refresh the displayed catalog after a successful mutation and preserve the form context with a readable error when a mutation fails.

#### Scenario: Administrator creates a template

- **WHEN** an administrator provides a name and PDF and confirms creation
- **THEN** the application submits the multipart values to `POST /templates`
- **AND** refreshes the catalog after the backend accepts the template

#### Scenario: Administrator updates a template

- **WHEN** an administrator changes the template name, replacement PDF, or both and confirms the edit
- **THEN** the application submits only the supplied values to `PUT /templates/{template_id}`
- **AND** refreshes the catalog after the backend accepts the update

#### Scenario: Template mutation fails

- **WHEN** creation or update is rejected or fails
- **THEN** the application shows one readable error notification
- **AND** preserves the entered values so the administrator can correct or retry them

### Requirement: Template deletion

The administrator catalog SHALL require an explicit confirmation before sending `DELETE /templates/{template_id}` through the authenticated backend proxy. After a successful deletion it SHALL refresh the catalog; a failed deletion SHALL leave the template visible and show a readable error notification.

#### Scenario: Administrator confirms deletion

- **WHEN** an administrator confirms removal of a listed template
- **THEN** the application sends `DELETE /templates/{template_id}`
- **AND** refreshes the catalog after successful deletion

#### Scenario: Administrator cancels deletion

- **WHEN** an administrator dismisses the deletion confirmation
- **THEN** the application does not call the deletion endpoint

### Requirement: Filename-based template name helper

The administrator catalog SHALL offer a visually identifiable “Usar mesmo nome do arquivo” button adjacent to the name field whenever a PDF is selected for creation or replacement. Activating the helper SHALL fill the name field with the selected filename without its final extension, while keeping that name editable before submission. PDF selection SHALL use a visually identifiable “Escolher arquivo” control and show the chosen filename.

#### Scenario: Administrator uses the filename during creation

- **WHEN** an administrator selects a PDF for a new template and activates “Usar mesmo nome do arquivo”
- **THEN** the creation name field is populated with the PDF filename without its extension
- **AND** the administrator can modify the populated value before creating the template

#### Scenario: Administrator uses a replacement filename during editing

- **WHEN** an administrator selects a replacement PDF and activates “Usar mesmo nome do arquivo” while editing
- **THEN** the edit name field is populated with the replacement filename without its extension
- **AND** the administrator can modify the populated value before updating the template

#### Scenario: Administrator chooses a PDF

- **WHEN** an administrator needs to select a template PDF
- **THEN** the route presents a prominent “Escolher arquivo” control
- **AND** shows the selected filename after the file is chosen

#### Scenario: Administrator clears a template name

- **WHEN** an administrator activates the clear control in a populated name field
- **THEN** the application clears only the name text
- **AND** preserves any selected PDF file

