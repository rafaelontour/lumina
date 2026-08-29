## Why

Avisos de sucesso, erro e processamento aparecem hoje de formas diferentes nas telas e muitas vezes ocupam espaco permanente na interface. Uma notificacao transitória e consistente melhora o retorno imediato das acoes sem competir com o conteudo de trabalho.

## What Changes

- Adicionar Sonner como o mecanismo unico de toast para avisos operacionais da aplicacao.
- Exibir toasts para sucesso, erro, validacao e progresso de acoes iniciadas pela pessoa usuaria em Documentos, Oiac IA e Tipificacoes.
- Remover mensagens de status transitorias renderizadas dentro das paginas quando elas forem substituidas por toasts.
- Manter estados persistentes e acionaveis na tela, como carregamento, ausencia de dados, PDF indisponivel e falha de carregamento inicial.

## Capabilities

### New Capabilities

- `toast-notifications`: Notificacoes transitórias, acessiveis e consistentes para retorno de acoes operacionais no Lumina.

### Modified Capabilities

Nenhuma.

## Impact

- Componentes afetados: shell da aplicacao, Documentos, Oiac IA e Tipificacoes.
- Dependencias: adiciona `sonner`.
- Persistencia e APIs: nenhuma alteracao; os toasts refletem os resultados das chamadas existentes.
