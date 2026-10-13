## 1. Preparação

- [x] 1.1 Consultar a documentação local relevante do Next.js 16 e revisar os quatro pontos atuais de exibição de `release.description` e `evaluation.feedback`.
- [x] 1.2 Adicionar `react-markdown` e `remark-gfm` com o gerenciador `pnpm`, atualizando o manifesto e o lockfile.

## 2. Renderizador compartilhado

- [x] 2.1 Criar um componente compartilhado para Markdown de análise com CommonMark, GFM e sem `rehype-raw` ou `dangerouslySetInnerHTML`.
- [x] 2.2 Estilizar parágrafos, negrito, listas, títulos e tabelas com os tokens existentes, incluindo rolagem horizontal para tabelas largas.
- [x] 2.3 Adicionar modo de síntese que preserve o destaque visual dos títulos “Pontos atendidos”, “Pontos a aprimorar” e “Orientação final”.
- [x] 2.4 Normalizar marcadores tipográficos `●` compactados em itens de lista separados antes da renderização.

## 3. Integração

- [x] 3.1 Substituir as exibições textuais de `release.description` e `evaluation.feedback` em `ResultadoAnaliseTipificacao` pelo componente compartilhado.
- [x] 3.2 Migrar a síntese inicial e os feedbacks do `OiacIaChat` para o componente compartilhado, mantendo mensagens comuns do chat no comportamento atual.
- [x] 3.3 Migrar as mensagens comuns enviadas, salvas e respondidas no `OiacIaChat` para o renderizador compartilhado, garantindo listas verticais com marcadores.
- [x] 3.4 Migrar as descrições de taxonomias e ramos nas duas experiências para o renderizador compartilhado.

## 4. Verificação

- [x] 4.1 Verificar os quatro formatos de parecer, a estrutura completa da síntese, texto legado simples, tabelas estreitas/largas e conteúdo HTML não confiável nas duas experiências.
- [x] 4.2 Verificar mensagens enviadas, salvas e respostas do assistente com listas Markdown, texto simples e HTML bruto não confiável.
- [x] 4.3 Executar `pnpm lint`, `pnpm build` e `openspec validate render-analysis-markdown --type change` após a ampliação do escopo.
- [x] 4.4 Verificar uma análise real com marcadores `●` em linha corrida e repetir lint, build e validação OpenSpec.
- [x] 4.5 Verificar descrições de “Problema” e “Justificativa” com marcadores `●` compactados e repetir lint, build e validação OpenSpec.
