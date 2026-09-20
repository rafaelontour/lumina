## Why

O cadastro público atual permite que qualquer visitante crie uma conta padrão, sem que um orientador tenha autorizado sua entrada na plataforma. O acesso inicial deve passar a depender de um convite emitido por um orientador, garantindo que a nova conta já nasça associada à pessoa responsável por sua orientação.

## What Changes

- **BREAKING**: impedir a criação de contas padrão sem um convite válido, inclusive quando alguém acessa `/cadastro` diretamente.
- Permitir que orientadores `ADMIN` informem o e-mail de uma pessoa em “Meus orientandos” e gerem um link de convite para copiar e compartilhar fora da plataforma.
- Vincular o convite ao e-mail informado e ao orientador autenticado que o criou.
- Fazer o link amigável `/convite/<código>` conduzir a pessoa à tela de login e apresentar um popup com nome e foto do orientador, a informação de que ele realizou o convite e a instrução de que basta criar a conta normalmente.
- Permitir fechar o popup por uma ação explícita “Entendi” e preservar a autorização do convite quando a pessoa seguir do login para o cadastro.
- Validar o convite antes de liberar o formulário de cadastro e exigir que a conta use o mesmo e-mail autorizado.
- Manter a criação normal de senha no cadastro: a própria pessoa convidada define e confirma sua senha, sem senha provisória ou credencial definida pelo orientador.
- Consumir o convite uma única vez ao criar a conta e estabelecer automaticamente o vínculo `MAIN_ADVISOR` com o orientador emissor.
- Apresentar, quando o cadastro for acessado sem convite ou com convite inválido, expirado ou já utilizado, um aviso de que é necessário receber um link de convite de um orientador.
- Manter o convite como autorização, sem enviar e-mail automaticamente: o orientador copia o link e o compartilha por um canal externo.
- Adiar para uma mudança futura a alternativa de autorização avulsa por e-mail sem link.

## Capabilities

### New Capabilities

- `advisor-registration-invitations`: geração, cópia, validação e consumo de convites de cadastro vinculados ao e-mail e ao orientador emissor.

### Modified Capabilities

- `standard-user-registration`: substituir o cadastro público irrestrito por um cadastro condicionado a convite válido e que cria o vínculo com o orientador emissor.

## Impact

- Nova ação administrativa em `app/components/DocumentosOrientandosWorkspace.tsx` ou componente dedicado da rota `/documentos/orientandos`.
- Nova rota pública de entrada `/convite/[token]` e alterações em `app/login/page.tsx`, `app/cadastro/page.tsx`, `app/services/autenticacao.ts`, serviços de orientação e tipos compartilhados.
- Novos contratos de backend para criar e validar convites, além de consumo atômico do convite durante a criação da conta e do vínculo de orientação.
- Continuidade do uso de `/api/backend/*`, sessão por cookie `HttpOnly`, tratamento normalizado de erros e respostas em tupla nos serviços.
- Nenhuma nova dependência de frontend e nenhum armazenamento de token de convite em `localStorage`, `sessionStorage` ou IndexedDB.
