## Why

O usuário autenticado não consegue confirmar rapidamente sua identidade no menu nem acessar um local único para manter os próprios dados. Um perfil pessoal torna essas informações visíveis, atualizáveis e consistentes em toda a plataforma.

## What Changes

- Adicionar ao menu lateral a identificação do usuário autenticado com foto, nome e o atalho “Ver perfil”.
- Criar a rota pessoal de perfil para consultar e editar nome de usuário, e-mail, telefone e foto de perfil.
- Atualizar imediatamente o estado autenticado e a identificação lateral após alterações bem-sucedidas.
- Exibir o nível de acesso como informação de conta, sem permitir que o próprio usuário altere permissões.

## Capabilities

### New Capabilities

- `user-profile-management`: página pessoal e operações de visualização e atualização dos dados de perfil do usuário autenticado.

### Modified Capabilities

- `app-shell`: identificação e atalho de perfil no menu lateral autenticado.
- `user-authentication`: estado de sessão refletido após atualização do perfil, mantendo a privacidade de autenticação.

## Impact

- Menu lateral, provedor de autenticação e nova rota `/perfil`.
- Tipos e cliente autenticado para `PUT /user` e upload de ícone em `POST /user/{user_id}/icon`.
- Não altera permissões, tokens ou armazenamento de autenticação no navegador.
