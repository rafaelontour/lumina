## 1. Modelo e integração de cadastro

- [x] 1.1 Adicionar os tipos de dados para criação pública de usuário, incluindo nível de acesso fixado em `DEFAULT`.
- [x] 1.2 Implementar no serviço de autenticação a chamada JSON para `POST /api/backend/user`, preservando o padrão de tupla e normalização de erros.
- [x] 1.3 Confirmar que o proxy interno encaminha a criação pública sem exigir sessão nem expor credenciais ao navegador.

## 2. Experiência pública de cadastro

- [x] 2.1 Criar a rota ou visual público de cadastro integrado à apresentação visual e aos requisitos de acessibilidade do login.
- [x] 2.2 Implementar os campos de usuário, e-mail, telefone, senha e confirmação de senha, com validação em português e sem seletor de nível de acesso.
- [x] 2.3 Submeter exclusivamente `access_level: "DEFAULT"`, tratar carregamento, sucesso e falhas sem exibir a senha e sem repetir automaticamente a solicitação.
- [x] 2.4 Redirecionar para `/login` após o cadastro confirmado, sem iniciar sessão automaticamente, e incluir a navegação entre login e cadastro para visitantes anônimos.

## 3. Privacidade e verificação

- [x] 3.1 Verificar que nenhuma senha, token ou estado de autenticação seja persistido em armazenamento acessível pelo navegador durante o cadastro.
- [ ] 3.2 Validar manualmente a criação de conta com `DEFAULT`, a ausência de opção para permissões elevadas, os erros de validação/duplicidade e o login posterior.
- [x] 3.3 Executar `pnpm lint`, `pnpm build` e `openspec validate add-standard-user-registration --type change`.
