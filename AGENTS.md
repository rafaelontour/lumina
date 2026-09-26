<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Lumina Project Guidance

Lumina is a Next.js 16 App Router frontend for AI-assisted scientific document review. The application language is Brazilian Portuguese, so preserve Portuguese UI copy, route labels, and domain terms unless a task explicitly asks otherwise.

## Sources of Truth

- Use `openspec/config.yaml` for project context and the active OpenSpec schema.
- Use `openspec/specs/` for current behavioral requirements. Do not change product behavior without an OpenSpec change that covers it.
- Run `openspec list --json` before relying on the main specs. Active changes under `openspec/changes/<change-name>/` may contain newer, not-yet-synced requirements, design decisions, and implemented work.
- When working from an active change, read its proposal, delta specs, design, and tasks; use unchecked tasks as the authoritative record of unfinished scope rather than inferring completion from the presence of code.
- Use `package.json` for scripts, dependency versions, and package manager expectations.
- For framework behavior, read the relevant local Next.js 16 docs in `node_modules/next/dist/docs/` before editing Next.js code.
- For backend behavior, inspect the published OpenAPI associated with `API_BASE_URL`; endpoint presence or a frontend call does not prove that every role is authorized to perform the operation.

## Context Recovery

When asked to “retomar o contexto” or when starting without a precise task, perform a read-only recovery before proposing edits:

1. Read this file and `openspec/config.yaml`.
2. Run `git status --short --branch` and preserve all existing user changes.
3. Run `openspec list --json`; for every relevant active change, inspect its status, proposal, design, delta specs, and unchecked tasks.
4. Read the relevant main specs, current routes/components/services, and `package.json` rather than relying on prior model knowledge.
5. Summarize in Brazilian Portuguese: branch/worktree state, active changes and progress, implemented product shape, pending backend dependencies or manual verification, and the safest next step.

Context recovery is diagnostic only. Do not edit files, mark tasks complete, archive changes, or run write-capable workflows merely because the user asked to resume context.

## Tech Stack

- Package manager: `pnpm` (`packageManager` is `pnpm@9`).
- Framework/runtime: Next.js 16 App Router, React 19, TypeScript.
- Styling and UI: Tailwind CSS 4, CSS tokens in `app/globals.css`, `next-themes`, `motion`, `lucide-react`.
- Data and validation helpers: `axios`, `radash`, `zod`, `react-pdf`, `pdfjs-dist`.

## Repository Map

- `app/layout.tsx` and `app/components/AppShell.tsx` define the fixed application shell.
- `app/(paginas)/` contains protected feature routes for Oiac IA, Documentos, Meus orientandos, Templates, Gerenciar usuários, Tipificações, Perfil, and the Template and ABNT conformity workspaces.
- `app/login/`, `app/cadastro/`, and `app/convite/` contain the public authentication, registration, and invitation entry points.
- `app/components/` contains shared UI and feature components.
- `app/data/provider/` contains the in-memory authentication and theme providers.
- `app/services/` contains frontend service clients for backend-facing calls.
- `app/api/backend/` contains the internal backend proxy route.
- `app/types/` contains shared TypeScript domain types.
- `public/` stores static assets, including Lumina logos and sample PDFs.

## Current Product Shape

- The fixed shell restores the backend session before protected content, renders a collapsible role-aware sidebar, uses cookie-backed theme/menu preferences, and hosts global Sonner notifications and pending-analysis polling.
- Public routes are `/login`, `/cadastro`, and `/convite`. Protected routes redirect anonymous visitors to `/login`.
- `DEFAULT` accounts must have an active `MAIN_ADVISOR`. `AuthProvider` checks `GET /advisorship/my-advisors`; without a confirmed main advisor, protected content is replaced by the non-dismissible advisor-selection flow. The active main advisor is retained only in memory and identified in the orientando header.
- `ADMIN` accounts use `/documentos/orientandos` as the canonical “Meus orientandos” workspace. `/documentos` is the personal document workspace for non-admin users; `/orientandos` remains a compatibility route and is redirected for administrators.
- Documentos restores projects, project documents, releases, and analyses from the backend. Oiac IA supports standalone and grouped document conversations, PDF viewing, release-analysis summaries, citations, and evidence navigation.
- Conformidade Template and Conformidade ABNT are implemented workspaces, not construction placeholders. Both use explicit user starts, authenticated stored PDFs, in-memory per-page result state, history, terminal-state polling rules, and independent result-panel scrolling.
- Administrators can manage templates, users, typification structures, invitations, and read-only advisee monitoring according to the applicable specs and active changes.
- The invitation/registration area is under active OpenSpec development. Link creation/listing/cancellation, public invitation inspection/refusal, existing-account login acceptance, authenticated-session invitation blocking, and duplicate-active-relationship warnings exist; passwordless invited registration, mandatory first-password setup, and email-only backend authorization remain incomplete unless their tasks and published backend contract say otherwise.
- The advisor-side relationship-removal flow exists in “Meus orientandos” and removes only the academic relationship after confirmation. It does not delete the advisee account or academic content. There is currently no orientando-side self-service action to leave or switch advisors unless a newer active change explicitly adds it.

## OpenSpec Workflow

- Prefer `$openspec-propose` for new behavior, architecture, or workflow changes before implementation.
- Prefer `$openspec-update-change <change-name>` when a decision revises an existing active change; do not create a competing change for the same scope without checking the current artifacts.
- Use `$openspec-apply-change <change-name>` to implement an approved change and keep task checkboxes current.
- Use `$openspec-sync-specs <change-name>` when approved delta specs need to be reflected in the main specs without archiving.
- Use `$openspec-archive-change <change-name>` only after implementation and required verification are complete.
- Run `openspec validate <change-name> --type change` before considering a change complete.
- If a change is documentation-only or tooling-only, it may use `skip_specs: true`; otherwise keep specs aligned with changed behavior.
- Do not invent requirements in `AGENTS.md`; point agents to `openspec/specs/` when detailed behavior matters.

## Implementation Guardrails

- Keep the root Next.js warning block at the top of this file.
- Preserve the App Router structure and avoid moving routes or components unless the active change requires it.
- Frontend backend calls should go through `/api/backend/*`, which depends on `API_BASE_URL`.
- Service code should preserve tuple-style result handling and normalized backend error messages where that pattern is already used.
- Preserve cookie-based backend auth behavior and never retry a 401 by submitting credentials automatically.
- User authentication uses the public frontend route `/login` and the backend-managed `HttpOnly` cookie through `/api/backend`; never persist or render passwords, access tokens, or authenticated-session state in browser-accessible storage. Keep invitation codes only in the shareable URL and requests required by the invitation flow; do not copy them into browser storage, logs, or unrelated UI. Call `GET /user/my` on every full page load before protected content is displayed; a missing or expired session redirects to `/login`.
- Invitation links are authorization data, not session tokens. If `/convite` or `/login?convite=...` is entered with a session already authenticated, present the invitation as unavailable for that visit without inspecting, accepting, rejecting, consuming, cancelling, or expiring it. A login that begins inside an initially anonymous invitation flow may still accept a matching existing-account invitation as specified by the active change.
- Before an advisor creates an invitation, compare the normalized recipient email with the active advisees already loaded for that advisor. If the relationship already exists, warn in the interface and do not send a creation request; keep normalized backend conflict handling as the authoritative stale-data fallback.
- Keep advisor onboarding and relationship state backend-backed and in memory. Do not persist advisor identity or onboarding completion in browser storage. Relationship deletion must use the returned `advisorship_id`, preserve accounts and academic content, and be authorized for the acting participant by the backend.
- Documentos uploads only create the backend document, release, and its main analysis; they MUST NOT dispatch template or ABNT conformity. Template conformity is started explicitly in `/conformidade-template`: every project component is selectable and its persistent project-document UUID is the `docId` used for the template job. The user chooses a stored PDF and a template from `GET /templates`, then the app sends that PDF plus `template_name` to `POST /templates/{docId}/conformidade`. Its result comes from `GET /templates/{docId}/conformidade` and is polled only while `processing` (`completed` and `error` are terminal); after an accepted POST, a transient 404 remains processing and continues polling. When polling observes completion or any start/request/backend failure, show one appropriate Sonner notification without repeated alerts. ABNT uses `POST`/`GET /abnt/{docId}/conformidade` when that experience is specified.
- In the desktop Conformidade Template workspace, keep the document selector stationary on the left and confine vertical scrolling of long reports to the independent right-hand result panel.
- Group Conformidade Template targets by their backend project/document group in the selector, and keep every completed-report section collapsed initially so the user expands only the sections they need.
- Cache each template result state in memory for the life of the Conformidade Template page: switching between targets must immediately restore a previously observed absent, completed, or error state; only a `processing` target keeps polling. Do not persist this cache in browser storage.
- Shell preferences use cookies, not `localStorage`.
- The Documentos workspace must not persist project, component, version, release, or analysis state in `localStorage` or IndexedDB; it should restore from backend data. Browser storage for Documentos is limited to the pending analysis id queue policy described in specs.
- Documentos should keep backend document ids as canonical handoff identifiers for Oiac IA.
- Uploaded PDF display names should preserve the original uploaded filename where specs require it.
- Keep UI changes consistent with the existing fixed shell, sidebar navigation, theme tokens, and dense application layout.

## Verification

- Use `pnpm lint` for lint checks.
- Use `pnpm build` for production build verification when code or framework behavior changes.
- For documentation-only changes, review affected docs and run the relevant OpenSpec validation.
