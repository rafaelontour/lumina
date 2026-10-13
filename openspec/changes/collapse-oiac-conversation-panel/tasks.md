## 1. Preparação

- [x] 1.1 Consultar a documentação local relevante do Next.js 16 e revisar a estrutura atual do workspace `OiacIaChat` antes da alteração.

## 2. Painel interno recolhível

- [x] 2.1 Ler o cookie `lumina-oiac-conversas-recolhido` na rota do Oiac IA, tratar valor ausente ou inválido como expandido e fornecer o estado inicial ao workspace sem deslocamento posterior do layout.
- [x] 2.2 Adicionar estado local inicializado pela preferência recebida, alternar a coluna da listagem entre a largura completa e um trilho compacto e atualizar o cookie próprio sem usar `localStorage`, `sessionStorage` ou IndexedDB.
- [x] 2.3 Adicionar o botão laranja acessível ao lado do título interno “Oiac IA”, acima de “Conversas”, com ícone e rótulo adequados para recolher e expandir.
- [x] 2.4 Ocultar todo o conteúdo de listagem no estado recolhido e preservar conversa selecionada, aba ativa, mensagens, PDF e texto em composição durante a alternância.
- [x] 2.5 Garantir que o item global “Oiac IA”, o estado e o cookie do menu lateral da aplicação permaneçam inalterados.

## 3. Verificação

- [ ] 3.1 Verificar visualmente os estados expandido e recolhido, restauração da preferência após recarregar, padrão expandido sem cookie, ganho de largura, reabertura pelo trilho compacto, preservação do contexto e comportamento em larguras estreitas.
- [x] 3.2 Executar `pnpm lint`, `pnpm build` e `openspec validate collapse-oiac-conversation-panel --type change`.
