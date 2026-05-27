# Issue Content Agent Instructions

These instructions apply to `content/issues/`.

## Frontmatter Contract

- File names must match `slug`.
- Required fields are `title`, `slug`, `date`, and `description`.
- Buttondown fields include `subject`, `status`, `email_type`, `publish_date`,
  `buttondown_id`, `canonical_url`, `image`, `secondary_id`, and optional
  `template` values `classic`, `modern`, or `plaintext`.
- `tags` are local archive metadata only and must not be emitted into generated
  Buttondown payloads.
- Keep `status: draft` unless the user explicitly asks for scheduled or sent
  behavior.
- Do not use full-email Naked Mode or `template: naked`; the free-plan-safe
  export path uses Buttondown's normal Markdown/default-template rendering.
- Do not add `metadata`, `filters`, `attachments`, comment/survey/form keys, or
  tag/segmentation payload fields. The current Buttondown free-plan sync path
  does not support those fields, and validation should fail if they appear. The
  local `tags` field above is the only allowed tag-shaped issue metadata.

## Body Contract

- Keep bodies Buttondown-safe Markdown.
- Do not use MDX imports, exports, or uppercase JSX components in issues.
- Use Markdown headings, paragraphs, lists, links, and blockquotes that can be
  rendered into HTML email.
- Keep a single leading `#` title only when it matches the frontmatter `title`;
  the exporter strips that duplicate heading from the email body.
