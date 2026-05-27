# Storybook Agent Instructions

These instructions apply to `.storybook/`.

## Storybook Contract

- Use `@storybook/nextjs-vite` as the framework.
- Import `src/app/globals.css` from `preview.ts` so stories use the same
  Tailwind tokens as the app.
- Keep Storybook tests local through `@storybook/addon-vitest`; do not add
  external visual-regression services unless the user explicitly asks.
- Keep Storybook a11y checks blocking; known issues should be fixed or narrowly
  documented, not hidden as todo checks.
- Storybook must not read live Buttondown state or require Buttondown
  credentials.

## Verification

- Run `npm run storybook:build` after changing Storybook configuration.
- Run `npm run storybook:test` after changing test-related configuration,
  story play functions, or Storybook-wide preview behavior.
