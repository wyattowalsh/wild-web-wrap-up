# App Router Agent Instructions

These instructions apply to `src/app/`.

## Routes

- Keep pages route-focused. Move reusable UI into `src/components/` and reusable
  data access into `src/lib/`.
- Use `generateStaticParams` and `generateMetadata` for issue routes when content
  is local and enumerable.
- Use `notFound()` for missing issue content rather than custom fallback UI.

## Metadata

- Keep metadata derived from issue frontmatter where possible.
- Do not hardcode per-issue metadata in route files.

## Rendering

- Preserve static rendering for `/`, `/archive`, and issue pages unless the user
  explicitly asks for live dynamic behavior.
- Do not fetch Buttondown or remote data from route render paths for the archive.
