## 1. Identificação segura do arquivo e da versão

- [x] 1.1 Consultar a documentação local aplicável do Next.js 16 antes de alterar o workspace interativo.
- [x] 1.2 Renderizar `Arquivo analisado` como badge com ícone e nome seguro do arquivo, sem expor o caminho do backend.
- [x] 1.3 Exibir o badge “Analisado” no seletor para cada versão que já possui análise ABNT, preservando o indicador de processamento.

## 2. Verificação

- [x] 2.1 Executar `pnpm lint`, `pnpm build` e `openspec validate hide-analyzed-file-backend-path --type change`.
