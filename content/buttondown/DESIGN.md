# Buttondown Design Spec

This document is the controlling design contract for Wild Web Wrap-Up
Buttondown assets. It covers local preview tooling, Buttondown snippets, and
generated email output.

## Free-Plan Capability Matrix

Use only Buttondown features that are available without paid add-ons:

| Surface      | Allowed                                                                     | Not allowed                                                             |
| ------------ | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Editor mode  | Markdown/default Buttondown rendering                                       | Full-email Naked Mode                                                   |
| Snippets     | API-managed snippets, including snippet `mode: naked` for raw HTML          | Snippet behavior that requires paid email templates                     |
| Issue output | Draft/public email fields, body, subject, description, image, canonical URL | Metadata, attachments, filters, paid subscriber targeting, tag payloads |
| Engagement   | Normal email replies and archive links                                      | Comments, surveys, paid-subscription upsells                            |
| Revenue      | Editorial notes and normal links                                            | Sponsorship variables, `{{ ad }}`, paid upgrade flows                   |

`mode: naked` in snippet frontmatter means raw HTML snippet content. It does
not mean full-email Naked Mode.

## shadcn/UI Strategy

Use real shadcn-compatible React primitives for the local web app and Storybook
studio. Translate the same design language into inline table-based email HTML
for Buttondown snippets.

| shadcn pattern | Buttondown translation                                     |
| -------------- | ---------------------------------------------------------- |
| `Card`         | Bordered presentation table with stable padding and radius |
| `Badge`        | Inline pill or uppercase eyebrow label                     |
| `Separator`    | Solid, dotted, or rail-style table divider                 |
| `Alert`        | Callout, correction, or source warning module              |
| `Tabs`         | Storybook-only catalog navigation                          |
| `Tooltip`      | Storybook-only metadata hints                              |
| `Table`        | Storybook-only inventory and retire/prune views            |
| `Sheet`        | Storybook-only snippet detail inspector                    |

Email snippets must never import React, Tailwind classes, Radix attributes, or
client-side behavior.

## Visual Tokens

| Token      | Hex       | Use                                                   |
| ---------- | --------- | ----------------------------------------------------- |
| Brand      | `#6a9fb5` | Primary accents, CTA surfaces, active studio controls |
| Brand dark | `#23495a` | Accessible text on pale blue surfaces                 |
| Brand ink  | `#14313d` | High-emphasis headings and dark modules               |
| Canvas     | `#f7faf8` | Email/page background                                 |
| Surface    | `#ffffff` | Cards and snippet interiors                           |
| Mist       | `#e5f1f5` | Pale brand tint and divider details                   |
| Border     | `#d8e4e7` | Default table/card borders                            |
| Muted text | `#52636b` | Descriptions and captions                             |
| Warm       | `#8a4f2f` | Sparing secondary editorial accent                    |
| Green      | `#347d68` | Verification, source confidence, positive states      |
| Danger     | `#a4473d` | Corrections and destructive/prune warnings            |
| Ink        | `#172033` | Primary body text                                     |

The visual system should not become a single-hue blue palette. Use brand blue
as the through-line, then vary structure, density, and secondary accents by
snippet category.

The brand fill `#6a9fb5` must use dark foreground text such as `#14313d`.
White text is reserved for dark fills like `#14313d`; white on `#6a9fb5` does
not pass the repository contrast gate.

## Email Token Translation

Use these CSS patterns in snippet HTML:

- Start with solid color fallbacks before gradients.
- Any `background` or `background-image` gradient must include a hex
  `background-color` fallback in the same style attribute so fallback preview
  mode and conservative email clients keep a stable surface color.
- Contrast validation treats every parseable hex gradient stop as a possible
  text background inherited by descendants. Keep text directly on gradients only
  when every foreground/stop pairing passes; otherwise move the gradient to a
  wrapper, hairline, border, or other non-text decorative surface.
- Keep border radius at 8px or less unless a small pill is required.
- Use subtle shadows only as nonessential enhancement.
- Keep body text at 13px minimum and normal paragraphs at 14px or 15px.
- Keep links visibly underlined or styled as clear buttons.
- Prefer table rows, rail cells, numbered pills, and compact dividers over SVG
  icons or decorative imagery.
- Use gradient hairline wrappers, subtle glow borders, micro dividers, dotted
  trails, numbered pills, and compact evidence ledgers as the W4W signature
  details. These details must remain decorative; the text hierarchy, labels,
  rows, and links must still carry the meaning when shadows, gradients, and
  radii are stripped.

Allowed progressive enhancement example:

```html
style="background-color: #ffffff; background: linear-gradient(135deg, #ffffff
0%, #eaf5f7 100%); border: 1px solid #d8e4e7; box-shadow: 0 14px 30px rgba(20,
49, 61, 0.08);"
```

## Snippet Anatomy

Every snippet must include:

- YAML frontmatter with `name` and `mode: naked`.
- Optional `category` from `editorial`, `links`, `trust`, `cta`, or
  `structure`.
- A single outer presentation table.
- Inline styles only.
- Reusable placeholder copy that is easy to replace.

Every snippet must avoid:

- `class` attributes.
- Scripts, iframes, forms, SVG, audio, video, and `javascript:` URLs.
- Paid Buttondown variables such as `{{ ad }}`, `upgrade_url`,
  `premium_subscribe_url`, or `subscriber.can_be_upsold`.
- Hidden assumptions about reply addresses, subscriber tags, or paid audience
  segmentation.

## Catalog Taxonomy

| Category    | Purpose                                                       |
| ----------- | ------------------------------------------------------------- |
| `editorial` | Ledes, notes, decisions, corrections, questions, continuity   |
| `links`     | Feature links, quick tabs, bookmarks, web gems, source trails |
| `trust`     | Source stacks, data notes, lab notes, counterpoints           |
| `cta`       | Reply, share, footer, reader-signal prompts                   |
| `structure` | Maps, dividers, timelines, watchlists, comparison layouts     |

The catalog intentionally stays at 36 active snippets. Breaking identifier
changes are tracked in `retired-snippets.json`.

## Identifier Lifecycle

Snippet identifiers are public Buttondown references. A rename or deletion must
be represented in the retired manifest with:

- old identifier,
- replacement identifier,
- reason,
- prune status.

The default sync path creates and updates snippets only. Remote deletion must be
run explicitly through the prune command.

## Accessibility Requirements

- Maintain WCAG AA contrast for text over its background.
- Keep `content/buttondown/content-contract.json`, `src/app/globals.css`, and
  snippet inline colors aligned so `npm run content:validate` can enforce
  contrast before export.
- Do not encode meaning only through color.
- Keep alt text placeholders explicit for image snippets.
- Keep tap targets at least 40px tall where a snippet presents a button.
- Ensure content remains readable if gradients, shadows, and border radius are
  stripped by the email client.
- Validate text contrast against both solid fallback colors and parseable hex
  gradient stops before using gradients on text-bearing surfaces.
- Use the Storybook fallback preview as the local visual check for stripped
  gradient, shadow, and radius behavior before syncing snippets.
- Keep labels concise enough for mobile email widths.

## Buttondown Sync Contract

- Source snippets live in `content/buttondown/snippets/`.
- Generated snippets live in `buttondown/snippets/`.
- `buttondown/emails/*.md` and `buttondown/snippets/*.md` are fully managed
  generated directories; rerunning export removes stale `.md` files there.
- Live API sync should use snippet `identifier`, `name`, `content`, and `mode`.
- Generated email payloads must omit `template: naked`, metadata, filters,
  attachments, sponsorship variables, paid-upgrade variables, and tag payloads.
- `buttondown:push` must not delete retired remote snippets.

## Storybook QA Workflow

The Buttondown Studio story must provide:

- category tabs,
- identifier search and category filters,
- mobile/email/desktop viewport toggles,
- normal and stripped-CSS fallback preview modes,
- inventory table,
- retired-snippet table,
- detail sheet with snippet HTML and checklist context.

Storybook must read local source files only and must not pull from or push to
Buttondown.

## Rollback/Prune Procedure

To roll back a catalog rename locally, restore the source snippet file and
regenerate Buttondown output. To remove stale live snippets, run the explicit
prune command in dry-run mode first, inspect identifiers and `reference_count`,
then rerun with `--apply` only after confirming the target account.
