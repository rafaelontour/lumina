## Why

Textos descritivos retornados pelo backend, especialmente conteúdo produzido por IA, aparecem em várias experiências e ainda são apresentados de formas diferentes. Quando o backend compacta listas com marcadores `●`, campos não integrados ao renderizador Markdown continuam exibindo todos os itens em linha corrida.

## What Changes

- Estabelecer uma política única para apresentar conteúdo textual rico retornado pelo backend em análises, conversas e relatórios.
- Renderizar como Markdown seguro a prosa gerada pela IA no Oiac IA, no monitoramento de orientandos e nos relatórios de Conformidade Template e ABNT.
- Normalizar todo marcador tipográfico `●` desse conteúdo para um item de lista em linha separada, com ou sem espaços Unicode ao redor.
- Manter como texto literal os identificadores e metadados operacionais, como nomes de usuário, e-mails, nomes de arquivos, projetos, templates, status, datas, caminhos e mensagens técnicas de erro.
- Preservar os valores recebidos, persistidos e enviados ao backend; a normalização existe somente na camada de apresentação.
- Continuar bloqueando a interpretação de HTML bruto vindo do backend.

## Capabilities

### New Capabilities

- `backend-rich-text-presentation`: política transversal de apresentação segura e consistente para prosa e conteúdo rico retornado pelo backend.

### Modified Capabilities

Nenhuma. A nova capacidade transversal define a política compartilhada sem alterar os contratos de dados ou o ciclo de vida das experiências existentes.

## Impact

- Componente compartilhado `app/components/MarkdownAnalise.tsx`, que passa a representar conteúdo rico vindo do backend e da IA.
- Apresentações estruturadas em `OiacIaChat`, `ResultadoAnaliseTipificacao`, `ConformidadeTemplateWorkspace` e `ConformidadeAbntWorkspace`.
- Nenhuma alteração de endpoint, payload, persistência, autenticação ou dependência.
