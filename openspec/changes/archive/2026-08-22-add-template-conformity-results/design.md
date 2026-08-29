## Context

Documentos restaura projetos, componentes, PDFs e releases do backend. Uploads devem somente criar ou atualizar esses recursos e sua análise principal. A análise de template é um trabalho independente, iniciado na tela Conformidade Template para um PDF já armazenado.

## Goals / Non-Goals

**Goals:**

- Listar PDFs atuais do workspace sem persistência de navegador.
- Permitir selecionar um PDF e um template e iniciar explicitamente a análise.
- Consultar o resultado por documento e fazer polling somente de `processing`.
- Notificar uma única vez a conclusão ou falha de uma análise iniciada pela pessoa usuária.
- Manter a criação de documento, release, `check_tree`, Oiac IA e ABNT isolados dessa escolha.

**Non-Goals:**

- Criar uma experiência de resultados ABNT.
- Disparar template ou ABNT no upload.
- Criar release para reenviar o PDF à análise.

## Decisions

### Usar o workspace como catálogo de PDFs

A tela reutiliza `carregarWorkspaceDocumentos` e expõe a versão mais recente de cada componente com PDF. Assim, o identificador do documento backend continua canônico e não é necessário duplicar dados em armazenamento de navegador.

### Iniciar somente por ação explícita

Depois de escolher um alvo e um nome retornado por `GET /templates`, a tela obtém o PDF do `filePath` autenticado e envia o mesmo arquivo a `POST /templates/{docId}/conformidade`. O upload em Documentos não chama endpoints de conformidade.

### Polling local ao alvo selecionado

A tela consulta inicialmente o resultado e agenda a próxima consulta somente quando `status` é `processing`. A rotina é cancelada ao trocar de seleção ou desmontar o componente; `completed`, `error` e resultado ausente não recebem novas consultas.

### Notificações de transição

O estado persistente da tela continua sendo a fonte de recuperação. Sonner complementa esse estado com um aviso de sucesso quando o polling observa a transição de `processing` para `completed` e um aviso de erro deduplicado para falhas de início, requisição ou backend.

### Tratar o relatório defensivamente

O contrato publicado descreve `report` como objeto aberto. O componente normaliza estruturas opcionais e renderiza dados como texto, nunca HTML inserido diretamente.

## Risks / Trade-offs

- [O PDF armazenado não está disponível] → desabilitar o disparo e explicar o motivo.
- [O resultado ainda não foi materializado após o aceite] → preservar a seleção e permitir novo disparo caso a consulta posterior o trate como ausente.
- [A API retorna um relatório parcial] → renderizar somente campos reconhecidos, mantendo a tela utilizável.

## Migration Plan

1. Publicar a tela de seleção e o serviço atualizado junto com a remoção dos disparos automáticos do upload.
2. Links existentes com `documentId` continuam selecionando o PDF se ele estiver no workspace.
3. A reversão restaura o fluxo anterior sem migração de dados, pois não há persistência nova.
