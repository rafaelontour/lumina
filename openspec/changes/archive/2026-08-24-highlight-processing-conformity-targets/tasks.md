## 1. Estado de processamento no seletor

- [x] 1.1 Consultar a documentação local aplicável do Next.js 16 antes de alterar os workspaces interativos.
- [x] 1.2 Em cada workspace, manter em memória somente os UUIDs cujas análises tenham sido iniciadas explicitamente na visita atual e ainda estejam em processamento.
- [x] 1.3 Remover qualquer varredura de status de todos os documentos ao carregar ou revisitar a rota e limpar o destaque ao recarregar, sair ou alcançar estado terminal.

## 2. Destaque visual

- [x] 2.1 Adicionar aos seletores de Conformidade Template e ABNT um tratamento de superfície distinto e badge “Em análise” para cada alvo em processamento, preservando a indicação de seleção atual.
- [x] 2.2 Adicionar uma animação pequena e não essencial ao badge, com alternativa estática sob preferência por menos movimento.

## 3. Verificação

- [x] 3.1 Confirmar que o destaque aparece somente após iniciar uma análise na visita atual, desaparece ao recarregar ou voltar à rota e é removido ao alcançar estado terminal.
- [x] 3.2 Executar `pnpm lint`, `pnpm build` e `openspec validate highlight-processing-conformity-targets --type change`.
