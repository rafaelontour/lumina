## 1. Preparação e contrato

- [x] 1.1 Consultar a documentação local relevante do Next.js 16 e revisar o estado, modais e ciclo de vida atuais da página de Tipificações antes de alterar código.
- [x] 1.2 Revalidar no OpenAPI publicado os endpoints, payloads e respostas de criação, listagem, detalhe, confirmação e descarte de sessões `/tree-suggestion`.
- [x] 1.3 Confirmar com a conta administrativa de teste que listagem e detalhe funcionam pela sessão `HttpOnly` encaminhada por `/api/backend/*`, sem usar ou expor Bearer token no cliente.

## 2. Tipos e serviços de sugestão

- [x] 2.1 Modelar modos e estados de sessão, tipos, operações e estados de item, evidências, regras excluídas, snapshots, detalhe e resumo de sessão.
- [x] 2.2 Implementar serviço tuple-style para criar uma sessão multipart com PDF e `typification_id` opcional, preservando erros normalizados.
- [x] 2.3 Implementar serviços tuple-style para listar sessões e carregar o detalhe canônico de uma sessão.
- [x] 2.4 Implementar serviços tuple-style para confirmar um item com edição opcional, descartar um item e descartar todos os itens pendentes.
- [x] 2.5 Garantir que os serviços usem somente `/api/backend/*`, cookies autenticados e identificadores codificados, sem persistir arquivo, sessão, credencial ou token no navegador.

## 3. Entrada pelos modos manual e por documento

- [x] 3.1 Alterar “Nova tipificação” para abrir uma escolha acessível entre “Criar manualmente” e “Gerar a partir de documento”, somente para `ADMIN`.
- [x] 3.2 Encaminhar “Criar manualmente” ao formulário hierárquico atual sem modificar sua validação, submissão ou descarte de rascunho.
- [x] 3.3 Criar um workspace responsivo e acessível para o modo por documento, isolado do estado dos formulários manuais.
- [x] 3.4 Adicionar seleção de PDF e escolha entre criar uma tipificação nova ou enriquecer uma tipificação existente, exigindo o alvo persistente no modo de enriquecimento.
- [x] 3.5 Validar campos obrigatórios e PDF claramente inválido, bloquear submissão duplicada e manter o limite de tamanho sob autoridade do backend.
- [x] 3.6 Adicionar o atalho “Enriquecer” na listagem, com ícone “i” e tooltip informativo no mesmo botão, abrindo o workspace em modo de enriquecimento com o alvo do cartão pré-selecionado.

## 4. Sessões e processamento assíncrono

- [x] 4.1 Listar sessões do backend com documento, modo, alvo quando disponível, data e estado, incluindo carregamento, vazio, erro e atualização manual.
- [x] 4.2 Carregar sob demanda o detalhe canônico da sessão selecionada e manter falhas de uma sessão independentes da lista e das demais sessões.
- [x] 4.3 Após o upload aceito, selecionar a sessão criada, atualizar a lista e apresentar imediatamente seu estado retornado.
- [x] 4.4 Implementar polling cancelável somente para a sessão selecionada em `processing`, parando em `ready`, `failed`, `completed`, erro, troca de sessão ou fechamento do workspace.
- [x] 4.5 Restaurar sessões e seus estados pelo backend ao reabrir o workspace, sem `localStorage`, IndexedDB ou cookies próprios.
- [x] 4.6 Separar as gerações anteriores nas tabs `Pendentes` e `Concluídas`, mantendo em cada tab a ordem retornada pelo backend.

## 5. Revisão hierárquica

- [x] 5.1 Derivar a árvore visual de sugestões a partir de `parent_item_id`, `parent_entity_id` e `position`, distinguindo fonte, tipificação, taxonomia e ramo.
- [x] 5.2 Apresentar operação, estado, conteúdo proposto, alvo/snapshot de atualização, justificativa e aviso de similaridade de cada item.
- [x] 5.3 Apresentar evidências com citações e páginas e regras excluídas em seção somente leitura separada, mantendo metadados literais e prosa no renderizador rico seguro.
- [x] 5.4 Identificar estados `pending`, `confirmed` e `discarded`, a entidade aplicada e o caráter incremental das confirmações já realizadas.
- [x] 5.5 Manter `file_path` interno fora da interface e usar `original_filename` como identidade visível do documento.

## 6. Confirmação e descarte

- [x] 6.1 Permitir confirmar explicitamente um item pendente com o conteúdo proposto, bloqueando confirmação quando o pai sugerido ainda não estiver confirmado.
- [x] 6.2 Permitir editar e validar título e descrição suportados antes da confirmação, sem modificar o valor proposto no estado local como se já estivesse aplicado.
- [x] 6.3 Após confirmação, recarregar detalhe da sessão e lista canônica de tipificações, atualizando também os alvos disponíveis para enriquecimento.
- [x] 6.4 Tratar falha ou conflito de confirmação com erro normalizado e recarga canônica antes de uma nova tentativa.
- [x] 6.5 Adicionar confirmação acessível para descartar um item e refletir descendentes descartados pelo backend após recarregar a sessão.
- [x] 6.6 Adicionar confirmação acessível para descartar todos os pendentes, sem apresentar a ação como rollback dos itens já confirmados.
- [x] 6.7 Bloquear mutações duplicadas durante requisições e manter as demais sessões navegáveis quando uma ação falhar.

## 7. Integração e verificação

- [x] 7.1 Verificar que contas não administrativas mantêm somente o navegador atual e não carregam nem alcançam o workspace de sessões pela interface.
- [ ] 7.2 Verificar criação manual completa após a introdução do seletor de modo, incluindo cancelamento, validação, criação e atualização dos totais.
- [x] 7.3 Verificar com conta `ADMIN` upload para criação e enriquecimento, polling, restauração, falha, sessão pronta e sessão concluída.
- [ ] 7.4 Verificar hierarquia, evidências, similaridades, snapshots, regras excluídas, nomes longos, conteúdo extenso, estados vazios e responsividade.
- [x] 7.5 Verificar confirmação original e editada, ordem pai-filho, aplicação parcial, descarte individual e total, conflitos e reconciliação da árvore real.
- [x] 7.6 Verificar que nenhum token, senha, PDF, caminho interno ou estado de sessão entra em browser storage ou em mensagens técnicas renderizadas.
- [x] 7.7 Executar `pnpm lint`, `pnpm build` e `openspec validate generate-typification-from-document --type change`.
