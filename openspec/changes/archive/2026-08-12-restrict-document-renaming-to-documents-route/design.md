## Context

O navegador de conversas agrupadas de Oiac IA apresenta projetos originados em Documentos e atualmente contém controles locais para renomeá-los. Conversas avulsas têm um fluxo de renomeação distinto, vinculado ao documento de conversa selecionado.

## Goals / Non-Goals

**Goals:**

- Restringir a renomeação em Oiac IA às conversas avulsas individuais.
- Remover o estado, callbacks e chamada de serviço exclusivos do renomeio de projetos agrupados nessa rota.
- Preservar o comportamento de renomeação existente em `/documentos`.

**Non-Goals:**

- Não alterar os nomes exibidos, a seleção ou os identificadores das conversas agrupadas.
- Não alterar o fluxo de renomeação das conversas avulsas.

## Decisions

- O componente da lista agrupada exibirá somente os nomes de projeto e os itens de conversa, sem modos de edição. Isso torna a regra visível diretamente na interface e elimina caminhos para a solicitação de atualização.
- O componente Oiac IA deixará de manter o estado e a atualização de projeto que atendiam apenas a essa interface. A alternativa de apenas ocultar o botão preservaria um fluxo interno sem uso e aumentaria o risco de reintrodução acidental.
- A atualização de projeto no serviço de Documentos será preservada, pois a rota `/documentos` continua sendo responsável pela edição do nome.

## Risks / Trade-offs

- [Usuários que renomeavam projetos diretamente no Oiac IA precisam mudar de rota] → A nomenclatura de projetos permanece editável em `/documentos`, local proprietário dessa informação.
- [Remoção de estados pode afetar a lista agrupada] → Manter a seleção e a renderização dos grupos inalteradas e validar a compilação/lint após a simplificação.
