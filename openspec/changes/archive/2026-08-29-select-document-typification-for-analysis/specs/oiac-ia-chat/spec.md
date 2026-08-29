## ADDED Requirements

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
