<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Lumina Project Guidance

Lumina is a Next.js 16 App Router frontend for AI-assisted scientific document review. The application language is Brazilian Portuguese, so preserve Portuguese UI copy, route labels, and domain terms unless a task explicitly asks otherwise.

## Sources of Truth

- Use `openspec/config.yaml` for project context and the active OpenSpec schema.
- Use `openspec/specs/` for current behavioral requirements. Do not change product behavior without an OpenSpec change that covers it.
- Use the active change under `openspec/changes/<change-name>/` for proposal, design, and tasks when implementing planned work.
- Use `package.json` for scripts, dependency versions, and package manager expectations.
- For framework behavior, read the relevant local Next.js 16 docs in `node_modules/next/dist/docs/` before editing Next.js code.

## Tech Stack

- Package manager: `pnpm` (`packageManager` is `pnpm@9`).
- Framework/runtime: Next.js 16 App Router, React 19, TypeScript.
- Styling and UI: Tailwind CSS 4, CSS tokens in `app/globals.css`, `next-themes`, `motion`, `lucide-react`.
- Data and validation helpers: `axios`, `radash`, `zod`, `react-pdf`, `pdfjs-dist`.

## Repository Map

- `app/layout.tsx` and `app/components/AppShell.tsx` define the fixed application shell.
- `app/(paginas)/` contains feature routes such as Oiac IA, Documentos, Tipificacoes, and conformity placeholders.
- `app/components/` contains shared UI and feature components.
- `app/services/` contains frontend service clients for backend-facing calls.
- `app/api/backend/` contains the internal backend proxy route.
- `app/types/` contains shared TypeScript domain types.
- `public/` stores static assets, including Lumina logos and sample PDFs.

## OpenSpec Workflow

- Prefer `$openspec-propose` for new behavior, architecture, or workflow changes before implementation.
- Use `$openspec-apply-change <change-name>` to implement an approved change and keep task checkboxes current.
- Run `openspec validate <change-name> --type change` before considering a change complete.
- If a change is documentation-only or tooling-only, it may use `skip_specs: true`; otherwise keep specs aligned with changed behavior.
- Do not invent requirements in `AGENTS.md`; point agents to `openspec/specs/` when detailed behavior matters.

## Implementation Guardrails

- Keep the root Next.js warning block at the top of this file.
- Preserve the App Router structure and avoid moving routes or components unless the active change requires it.
- Frontend backend calls should go through `/api/backend/*`, which depends on `API_BASE_URL`.
- Service code should preserve tuple-style result handling and normalized backend error messages where that pattern is already used.
- Preserve cookie-based backend auth behavior and never retry a 401 by submitting credentials automatically.
- User authentication uses the public frontend route `/login` and the backend-managed `HttpOnly` cookie through `/api/backend`; never persist or render passwords, access tokens, or authenticated-session state in browser-accessible storage. Call `GET /user/my` on every full page load before protected content is displayed; a missing or expired session redirects to `/login`.
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
