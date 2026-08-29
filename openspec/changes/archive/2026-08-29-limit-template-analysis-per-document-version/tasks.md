## 1. Resultados por versão

- [x] 1.1 Estender o serviço de template para filtrar e selecionar execuções associadas à versão de PDF exibida.
- [x] 1.2 Registrar no cache da tela se a versão atual já possui uma execução e se sua elegibilidade foi resolvida.

## 2. Fluxo de Conformidade Template

- [x] 2.1 Desabilitar o início para qualquer versão que já possua uma execução e reabilitá-lo após a análise principal de uma nova versão, sem disparar conformidade automaticamente.
- [x] 2.2 Exibir estado, orientação e badge “Analisado” equivalentes aos da Conformidade ABNT para versão já analisada ou nova versão ainda em análise.
- [x] 2.3 Notificar exatamente uma vez quando cada análise iniciada na sessão atingir `completed`, inclusive em resposta terminal imediata.
- [x] 2.4 Pré-carregar apenas os estados de análise dos documentos e mostrar os badges “Analisado” sem interação prévia, mantendo o relatório inativo até o clique.
- [x] 2.5 Destacar no popup de histórico a execução do relatório atualmente em visualização.
- [x] 2.6 Usar o último resultado histórico como fallback de exibição quando o filtro da versão não encontrar execução, sem alterar a elegibilidade da versão.
- [x] 2.7 Manter Template desabilitado durante a análise principal da nova versão, sem alterar a elegibilidade independente de ABNT.
- [x] 2.8 Atualizar automaticamente os alvos pendentes em Template e ABNT para remover o badge e recalcular a elegibilidade quando a análise principal terminar.
- [x] 2.9 Manter o relatório anterior visível enquanto uma nova análise processa e substituí-lo automaticamente pelo novo relatório concluído.
- [x] 2.10 Associar resultados ao arquivo da versão quando o backend informar seu caminho, reforçando o bloqueio de uma execução por versão.

## 3. Verificação

- [x] 3.1 Executar lint e build do frontend.
- [x] 3.2 Validar a mudança OpenSpec.
