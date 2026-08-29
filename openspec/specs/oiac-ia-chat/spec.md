## Purpose
Document the baseline Oiac IA chat workflow for creating PDF-backed conversations and exchanging messages with the AI endpoint.
## Requirements
### Requirement: Standalone PDF Conversation Creation
Oiac IA SHALL allow the user to create an avulsa conversation by uploading a PDF.

#### Scenario: User uploads a valid PDF
- **WHEN** the user selects a PDF in Oiac IA
- **THEN** the application creates a backend document marked with source `oiac-ia-avulsa`, uploads the file as a release, and selects the resulting conversation

### Requirement: Conversation List
Oiac IA SHALL list non-archived standalone conversations from the backend.

#### Scenario: User opens Oiac IA
- **WHEN** the page loads
- **THEN** the application requests backend documents with source `oiac-ia-avulsa` and displays them in the conversation sidebar

### Requirement: Conversation Message Loading
Oiac IA SHALL load messages for the selected backend document.

#### Scenario: User selects a conversation
- **WHEN** a conversation is selected
- **THEN** the application requests that document's messages and renders them in chronological order

### Requirement: AI Message Sending
Oiac IA SHALL send user prompts to the backend AI message endpoint for the selected document.

#### Scenario: User submits a message
- **WHEN** the user sends non-empty text in a selected conversation
- **THEN** the application posts the text to `/doc/{id}/message/ai` and renders the user message plus the AI response when returned

### Requirement: Message Author Detection
Oiac IA SHALL distinguish AI messages from user messages using message mentions.

#### Scenario: Message includes AI mention
- **WHEN** a message has a mention with type `AI`
- **THEN** the message is presented as an Oiac IA response rather than a user message

### Requirement: Conversation Deletion
Oiac IA SHALL allow the user to delete the selected conversation after confirmation.

#### Scenario: User confirms deletion
- **WHEN** the user confirms deletion for a selected conversation
- **THEN** the application deletes the backend document and removes it from the local list

### Requirement: Backend Document Handoff
Oiac IA SHALL accept a backend document id from Documentos and use it as the selected conversation document id.

#### Scenario: User opens Oiac IA from Documentos
- **WHEN** the Oiac IA route receives a backend document id from a Documentos handoff
- **THEN** Oiac IA loads messages for that backend document id and sends AI messages to `/doc/{id}/message/ai`

#### Scenario: Supporting context is present
- **WHEN** the Oiac IA route also receives project, project document, or release identifiers
- **THEN** those identifiers are treated as supporting context and do not replace the backend document id for message loading

### Requirement: Handoff PDF Preview File Path
Oiac IA SHALL use a PDF file path received from Documentos handoff context to load the document preview, without replacing the backend document id used for conversation messages.

#### Scenario: Handoff includes PDF file path
- **WHEN** the Oiac IA route receives a backend document id and a PDF file path from Documentos
- **THEN** Oiac IA uses the backend document id to load and send conversation messages
- **AND** Oiac IA uses the PDF file path to download and render the PDF preview

#### Scenario: Handoff omits PDF file path
- **WHEN** the Oiac IA route receives a backend document id without a PDF file path
- **THEN** Oiac IA attempts to find a release with an available PDF file for preview using the selected document and supporting context

### Requirement: Split Document And Chat Workspace
Oiac IA SHALL show the selected conversation's source document together with the AI chat so the user can read the document and converse about it in the same workspace.

#### Scenario: Desktop user opens a selected conversation
- **WHEN** a selected Oiac IA conversation is available on a desktop-sized viewport
- **THEN** the workspace displays the document viewing area and the AI chat area side by side with each area occupying approximately half of the conversation workspace

#### Scenario: User selects a different conversation
- **WHEN** the user selects another Oiac IA conversation
- **THEN** the document viewing area updates to the newly selected conversation's document while the chat area loads that conversation's messages

#### Scenario: No conversation is selected
- **WHEN** no Oiac IA conversation is selected
- **THEN** the workspace presents the existing empty state without trying to render a document preview

### Requirement: Embedded PDF Viewer Controls
Oiac IA SHALL provide an embedded continuous PDF viewer that renders all pages in the document viewing area and provides exact-text search navigation and zoom controls.

#### Scenario: User reads a selected conversation PDF
- **WHEN** a selected conversation has a PDF available for preview
- **THEN** the document viewing area displays every PDF page in order in a vertically scrollable area
- **AND** the viewer provides a search field for exact text and controls to navigate its results

#### Scenario: User changes PDF zoom
- **WHEN** a selected conversation has a PDF available for preview
- **THEN** the document viewing area allows the user to zoom the PDF in and out
- **AND** preserves the currently selected PDF and any active search term

### Requirement: Tabbed Conversation Browser
Oiac IA SHALL separate conversation browsing into standalone and grouped conversation views.

#### Scenario: User opens Oiac IA
- **WHEN** the user opens Oiac IA
- **THEN** the conversation sidebar offers separate views for avulsa conversations and grouped conversations

#### Scenario: User selects standalone view
- **WHEN** the user selects the avulsa conversation view
- **THEN** Oiac IA lists non-archived standalone conversations created directly in Oiac IA

#### Scenario: User selects grouped view
- **WHEN** the user selects the grouped conversation view
- **THEN** Oiac IA lists grouped conversation entries derived from backend projects, document groups, project documents, backend documents, and releases

### Requirement: Grouped Conversation Entries
Oiac IA SHALL show grouped conversation entries by project and document group, including project document components with and without uploaded PDFs.

#### Scenario: Grouped component has uploaded PDF
- **WHEN** a grouped component has a backend document with an uploaded PDF release
- **THEN** Oiac IA shows the component as selectable
- **AND** selecting the component opens the conversation using that backend document id
- **AND** Oiac IA uses the release PDF file path to render the PDF preview when available

#### Scenario: Grouped component has no uploaded PDF
- **WHEN** a grouped component has no backend document or no uploaded PDF release
- **THEN** Oiac IA keeps the component visible in its project and group position
- **AND** Oiac IA disables the component for chat selection

#### Scenario: Grouped component has unavailable preview file path
- **WHEN** a grouped component has a backend document but no available release PDF file path
- **THEN** Oiac IA keeps the component visible
- **AND** Oiac IA does not allow the component to open a PDF-backed chat until a file path is available

### Requirement: Grouped Conversation Message Continuity
Oiac IA SHALL resume grouped document conversations using the same backend document id used by Documentos handoff.

#### Scenario: User selects available grouped component
- **WHEN** the user selects an available grouped component
- **THEN** Oiac IA loads messages for that component's backend document id
- **AND** Oiac IA sends new AI messages to `/doc/{id}/message/ai` for that backend document id

### Requirement: Avulsa Conversation Rename
Oiac IA SHALL allow the user to rename an avulsa conversation using the backend document title/name field.

#### Scenario: User renames an avulsa conversation
- **WHEN** the user edits the selected avulsa conversation name and saves a non-empty value
- **THEN** Oiac IA persists the new name to the backend document
- **AND** the avulsa conversation list displays the updated name
- **AND** the selected chat header displays the updated name
- **AND** message loading and sending continue to use the same backend document id

#### Scenario: User cancels avulsa rename
- **WHEN** the user starts editing an avulsa conversation name and cancels
- **THEN** Oiac IA keeps the previous conversation name visible
- **AND** no backend update is sent

### Requirement: Scoped Rename Actions In Oiac IA
Oiac IA SHALL offer rename controls only for avulsa individual conversations. It SHALL NOT offer controls to rename Documentos-backed projects or documents in the grouped conversation browser.

#### Scenario: User views grouped document conversations
- **WHEN** the user opens the grouped conversation browser in Oiac IA
- **THEN** project and document labels are displayed without rename controls
- **AND** no project or document rename request can be initiated from that browser

#### Scenario: User views an avulsa conversation
- **WHEN** the user selects an avulsa individual conversation in Oiac IA
- **THEN** the user can edit that conversation name
- **AND** the edit continues to target the same backend conversation document id

### Requirement: Complete Release Analysis Opening Message

Oiac IA SHALL present the selected release analysis before the saved conversation messages, indicating processing while the analysis is pending and presenting the summary plus every analyzed typification when it is complete. Each taxonomy title SHALL classify branch outcomes by score: scores below 5 are “Não atendidos”, scores from 5 through 7 are “Parcialmente atendidos”, and scores above 7 are “Atendidos”. It SHALL show a count for each classification. A branch without a numeric score MAY use its boolean `fulfilled` result as a legacy fallback; one without either result SHALL not contribute to any count.

#### Scenario: Selected release has a completed analysis

- **WHEN** the selected release has a non-empty `check_tree`
- **THEN** Oiac IA presents an initial response before the document's saved messages
- **AND** includes the release `description` when it is non-empty
- **AND** includes every typification, taxonomy, branch, evaluation status, score, feedback, and associated source available in `check_tree`

#### Scenario: Taxonomy has branches across score ranges

- **WHEN** a taxonomy has branch scores below 5, from 5 through 7, and above 7
- **THEN** its title displays the count of non-attended, partially attended, and attended branches

#### Scenario: Taxonomy has only high-scoring branches

- **WHEN** every scored branch in a taxonomy has a score above 7
- **THEN** its title displays that attended count and zero partially attended and non-attended branches

#### Scenario: Taxonomy has no evaluated branches

- **WHEN** no criterion in a taxonomy provides a score or a boolean `fulfilled` result
- **THEN** its title displays zero attended, partially attended, and non-attended branches

#### Scenario: Handoff selects a release

- **WHEN** Oiac IA receives a release identifier in the Documentos handoff and that release has a non-empty `check_tree`
- **THEN** Oiac IA presents the complete analysis from that exact release before the selected document's saved messages
- **AND** does not substitute analysis from another release

#### Scenario: Analysis has no summary text

- **WHEN** the selected release has a non-empty `check_tree` and an empty `description`
- **THEN** Oiac IA presents the structured analysis without a summary section

#### Scenario: Selected release analysis is pending

- **WHEN** the selected release has an empty or absent `check_tree`
- **THEN** Oiac IA presents an animated processing response before the saved conversation messages
- **AND** refreshes that same selected release until its analysis is complete or the conversation context changes

#### Scenario: Pending analysis completes

- **WHEN** a refresh of the selected release returns a non-empty `check_tree`
- **THEN** Oiac IA replaces the processing response with the release `description` when present and the complete structured analysis
- **AND** does not create, update, or send a document message for either presentation

#### Scenario: Structured analysis is legible

- **WHEN** Oiac IA presents the release analysis
- **THEN** it groups content by typification, taxonomy, and criterion
- **AND** makes fulfilled status, score, feedback, sources, headings, and paragraph boundaries legible
- **AND** does not expose internal identifiers such as UUIDs

#### Scenario: Initial analysis is not a saved message

- **WHEN** Oiac IA presents the initial release analysis
- **THEN** it does not create, update, or send a document message for that presentation

### Requirement: Applied typification identification
Oiac IA SHALL explicitly identify the typification or typifications returned in the selected release's `check_tree` as the typifications applied to that analysis, before the detailed taxonomy presentation.

#### Scenario: Selected release has one applied typification
- **WHEN** the selected release analysis contains one typification in `check_tree`
- **THEN** Oiac IA presents its name with a “Tipificação utilizada” label before the detailed analysis
- **AND** does not repeat the typification name within the detailed taxonomy tree

#### Scenario: Selected release has multiple applied typifications
- **WHEN** the selected release analysis contains multiple typifications in `check_tree`
- **THEN** Oiac IA presents every returned name as an applied typification before the detailed analysis
- **AND** does not repeat those typification names within the detailed taxonomy tree

#### Scenario: Selected release has no completed analysis
- **WHEN** the selected release has no non-empty `check_tree`
- **THEN** Oiac IA does not present an applied-typification label as though analysis had completed

### Requirement: Initial analysis summary hierarchy
Oiac IA SHALL render recognized initial-analysis headings with compact bold visual hierarchy, without adding blank-line spacing between their content sections.

#### Scenario: Initial analysis contains attended and improvement points
- **WHEN** the release description contains “Pontos atendidos” or “Pontos a aprimorar” headings
- **THEN** Oiac IA presents each as a bold heading
- **AND** gives “Pontos atendidos” a positive visual emphasis and “Pontos a aprimorar” an attention visual emphasis

#### Scenario: Initial analysis contains presentation heading
- **WHEN** the release description contains “Apresentação da IA” or “Apresentação da análise”
- **THEN** Oiac IA presents it as a compact bold heading
- **AND** keeps it visually close to the attended and improvement sections

#### Scenario: Initial analysis contains final orientation
- **WHEN** the release description contains an “Orientação final” heading
- **THEN** Oiac IA presents it as a compact bold closing heading

### Requirement: Evidências navegáveis da análise inicial
Quando um critério da análise inicial de uma release possuir referências de documento, Oiac IA SHALL exibir controles de evidência junto ao parecer do critério.

#### Scenario: Critério possui referências localizáveis
- **WHEN** um critério da análise inicial possui uma ou mais referências com página
- **THEN** Oiac IA exibe um controle para cada referência na ordem retornada
- **AND** cada controle identifica sua página em uma contagem compreensível para o usuário

#### Scenario: Usuário seleciona uma evidência
- **WHEN** o usuário aciona o controle de uma evidência
- **THEN** Oiac IA envia aquela referência ao leitor do PDF exibido para navegação e destaque
- **AND** mantém a conversa e a análise inicial visíveis

#### Scenario: Critério não possui evidências
- **WHEN** um critério não possui referências retornadas pelo backend
- **THEN** Oiac IA mantém o parecer, status, nota e feedback atuais
- **AND** não exibe um controle de evidência vazio
