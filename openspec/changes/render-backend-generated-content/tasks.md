## 1. Renderizador compartilhado

- [x] 1.1 Tornar a normalização de `●` independente de espaços comuns, não separáveis ou ausentes, sem modificar o valor original.
- [x] 1.2 Confirmar que Markdown, tabelas GFM e HTML bruto continuam usando a política segura existente.

## 2. Conteúdo de análise e conversa

- [x] 2.1 Encaminhar resumos, descrições de fontes, taxonomias e ramos, feedbacks e mensagens do Oiac IA pelo renderizador compartilhado.
- [x] 2.2 Encaminhar os mesmos campos da análise e as mensagens monitoradas no workspace de orientandos pelo renderizador compartilhado.

## 3. Relatórios de conformidade

- [x] 3.1 Encaminhar descrições de resumo, valores textuais comparados e justificativas do relatório de Template pelo renderizador compartilhado.
- [x] 3.2 Encaminhar descrições de resumo, referências normativas e justificativas do relatório ABNT pelo renderizador compartilhado.
- [x] 3.3 Manter nomes, arquivos, caminhos, datas, status e erros técnicos como texto literal.

## 4. Verificação

- [x] 4.1 Verificar texto simples, Markdown, HTML bruto e listas `●` compactadas com espaços comuns, Unicode e ausentes nas quatro experiências.
- [x] 4.2 Executar `pnpm lint`, `pnpm build` e `openspec validate render-backend-generated-content --type change`.
