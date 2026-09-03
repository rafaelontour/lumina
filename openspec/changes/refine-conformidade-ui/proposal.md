## Why

Users reviewing conformity results in Lumina need clearer and less confusing information on screen:
- When an analysis has already been executed for a document version (ersaoJaAnalisada), the template dropdown should lock to the template that was actually used rather than allowing the user to select another template when the button indicates Análise já realizada.
- The technical approach metadata (Abordagem on Conformidade Template and Método de análise on Conformidade ABNT) clutters the interface and distracts from scientific document evaluation, so it must be omitted completely from result views.
- In Conformidade Template results, criteria and their individual deterministic check items (criteria[].checks) currently lack explicit conformity badges; displaying clear green/red status indicators (Em conformidade / Não conforme with icons) aligns them with section-level and ABNT evaluation patterns.

## What Changes

- **Template Dropdown Locking**: On ConformidadeTemplateWorkspace, disable the Template de comparação dropdown when the document version has already been analyzed (ersaoJaAnalisada / Análise já realizada) or when an analysis is in progress/starting. Automatically select and lock onto the template that was used for the analysis when displaying a completed or historic result (matching eport.metadata.template_file or history record if available).
- **Metadata Approach Removal**:
  - Remove Abordagem from the displayed metadata list on ConformidadeTemplateWorkspace.
  - Remove Método de análise (pproach) from the displayed metadata list on ConformidadeAbntWorkspace.
- **Match Badges for Criteria and Deterministic Checks**:
  - In ConformidadeTemplateWorkspace, display a compliance badge next to the criterion title (Em conformidade in green with check icon when criterio.match === true, Não conforme in red with x icon when criterio.match === false).
  - In ConformidadeTemplateWorkspace, add a compliance column / indicator for each item in checks in deterministic criteria tables showing Em conformidade (green + check icon) or Não conforme (red + x icon) based on check.match.

## Capabilities

### Modified Capabilities
- 	emplate-conformity-results: Update requirements for template selector state when analysis is completed/locked, omit approach metadata, and specify conformity badges for criterion titles and check items.
- conformity-checks: Update ABNT metadata display requirement to omit approach / analysis method.

## Impact

- Frontend components: pp/components/ConformidadeTemplateWorkspace.tsx and pp/components/ConformidadeAbntWorkspace.tsx.
- Specs: openspec/specs/template-conformity-results/spec.md and openspec/specs/conformity-checks/spec.md.
- No breaking changes to backend APIs or data contracts.
