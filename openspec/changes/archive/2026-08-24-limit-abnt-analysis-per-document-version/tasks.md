## 1. Elegibilidade por versão de PDF

- [x] 1.1 Consultar a documentação local aplicável do Next.js 16 antes de alterar o workspace interativo.
- [x] 1.2 Estender a consulta do histórico ABNT para identificar se a versão atual do PDF já possui uma execução aceita, distinguindo execuções de versões anteriores.
- [x] 1.3 Desabilitar a nova solicitação para uma versão analisada e comunicar que uma nova versão deve ser enviada em Documentos; manter disponível a primeira análise de uma versão posterior.
- [x] 1.4 Manter a elegibilidade bloqueada imediatamente após o aceite e disponível quando a solicitação não for aceita.

## 2. Verificação

- [x] 2.1 Executar `pnpm lint`, `pnpm build` e `openspec validate limit-abnt-analysis-per-document-version --type change`.
