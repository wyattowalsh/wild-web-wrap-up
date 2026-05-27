# Buttondown Source Agent Instructions

These instructions apply to `content/buttondown/`.

## Template Contract

- `templates/base.html` is the local preview shell for Storybook and snippet
  QA. It is not the live Buttondown email template.
- Preserve required exporter tokens:
  - `%%EMAIL_BODY%%`
  - `%%ISSUE_DATE%%`
  - `%%ISSUE_DESCRIPTION%%`
  - `%%ISSUE_TITLE%%`
  - `%%PREHEADER%%`
- Keep template HTML email-safe: no scripts, iframes, forms, SVGs, embedded
  audio/video, or `javascript:` URLs.
- Keep CSS inline unless a tested Buttondown rendering path supports otherwise.
- Keep the visual contract aligned with `DESIGN.md`.

## Snippet Contract

- Snippet source files live in `snippets/*.md`.
- Snippet filenames are lowercase hyphenated identifiers.
- Required snippet frontmatter is `name` and `mode: naked`; optional `category`
  is defined by `content-contract.json` and currently allows `editorial`,
  `links`, `trust`, `cta`, or `structure`.
- Keep snippets reusable and self-contained. Avoid issue-specific language unless
  the snippet name says it is issue-specific.
- Snippets should use shadcn/Tailwind-inspired design translated into inline,
  table-based email HTML. Do not rely on raw Tailwind classes in Buttondown
  snippet bodies.
- Use real destination URLs, Buttondown template variables, or obvious
  replace-before-send placeholders. Do not add fake reply addresses or invisible
  assumptions about the newsletter account.
- Do not add snippets that depend on paid subscriptions, sponsorship variables,
  comments, surveys, analytics, automations, metadata, attachments, filters, or
  tag-based segmentation.
- When adding or renaming snippets, update the catalog in `content/README.md`
  and regenerate `buttondown/snippets/` with `npm run content:buttondown`.
- Keep the Storybook Buttondown snippet lab current when snippets or
  `templates/base.html` change.
- Keep token, category, and unsupported-field changes aligned with
  `content-contract.json`; validation reads that file as the shared contract.

## Buttondown Behavior

- The generated `buttondown/snippets/` files follow Buttondown's documented
  snippet file layout.
- Do not assume the installed CLI syncs snippets until verified against
  `node_modules/@buttondown/cli`; current repo docs note the limitation.
- Default sync must create/update snippets only. Retired remote snippets are
  deleted only by the explicit prune command.
