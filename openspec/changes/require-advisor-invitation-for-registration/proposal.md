## Why

O cadastro público atual permite criar uma conta padrão sem que um orientador tenha autorizado sua entrada. A plataforma precisa permitir que o orientador autorize previamente um e-mail e ofereça ao orientando tanto um link com código de convite quanto o cadastro direto pelo e-mail autorizado.

## What Changes

- **BREAKING**: condicionar a criação de contas padrão a uma autorização de e-mail emitida por um orientador.
- Permitir que orientadores `ADMIN` informem o e-mail de uma pessoa em “Meus orientandos”, autorizem seu cadastro e obtenham um link de convite para copiar e compartilhar fora da plataforma.
- Oferecer nessa mesma área uma seção chamada “Links ativos”, aberta sob demanda, com somente os convites pendentes, não expirados e emitidos pelo orientador autenticado.
- Informar que links já utilizados deixam de aparecer em “Links ativos” e permitir que o orientador exclua antecipadamente um link pendente.
- Tratar o token retornado pelo backend somente como código opaco do convite, transportado no link e nas operações de consulta, cadastro, aceite ou recusa; ele não representa sessão ou autenticação.
- Permitir que uma pessoa sem conta se cadastre pelo link em um único passo, criando a conta `DEFAULT`, aceitando o convite e estabelecendo o vínculo acadêmico.
- Permitir que a mesma pessoa acesse `/cadastro`, informe um e-mail previamente autorizado e crie a conta sem precisar possuir o link.
- Direcionar pessoas que já possuem conta para o login e, após autenticação com o mesmo e-mail convidado, concluir o aceite do convite.
- Permitir que o destinatário recuse um convite pendente.
- Exibir nome do orientador, e-mail autorizado, projeto, tema e expiração quando esses dados estiverem disponíveis no contrato público.
- Criar a conta convidada sem solicitar senha no formulário de cadastro e exigir que a própria pessoa defina sua primeira senha em um popup obrigatório após a sessão ser estabelecida.
- Persistir no backend a pendência de definição da primeira senha, restaurando o popup após atualização da página até a conclusão bem-sucedida.
- Após a definição da senha, restaurar o vínculo já criado e não exibir o modal de seleção de orientador.
- Manter o convite como autorização compartilhada manualmente, sem envio automático de e-mail pela plataforma.

## Capabilities

### New Capabilities

- `advisor-registration-invitations`: autorização de e-mail, geração e cópia do link, consulta, aceite, recusa e consumo de convites de orientação.

### Modified Capabilities

- `standard-user-registration`: substituir o cadastro irrestrito por cadastro condicionado a convite por link ou autorização prévia do e-mail, com criação do vínculo e autenticação após sucesso.

## Impact

- Ação administrativa em `app/components/DocumentosOrientandosWorkspace.tsx` ou componente dedicado da rota `/documentos/orientandos`.
- Alterações em `app/login/page.tsx`, `app/cadastro/page.tsx`, `app/data/provider/AuthProvider.tsx`, serviços e tipos compartilhados.
- Popup obrigatório no shell autenticado para definição da primeira senha antes de onboarding ou conteúdo protegido.
- Nova entrada pública `/convite?token=<código>` ou rota amigável equivalente que preserve o código apenas durante o fluxo necessário.
- Integração com `POST`/`GET /invitations`, `DELETE /invitations/{invitation_id}`, `GET /invitations/{token}`, `POST /invitations/{token}/register`, `POST /invitations/{token}/accept` e `POST /invitations/{token}/reject`.
- Novo contrato backend necessário para validar e consumir um convite pendente somente pelo e-mail autorizado, pois o OpenAPI atual exige o código nas operações públicas.
- Ajuste backend necessário para criar a conta convidada sem senha utilizável, expor `password_setup_required` em `/user/my` e permitir a definição inicial segura da senha somente para a conta autenticada marcada com essa pendência.
- Continuidade do uso de `/api/backend/*`, sessão por cookie `HttpOnly`, respostas em tupla e erros normalizados em português.
- Nenhuma nova dependência e nenhuma persistência do código do convite, senha ou token de acesso em armazenamento acessível ao JavaScript.
