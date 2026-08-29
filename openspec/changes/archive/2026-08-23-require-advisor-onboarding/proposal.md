## Why

Uma conta comum pode entrar na plataforma sem ter um vínculo acadêmico de orientação, deixando o contexto de autoria e acompanhamento incompleto desde o primeiro acesso. O Lumina Back já expõe usuários e vínculos de orientação, permitindo tornar essa escolha obrigatória no onboarding autenticado.

## What Changes

- Para usuários com `access_level: DEFAULT`, verificar os vínculos ativos de orientação logo após a restauração da sessão.
- Quando não houver orientador ativo, mostrar um diálogo modal obrigatório para selecionar um orientador e criar um vínculo `MAIN_ADVISOR` com o usuário autenticado como orientando.
- Carregar candidatos de orientação da lista de usuários disponível no backend, excluindo a própria conta; a seleção cria o papel de orientador no vínculo, já que a API não publica uma categoria independente de “professor”.
- Impedir o acesso ao conteúdo protegido enquanto o vínculo não for salvo com sucesso; o diálogo não poderá ser fechado por botão, clique fora ou teclado.
- Não aplicar a etapa obrigatória a administradores nem persistir esse estado no armazenamento do navegador.
- Disponibilizar a rota `/orientandos` para contas `ADMIN`, mostrando exclusivamente os orientandos retornados para o professor autenticado pelo backend.

## Capabilities

### New Capabilities

- `advisor-onboarding`: seleção obrigatória do primeiro orientador para contas comuns e visão temporária de orientandos para administradores que atuam como professores.

### Modified Capabilities

<!-- Nenhuma. A autenticação explícita ainda é uma mudança ativa e não possui spec principal arquivada. -->

## Impact

- Afeta `AuthProvider`, o shell protegido, a navegação e componentes de autenticação.
- Adiciona cliente tipado para `GET /user`, `GET /advisorship/my-advisors`, `POST /advisorship` e `GET /advisorship/my-advisees` por meio de `/api/backend`.
- Usa o usuário atual da sessão como `advisee_id` e cria o vínculo selecionado com `role_type: MAIN_ADVISOR`, sem criar ou expor credenciais no navegador.
