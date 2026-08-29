## Context

Veja `proposal.md` para a motivação. `ArvoreAnaliseRelease`, em `app/components/OiacIaChat.tsx`, renderiza a tipificação como agrupador e cada taxonomia com descrição, fontes e critérios dentro de uma resposta inicial da Oiac IA. O componente já possui os dados normalizados; a mudança é apenas de apresentação.

## Goals / Non-Goals

**Goals:**

- Reduzir a altura inicial do detalhamento sem remover informações da avaliação.
- Dar ao usuário controle individual sobre a abertura da explicação de cada taxonomia.
- Preservar o estilo denso, tokens visuais e a hierarquia já exibida no chat.

**Non-Goals:**

- Recolher tipificações inteiras ou critérios individualmente.
- Alterar dados, normalização, chamadas de serviço, histórico do chat ou o comportamento de outras mensagens.
- Persistir o estado aberto ou fechado entre renderizações, mensagens ou sessões.

## Decisions

### Usar um controle expansível acessível para cada taxonomia

Cada taxonomia terá um botão semântico com estado de expansão exposto para tecnologias assistivas; a descrição, fontes e critérios existentes ficarão no painel associado. A tipificação continuará como contêiner visual estático. O estado controlado permite animar tanto a entrada quanto a saída do painel de forma confiável, mantendo foco e operação por teclado. O elemento nativo `details` foi descartado porque seu conteúdo deixa de participar do layout imediatamente no fechamento, impedindo uma animação de saída consistente.

### Iniciar os itens recolhidos

As explicações de taxonomia serão inicialmente recolhidas para atender ao objetivo de compactar respostas com árvores extensas. O usuário abre apenas os itens relevantes e cada painel mantém sua própria abertura durante a vida da resposta renderizada.

### Preservar o conteúdo e as chaves atuais no corpo expansível

Descrição, fontes, critérios e avaliações de cada taxonomia serão movidos como um bloco, sem alteração de ordem, textos ou dados apresentados. As chaves atualmente associadas a tipificações, taxonomias e critérios continuarão sendo usadas, evitando impacto na reconciliação de listas. Um resumo agregado de avaliações foi descartado para não inferir ou ocultar informação que o backend não fornece de modo uniforme.

### Exibir a mudança de estado com os estilos existentes

O botão da taxonomia receberá estilos de cursor, foco e indicador rotativo coerentes com os tokens do chat, comunicando visualmente a abertura sem depender apenas de cor. O painel usará a dependência `motion` já presente no projeto para animar altura e opacidade em duração curta; a animação será desativada quando o usuário preferir reduzir movimentos.

## Risks / Trade-offs

- [A explicação deixa de estar visível de imediato] → O título da taxonomia permanece sempre visível, e o usuário abre o detalhe com uma única ação.
- [Uma animação pode reduzir a responsividade percebida] → A duração será curta e o movimento será desativado quando a preferência do usuário solicitar redução de movimento.
- [Um item aberto pode voltar a recolher após recriação da mensagem] → O estado não será persistido por estar fora do escopo e porque a resposta continua integralmente consultável.

## Migration Plan

1. Manter o contêiner visual de cada tipificação e substituir o contêiner de cada taxonomia por um controle expansível animado, preservando seu corpo atual.
2. Verificar abertura, recolhimento por mouse e teclado, múltiplas taxonomias independentes e conteúdo de avaliações.
3. Caso seja necessário reverter, restaurar o contêiner estático sem mudança em dados ou backend.
