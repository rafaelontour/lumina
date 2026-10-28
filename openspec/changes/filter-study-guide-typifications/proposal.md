## Why

O campo “Buscar tipificação” do gerenciador de materiais não reduz as opções quando a API não aplica seu parâmetro de busca. Isso impede encontrar e indicar uma tipificação no guia de estudo.

## What Changes

- Filtrar as tipificações carregadas no navegador pelo texto informado no campo de busca.
- Manter a opção já selecionada disponível durante a edição, mesmo que o termo de busca atual não a corresponda.
- Informar claramente quando nenhuma tipificação corresponder à busca.

## Capabilities

### New Capabilities

### Modified Capabilities
- `study-guide-management`: tornar funcional a busca de tipificação durante a configuração de materiais por etapa.

## Impact

- `app/components/StudyGuideWorkspace.tsx`.
- Nenhuma mudança de API ou persistência.
