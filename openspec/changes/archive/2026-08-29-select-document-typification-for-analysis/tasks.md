## 1. Seleção de tipificação no envio

- [x] 1.1 Modelar o estado transitório do PDF selecionado e carregar as tipificações disponíveis antes da confirmação do envio.
- [x] 1.2 Exibir um diálogo acessível para selecionar uma tipificação, tratar catálogo vazio/erro e permitir cancelar sem criar documento ou release.
- [x] 1.3 Usar exclusivamente o id confirmado pelo usuário ao criar o documento externo e preservar o fluxo existente de envio e acompanhamento da release.

## 2. Identificação no Oiac IA

- [x] 2.1 Exibir, antes da avaliação detalhada, as tipificações retornadas em `check_tree` como referência da análise aplicada, sem repetir os nomes na árvore detalhada.
- [x] 2.2 Dar destaque compacto à apresentação da análise, aos pontos atendidos, aos pontos a aprimorar e à orientação final na mensagem inicial da IA.

## 3. Verificação

- [x] 3.1 Validar manualmente a seleção, o cancelamento, catálogo vazio/erro e a análise de um componente com a tipificação escolhida exibida no Oiac IA.
- [x] 3.2 Executar `pnpm lint`, `pnpm build` e `openspec validate select-document-typification-for-analysis --type change`.
