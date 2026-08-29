## Why

Os PDFs enviados em Documentos precisam permanecer disponíveis para os fluxos de revisão sem iniciar conformidade automaticamente. A pessoa usuária deve escolher, na página Conformidade Template, qual PDF analisar e qual template institucional comparar.

## What Changes

- Substituir o placeholder de Conformidade Template por uma área que lista os PDFs mais recentes do workspace restaurado do backend.
- Carregar os templates disponíveis, permitir a seleção explícita de um PDF e de um template, e iniciar a análise somente por ação do usuário.
- Reaproveitar o PDF armazenado na release para enviar `file` e `template_name` a `POST /templates/{docId}/conformidade`, sem criar documento ou release adicional.
- Consultar `GET /templates/{docId}/conformidade` e atualizar somente o resultado selecionado enquanto estiver em `processing`.
- Exibir os estados de ausência, processamento, erro e conclusão, além do relatório estruturado concluído.
- Remover do upload em Documentos todo disparo automático de conformidade de template ou ABNT; esses fluxos ficam isolados da criação de documento, release e análise principal.
- Manter a tela de resultados ABNT fora de escopo.

## Capabilities

### New Capabilities

- `template-conformity-results`: seleção explícita, disparo, acompanhamento e apresentação da conformidade de PDFs do workspace com templates institucionais.

### Modified Capabilities

- `conformity-checks`: a seleção e o disparo de template deixam Documentos e passam para Conformidade Template; uploads deixam de disparar automaticamente template ou ABNT.
- `document-workspace`: uploads mantêm apenas a criação de documento, release e análise principal.

## Impact

- Afeta `app/(paginas)/documentos/page.tsx`, `app/components/ConformidadeTemplateWorkspace.tsx`, `app/services/conformidade.ts` e `app/types/Conformidade.ts`.
- Usa o proxy interno para `/templates` e `/templates/{docId}/conformidade` e o download autenticado do PDF da release.
- Não usa `localStorage` ou IndexedDB para o catálogo, a seleção ou o resultado.
