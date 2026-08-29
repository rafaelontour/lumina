## Why

O frontend inicia sessões automaticamente com credenciais fixas, o que impede uma autenticação real por pessoa e expõe um comportamento inadequado para produção. A API já oferece login e encerramento de sessão por cookie, permitindo substituir esse atalho por um fluxo explícito e seguro.

## What Changes

- Adicionar uma página pública de login com usuário/e-mail e senha.
- Restaurar a sessão autenticada ao abrir a plataforma e proteger as rotas internas.
- Redirecionar o usuário autenticado para a página inicial da plataforma após o login.
- Permitir encerrar a sessão pelo aplicativo e voltar ao login.
- Remover credenciais fixas e qualquer tentativa automática de login após respostas não autenticadas.
- Manter a sessão exclusivamente no cookie `HttpOnly` emitido pelo backend; não persistir token ou dados de autenticação em `localStorage`, `sessionStorage` ou IndexedDB.

## Capabilities

### New Capabilities

- `user-authentication`: Login explícito, restauração de sessão, proteção de rotas e logout baseados na sessão do backend.

### Modified Capabilities

- `backend-proxy-auth`: O proxy e seus consumidores passam a depender da sessão iniciada pelo usuário, sem credenciais de demonstração nem retry automático de login.

## Impact

- Afeta as rotas da aplicação, o shell, serviços de autenticação e todos os consumidores do proxy `/api/backend/*`.
- Usa `POST /auth/sign-in`, `POST /auth/sign-out` e `GET /user/my` da API Lumina.
- Não inclui cadastro, recuperação ou redefinição de senha nesta entrega.
