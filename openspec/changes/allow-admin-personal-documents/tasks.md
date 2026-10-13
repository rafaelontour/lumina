## 1. Preparação

- [x] 1.1 Consultar a documentação local relevante do Next.js 16 para navegação e revisar as regras atuais de acesso a `/documentos` e `/documentos/orientandos`.
- [x] 1.2 Confirmar no OpenAPI publicado os parâmetros de escopo pessoal disponíveis nas consultas usadas pelo workspace de documentos.

## 2. Acesso administrativo aos documentos pessoais

- [x] 2.1 Tornar “Meus documentos” visível no menu para todos os usuários autenticados, mantendo “Meus orientandos” como item administrativo separado.
- [x] 2.2 Remover o redirecionamento de administradores de `/documentos` sem alterar a proteção de `/documentos/orientandos` nem a compatibilidade de `/orientandos`.
- [x] 2.3 Fazer o workspace pessoal solicitar explicitamente o escopo `mine` nas listagens compatíveis, sem introduzir ramificações de interface ou funcionalidades por perfil.

## 3. Verificação

- [ ] 3.1 Verificar com contas `DEFAULT` e `ADMIN` que `/documentos` apresenta as mesmas ações, restaura somente dados próprios e mantém criação, edição, upload/análise e exclusão funcionais, inclusive para um administrador sem orientando associado ao documento.
- [x] 3.2 Verificar que `/documentos/orientandos` continua exclusivo de `ADMIN`, somente leitura e separado dos documentos pessoais.
- [x] 3.3 Executar `pnpm lint`, `pnpm build` e `openspec validate allow-admin-personal-documents --type change`.
