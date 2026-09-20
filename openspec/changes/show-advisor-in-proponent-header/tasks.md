## 1. Estado do orientador autenticado

- [x] 1.1 Estender `AuthProvider` para conservar em memória o cartão `MAIN_ADVISOR` ativo retornado pela verificação do orientando e expô-lo pelo contexto autenticado.
- [x] 1.2 Limpar o orientador principal em estados administrativos, anônimos, expirados ou de erro e revalidar o resumo canônico após a criação de um vínculo.

## 2. Identificação na barra superior

- [x] 2.1 Adicionar ao `Cabecalho` uma identificação não interativa “Orientador” com o nome do orientador principal apenas para a interface do orientando.
- [x] 2.2 Limitar e truncar visualmente nomes longos, manter o nome completo acessível e preservar os controles de tema e encerramento de sessão em larguras estreitas.

## 3. Verificação

- [x] 3.1 Verificar a exibição exclusiva para orientandos, a ausência no cabeçalho de orientadores, o comportamento de nomes longos e a atualização após concluir o onboarding.
- [x] 3.2 Executar `pnpm lint`, `pnpm build` e `openspec validate show-advisor-in-proponent-header --type change`.
