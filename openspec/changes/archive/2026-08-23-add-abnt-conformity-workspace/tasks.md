## 1. Contrato e dados da Conformidade ABNT

- [x] 1.1 Consultar a documentação local aplicável do Next.js 16 antes de alterar a rota ou criar componentes interativos.
- [x] 1.2 Completar os tipos e as operações autenticadas em tupla para iniciar, consultar o resultado apropriado para a seleção e listar o histórico de `POST`/`GET /abnt/{docId}/conformidade`, validando a coleção, priorizando o resultado terminal mais recente na seleção comum e o processamento iniciado na visita atual.
- [x] 1.3 Reutilizar ou ajustar a descoberta de alvos para listar somente os documentos elegíveis enviados pela pessoa autenticada, com PDF recuperável e UUID persistente de project-document.
- [x] 1.4 Recuperar o PDF já armazenado somente no início explícito da análise e enviá-lo como `file`, sem template ou identificador de template e sem criar upload ou release.

## 2. Workspace ABNT

- [x] 2.1 Criar o workspace de Conformidade ABNT com seletor de documento, ação de iniciar análise e estados claros de carregamento, ausência de documentos e PDF indisponível, sem catálogo ou seletor de template.
- [x] 2.2 Implementar o ciclo de resultado por documento: estado aceito, ausência, processamento animado, conclusão e erro; polling somente para o alvo ativo em processamento, incluindo o 404/coleção vazia transitório após aceite e respeitando preferência por menos movimento.
- [x] 2.3 Manter o cache de resultados somente na memória da página, restaurar resultados observados ao trocar de documento, cancelar consultas obsoletas e emitir notificações Sonner únicas para aceite, falhas e transições terminais.
- [x] 2.4 Exibir o formato conhecido de relatório ABNT com metadados e resumo alinhados, critérios em largura total e rótulos em português, mantendo o fallback defensivo, painel rolável independente no desktop e estado explícito quando não houver detalhes estruturados.
- [x] 2.5 Adicionar o Histórico ABNT em popup descartável, ordenado pela atualização mais recente, sem alterar o resultado principal selecionado.
- [x] 2.6 Substituir o espaço reservado de `/conformidade-abnt` pelo workspace, preservando a estrutura fixa da aplicação e a autenticação existente.

## 3. Verificação

- [x] 3.1 Confirmar com conta autenticada que a tela lista apenas documentos elegíveis da pessoa atual, não exibe seletor de template e envia somente o PDF selecionado para a análise ABNT.
- [x] 3.2 Confirmar que aceite, 404/coleção vazia transitório, processamento animado, conclusão, erro, troca de documento, restauração em memória e histórico apresentam os estados e notificações Sonner esperados sem polling duplicado.
- [x] 3.3 Executar `pnpm lint`, `pnpm build` e `openspec validate add-abnt-conformity-workspace --type change`.
