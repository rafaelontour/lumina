## MODIFIED Requirements

### Requirement: Search Filtering
The Tipificacoes page SHALL filter typifications by typification name only.

#### Scenario: User enters a search term
- **WHEN** the search input changes
- **THEN** the displayed typifications are limited to records whose typification name contains the term
- **AND** taxonomy titles and branch titles do not independently include a typification in the results
