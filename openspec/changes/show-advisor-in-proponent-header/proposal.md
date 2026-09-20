## Why

A pessoa orientanda não consegue identificar rapidamente, durante a navegação, qual orientador está associado à sua conta. Exibir essa informação na barra superior mantém o vínculo acadêmico visível sem exigir que o usuário abra outra tela.

## What Changes

- Exibir na barra superior da interface do orientando o nome do orientador principal associado ao vínculo ativo.
- Restringir essa identificação a contas não administrativas, preservando o cabeçalho atual dos orientadores.
- Reaproveitar a consulta autenticada de orientadores ativos já executada durante a verificação obrigatória do vínculo.
- Manter o cabeçalho responsivo quando o nome do orientador for longo e não revelar dados de vínculos inativos ou de outros usuários.
- Tratar ausência e falha da consulta no fluxo de onboarding existente, sem apresentar uma identidade incorreta na barra.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `app-shell`: incluir a identificação do orientador ativo na barra superior somente na interface do orientando.

## Impact

- Componentes afetados: `app/components/Cabecalho.tsx` e, se necessário para o repasse do dado, `app/components/AppShell.tsx`.
- Estado autenticado afetado: `app/data/provider/AuthProvider.tsx`, que passa a conservar o orientador retornado por `GET /advisorship/my-advisors` durante a sessão em memória.
- Contrato reutilizado: `CartaoOrientador` e `listarMeusOrientadoresAtivos()`; nenhuma alteração de backend ou nova dependência.
- Especificação afetada: `openspec/specs/app-shell/spec.md`.
