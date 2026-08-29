## Why

O onboarding de novos usuários permite selecionar qualquer conta como orientador, inclusive contas sem permissão para exercer esse papel. A seleção precisa refletir a regra de que somente administradores são professores/orientadores disponíveis.

## What Changes

- Restringir a lista de candidatos no onboarding obrigatório de orientação a contas com `access_level: ADMIN`.
- Manter a exclusão da própria conta e o bloqueio do onboarding quando nenhum administrador estiver disponível.
- Não alterar a criação do vínculo: o candidato selecionado continua sendo salvo como `MAIN_ADVISOR`.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `advisor-onboarding`: Candidatos de orientador passam a ser exclusivamente contas administrativas.

## Impact

- Afeta o serviço que consulta candidatos e a experiência do diálogo obrigatório de seleção de orientador.
- Continua usando a listagem autenticada de usuários por `/api/backend/user` e a criação de vínculo por `/api/backend/advisorship`.
