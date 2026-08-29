## Why

O orientador já consegue identificar seus orientandos, mas precisa sair desse contexto para acompanhar os documentos e grupos que eles enviaram. Trazer esse acompanhamento para Documentos permite revisar o estado mais recente do trabalho acadêmico sem misturar dados de outros orientadores.

## What Changes

- Direcionar contas `ADMIN` de `/documentos` para a única página de documentos disponível a elas: “Meus orientandos”, com visual compacto e de acompanhamento.
- Listar os orientandos a partir do resumo associado ao professor autenticado e carregar os documentos de cada orientando somente pelos endpoints de orientação do backend.
- Agrupar a apresentação pelos metadados acadêmicos disponíveis do documento, como projeto e grupo, preservando o nome, tipo, situação de processamento, atualização e arquivamento.
- Disponibilizar, na visão do orientador, busca por projeto dos orientandos e filtro por aluno, incluindo a opção de visualizar todos os orientandos ativos.
- Consultar os dados ao abrir a visão e oferecer atualização explícita, sem persistir resultados no armazenamento do navegador.
- Não exibir ao orientador nenhum controle de criação, envio de PDF, edição, análise, release, arquivamento ou exclusão de projetos, grupos e documentos de seus orientandos.
- Manter o workspace pessoal de Documentos e todos os fluxos de criação, envio e análise disponíveis somente para contas não administrativas.

## Capabilities

### New Capabilities

- `advisee-document-monitoring`: acompanhamento atualizado, por orientador, dos documentos e grupos de seus orientandos dentro do workspace Documentos.

### Modified Capabilities

- `document-workspace`: a página Documentos passa a entregar o workspace pessoal apenas para contas não administrativas e “Meus orientandos” para administradores.

## Impact

- Afeta a rota `/documentos`, seus componentes de apresentação e os tipos/serviços de documentos e orientação.
- Usa `GET /advisorship/my-advisees` e `GET /advisorship/advisees/{advisee_id}/documents` através de `/api/backend`.
- Não concede ao orientador autorização de mutação, criação, upload, release ou persistência sobre documentos de seus orientandos.
