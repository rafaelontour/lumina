## Context

Veja `proposal.md` para a motivação. A Oiac IA já obtém releases pelo documento backend canônico e exibe o `check_tree` ao lado do `PdfDocumentViewer`. O contrato de release documentado em `/openapi.json` disponibiliza `evaluation.references` com `page`, `text_snippet`, `chunk_id` e retângulos `x1`, `y1`, `x2`, `y2`; a página é indexada a partir de zero, enquanto o leitor React-PDF numera páginas a partir de um. O leitor atual já renderiza continuamente todas as páginas, controla zoom e rola resultados de pesquisa para o centro do painel.

## Goals / Non-Goals

**Goals:**

- Ligar o parecer de cada critério aos trechos de evidência retornados pelo backend.
- Reutilizar o leitor PDF e o PDF autenticado já carregados na área de trabalho dividida.
- Manter os destaques geométricos alinhados ao PDF em todos os níveis de zoom.
- Falhar de forma informativa quando a referência não tiver área ou página localizável.

**Non-Goals:**

- Gerar novas citações, chunks, análises ou chamadas de IA.
- Alterar o PDF, suas anotações nativas ou a pesquisa textual existente.
- Persistir evidência selecionada entre conversas, releases ou sessões.
- Mostrar citações em mensagens comuns do histórico sem referências estruturadas da release.

## Decisions

### Normalizar referências no limite do serviço

Os tipos da análise de release passarão a representar explicitamente citações e referências. A normalização aceitará somente páginas numéricas e retângulos com as quatro coordenadas numéricas, preservando texto e identificador de chunk quando disponíveis. Isso impede que uma resposta parcial do backend quebre a árvore da análise; referências sem retângulos ainda podem navegar por página.

### Elevar a evidência selecionada para o workspace Oiac IA

O critério renderizado em `OiacIaChat` emitirá uma referência selecionada para o estado do workspace. Esse estado será passado ao `PdfDocumentViewer`, em vez de criar uma segunda renderização de PDF ou um canal global. Ao mudar de conversa, release ou PDF, a seleção será reconciliada para evitar aplicar uma referência antiga ao novo documento.

### Usar sobreposição geométrica coordenada ao viewport da página

O leitor carregará as dimensões base de cada página e converterá os retângulos da referência para o tamanho renderizado, inclusive após mudanças de zoom. A página de API será convertida de base zero para a página visual de base um. Cada página continuará sendo renderizada pelo React-PDF; a sobreposição ficará no mesmo contêiner posicionado da página para não alterar a camada de texto nem a busca.

### Destacar uma evidência por vez e preservar pesquisa

A seleção substituirá apenas os destaques de evidência anteriores. Ela rolará a página-alvo para o centro do painel e aplicará um pulso visual curto aos seus retângulos. Os estados e a camada de destaques de busca literal permanecerão independentes, evitando que citar um trecho limpe a pesquisa em andamento.

### Tratar evidências incompletas no próprio fluxo

Um controle de citação só será oferecido quando houver ao menos página. Uma referência sem retângulo continuará navegável e exibirá uma mensagem persistente no leitor; página inválida ou PDF indisponível manterão a interface utilizável e informarão o motivo sem enviar nova requisição.

## Risks / Trade-offs

- [Coordenadas da referência usam escala diferente da página renderizada] → Converter cada retângulo a partir das dimensões base da página e verificar em mais de um nível de zoom.
- [O PDF ainda está renderizando quando uma evidência é escolhida] → Aguardar a montagem da página em um efeito observável antes de rolar e destacar.
- [Referências legadas são parciais] → Exibir somente controles navegáveis por página e manter o restante do parecer intacto.
- [Muitos retângulos na mesma página] → Renderizar apenas os da evidência selecionada e usar uma sobreposição sem captura de eventos.

## Migration Plan

1. Publicar os tipos, normalização e leitura de referências junto aos controles da análise.
2. Acrescentar a propriedade de evidência selecionada ao leitor existente e implementar sobreposições e rolagem.
3. Verificar referências em PDFs de páginas múltiplas, zoom, busca ativa, ausência de retângulos e troca de conversa.
4. Reverter removendo os controles e a propriedade de evidência; nenhuma migração de dados ou backend é necessária.
