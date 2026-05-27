# Buttondown Snippet System Overhaul

## Summary

Redesign the Buttondown snippet system around a free-plan-safe publishing
contract, a shadcn-driven local studio, and a richer reusable snippet catalog.

## Why

The previous generated email path depended on `template: naked`, while Buttondown
documents full-email Naked Mode as a paid feature. The snippet catalog also
contains paid-upgrade and sponsorship-specific blocks. The repository needs a
clear design spec, free-plan validation, and a safe retired-snippet lifecycle.

## Scope

- Add `content/buttondown/DESIGN.md` as the source of truth for design and
  Buttondown constraints.
- Replace the 36-snippet catalog with a redesigned 36-snippet catalog.
- Generate Buttondown email bodies without full-email Naked Mode.
- Add explicit retired-snippet prune tooling.
- Expand the local Storybook snippet lab into a shadcn-style Buttondown Studio.
- Enforce contrast and shared-contract validation in the local content gate.
- Replace partial local interactive primitives with Radix-backed shadcn
  registry components.
- Make generated Buttondown `.md` output directories fully managed by the
  exporter.

## Out Of Scope

- Live Buttondown push, verify, or prune.
- Paid Buttondown features.
- Subscriber data, tags, filters, automations, or analytics integrations.
