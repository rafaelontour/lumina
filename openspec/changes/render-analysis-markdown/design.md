## Context

`ResultadoAnaliseTipificacao` exibe tanto a descrição da release quanto as descrições de taxonomias, ramos e feedbacks como texto puro. `OiacIaChat` também exibe as descrições da tipificação e o feedback como texto puro e usa um parser linha a linha próprio para a descrição da release e para as mensagens da conversa, capaz de reconhecer alguns títulos, mas incapaz de interpretar corretamente listas, negrito e tabelas. Todo conteúdo textual apresentado como Markdown precisa ter apresentação e segurança consistentes nos dois componentes.

## Goals / Non-Goals

**Goals:**

- Centralizar a renderização dos campos de análise em um componente reutilizável.
- Cobrir CommonMark e tabelas GFM com estilos coerentes com os tokens visuais atuais.
- Impedir interpretação de HTML bruto e comportamento executável vindo do conteúdo.
- Conter tabelas largas dentro do painel por rolagem horizontal.
- Preservar os destaques semânticos dos títulos fixos da síntese no Oiac IA.
- Renderizar listas presentes nas mensagens comuns da conversa como listas verticais, com marcador e um item por linha.

**Non-Goals:**

- Alterar o contrato, o envio, a persistência ou o conteúdo das mensagens da conversa.
- Interpretar a estrutura variável dos pareceres além da semântica padrão do Markdown.
- Modificar o contrato, os tipos ou o processamento assíncrono das releases.

## Decisions

### Usar um renderizador CommonMark com extensão GFM

Será criado um componente compartilhado baseado em `react-markdown`, com `remark-gfm` para tabelas e demais extensões GFM. Essa combinação processa o texto em elementos React sem depender de `dangerouslySetInnerHTML`.

A alternativa de ampliar o parser linha a linha existente foi descartada porque exigiria reimplementar regras de Markdown, especialmente tabelas e combinações de listas com negrito, e produziria comportamento diferente entre telas.

### Não habilitar HTML bruto

O pipeline não incluirá `rehype-raw` nem outra etapa que converta nós HTML do texto em elementos ativos. O componente também não usará `dangerouslySetInnerHTML`. Assim, o conteúdo gerado pela IA permanece não confiável e limitado aos elementos produzidos pelo parser Markdown seguro.

### Concentrar estilos no componente compartilhado

O componente fornecerá renderizadores para parágrafos, `strong`, listas, títulos e tabelas. Tabelas serão envolvidas por um contêiner com `overflow-x-auto`, largura mínima adequada e células com bordas/tokens do tema. Variantes de densidade permitirão o uso tanto nos cartões compactos de feedback quanto no bloco maior da síntese, sem duplicar regras de segurança ou GFM.

Antes do parsing, o componente normalizará todo marcador tipográfico `●`, independentemente do espaço Unicode ao redor, para um item Markdown em linha separada. Essa compatibilidade cobre respostas compactadas do backend sem modificar os dados recebidos, persistidos ou enviados e sem ampliar a interpretação de HTML.

### Tratar os títulos da síntese por sobrescrita do nível 1

No modo de síntese do Oiac IA, o renderizador de `h1` normalizará o texto visível e aplicará as classes já associadas a “Pontos atendidos”, “Pontos a aprimorar” e “Orientação final”. Outros títulos Markdown receberão o estilo genérico. O conteúdo abaixo dos títulos continuará sendo processado pelo mesmo fluxo Markdown.

As mensagens comuns da conversa usarão o mesmo renderizador seguro. Texto simples continuará visualmente compatível, enquanto sintaxe Markdown válida — especialmente listas — será apresentada semanticamente. O campo de entrada e o conteúdo enviado ao backend não serão transformados.

## Risks / Trade-offs

- **[A nova dependência aumenta o bundle do cliente]** → manter um único componente e apenas os plugins necessários, sem pipeline de HTML ou plugins adicionais.
- **[Markdown ocasional pode produzir elementos além dos exemplos atuais]** → aplicar estilos seguros e neutros também a elementos básicos suportados pelo renderizador.
- **[Tabelas podem exceder painéis estreitos]** → limitar o bloco à largura disponível e usar rolagem horizontal no contêiner da tabela.
- **[O estilo especial dos títulos pode se perder ao remover o parser antigo]** → cobrir os três títulos fixos em testes e na verificação visual do Oiac IA.

## Migration Plan

1. Adicionar as dependências de Markdown e GFM.
2. Criar o componente compartilhado com estilos e política de segurança.
3. Migrar os dois campos em `ResultadoAnaliseTipificacao`.
4. Migrar somente a síntese inicial e os feedbacks em `OiacIaChat`, mantendo mensagens normais no renderizador atual.
5. Migrar as mensagens comuns da conversa no `OiacIaChat` para o renderizador compartilhado.
6. Verificar formatos de parecer, síntese, mensagens com listas, texto legado e conteúdo HTML não confiável.

O rollback restaura a apresentação textual anterior e remove as duas dependências; não há migração de dados.
