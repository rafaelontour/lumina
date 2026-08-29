## 1. Search Scope

- [x] 1.1 Restrict the Tipificacoes filter predicate to normalized typification names and update the input copy.

## 2. Verification

- [x] 2.1 Verify that a taxonomy or branch title alone does not return a typification, while a partial typification name does.
- [x] 2.2 Run `pnpm lint`, `pnpm build`, and `openspec validate limit-typification-search-to-names --type change`.
