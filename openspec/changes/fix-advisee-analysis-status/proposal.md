## Why

Em “Meus orientandos”, documentos que já possuem uma análise concluída podem aparecer como `FAILED`. A tela interpreta o estado operacional de processamento do arquivo como se fosse o resultado acadêmico da análise e deixa de considerar o histórico retornado pelo backend.

## What Changes

- Determinar o estado exibido no acompanhamento a partir do histórico mais recente do documento, priorizando a conclusão de análise quando ela estiver registrada.
- Manter o estado operacional de processamento apenas como indicação de andamento quando não houver conclusão registrada.
- Traduzir todos os estados conhecidos da API para rótulos em português, sem expor valores técnicos como `FAILED`.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `advisee-document-monitoring`: a situação apresentada para documentos de orientandos deve refletir corretamente a análise concluída retornada pelo backend, sem confundir esse resultado com o estado operacional do processamento.

## Impact

- Afeta os tipos retornados por `GET /advisorship/advisees/{advisee_id}/documents` e o componente `DocumentosOrientandosWorkspace`.
- Não altera autorização, persistência, rotas nem realiza mutações no backend.
