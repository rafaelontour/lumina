## Purpose

Disponibiliza um leitor de PDF contínuo e pesquisável para que a pessoa usuária leia e localize texto no documento sem sair da Oiac IA.

## ADDED Requirements

### Requirement: Continuous PDF Reading
The application SHALL render every page of an available PDF in order within one vertically scrollable document-reading area.

#### Scenario: PDF with multiple pages is loaded
- **WHEN** a selected conversation has an available PDF with more than one page
- **THEN** every page is displayed in its original order in the same scrollable reading area
- **AND** the user can read from one page to the next by scrolling

#### Scenario: PDF source changes
- **WHEN** the user selects another conversation or PDF source
- **THEN** the reader clears the previous document pages and renders the pages of the newly selected PDF

### Requirement: Exact Text Search
The application SHALL provide a search field that finds literal occurrences of the entered text in the available PDF text layer.

#### Scenario: User searches for text that occurs in the PDF
- **WHEN** the user enters a non-empty search term with one or more literal occurrences in the PDF text layer
- **THEN** the reader highlights every occurrence
- **AND** displays the current occurrence position and the total number of occurrences

#### Scenario: User searches for text that does not occur in the PDF
- **WHEN** the user enters a non-empty search term with no literal occurrence in the PDF text layer
- **THEN** the reader reports that no result was found
- **AND** does not alter the visible document text

#### Scenario: PDF has no searchable text layer
- **WHEN** the available PDF contains no extractable text
- **THEN** the reader remains usable for visual reading
- **AND** reports no result for a non-empty search term

### Requirement: Search Result Navigation
The application SHALL allow the user to move to the previous and next occurrence of the active exact-text search.

#### Scenario: User navigates search results
- **WHEN** a search has one or more occurrences and the user selects the previous or next result control
- **THEN** the reader scrolls the selected occurrence into view
- **AND** marks that occurrence as the active result

#### Scenario: Search term is cleared
- **WHEN** the user clears the search field
- **THEN** the reader removes all search-result highlights and count information
