## Why

Nomes de arquivos enviados podem ser maiores que o espaço disponível em cartões, listas e metadados, invadindo os controles vizinhos ou ultrapassando o contêiner. A plataforma precisa preservar uma leitura estável independentemente do tamanho do nome original.

## What Changes

- Truncar visualmente nomes longos de arquivos com reticências dentro de seus contêineres, preservando o nome completo como informação acessível quando aplicável.
- Auditar as apresentações de arquivos em Documentos, Oiac IA, Conformidade ABNT, Conformidade Template e gestão de templates.
- Manter o nome original e os dados de arquivo intactos em estado e nas chamadas ao backend.

## Capabilities

### New Capabilities

- `filename-overflow-protection`: Apresentação segura e responsiva de nomes longos de arquivos em toda a interface.

### Modified Capabilities

Nenhuma.

## Impact

Afeta componentes de interface que exibem nomes de PDFs ou templates. Não altera endpoints, uploads, armazenamento ou nomes persistidos no backend.
