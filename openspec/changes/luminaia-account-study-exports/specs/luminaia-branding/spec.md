## Purpose

Apresentar a identidade solicitada LuminaIA de forma consistente na experiência de chat, análise e navegação da aplicação.

## ADDED Requirements

### Requirement: LuminaIA is the visible AI identity
The application SHALL use “LuminaIA” in user-visible navigation, headings, explanatory text, accessibility labels, and AI feedback labels wherever the current experience names the assistant “Oiac IA” or “OiacIA”. Backend identifiers and persisted source values SHALL remain unchanged unless the API contract changes.

#### Scenario: User opens AI chat or analysis
- **WHEN** a user views the chat, an AI analysis, or an AI feedback label
- **THEN** the visible assistant name is “LuminaIA”

#### Scenario: Existing backend conversation is loaded
- **WHEN** the application loads a conversation with existing Oiac source identifiers
- **THEN** it continues to use those identifiers for backend compatibility
- **AND** presents the assistant as “LuminaIA” in the interface
