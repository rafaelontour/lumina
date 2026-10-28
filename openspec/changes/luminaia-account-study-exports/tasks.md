## 1. Senhas e recuperação de acesso

- [x] 1.1 Adicionar tipos e serviços tuple-style para `PUT /auth/password`, `POST /auth/forgot-password` e `POST /auth/reset-password`, normalizando erros pelo padrão existente.
- [x] 1.2 Criar a tela pública de solicitação em `/esqueci-senha`, com confirmação genérica para qualquer e-mail válido.
- [x] 1.3 Criar a tela pública `/redefinir-senha`, ler email/token do link sem persistência e limpar a URL após a resposta.
- [x] 1.4 Integrar troca autenticada de senha ao perfil, vinculando a requisição ao usuário atual e limpando os campos em todas as respostas.
- [x] 1.5 Incluir rotas públicas no AppShell e ligação de recuperação no login.

## 2. Exportação PDF de tipificações

- [x] 2.1 Adicionar serviço de download binário para tipificação individual ou árvore completa via proxy.
- [x] 2.2 Adicionar ação por tipificação e ação geral, com estado de carregamento, nome de arquivo seguro e erro normalizado.

## 3. Guia de estudo compartilhado por grupo

- [x] 3.1 Modelar itens com `position`, anexos, respostas do guia e contratos de criação/edição/ordenação.
- [x] 3.2 Implementar serviços para anexos, ordenação, leitura do guia, marcação e desmarcação, tratando `204`, `403`, `404`, `409` e `422`.
- [x] 3.3 Construir configuração compartilhada por grupo para ADMIN na gestão de orientandos: listar materiais ordenados, criar TYPIFICATION/DOI/LINK, editar campos do mesmo tipo, excluir com confirmação e reordenar acessivelmente.
- [x] 3.4 Apresentar estado de consulta Crossref, metadados retornados e fallback manual; impedir envio duplicado durante salvamento.
- [x] 3.5 Integrar guia e progresso aos projetos pessoais usando ids persistentes, `created_by` e contadores do backend; apenas o dono marca materiais como estudados.
- [x] 3.6 Integrar guia somente leitura e configuração compartilhada de grupo aos projetos correspondentes no monitoramento ADMIN, preservando o isolamento entre orientadores.
- [x] 3.7 Cobrir estados sem grupo, etapa sem material, erros recuperáveis e atualização do guia diretamente pelas respostas de mutação.

## 4. Identidade LuminaIA

- [x] 4.1 Substituir “Oiac IA”/“OiacIA” em navegação, home, títulos, feedbacks e acessibilidade por “LuminaIA”, preservando rotas e identificadores backend.
- [x] 4.2 Atualizar as especificações tocadas para a identidade visível e manter os nomes internos como compatibilidade.

## 5. Validação

- [x] 5.1 Conferir OpenAPI e cenários dos formulários, permissões de marcação, escopo compartilhado, ordenação e respostas de exportação.
- [x] 5.2 Executar `openspec validate luminaia-account-study-exports --type change`.
