# Design

The detailed design contract lives in
`content/buttondown/DESIGN.md`. Implementation must keep code, docs, snippets,
generated output, and Storybook aligned with that document.

## Decisions

- Treat full-email Naked Mode as unavailable for the free-plan-safe export path.
- Continue to use snippet `mode: naked` for raw HTML snippets because it is a
  snippet-level API mode.
- Keep the default Buttondown push create/update-only.
- Add destructive remote snippet deletion as an explicit prune command with
  dry-run behavior and `reference_count` safety.
- Use shadcn-compatible primitives in the web and Storybook surfaces while
  translating the same visual language into inline email HTML for snippets.
- Keep `#6a9fb5` as the brand token but pair it with dark foreground text.
- Treat `buttondown/emails/*.md` and `buttondown/snippets/*.md` as fully managed
  generated output directories, with stale `.md` files removed on export.
- Use `content/buttondown/content-contract.json` as the shared source for
  statuses, templates, snippet categories, tab labels, unsupported fields, and
  contrast token expectations.
