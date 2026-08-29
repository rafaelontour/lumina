## Why

Oiac IA deve concentrar a pessoa usuária na leitura e na conversa sobre o documento. A edição do nome de projetos/documentos nessa rota mistura responsabilidades com o espaço de trabalho de Documentos, que é o local próprio para essa manutenção.

## What Changes

- Remove da lista de conversas agrupadas de Oiac IA os controles para editar o nome do projeto/documento.
- Mantém em Oiac IA somente a edição dos nomes de conversas avulsas individuais.
- Preserva a edição de nome do documento/projeto na rota `/documentos`.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `oiac-ia-chat`: Oiac IA deixa de oferecer renomeação de projetos/documentos agrupados e continua permitindo a renomeação de conversas avulsas individuais.

## Impact

- Código afetado: `app/components/OiacIaChat.tsx` e os serviços/importações usados exclusivamente pelo renomeio de projetos nessa tela.
- A rota `/documentos` e seu fluxo de renomeação permanecem inalterados.
- Não há alteração de API, dependências ou armazenamento no navegador.
