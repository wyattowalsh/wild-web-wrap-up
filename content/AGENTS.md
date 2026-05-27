# Content Agent Instructions

These instructions apply to `content/`.

## Source Of Truth

- `content/issues/*.mdx` is the canonical editorial source.
- `content/buttondown/` is the canonical source for email templates and snippet
  content.
- Do not edit generated `buttondown/` files as the primary source of a change;
  update `content/` and run `npm run content:buttondown`.

## Validation

- Run `npm run content:validate` after changing issue files, templates, or
  snippets.
- Run `npm run content:buttondown` after changing content that affects
  Buttondown output.
- Keep content safe for both the web archive and email export.
- Keep Buttondown output aligned with `content/buttondown/DESIGN.md` and the
  free-plan-safe export contract.

## Writing

- Prefer clear issue prose over marketing copy.
- Keep examples and placeholders easy to replace.
- Do not include secrets, private subscriber data, or unpublished credentials in
  content files.
