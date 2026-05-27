# Issue Content

Manual issues live in `content/issues/*.mdx`.

Required frontmatter:

- `title`: Display title for the archive.
- `slug`: Lowercase URL slug. It must match the file name.
- `date`: Issue date in `YYYY-MM-DD` format.
- `description`: Short archive summary.

Buttondown-aligned frontmatter:

- `subject`: Email subject. Defaults to `title` when exported.
- `status`: `draft`, `scheduled`, `about_to_send`, or `sent`.
- `email_type`: Buttondown email type. Defaults to `public`.
- `publish_date`: Optional ISO-like publish timestamp for scheduled drafts.
- `buttondown_id`: Optional remote Buttondown email id after an issue exists.
- `canonical_url`: Optional original URL for the issue.
- `image`: Optional Open Graph image URL.
- `secondary_id`: Optional Buttondown issue number.
- `template`: Optional Buttondown template value. Allowed values are `classic`,
  `modern`, or `plaintext`; do not use full-email Naked Mode.
- `tags`: Local archive metadata only. Tags are not emitted into generated
  Buttondown payloads.

Do not add `metadata`, `filters`, `attachments`, comment/survey/form keys, or
tag/segmentation payload fields to issue frontmatter. The current Buttondown
workflow is free-plan-safe and rejects paid/add-on payload surfaces. The local
`tags` field above is the only allowed tag-shaped issue metadata.

The body should stay in Buttondown-safe Markdown. The validator rejects MDX
imports, exports, uppercase JSX components, paid-upgrade variables,
sponsorship variables, comment/survey variables, and form-adjacent variables.

## Buttondown Design, Templates, And Snippets

The design source of truth lives in `content/buttondown/DESIGN.md`.

`content/buttondown/templates/base.html` is the local Storybook preview shell.
It is not the live Buttondown email template. `npm run content:buttondown`
writes free-plan-safe Markdown/default-template email files into
`buttondown/emails/*.md`. The generated `buttondown/emails/*.md` and
`buttondown/snippets/*.md` directories are fully managed; the exporter removes
stale `.md` files there before writing current output and the generated
manifest.

Reusable snippet sources live in `content/buttondown/snippets/*.md` and are
copied into `buttondown/snippets/`. Snippet filenames are their identifiers; for
example, `issue-footer.md` is referenced in Buttondown Markdown mode as:

```html
<buttondown-snippet name="issue-footer"></buttondown-snippet>
```

Snippet blocks use shadcn/Tailwind-inspired design tokens translated into
inline, table-based email HTML. Every snippet must include `mode: naked` for
raw HTML snippet content. Do not replace them with raw Tailwind classes; email
clients do not reliably preserve utility classes, and the validator rejects
`class` attributes in Buttondown templates and snippets.

Snippets are reusable starting points, not finished issue copy. External-link
snippets intentionally use `https://example.com` as a visible placeholder; replace
placeholder URLs and copy before inserting them into a send-ready issue.
After changing snippets, run `npm run content:validate` and inspect the
Buttondown Studio with `npm run storybook` or `npm run storybook:build`.
The same content gate is available through `just content-validate`, and
`just content` validates content before regenerating Buttondown output.
The validator also checks app/email contrast pairs, snippet catalog drift, and
free-plan-safe contract drift from `content/buttondown/content-contract.json`.

Retired identifiers and replacements are tracked in
`content/buttondown/retired-snippets.json`. Default sync does not delete remote
snippets; use the explicit prune command in dry-run mode before any live prune.

Current snippet catalog:

- `bookmark-bar`: Compact trio of saved links.
- `brief-lede`: Opening issue frame with two key takeaways.
- `callout`: General-purpose highlighted note.
- `comparison`: Stacked tradeoff block for two options or patterns.
- `context-window`: What changed, what stayed true, and what to verify next.
- `correction`: Calm correction block for updated or fixed claims.
- `counterpoint`: Useful objection or caveat block.
- `data-note`: Methodology/source/caveat note for numbers or claims.
- `date-radar`: Date-driven launch, deadline, or follow-up list.
- `decision-log`: Changed/why/next block for decisions and platform moves.
- `feature-link`: Lead-item card with summary and primary-source CTA.
- `field-note`: Short editorial note that connects a link to a broader pattern.
- `follow-up`: Continuity block for prior issue updates.
- `image-feature`: Image, caption, and source block with required alt text.
- `issue-footer`: Issue footer with archive/preferences links.
- `issue-map`: Table-of-contents style issue map.
- `lab-note`: Transparent test/process note.
- `link-signal`: Reusable card for a notable link and why it matters.
- `mini-review`: Compact verdict with best-for context.
- `next-thread`: Forward follow-up queue for a future issue.
- `number-signal`: Number-focused callout.
- `open-question`: Unresolved question block for reader signal.
- `pattern-map`: Multi-signal pattern summary.
- `pull-quote`: Short pull quote with source context.
- `quick-tabs`: Compact multi-link list for fast items.
- `reader-signal`: Normal-reply reader prompt.
- `reply-prompt`: Single-question reply prompt.
- `section-divider`: Rich divider for issue sections.
- `share-card`: Free-plan-safe share/subscribe CTA.
- `source-stack`: Primary/context/caveat block for transparent sourcing.
- `source-trail`: Annotated trail of supporting links.
- `timeline`: Before/now/next sequence block.
- `tool-spotlight`: Tool spotlight with fit/caveat chips and CTA.
- `trend-radar`: Signal block for emerging patterns and next evidence.
- `watchlist`: Forward-looking monitor list.
- `web-gem`: Signature single discovery block.
