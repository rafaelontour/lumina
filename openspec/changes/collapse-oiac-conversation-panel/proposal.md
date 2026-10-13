## Why

O painel fixo de listagem de conversas ocupa parte relevante da largura do workspace Oiac IA mesmo quando a pessoa está concentrada na leitura do PDF e na conversa selecionada. A interface precisa permitir recolher e reabrir essa seção sem alterar o item global “Oiac IA” do menu lateral.

## What Changes

- Adicionar um controle laranja ao lado do título interno “Oiac IA”, acima de “Conversas”, para recolher e expandir o painel completo de listagem de conversas.
- Quando recolhido, ocultar o cabeçalho “Conversas”, a ação “Nova conversa”, as tabs “Individuais” e “Documentos” e suas respectivas listas, liberando a largura para o workspace da conversa selecionada.
- Manter um trilho compacto com o título “Oiac IA” e o controle de expansão, para que a seção possa ser reaberta diretamente.
- Preservar a conversa selecionada, a aba ativa e os dados já carregados durante alternâncias entre os estados expandido e recolhido.
- Persistir a escolha em um cookie próprio e restaurá-la nas próximas visitas ao Oiac IA, iniciando expandido quando nenhuma preferência válida estiver registrada.
- Manter essa preferência independente do cookie e do estado do menu lateral global.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `oiac-ia-chat`: permitir que o painel interno de conversas seja recolhido e expandido sem perder o contexto atual do workspace.

## Impact

- Componentes afetados: `app/(paginas)/oiac-ia/page.tsx` e `app/components/OiacIaChat.tsx`.
- Especificação afetada: `openspec/specs/oiac-ia-chat/spec.md`.
- Persistência afetada: novo cookie de preferência `lumina-oiac-conversas-recolhido`, sem uso de `localStorage`.
- Nenhuma alteração de backend, dependência ou item do menu lateral global.
