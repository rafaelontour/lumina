## Why

O backend passou a produzir a síntese executiva das releases e os pareceres dos critérios em Markdown CommonMark com tabelas GFM. O frontend ainda exibe esses campos como texto puro ou com um parser parcial, fazendo símbolos como `**`, `-`, `|` e `#` aparecerem ao usuário e impedindo a leitura correta da análise.

## What Changes

- Renderizar `release.description` como Markdown nas apresentações de resultado e na análise inicial do Oiac IA.
- Renderizar `evaluation.feedback` como Markdown em todos os cartões de critérios exibidos atualmente.
- Renderizar também o conteúdo das mensagens comuns da conversa no Oiac IA como Markdown seguro, incluindo listas com um item por linha.
- Suportar parágrafos, negrito, listas, títulos e tabelas GFM, mantendo texto simples de releases antigas compatível.
- Preservar o destaque visual específico dos títulos “Pontos atendidos”, “Pontos a aprimorar” e “Orientação final” na síntese do Oiac IA.
- Tratar o conteúdo gerado pela IA como não confiável e não interpretar HTML bruto.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `oiac-ia-chat`: apresentar síntese, pareceres e mensagens da conversa como Markdown seguro, preservando a hierarquia visual específica da análise.
- `advisee-document-monitoring`: apresentar síntese e pareceres das releases monitoradas como Markdown seguro e legível.

## Impact

- Componentes `app/components/OiacIaChat.tsx` e `app/components/ResultadoAnaliseTipificacao.tsx`.
- Componente compartilhado de apresentação Markdown para conteúdo de análise e conversa.
- Dependências de renderização CommonMark e GFM no `package.json` e lockfile.
- Nenhuma alteração de endpoint, serviço, tipo de resposta ou contrato da API.
