import type { Preview } from "@storybook/nextjs-vite";

import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    a11y: {
      test: "error",
    },
    backgrounds: {
      default: "app",
      values: [
        { name: "app", value: "oklch(0.99 0.006 92)" },
        { name: "email canvas", value: "#eef0f4" },
        { name: "white", value: "#ffffff" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
    viewport: {
      viewports: {
        mobile: {
          name: "Mobile",
          styles: {
            height: "812px",
            width: "390px",
          },
        },
        email: {
          name: "Email Width",
          styles: {
            height: "900px",
            width: "640px",
          },
        },
        desktop: {
          name: "Desktop",
          styles: {
            height: "900px",
            width: "1280px",
          },
        },
      },
    },
  },
  tags: ["autodocs"],
};

export default preview;
