## Context

O histórico ABNT é indexado pelo documento de backend, enquanto o workspace mantém a release mais recente e sua data de envio. Os resultados expõem a data de criação, mas não o identificador da release; por isso, a versão atual pode ser distinguida das anteriores comparando a criação da execução com o envio da release atual.

## Goals / Non-Goals

**Goals:**

- Impedir uma segunda solicitação ABNT para a versão atual, inclusive após recarregar a página.
- Liberar uma solicitação quando houver uma release posterior ainda sem execução ABNT.
- Comunicar claramente o próximo passo para a pessoa usuária.

**Non-Goals:**

- Alterar o backend, os endpoints ou o upload de Documentos.
- Ocultar resultados históricos de versões anteriores no histórico do documento.
- Impor uma trava transacional entre múltiplas abas ou clientes; o backend atual não expõe uma chave de release no contrato ABNT para essa garantia.

## Decisions

- Consultar o histórico já retornado pelo endpoint ABNT e considerar a versão atual analisada quando houver uma execução criada na data ou após o envio da release atual. Isso separa resultados de versões antigas sem exigir mudança no contrato do backend.
- Armazenar no cache em memória do workspace tanto o resultado visível quanto a elegibilidade da versão. Assim, a ação muda imediatamente após o aceite e permanece correta após as revalidações.
- Desabilitar o botão e substituir a ajuda da ação por uma instrução para enviar uma nova versão em Documentos. Uma falha anterior ao aceite não consome a única análise permitida.

## Risks / Trade-offs

- [Histórico ABNT sem associação explícita de release] → usar a ordem temporal entre o envio da release atual e a criação da execução; uma evolução de backend com `release_id` poderá substituir essa inferência.
- [Solicitações simultâneas em clientes diferentes] → a interface reduz duplicidade no fluxo normal, mas a unicidade transacional exigiria validação no backend.
