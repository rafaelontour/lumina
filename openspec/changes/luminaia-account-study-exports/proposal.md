## Why

O Lumina precisa atender às solicitações já suportadas pela API para segurança de conta, exportação da árvore de tipificação e orientação de estudo por etapa documental. A experiência também deve apresentar a identidade solicitada como LuminaIA, mantendo o guia compartilhado pelo grupo documental porque a API ainda não oferece recomendações individualizadas por orientando.

## What Changes

- Adicionar troca autenticada de senha no perfil e os fluxos públicos de solicitação e redefinição de senha pelos endpoints publicados.
- Permitir exportar em PDF uma tipificação individual ou a árvore completa usando o endpoint publicado.
- Adicionar configuração ordenada de materiais de estudo por item do grupo documental, com tipificações, DOI e links, e apresentar o progresso do guia em cada projeto.
- Permitir que o dono do projeto marque materiais como estudados e apresentar o guia em modo somente leitura para orientadores e administradores.
- Atualizar os textos visíveis que identificam Oiac IA/OiacIA para LuminaIA.
- Manter explícito que os materiais são compartilhados entre projetos do mesmo grupo; recomendações individuais do orientador ficam fora desta entrega até existir contrato de API.

## Capabilities

### New Capabilities

- `account-password-management`: troca autenticada, solicitação de recuperação e redefinição de senha.
- `study-guide-management`: configuração de anexos ordenados por etapa de grupo e guia de leitura do projeto com progresso.
- `typification-pdf-export`: exportação de uma tipificação ou da árvore completa em PDF.
- `luminaia-branding`: identidade textual LuminaIA nas áreas de conversa e análise por IA.

### Modified Capabilities

- `user-authentication`: navegação pública de recuperação e privacidade de credenciais.
- `document-workspace`: apresentação do guia e progresso nos projetos pessoais.
- `advisee-document-monitoring`: apresentação somente leitura do guia nos projetos acompanhados pelo orientador.
- `typification-browser`: ação de exportação para tipificação individual e árvore completa.

## Impact

- Rotas públicas de login, solicitação e redefinição de senha; workspace de perfil e serviços/tipos de autenticação.
- Página e serviços de Tipificações para download de PDF via proxy autenticado.
- Workspace de Documentos e acompanhamento de orientandos, com novos tipos e serviços para grupos, anexos e guia de estudo.
- Textos visíveis no shell, página inicial, chat e análises.
- Integração com `/auth/password`, `/auth/forgot-password`, `/auth/reset-password`, `/export/typifications/pdf`, endpoints `/document-group/*` e `/project/{project_id}/study-guide` já publicados.
- Nenhuma nova dependência prevista. A personalização de materiais por orientando permanece dependente de uma futura API.
