# filename-overflow-protection Specification

## Purpose
Manter nomes longos de arquivos legíveis e contidos em todos os elementos visuais que os apresentam na plataforma.
## Requirements
### Requirement: Contained filename presentation

The application SHALL keep every visible uploaded-file or template filename within the horizontal bounds of its immediate UI container across Documentos, Oiac IA, conformity workspaces, and template management.

#### Scenario: Filename exceeds available width

- **WHEN** a visible filename is longer than its available container width
- **THEN** the interface truncates the displayed text with an ellipsis
- **AND** does not push sibling controls outside the container or create horizontal overflow

#### Scenario: Filename fits available width

- **WHEN** a visible filename fits within its available container width
- **THEN** the interface presents the complete filename without truncation

### Requirement: Full filename availability

The application SHALL preserve the original filename and make its full value available to assistive technology or a native text affordance when visual truncation occurs.

#### Scenario: Filename is visually truncated

- **WHEN** the interface truncates a filename
- **THEN** its full original value remains available through an accessible label or title
- **AND** the original value sent to and returned from the backend is not changed

