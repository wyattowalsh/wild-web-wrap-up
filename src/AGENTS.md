# Source Agent Instructions

These instructions apply to `src/`.

## App Architecture

- Use Next.js App Router and React Server Components by default.
- Keep filesystem content reads server-side in `src/lib/content.ts` or direct
  server-only callers.
- Do not introduce client components unless interactivity requires them. If a
  client component is needed, keep the client boundary narrow.
- Keep route pages static when possible; the archive should be buildable without
  live services.

## TypeScript

- Keep TypeScript strict. Avoid `any` unless a third-party boundary forces it and
  a narrower type is not practical.
- Prefer simple exported types from local modules over duplicating inferred
  shapes across components.
- Keep parsing and validation grounded in structured schemas.

## Styling

- Use Tailwind CSS tokens and existing shadcn-compatible primitives.
- Keep visual changes consistent with the restrained newsletter/archive design.
- Do not add new component libraries without an explicit reason.

## Storybook

- Add or update stories when app-visible component behavior or page-state
  composition changes.
- Keep page stories fixture-backed; do not import route modules that read local
  filesystem content.
