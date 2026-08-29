## 1. Gather Source Context

- [x] 1.1 Review the current root `AGENTS.md` and preserve the existing Next.js 16 warning block.
- [x] 1.2 Review `openspec/config.yaml`, current `openspec/specs/`, `package.json`, and relevant repository structure for agent-facing conventions.

## 2. Update Documentation

- [x] 2.1 Expand `AGENTS.md` with concise project context for Lumina, including language, framework, package manager, and major source-of-truth files.
- [x] 2.2 Document OpenSpec workflow expectations for proposing, applying, validating, and avoiding unspecced behavior changes.
- [x] 2.3 Document implementation guardrails for Next.js 16 docs, App Router, backend proxy/auth behavior, browser storage, UI language, and existing validation commands.

## 3. Verify

- [x] 3.1 Review the updated `AGENTS.md` for consistency with current OpenSpec specs and `package.json` scripts.
- [x] 3.2 Run `openspec validate document-agents-md --type change` and record any follow-up fixes needed.
