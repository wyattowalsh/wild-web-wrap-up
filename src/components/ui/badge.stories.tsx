import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "@/components/ui/badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  args: {
    children: "draft",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>public</Badge>
      <Badge variant="secondary">draft</Badge>
      <Badge variant="outline">manual MDX</Badge>
    </div>
  ),
};
