# Buttondown Snippet System

## ADDED Requirements

### Requirement: Free-plan-safe generated email output

Generated Buttondown email files SHALL avoid paid-only or paid-add-on fields and
markup.

#### Scenario: Exporting a local issue

- **WHEN** the Buttondown output generator renders an issue
- **THEN** the generated email body is Markdown/default-template safe
- **AND** the generated frontmatter does not include `template: naked`
- **AND** it omits metadata, filters, attachments, comment/survey/form fields,
  and tag/segmentation payloads.

#### Scenario: Regenerating managed output

- **WHEN** the Buttondown output generator runs
- **THEN** `buttondown/emails/*.md` and `buttondown/snippets/*.md` are treated as
  fully managed generated files
- **AND** stale `.md` files in those directories are removed before current
  output and the generated manifest are written.

### Requirement: Snippet catalog design contract

Buttondown snippets SHALL follow the design rules in
`content/buttondown/DESIGN.md`.

#### Scenario: Validating snippets

- **WHEN** content validation reads `content/buttondown/snippets/*.md`
- **THEN** each snippet has valid frontmatter
- **AND** the snippet body avoids unsupported email markup and paid-feature
  variables
- **AND** app token pairs and inline email HTML text/background pairs satisfy the
  contrast gate.

#### Scenario: Validating visual enhancement fallbacks

- **WHEN** a snippet uses a `linear-gradient` or `radial-gradient` background
- **THEN** the same inline style includes a hex `background-color` fallback
- **AND** content validation treats parseable hex gradient stops as possible
  inherited text backgrounds for contrast checks
- **AND** the snippet remains readable when gradients, shadows, and border
  radius are stripped in Storybook fallback mode.

#### Scenario: Validating shared catalog rules

- **WHEN** content validation runs
- **THEN** statuses, templates, snippet categories, tab labels, unsupported
  fields, and contrast token expectations are read from
  `content/buttondown/content-contract.json`
- **AND** the documented snippet catalog matches the snippet source files.

### Requirement: Storybook studio accessibility

The Buttondown Studio SHALL use accessible shadcn/Radix interactive primitives.

#### Scenario: Inspecting snippets locally

- **WHEN** a user navigates tabs, filters, tooltips, toggles, selects, or the
  detail sheet in Storybook
- **THEN** those controls expose keyboard and focus behavior from the
  shadcn/Radix components
- **AND** Storybook a11y checks fail the test run for violations.

### Requirement: Explicit retired snippet pruning

Remote retired snippet deletion SHALL be explicit and safe by default.

#### Scenario: Running prune without apply

- **WHEN** the prune command runs without `--apply`
- **THEN** it reports matching retired remote snippets
- **AND** it does not delete anything.

#### Scenario: Referenced snippet

- **WHEN** a retired remote snippet has `reference_count > 0`
- **THEN** the prune command refuses to delete it unless a force flag is used.
