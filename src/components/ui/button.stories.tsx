import Link from "next/link";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { ArrowRight, Download } from "lucide-react";

import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Read issue",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm", "icon"],
    },
    variant: {
      control: "select",
      options: ["default", "outline", "ghost"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button")).toHaveTextContent(
      "Read issue",
    );
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="icon" aria-label="Download issue">
        <Download />
      </Button>
    </div>
  ),
};

export const AsChildLink: Story = {
  render: () => (
    <Button asChild variant="outline">
      <Link href="/archive">
        View archive
        <ArrowRight />
      </Link>
    </Button>
  ),
};
