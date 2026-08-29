## Context

O relatório ABNT apresenta os metadados diretamente como texto. O valor de `article_file` pode ser um caminho de armazenamento do backend, e a lista lateral já calcula se a versão atual foi analisada para controlar a ação de início.

## Goals / Non-Goals

**Goals:**

- Exibir um identificador legível do arquivo analisado sem revelar detalhes internos de armazenamento.
- Tornar visível, no seletor, que uma versão já recebeu análise ABNT.

**Non-Goals:**

- Alterar valores enviados pelo backend, resultados históricos ou o fluxo de processamento.
- Adicionar navegação, download ou ação ao badge de arquivo.

## Decisions

- Extrair o último segmento do valor de `article_file`, aceitando separadores de caminhos comuns, e usá-lo em um badge com ícone de documento. O valor bruto não será repassado a atributos auxiliares que possam expô-lo.
- Manter os demais metadados no formato atual e tratar somente o metadado de arquivo analisado de forma especial.
- Reutilizar o estado em memória de versão já analisada para mostrar um badge estático “Analisado” nos itens já consultados, sem substituir o indicador animado de processamento nem executar uma varredura de status ao carregar a lista.

## Risks / Trade-offs

- [Backend retornar um valor sem nome de arquivo reconhecível] → mostrar um rótulo seguro genérico, sem expor o valor bruto.
- [Badge adicionar densidade à lista] → usar a mesma escala compacta dos badges de estado existentes.
