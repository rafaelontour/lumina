## 1. Seleção de orientador

- [x] 1.1 Filtrar no serviço de candidatos de orientação apenas usuários com `access_level: ADMIN`, mantendo a exclusão da conta atual.
- [x] 1.2 Manter o estado vazio bloqueante do diálogo quando não houver nenhum administrador disponível.

## 2. Verificação

- [x] 2.1 Validar manualmente que contas DEFAULT, ANALYST e AUDITOR não aparecem como orientadores e que contas ADMIN aparecem.
- [x] 2.2 Validar que a ausência de administrador mantém o onboarding obrigatório aberto e sem opção de salvar.
- [x] 2.3 Executar `pnpm lint`, `pnpm build` e `openspec validate restrict-advisor-candidates-to-admins --type change`.
