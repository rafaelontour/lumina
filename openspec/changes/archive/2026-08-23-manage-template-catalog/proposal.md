## Why

Os templates institucionais são a base das análises de conformidade, mas não há uma interface para que professores administradores os cadastrem e mantenham. Sem ela, a lista de templates permanece vazia e a análise não pode ser iniciada.

## What Changes

- Adicionar a rota administrativa `/templates`, disponível apenas para contas `ADMIN`.
- Permitir listar, criar, editar (nome e/ou PDF) e excluir templates pelo CRUD já exposto pelo backend.
- Oferecer um atalho que preenche o nome do template a partir do nome do PDF, sem sua extensão.
- Permitir limpar rapidamente o texto informado no campo de nome sem remover o PDF selecionado.
- Incluir a entrada “Templates” na navegação de professores administradores e impedir acesso à rota por contas padrão.

## Capabilities

### New Capabilities

- `template-catalog-management`: Gestão, por professores administradores, do catálogo de PDFs institucionais usados na conformidade.

### Modified Capabilities

Nenhuma.

## Impact

- Nova rota e workspace de gestão de templates.
- Integração autenticada com `GET`, `POST`, `PUT` e `DELETE /templates`.
- Navegação e proteção de rota dependentes de `access_level: ADMIN`.
