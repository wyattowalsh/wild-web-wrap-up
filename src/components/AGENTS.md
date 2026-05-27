# Component Agent Instructions

These instructions apply to `src/components/`.

## Components

- Use shadcn/ui conventions for reusable primitives in `src/components/ui/`.
- Keep app-specific components outside `ui/`.
- Use `lucide-react` icons where an icon improves command clarity.
- Keep cards for repeated items or framed tools; do not nest cards inside cards.
- Add or update component stories for meaningful variant, size, responsive, or
  empty/long-content states.

## Accessibility

- Preserve semantic links, headings, and button behavior.
- Use `asChild` only when it keeps the underlying element semantically correct.
- Keep visible text concise and make sure labels fit at mobile widths.

## Styling

- Use the `cn` helper from `src/lib/utils.ts` for conditional classes.
- Avoid one-off CSS files for components unless Tailwind cannot express the
  behavior cleanly.
