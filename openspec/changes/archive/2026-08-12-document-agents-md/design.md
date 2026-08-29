## Context

See `proposal.md` for motivation. `AGENTS.md` is the root instruction file consumed by coding agents in this repository and currently only preserves the required Next.js 16 warning. `CLAUDE.md` delegates to `AGENTS.md`, so improving the root file centralizes guidance for multiple agent entry points.

The project context already lives in OpenSpec and the package metadata: Lumina is a Brazilian Portuguese Next.js 16 App Router frontend using React 19, TypeScript, Tailwind CSS 4, next-themes, axios, motion, lucide-react, radash, zod, and pnpm. Existing specs document application shell, Oiac IA, Documentos, backend proxy/auth, typification, and conformity behavior.

## Goals / Non-Goals

**Goals:**

- Make `AGENTS.md` useful as the first operational reference for future coding agents.
- Preserve the existing Next.js 16 warning exactly enough that agents still notice and follow it before code edits.
- Keep the document concise, stable, and grounded in local source-of-truth files rather than duplicating every requirement from OpenSpec.
- Include practical commands and validation expectations that match `package.json`.

**Non-Goals:**

- Do not change application behavior, source code, dependency versions, specs, or project configuration outside the OpenSpec proposal artifacts.
- Do not replace OpenSpec as the detailed requirements source.
- Do not add speculative conventions that are not supported by the current repository.

## Decisions

1. Keep the existing generated Next.js warning block at the top of `AGENTS.md`.

   Rationale: the current instruction is explicit and high-priority for this project because it uses Next.js 16. Agents should see it before any other guidance.

   Alternative considered: rewriting the warning into a broader framework section. That would make the required notice less visible and could lose the generated block markers.

2. Organize the added content around agent actions, not general project marketing.

   Rationale: `AGENTS.md` is most useful when it answers what to read, what conventions to preserve, what commands to run, and which areas are sensitive.

   Alternative considered: expanding the README. The README is currently generic user/developer onboarding, while `AGENTS.md` is the intended target for automated coding instructions.

3. Reference OpenSpec instead of embedding all product requirements.

   Rationale: detailed requirements already live under `openspec/specs/`; duplicating them in `AGENTS.md` would create drift.

   Alternative considered: copying major requirements into `AGENTS.md`. That would make the file longer and harder to keep current.

4. Document storage and backend integration constraints at a high level.

   Rationale: the specs show important architectural boundaries around `/api/backend/*`, `API_BASE_URL`, cookie-backed auth behavior, and avoiding browser persistence for Documentos. These are exactly the kinds of constraints agents can accidentally violate.

   Alternative considered: omitting implementation-sensitive notes because this change is documentation-only. That would leave future agents without the practical guardrails the file is meant to provide.

## Risks / Trade-offs

- Stale guidance over time -> Mitigate by pointing to OpenSpec, `package.json`, and Next.js local docs as sources of truth and keeping `AGENTS.md` concise.
- Documentation-only validation may miss content quality issues -> Mitigate by reviewing the final file against current specs and package scripts.
- Too much detail could obscure the Next.js warning -> Mitigate with a short structure and by keeping the warning first.
