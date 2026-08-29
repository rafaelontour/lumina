## Why

O endpoint de consulta de conformidade com template retorna uma coleção de resultados, inclusive quando ela está vazia. O frontend interpreta essa resposta como um único resultado e exibe um erro inválido antes que a pessoa tenha iniciado qualquer análise. Além disso, o catálogo de templates retorna objetos, mas a interface ainda o modela como uma lista de textos.

## What Changes

- Normalizar a resposta em lista de `GET /templates/{docId}/conformidade` no cliente.
- Tratar uma lista vazia como ausência de análise, mantendo a ação de iniciar disponível.
- Usar o resultado mais recentemente atualizado quando o backend devolver histórico para o mesmo documento.
- Modelar o catálogo de `GET /templates` como objetos, exibir o nome de cada template no seletor e enviar seu UUID na análise.
- Expor o histórico retornado pelo backend em um popup sob demanda para o documento selecionado.
- Revalidar no backend o resultado mais recente sempre que um PDF for selecionado, sem esconder o resultado já guardado durante a consulta.
- Apresentar o resumo e os metadados da análise em linguagem mais amigável.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `template-conformity-results`: A recuperação do resultado de conformidade passa a reconhecer a coleção retornada pelo backend e a representar uma coleção vazia como resultado ausente; o seletor passa a consumir o catálogo estruturado de templates.

## Impact

- Afeta `app/services/conformidade.ts`, os tipos de resposta de conformidade, o seletor e o painel de resultados da tela.
- Não altera o envio de PDFs, o início explícito da análise nem a análise principal da IA.
