## Why

The root `AGENTS.md` currently contains only the mandatory Next.js 16 warning, so agents lack project-specific guidance about Lumina's architecture, workflow, language, and verification expectations. Expanding it now reduces repeated context discovery and helps future automated edits preserve the conventions already documented in OpenSpec.

## What Changes

- Document agent-facing project context in `AGENTS.md`, preserving the existing Next.js 16 warning block.
- Add concise guidance for repository structure, OpenSpec workflow, frontend conventions, backend proxy/auth expectations, storage rules, language, and validation commands.
- Point agents to local sources of truth such as `openspec/config.yaml`, `openspec/specs/`, `package.json`, and `node_modules/next/dist/docs/`.
- Avoid changing application behavior, dependencies, APIs, or user-facing product requirements.

## Capabilities

### New Capabilities

- None. This is project documentation for contributors and agents.

### Modified Capabilities

- None. No product behavior requirements change.

## Impact

- Affected files: root `AGENTS.md`.
- No runtime code, public APIs, backend contracts, dependencies, routes, or UI behavior are expected to change.
- Validation impact is limited to documentation review and, if practical after implementation, running existing project checks to confirm no incidental code changes were introduced.
