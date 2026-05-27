# Scripts Agent Instructions

These instructions apply to `scripts/`.

## Script Style

- Use Node ESM `.mjs` scripts.
- Keep scripts deterministic and repo-local.
- Use structured parsers and schemas instead of ad hoc string parsing when
  practical.
- Keep filesystem writes scoped to known output directories and guard cleanup
  paths against escaping those directories.

## Content And Buttondown Scripts

- `scripts/lib/issues.mjs` is the shared issue parser for scripts.
- `scripts/validate-content.mjs` validates issue frontmatter, template tokens,
  snippet frontmatter, contrast, catalog drift, and email-safe HTML
  restrictions.
- `scripts/build-buttondown.mjs` generates Buttondown email and snippet output.
  It treats `buttondown/emails/*.md` and `buttondown/snippets/*.md` as fully
  managed generated output.
- `scripts/run-buttondown.mjs` wraps the local Buttondown CLI and forces failure
  on known error output that the CLI may otherwise exit with as success.
- `scripts/sync-buttondown-api.mjs` syncs generated emails and snippets through
  Buttondown's API because the installed CLI push path currently sends full
  frontmatter files instead of parsed bodies.
- `scripts/verify-buttondown-api.mjs` reads Buttondown's API after sync and
  verifies managed generated email/snippet payloads against the live platform
  without printing secrets or content bodies.

## Verification

- After changing scripts, run the narrow affected script first.
- Then run `npm run content:validate`, `npm run content:buttondown`,
  `npm run lint`, `npm run typecheck`, and `npm run build` when behavior could
  affect generated output or the app.
