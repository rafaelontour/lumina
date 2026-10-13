## Context

See `proposal.md` for motivation. The existing `MarkdownAnalise` component already provides safe CommonMark/GFM rendering for part of Oiac IA and advisee monitoring, but other backend prose is still emitted through plain `p`, `span`, or table cells. Normalizing data in services would mutate canonical backend values and would also mix presentation behavior with transport concerns.

## Goals / Non-Goals

**Goals:**

- Make one presentation component responsible for safe Markdown and typographic-list normalization.
- Route all identified AI/report prose through that component across the four analysis experiences.
- Preserve compact and table-cell layouts while allowing lists to become vertical.
- Keep the original backend strings unchanged outside rendering.

**Non-Goals:**

- Interpret every backend string as Markdown.
- Change API contracts, service normalization, caching, or persistence.
- Reformat identity, naming, status, date, path, filename, or technical-error fields.
- Infer list structure from punctuation when no `●` marker or valid Markdown list exists.

## Decisions

### Reuse the shared safe renderer at presentation boundaries

`MarkdownAnalise` remains the only path for rich backend prose. Oiac IA and monitoring use it for release summaries, taxonomy descriptions, branch descriptions, feedback, and messages. Template and ABNT conformity use it for summary prose, compared textual values, normative references, and justifications.

Normalizing in API services was rejected because it would alter values used by other logic and violate the requirement that the backend representation remain canonical. A global React string interceptor was rejected because it cannot distinguish prose from identifiers and operational metadata.

### Normalize every black-circle marker before Markdown parsing

Within eligible rich text, a Unicode-aware preprocessing step replaces `●` plus adjacent horizontal whitespace with a Markdown list marker on a new line. Detection keys directly on `●`, so ordinary spaces, non-breaking spaces, tabs, and absence of spaces produce the same result.

The preprocessing result is passed only to the Markdown renderer. Callers retain and reuse the original string.

### Keep structural labels and operational metadata literal

Headings and labels that define report structure remain owned by the UI. Backend identifiers, names, files, paths, dates, statuses, and error messages continue through literal text nodes. This boundary avoids turning punctuation in a filename, email, or backend error into formatting or links.

## Risks / Trade-offs

- **[A genuine black-circle character in prose becomes a list item]** → limit normalization to fields explicitly classified as backend rich text; operational metadata remains literal.
- **[Markdown blocks make dense table cells taller]** → use the compact renderer mode and retain horizontal containment for nested tables.
- **[A new backend prose field may initially bypass the renderer]** → document the classification rule and centralize future presentation through the same component.

## Migration Plan

1. Keep the current Oiac IA and monitoring integrations.
2. Expand the Unicode marker normalization in the shared renderer.
3. Migrate remaining Template and ABNT prose fields without changing their source values.
4. Verify representative plain text, Markdown, inline `●` lists, Unicode spacing, wide tables, and raw HTML.

Rollback consists of restoring the affected fields to literal text rendering; no data migration is required.
