## Why

Pessoas interessadas em usar o Lumina ainda dependem da criação manual de uma conta. Um cadastro público permite iniciar o acesso de forma autônoma, sem conceder privilégios administrativos indevidos.

## What Changes

- Adicionar, na área pública de autenticação, um caminho para criar uma conta com os dados cadastrais e a senha necessários.
- Criar a conta por meio do backend com o nível de acesso `DEFAULT` (usuário padrão), sem oferecer escolha de permissão no formulário.
- Informar claramente o sucesso ou o erro do cadastro, preservando os dados digitados em caso de falha e conduzindo a pessoa para o login após uma criação bem-sucedida.
- Manter senha, tokens e estado autenticado fora de armazenamento acessível pelo navegador; o cadastro não concede permissão elevada nem altera a sessão sem confirmação explícita do backend.

## Capabilities

### New Capabilities

- `standard-user-registration`: Cadastro público de novas contas sempre com o nível de acesso de usuário padrão.

### Modified Capabilities

- `user-authentication`: A área pública de autenticação passa a permitir a transição segura entre login e cadastro de uma conta padrão.

## Impact

- Afeta a rota pública de login, o serviço e os tipos de autenticação e o proxy interno `/api/backend/*`.
- Usa o endpoint público `POST /user` da API Lumina, enviando `username`, `email`, `phone_number`, `password` e `access_level: "DEFAULT"`; a API responde com `201` e o usuário criado.
- Não inclui criação de contas administrativas, alteração de permissão, recuperação de senha ou autenticação automática após o cadastro.
