# Wild Web Wrap-Up Agent Instructions

These instructions apply to the whole repository unless a nested `AGENTS.md`
narrows them.

## Project Shape

- This is a content-first Next.js newsletter archive with Buttondown publishing
  support.
- The canonical issue source is `content/issues/*.mdx`.
- Buttondown source assets live under `content/buttondown/`.
- Generated Buttondown sync output lives under `buttondown/`.
- The public app lives under `src/`.

## Working Rules

- Before editing, check the current branch and focused dirty state.
- Preserve unrelated dirty work. Do not reset, stash, switch branches, or clean
  generated files unless the user explicitly asks.
- Prefer current repo patterns over introducing new frameworks or build tools.
- Do not add compatibility layers, alternate content sources, or migration paths
  unless concrete persisted/deployed consumers require them.
- Never commit, print, or persist secrets. Buttondown credentials and
  account-specific sync state must stay out of the repo.

## Commands

- If `just` is available, use the root `Justfile` as a friendly command router.
  Its recipes are wrappers around the npm scripts below; start with `just`,
  `just check`, `just ci`, `just content`, or `just buttondown-verify`.
- Install dependencies with `npm install`.
- Run content validation with `npm run content:validate`.
- Regenerate Buttondown output with `npm run content:buttondown`.
- Run app checks with `npm run lint`, `npm run typecheck`, `npm run format`,
  and `npm run build`.
- Run Storybook with `npm run storybook`, build it with
  `npm run storybook:build`, and run Storybook browser tests with
  `npm run storybook:test`.
- Use the repo-local Buttondown CLI through `npm run buttondown -- ...` or the
  named scripts in `package.json`.

## Documentation Stewardship

- Update `README.md`, `content/README.md`, and relevant nested `AGENTS.md` files
  when changing public workflows, file structure, Buttondown behavior, or content
  contracts.
- Update Storybook stories when changing component APIs, public page
  compositions, Buttondown snippet contracts, or the base email template.
- There is no dedicated docs framework in this repo. Treat docs work here as
  project-local runbook and contributor-surface maintenance.
- Keep docs concrete and command-backed. Do not claim a setup or publish path
  works unless it was validated or the limitation is stated.

## Buttondown Boundary

- `@buttondown/cli` is first-party repo tooling and is installed locally.
- The installed CLI version syncs emails, media, and newsletter branding. Do not
  assume snippet sync works through the CLI unless verified against the installed
  package, not just external docs.
- Generated emails default to `status: draft`; do not change that safety default
  without an explicit publishing request.
