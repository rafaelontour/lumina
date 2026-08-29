## Why

A rota de Conformidade ABNT ainda é apenas um aviso de área em construção, apesar de o backend já permitir iniciar e acompanhar verificações ABNT assíncronas para PDFs armazenados. Isso impede que pesquisadores usem uma capacidade já disponível e fragmenta a experiência de conformidade da plataforma.

## What Changes

- Substituir a página de espaço reservado em `/conformidade-abnt` por um workspace de Conformidade ABNT.
- Permitir que a pessoa autenticada escolha explicitamente um dos seus documentos enviados com PDF disponível, inicie a análise ABNT e acompanhe seu estado até a conclusão ou erro.
- Não exibir nem solicitar um template ABNT: a referência normativa usada na comparação permanece fixa e é administrada pelo backend.
- Consultar e apresentar o resultado ABNT persistido do documento, priorizando a execução terminal mais recente ao abrir um alvo e preservando o processamento somente para uma execução iniciada na visita atual.
- Exibir feedback animado enquanto a análise estiver em processamento e notificar seus eventos relevantes com Sonner.
- Apresentar o formato conhecido de relatório ABNT com metadados e resumo alinhados, critérios em largura total e rótulos em português.
- Manter os resultados em cache apenas durante a sessão da página, restaurando imediatamente um estado já observado ao alternar entre documentos e consultando novamente somente análises em processamento.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `conformity-checks`: A rota de Conformidade ABNT deixa de ser um espaço reservado e passa a oferecer a seleção explícita de PDF, o início, o acompanhamento e a apresentação de resultados da análise ABNT.

## Impact

- Afeta a rota `/conformidade-abnt`, serviços e tipos de conformidade e um novo componente de workspace.
- Consome `POST` e `GET /abnt/{doc_id}/conformidade` através do proxy autenticado existente, enviando o PDF armazenado em multipart.
- Reutiliza os alvos de documentos e o padrão de notificações, polling e cache em memória da Conformidade Template, sem mudar uploads ou a análise principal da IA.
