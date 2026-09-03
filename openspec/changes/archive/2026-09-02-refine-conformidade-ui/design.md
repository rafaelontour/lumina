## Context

See proposal.md - Why.
In ConformidadeTemplateWorkspace, users select a document and an institutional template, then trigger analysis. Currently:
1. When a version has already been analyzed (ersaoJaAnalisada is true and the action button displays Análise já realizada), the template select dropdown remains interactive even though the user cannot run an analysis with another template for that version.
2. In the metadata section of the results panel, pproach (Abordagem) is shown in Template conformity, and pproach (Método de análise) is shown in ABNT conformity.
3. In CriterioCard inside ConformidadeTemplateWorkspace, the criterion title does not show whether it matched or diverged. Furthermore, the deterministic checks table lists Item analisado, No template, and No documento, but lacks a conformity status column displaying Em conformidade (green) / Não conforme (red) with an icon for each check.

## Goals / Non-Goals

**Goals:**
- Fix and disable the Template de comparação dropdown when the document version has already been analyzed (ersaoJaAnalisada) or is processing, ensuring the displayed template matches the template used in the analysis report/execution.
- Completely omit Abordagem / approach from metadata in ConformidadeTemplateWorkspace and Método de análise / pproach from metadata in ConformidadeAbntWorkspace.
- Add a conformity status badge to criterion headers in ConformidadeTemplateWorkspace (Em conformidade in green with CheckCircle2 / check icon, and Não conforme in red with XCircle / x icon).
- Add a conformity status column / indicator to deterministic checks in ConformidadeTemplateWorkspace showing Em conformidade or Não conforme with icons.

**Non-Goals:**
- Modifying backend endpoints or database schemas.
- Changing ABNT criteria checks layout (ABNT already has standard criteria cards).
- Changing logic for versions that have not been analyzed yet (they can freely select templates).

## Decisions

1. **Locking the template dropdown when ersaoJaAnalisada is true**:
   - In ConformidadeTemplateWorkspace:
     - Determine the template associated with the result or execution: from esultadoVisivel?.report?.metadata?.template_file, match the template by ile_path, id, original_filename, or 
ame. If found, ensure 	emplateSelecionado is synced to this template.
     - Disable the <select> element when ersaoJaAnalisada || analiseProcessando || iniciandoAnalise || templates.length === 0.
   - *Alternative considered*: Hiding the dropdown completely. Rejected because users still want to see which comparison template was used.

2. **Omission of Approach (pproach) from Metadata**:
   - In ConformidadeTemplateWorkspace.tsx: in 
ormalizarRelatorio, filter out chave === approach.
   - In ConformidadeAbntWorkspace.tsx: in 
ormalizarRelatorioAbnt, filter out chave === approach.
   - *Alternative considered*: Hiding with CSS. Rejected in favor of data-level normalization so no empty keys or layout artifacts are produced.

3. **Conformity Badge Component for Criteria and Deterministic Checks**:
   - Re-use or introduce an IndicadorConformidadeTemplate component similar to IndicadorConformidadeAbnt (or generalize it) that renders:
     - match === true: green badge with CheckCircle2 icon and text Em conformidade.
     - match === false: red badge with XCircle icon and text Não conforme.
   - In CriterioCard:
     - Place the badge in the header alongside criterio.title.
     - In the deterministic checks table, add a column Situação (or Conformidade) containing the badge for each check item.

## Risks / Trade-offs

- [Risk: Historic analysis without 	emplate_file in metadata] → Fall back to currently active template or first available template without throwing errors.
- [Risk: Table horizontal overflow with extra column on small screens] → Ensure the table container maintains overflow-x-auto with appropriate padding and wrapping behavior.
