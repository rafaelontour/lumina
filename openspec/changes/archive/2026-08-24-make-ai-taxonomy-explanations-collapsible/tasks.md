## 1. Interface de tipificações no chat

- [x] 1.1 Revisar a documentação local relevante do Next.js 16 antes de editar o componente de cliente da Oiac IA.
- [x] 1.2 Manter cada tipificação como agrupador estático e substituir o contêiner de cada taxonomia por um controle expansível acessível, com o título no cabeçalho sempre visível e inicialmente recolhido.
- [x] 1.3 Manter a explicação, fontes, critérios, estados de avaliação, notas e feedback de cada taxonomia no conteúdo expandido, preservando sua ordem e dados atuais.
- [x] 1.4 Aplicar estilos de foco, cursor e indicação de abertura coerentes com os tokens e uma animação curta de altura e opacidade que respeite a preferência por menos movimento.

## 2. Verificação

- [x] 2.1 Verificar por mouse e teclado que cada taxonomia abre e recolhe de forma independente, com semântica acessível e transição curta.
- [x] 2.2 Confirmar que uma taxonomia expandida mostra integralmente sua explicação, fontes, critérios, status, notas e feedback, sem afetar a resposta ou outras mensagens da Oiac IA.
- [x] 2.3 Executar `pnpm lint`, `pnpm build` e `openspec validate make-ai-taxonomy-explanations-collapsible --type change`.
