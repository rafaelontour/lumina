## Why

Os testes de fluxos de cadastro, orientação e permissões deixam contas de teste na plataforma sem uma forma prática de removê-las ou ajustar suas permissões. Administradores precisam de uma área restrita para localizar, excluir e alterar o nível de acesso dessas contas sem depender de intervenção direta no backend.

## What Changes

- Adicionar uma página de gerenciamento de usuários acessível somente a contas `ADMIN`.
- Listar os usuários retornados pela API, com identificação, nível de acesso e busca por texto.
- Permitir que o administrador exclua uma conta após confirmação explícita, atualizando a lista apenas quando a API aceitar a remoção.
- Permitir que o administrador altere o nível de acesso de outra conta somente entre `DEFAULT` (orientando) e `ADMIN` (orientador), após confirmação explícita e atualização confirmada pela API.
- Bloquear a exclusão ou alteração de permissão da própria conta pela interface e manter a área indisponível para contas não administrativas.

## Capabilities

### New Capabilities

- `admin-user-management`: Consulta, remoção confirmada e alteração confirmada de nível de acesso de contas por administradores.

### Modified Capabilities

- `app-shell`: A navegação passa a disponibilizar o gerenciamento de usuários exclusivamente para administradores e a proteger sua rota.

## Impact

- Afeta a navegação e a proteção de rotas do shell, um novo workspace administrativo, os tipos e o serviço de usuários.
- Usa os endpoints autenticados `GET /user`, `PUT /user` e `DELETE /user/{user_id}` por meio de `/api/backend`.
- Não permite criar usuários, alterar ou excluir a própria conta, nem selecionar níveis fora de `DEFAULT` e `ADMIN`; autorização e integridade dos dados continuam sob responsabilidade da API.
