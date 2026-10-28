## Why

Na seleção obrigatória de orientador, o e-mail não ajuda o orientando a reconhecer visualmente o professor e expõe um dado que não é necessário para escolher. Nome e foto tornam as opções mais claras mantendo a mesma ação de vínculo.

## What Changes

- Mostrar o nome e a foto de perfil (ou iniciais quando não houver foto) em cada opção de orientador.
- Remover o endereço de e-mail da interface de seleção.
- Preservar seleção, confirmação e criação do vínculo pelo identificador interno do candidato.

## Capabilities

### New Capabilities

### Modified Capabilities
- `advisor-onboarding`: limitar a apresentação de cada candidato a nome e imagem de perfil, sem exibir e-mail.

## Impact

- `app/components/OnboardingOrientadorObrigatorio.tsx` e o componente compartilhado `AvatarUsuario`.
- Nenhuma mudança na API, no payload de criação do vínculo ou nas dependências.
