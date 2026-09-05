## 1. Lock Comparison Template Dropdown

- [x] 1.1 In ConformidadeTemplateWorkspace.tsx, sync the active template selection with the analyzed template when resultadoVisivel is present and disable the template selector when versaoJaAnalisada is true (or when analysis is running/starting), verifying the dropdown cannot be changed when the button shows Análise já realizada
- [x] 1.2 Commit the template dropdown locking adjustment

## 2. Omit Approach Metadata

- [x] 2.1 In ConformidadeTemplateWorkspace.tsx, filter out approach from the metadata list so Abordagem is never displayed in report metadata, verifying it no longer appears in the rendered metadata card
- [x] 2.2 In ConformidadeAbntWorkspace.tsx, filter out approach from the metadata list so Método de análise is never displayed in report metadata, verifying it no longer appears in the rendered metadata card
- [x] 2.3 Commit the metadata approach omission adjustment

## 3. Conformity Badges for Criteria and Checks

- [x] 3.1 In ConformidadeTemplateWorkspace.tsx, add a conformity status badge (Em conformidade green with check icon when match: true, Não conforme red with x icon when match: false) next to the criterion title in CriterioCard, verifying criterion headers render the badge
- [x] 3.2 In ConformidadeTemplateWorkspace.tsx, update the deterministic checks table to include a conformity column with the status badge (Em conformidade / Não conforme with icon) for each check item based on check.match, verifying deterministic tables render the status column
- [x] 3.3 Commit the criteria and checks conformity badge adjustment

## 4. Verification

- [x] 4.1 Run pnpm lint and pnpm build to verify that there are no TypeScript or linting regressions
- [x] 4.2 Run openspec validate refine-conformidade-ui --type change to verify that the change proposal adheres to OpenSpec rules
