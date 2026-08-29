## 1. Persistent Page Headers

- [x] 1.1 Identify the existing page-header regions in Oiac IA, Documentos, Tipificações, Conformidade Template, and Conformidade ABNT, preserving the shell's existing scroll container.
- [x] 1.2 Apply the shared route-local sticky header treatment, including opaque themed background, stacking, and spacing, to every identified feature-page header.
- [x] 1.3 Preserve route-specific header controls and ensure routes without a page header do not render a new empty header.

## 2. Document Creation Action

- [x] 2.1 Update the Documentos add-document action to reuse the primary-action sizing and visual treatment of “Nova tipificação” without changing its label or behavior.

## 3. Verification

- [x] 3.1 Verify each affected feature route retains a visible, usable header while its content scrolls in both themes and that the shell remains fixed.
- [x] 3.2 Verify the Documentos add action matches the primary Tipificações action visually and still opens the existing document-creation flow.
- [x] 3.3 Run `pnpm lint`, `pnpm build`, and `openspec validate make-page-headers-sticky --type change`.
