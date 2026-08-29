## 1. Restrição de edição no Oiac IA

- [x] 1.1 Remover da lista de conversas agrupadas os controles, estado e callback usados para renomear projetos/documentos.
- [x] 1.2 Preservar a edição do nome de conversas avulsas individuais e a seleção das conversas agrupadas.
- [x] 1.3 Manter sem alterações o fluxo de renomeação da rota `/documentos`.

## 2. Verificação

- [x] 2.1 Executar `pnpm lint`.
- [x] 2.2 Executar `pnpm build`.
- [x] 2.3 Executar `openspec validate restrict-document-renaming-to-documents-route --type change`.
