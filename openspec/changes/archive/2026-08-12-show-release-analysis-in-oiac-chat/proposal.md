## Why

O backend produz a analise inicial do PDF no release de forma assincrona. Enquanto a `check_tree` ainda nao chegou, a conversa da Oiac IA nao informa que a analise esta em processamento; quando chega, a sintese em `description` e o resultado completo permanecem inacessiveis ou desatualizados na interface. Isso obriga a pessoa usuaria a iniciar uma conversa sem visibilidade sobre o processamento e sem os criterios detalhados que ja foram gerados para o documento.

## What Changes

- Carregar o release correspondente a conversa selecionada e derivar uma apresentacao inicial da Oiac IA a partir de seu campo `description` e de toda a sua arvore `check_tree` quando a analise estiver concluida.
- Exibir essa apresentacao antes do historico de mensagens salvo para o documento, sem alterar a ordem, envio, carregamento ou persistencia das mensagens existentes.
- Apresentar cada tipificacao, taxonomia e criterio analisado de forma hierarquica, incluindo fontes, status, nota e feedback de avaliacao quando disponiveis.
- Apresentar a sintese e os detalhes da analise de forma legivel, incluindo seus titulos e quebras de linha, sem expor identificadores internos como UUIDs.
- Enquanto o release selecionado ainda nao possuir `check_tree`, exibir uma resposta inicial animada da Oiac IA indicando que a analise esta sendo preparada e consultar novamente esse mesmo release ate a conclusao ou mudanca de contexto.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `oiac-ia-chat`: Exibir a analise inicial completa do release selecionado, incluindo a arvore de tipificacoes, antes das mensagens da conversa.

## Impact

- Componentes afetados: `OiacIaChat`, a lista/conteudo de mensagens da Oiac IA e a apresentacao hierarquica da analise.
- Servicos e tipos afetados: carregamento de releases da conversa e os tipos estruturados da arvore de avaliacao do release.
- APIs afetadas: reutiliza `GET /doc/{id}/release` para consultar o progresso do release; nenhuma API nova e nenhuma alteracao no endpoint de mensagens sao necessarias.
- Persistencia: a apresentacao inicial e derivada no cliente e nao cria ou altera mensagens salvas.
