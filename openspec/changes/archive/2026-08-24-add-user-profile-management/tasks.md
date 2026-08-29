## 1. Dados e estado de perfil

- [x] 1.1 Estender os tipos de usuário e o cliente autenticado para atualizar dados pessoais e enviar foto de perfil pelo proxy.
- [x] 1.2 Expor no AuthProvider a atualização confirmada do usuário para sincronizar a identificação compartilhada sem persistência no navegador.

## 2. Interface de perfil

- [x] 2.1 Criar um avatar reutilizável com foto pelo proxy e fallback acessível de iniciais.
- [x] 2.2 Criar a rota `/perfil` com visualização e edição de nome de usuário, e-mail, telefone e foto, preservando o nível de acesso como leitura.

## 3. Navegação e verificação

- [x] 3.1 Adicionar a identificação do usuário e o atalho “Ver perfil” ao menu lateral em estados expandido e recolhido.
- [x] 3.2 Executar lint e build de produção.
- [x] 3.3 Validar a mudança OpenSpec em modo estrito.
