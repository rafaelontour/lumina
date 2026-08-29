## Why

O upload em Documentos escolhe automaticamente uma tipificação, sem deixar claro qual regra orientará a análise. A pessoa precisa selecionar conscientemente a tipificação do arquivo e encontrá-la de forma explícita no resultado do Oiac IA.

## What Changes

- Solicitar uma tipificação antes de enviar o PDF de um componente em Documentos e bloquear a confirmação enquanto ela não for selecionada.
- Criar o documento externo com exclusivamente a tipificação escolhida, sem substituir a escolha por uma correspondência automática.
- Exibir no resultado inicial do Oiac IA a tipificação ou tipificações efetivamente retornadas em `check_tree` como referência da análise aplicada.
- Dar hierarquia visual compacta à apresentação da análise inicial, aos pontos atendidos e aos pontos a aprimorar.
- Manter inalterado o envio de PDF por conversa avulsa do Oiac IA.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `document-workspace`: O envio de PDF passa a exigir a seleção explícita da tipificação usada para criar a análise.
- `oiac-ia-chat`: A análise inicial passa a identificar claramente as tipificações aplicadas ao documento.

## Impact

Afeta o diálogo de envio de PDF em Documentos, a criação de documento externo por `/doc` e a apresentação da análise inicial no Oiac IA. Não altera os endpoints, a persistência em navegador, a análise de conformidade ou conversas avulsas.
