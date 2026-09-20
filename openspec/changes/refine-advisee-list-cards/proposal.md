## Why

A listagem de “Meus orientandos” apresenta de imediato toda a hierarquia de projetos, grupos e documentos de cada pessoa, o que torna a leitura densa e dificulta localizar rapidamente um orientando. A tela deve priorizar uma visão resumida em cartões e deixar o conteúdo detalhado sob demanda.

## What Changes

- Apresentar cada orientando em um cartão compacto e responsivo contendo inicialmente a foto de perfil circular, o nome, o e-mail, a data de criação do vínculo de orientação e o botão “Ver perfil”.
- Manter a listagem inicial restrita aos cartões, sem exibir projetos diretamente na página.
- Abrir ao clicar em “Ver perfil” um modal com a foto, o nome, o e-mail e a data do vínculo do orientando.
- Exibir no modal de perfil duas tabs principais, “OIAC IA” e “Grupo de documentos”, separando as conversas do orientando com a IA do acompanhamento dos arquivos obrigatórios.
- Apresentar em “OIAC IA”, somente para leitura, tanto as conversas avulsas quanto as conversas associadas aos documentos dos grupos, carregando as mensagens do documento selecionado.
- Exibir em “Grupo de documentos”, dentro de um modal mais largo que aproveita melhor o espaço horizontal disponível, os projetos deduzidos somente dos documentos de grupo e uma busca local por nome de projeto.
- Permitir selecionar um projeto para consultar, no próprio modal, o histórico dos arquivos enviados.
- Organizar o histórico do projeto em tabs correspondentes a todos os tipos de documento obrigatórios do grupo retornado por `GET /document-group`, preservando a tab mesmo quando aquele tipo ainda não possui envio.
- Exibir em cada tab somente os documentos do tipo correspondente e apresentar “Nenhum arquivo enviado ainda” quando não houver arquivos daquele tipo.
- Conectar visualmente os cartões de arquivos enviados em cada tab por uma linha vertical, formando uma linha do tempo em ordem cronológica inversa.
- Consultar a release mais recente com arquivo de cada documento do projeto selecionado e apresentar no cartão sua nota média de análise, calculada somente a partir das notas numéricas dos critérios dessa release.
- Oferecer em cada documento a ação “Ver documento”, que abre um segundo modal com a versão PDF mais recente disponível e, ao lado, o resultado da análise de tipificação retornado para essa mesma release.
- Apresentar estados legíveis quando a release ainda não possui critérios pontuados ou resultado de tipificação, sem substituir dados de outra versão.
- Remover o filtro por orientando e a busca por projeto para liberar espaço e manter a listagem direta dos cartões.
- Renomear o resumo “Documentos retornados” para “Total de documentos” e definir seu valor como a soma de todos os documentos carregados de todos os orientandos listados.
- Animar visualmente “Total de documentos” de zero até o total calculado, avançando por todos os números inteiros sempre que o valor carregado mudar e exibindo o resultado imediatamente quando o usuário preferir movimento reduzido.
- Preservar a atualização dos dados, os estados vazios e de erro e as regras de acesso somente leitura, sem tentar resolver documentos avulsos do OIAC IA no catálogo de grupos.
- Manter o modal, a lista de projetos e o histórico de documentos somente leitura, sem acrescentar ações de mutação.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `advisee-document-monitoring`: alterar a apresentação para cartões-resumo que abrem um modal de perfil com identidade, vínculo, conversas do OIAC IA e histórico de arquivos por projeto e tipo obrigatório.

## Impact

- Componente principal afetado: `app/components/DocumentosOrientandosWorkspace.tsx`.
- Especificação afetada: `openspec/specs/advisee-document-monitoring/spec.md`.
- Reutilização de `GET /advisorship`, filtrado pelo orientador autenticado e por vínculos ativos, para obter o `created_at` de cada vínculo sem alterar o contrato backend.
- Reutilização de `GET /doc/{id}/release` para calcular a nota média da release exibida e do proxy autenticado para carregar seu PDF e seu resultado de tipificação sem cruzar versões.
- Reutilização de `GET /document-group` para obter, na ordem definida pelo backend, todos os tipos obrigatórios que compõem as tabs do grupo de documentos selecionado.
- Reutilização de `GET /doc/{id}/messages` para apresentar, em modo somente leitura, as mensagens das conversas avulsas e das conversas ligadas aos documentos de grupo.
- Uso do campo `source` dos documentos retornados para excluir documentos avulsos do OIAC IA da resolução de grupos, mantendo documentos legados com metadados de grupo no acompanhamento de arquivos.
- Reutilização do `advisee.email` já retornado por `GET /advisorship/my-advisees`, sem acrescentar uma chamada de rede.
- Serviço e tipos de orientação ajustados para representar a lista de vínculos e sua data de criação.
- Sem novas dependências e sem persistência adicional no navegador.
