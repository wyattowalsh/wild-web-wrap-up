# `w4w`'s Wild Web Wrap-Up 🤠 👨‍💻

Wild Web Wrap-Up is a content-first newsletter archive and Buttondown publishing
workspace. The canonical issue drafts live in `content/issues/*.mdx`; the site
renders those issues, and the Buttondown export script generates draft-ready
Markdown/default-template emails and snippets into `buttondown/`.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS 4 with shadcn/ui-compatible component conventions
- Manual MDX issue files
- First-party Buttondown CLI dependency and repo-owned sync scripts
- Free-plan-safe Buttondown export, local email preview shell, and reusable
  Buttondown snippets

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The local app starts at `http://localhost:3000`.

The root `Justfile` provides npm-backed shortcuts for common contributor
workflows:

```bash
just
just bootstrap
just dev
```

`just bootstrap` installs dependencies and creates `.env.local` from
`.env.example` when needed. `just` lists the available recipes.

## Storybook

Storybook covers the shadcn-compatible primitives, app components, page-state
compositions, and the Buttondown Studio for local snippet previews.

```bash
npm run storybook
npm run storybook:build
npm run storybook:test
# or:
just storybook
just storybook-check
```

The Buttondown Studio reads local `content/buttondown/snippets/*.md` files and
renders them inside `content/buttondown/templates/base.html`. It includes
category tabs, filters, viewport toggles, fallback rendering, retired-snippet
inventory, and detail inspection. It does not pull from or push to Buttondown.

## Content Workflow

Create or edit issues under `content/issues/`. The file name must match the
frontmatter `slug`.

```bash
npm run content:validate
npm run content:buttondown
# or:
just content
```

`content:buttondown` writes Buttondown-compatible `.md` files with
Markdown/default-template-safe bodies into `buttondown/emails/`. The generated
files default to `status: draft`, so they are safe to review before sending.
`buttondown/emails/*.md` and `buttondown/snippets/*.md` are fully managed
generated output; rerunning the exporter removes stale `.md` files in those
directories before writing the current manifest.

The Buttondown design contract lives in `content/buttondown/DESIGN.md`. The
local preview shell lives in `content/buttondown/templates/base.html`; it is not
the live Buttondown email template. Reusable snippets live in
`content/buttondown/snippets/` and are exported to `buttondown/snippets/`.
Snippets use shadcn/Tailwind-inspired design translated into inline,
table-based email-safe HTML instead of raw Tailwind utility classes. Each
snippet uses `mode: naked` for raw HTML snippet content; generated emails still
avoid full-email Naked Mode.

## Buttondown Workflow

Authenticate once:

```bash
npm run buttondown:login
```

If `BUTTONDOWN_API_KEY` is present in `.env.local`, `.env`, or the process
environment, the repo wrapper passes it to the local CLI without printing it.
`.env.local` takes precedence over `.env`.

Before the first push, initialize the Buttondown sync directory:

```bash
npm run buttondown:pull
```

Prepare and push generated drafts:

```bash
npm run buttondown:push
npm run buttondown:verify
# or:
just bd-push
just bd-verify
```

Retired snippets are pruned separately and default to dry-run behavior:

```bash
npm run buttondown:prune-snippets
npm run buttondown:prune-snippets -- --apply
# or:
just bd-prune-snippets
```

Buttondown credentials are stored by the CLI outside the repo. Local sync-state
files under `buttondown/` are ignored because they can be account-specific.

`@buttondown/cli` is installed as a local dev dependency so the repo uses the
same CLI version everywhere. Its terminal UI currently depends on React 18, so
the lockfile keeps that dependency nested under the CLI while the app uses React 19.

The installed CLI currently pulls live emails, media, and newsletter branding
correctly, but its email push path sends full local files instead of parsed
bodies. `npm run buttondown:push` therefore uses the repo-owned API sync script
for generated emails and snippets after `buttondown:prepare`.
`npm run buttondown:verify` reads Buttondown's API back after sync and confirms
the managed generated email and snippet content matches the live platform.

The sync path intentionally omits Buttondown email `metadata`, filters,
attachments, comment/survey/form fields, and tag/segmentation payloads. The
generated email path also avoids full-email Naked Mode, sponsorship variables,
paid-upgrade variables, comment/survey variables, and form-adjacent variables.

`npm run content:validate` also checks the shared Buttondown content contract,
snippet catalog drift, app brand-token contrast, and inline email HTML contrast.

The generated `buttondown/snippets/` files follow Buttondown's documented
snippet layout. The API sync script upserts them because the installed
`@buttondown/cli@1.0.9` package source does not yet include snippet sync even
though current CLI docs describe that workflow.

Default `buttondown:push` creates or updates generated emails and snippets only.
It never deletes retired remote snippets. Use the explicit prune command after
reviewing `content/buttondown/retired-snippets.json` and Buttondown
`reference_count` values.

## Quality Gates

```bash
npm run content:validate
npm run lint
npm run typecheck
npm run build
npm run format
npm run storybook:check
```

For the same gates through `just`, use `just check` for the faster local gate or
`just ci` for the full app and Storybook build gate.
