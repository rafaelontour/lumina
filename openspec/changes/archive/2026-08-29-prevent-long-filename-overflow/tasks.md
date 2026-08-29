## 1. Auditoria e contenção de nomes de arquivos

- [x] 1.1 Auditar e corrigir os nomes de arquivo exibidos em Documentos e no navegador de conversas agrupadas do Oiac IA.
- [x] 1.2 Auditar e corrigir os nomes de arquivo exibidos nos seletores e cabeçalhos de Conformidade ABNT e Template.
- [x] 1.3 Auditar e corrigir os nomes de arquivo escolhidos nos fluxos de criação e edição de templates.

## 2. Verificação

- [x] 2.1 Revisar as superfícies auditadas com nomes longos, confirmando truncamento visual e disponibilidade do nome completo.
- [x] 2.2 Executar `pnpm lint`, `pnpm build` e `openspec validate prevent-long-filename-overflow --type change`.
