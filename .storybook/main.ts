import path from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/nextjs-vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx|mdx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-vitest"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  viteFinal: async (viteConfig) => ({
    ...viteConfig,
    server: {
      ...viteConfig.server,
      fs: {
        ...viteConfig.server?.fs,
        allow: [
          ...(viteConfig.server?.fs?.allow ?? []),
          path.resolve(dirname, ".."),
        ],
      },
    },
  }),
};

export default config;
