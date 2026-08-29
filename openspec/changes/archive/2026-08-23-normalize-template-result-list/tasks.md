## 1. Normalização da resposta da API

- [x] 1.1 Modelar a resposta em coleção de resultados da conformidade com template.
- [x] 1.2 Converter coleção vazia em resultado ausente e selecionar o item atualizado mais recentemente quando houver histórico.
- [x] 1.3 Modelar o catálogo de templates como objetos e exibir seus nomes no seletor.
- [x] 1.4 Enviar o UUID do template selecionado como `template_id` ao iniciar a análise.
- [x] 1.5 Expor a coleção autenticada de resultados para consulta de histórico sem alterar o adaptador do resultado atual.

## 2. Histórico de análises

- [x] 2.1 Adicionar o botão Histórico e o popup com estados de carregamento, vazio e erro.
- [x] 2.2 Listar os resultados por atualização mais recente, com status, datas e erro disponível.
- [x] 2.3 Revalidar em segundo plano o resultado mais recente ao selecionar novamente um PDF, preservando a exibição em cache até a resposta.
- [x] 2.4 Simplificar a descrição técnica do resultado e manter os metadados em texto claro, sem emojis.

## 3. Verificação

- [x] 3.1 Executar validação do OpenSpec e verificações estáticas do projeto.
- [x] 3.2 Confirmar manualmente que um PDF sem análise prévia mostra o estado de ausência sem erro.
- [x] 3.3 Confirmar manualmente que um catálogo com objetos de template preenche o seletor pelos nomes e envia o UUID selecionado.
- [x] 3.4 Confirmar manualmente que o popup mostra múltiplos resultados sem alterar o resultado principal.
