# Buttondown Output Agent Instructions

These instructions apply to `buttondown/`.

## Generated Output

- This directory is the local Buttondown sync workspace.
- `emails/*.md` and `snippets/*.md` are generated from `content/`.
- Those generated `.md` directories are fully managed; `npm run
content:buttondown` removes stale `.md` files there before writing current
  output.
- Prefer editing `content/issues/` or `content/buttondown/`, then running
  `npm run content:buttondown`.
- Do not hand-edit generated files unless debugging the exporter or explicitly
  asked to patch generated output.

## Sync State And Credentials

- Do not commit `.buttondown.json` or other account-specific sync-state files.
- Never print API keys or credential values.
- If a Buttondown command fails due to auth, report the exact error string and
  leave generated source files intact.

## Publishing Safety

- Generated emails should remain drafts unless the user explicitly asks to
  schedule or send.
- Generated emails should not use `template: naked` or full-email Naked Mode.
  Keep live Buttondown output Markdown/default-template safe.
- Do not run `npm run buttondown:push` unless the user has clearly asked for a
  Buttondown push in the active session.
- `npm run buttondown:push` uses the repo API sync script for generated emails
  and snippets. The local CLI remains the pull path for live emails, media, and
  newsletter branding.
- Keep generated/API-synced email payloads free of `metadata`; the current
  Buttondown account plan does not support email metadata.
- Keep generated/API-synced payloads free of filters, attachments,
  paid-upgrade variables, sponsorship variables, comment/survey/form fields, and
  tag/segmentation payloads.
- Retired snippets are not deleted by default push. Use the explicit prune
  command in dry-run mode first.
