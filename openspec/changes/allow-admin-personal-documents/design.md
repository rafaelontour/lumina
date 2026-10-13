## Context

O shell atualmente trata `/documentos` como uma rota exclusiva de contas não administrativas: o item de menu usa `apenasNaoAdmin` e o `AppShell` redireciona qualquer `ADMIN` para `/documentos/orientandos`. O workspace pessoal já é um único componente completo e não contém uma variante interna por perfil. O backend publicado oferece `scope=mine` nas listagens de projetos e documentos, mas a autorização efetiva das operações de escrita para uma sessão administrativa precisa ser confirmada em integração.

## Goals / Non-Goals

**Goals:**

- Reutilizar exatamente o mesmo workspace pessoal para `DEFAULT` e `ADMIN`, sem bifurcar componentes ou ações por perfil.
- Manter dados próprios e dados de orientandos em rotas e escopos distintos.
- Permitir que o orientador analise documentos de interesse próprio sem depender da existência ou seleção de um orientando.
- Preservar `/documentos/orientandos` como monitoramento administrativo somente leitura e `/orientandos` como compatibilidade existente.

**Non-Goals:**

- Conceder ao administrador ações de edição sobre documentos de orientandos.
- Criar uma versão administrativa do workspace pessoal.
- Alterar endpoints, modelos ou regras de propriedade do backend.

## Decisions

### Remover apenas a barreira de perfil de `/documentos`

O item de `/documentos` deixará de usar o filtro `apenasNaoAdmin`, e o shell deixará de redirecionar administradores dessa rota. O redirecionamento legado de `/orientandos` para `/documentos/orientandos` será preservado.

Isso reutiliza o workspace já testado e garante equivalência funcional por construção. A alternativa de criar outra página ou condicionar controles por `access_level` duplicaria comportamento e poderia divergir no futuro.

### Manter dois destinos explícitos no menu administrativo

O item pessoal será rotulado “Meus documentos” para todos os perfis e apontará para `/documentos`. Administradores também continuarão vendo “Meus orientandos”, apontando para `/documentos/orientandos`.

A separação por rota evita misturar contexto de propriedade e deixa claro quando o administrador está operando sobre dados próprios ou apenas acompanhando orientandos.

O workspace pessoal não receberá seletor de orientando nem validação de vínculo acadêmico: nele, o administrador atua exclusivamente como proprietário dos próprios projetos e documentos. Qualquer relação de orientação permanece restrita à rota de monitoramento.

### Solicitar explicitamente o escopo pessoal

As listagens usadas para reconstruir o workspace pessoal deverão enviar `scope=mine` quando o endpoint suportar esse parâmetro, inclusive para contas administrativas. O frontend não deverá depender de um padrão implícito do backend, especialmente porque administradores podem ter escopos ampliados em outras telas.

As mutações continuarão usando as mesmas funções e payloads do usuário comum; nenhuma ramificação por perfil será adicionada.

## Risks / Trade-offs

- **[O backend autentica a rota, mas pode rejeitar alguma mutação de uma conta `ADMIN`]** → testar criação, edição, upload/análise e exclusão com uma sessão administrativa; registrar como dependência de backend qualquer resposta de autorização, sem introduzir uma experiência diferente no frontend.
- **[Uma consulta sem escopo poderia misturar projetos próprios e de orientandos]** → enviar `scope=mine` explicitamente nas consultas do workspace pessoal e manter as consultas de orientação dentro do serviço/rota dedicada.
- **[Dois itens relacionados podem gerar confusão]** → usar os rótulos possessivos “Meus documentos” e “Meus orientandos” e rotas distintas.

## Migration Plan

1. Liberar o item pessoal no menu administrativo e remover o redirecionamento de `/documentos`.
2. Tornar explícito o escopo `mine` nas consultas do workspace pessoal.
3. Verificar com contas `DEFAULT` e `ADMIN` que `/documentos` apresenta o mesmo conjunto de ações e somente dados próprios.
4. Confirmar que `/documentos/orientandos` permanece exclusivo de administradores e somente leitura.

O rollback consiste em restaurar o filtro do menu e o redirecionamento anterior; não há migração de dados.
