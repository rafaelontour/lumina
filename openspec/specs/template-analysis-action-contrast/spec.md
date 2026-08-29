# template-analysis-action-contrast Specification

## Purpose
Garantir que a ação principal de iniciar conformidade seja legível no modo escuro da aplicação.
## Requirements
### Requirement: Dark-mode start-analysis contrast
The Conformidade Template “Iniciar análise” action SHALL present legible foreground and background contrast in dark mode while preserving its enabled and disabled states.

#### Scenario: Eligible template analysis in dark mode
- **WHEN** dark mode is active and the selected document and template allow an analysis to start
- **THEN** the “Iniciar análise” label and icon are visibly distinguishable from the button background

#### Scenario: Disabled template analysis in dark mode
- **WHEN** the start action is disabled in dark mode
- **THEN** the disabled state remains visually distinct from the enabled primary action

