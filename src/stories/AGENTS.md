# Storybook Stories Agent Instructions

These instructions apply to `src/stories/`.

## Story Scope

- Keep route/page stories as story-only compositions with fixtures. Do not import
  Next route files that read filesystem content or use server-only APIs.
- Buttondown snippet stories must read local source files only. They must not run
  Buttondown pull, push, or verify commands.
- Render email HTML in isolated iframes so app CSS does not alter email-safe
  inline styles.

## Maintenance

- Update snippet stories when the Buttondown snippet frontmatter contract,
  template tokens, or snippet catalog changes.
- Update page-state stories when the public archive/home/issue composition
  changes materially.
