import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const meta = {
  title: "UI/Card",
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Current source</CardTitle>
        <CardDescription>
          Generated drafts stay connected to the local issue source.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          Use cards for repeated issue items and compact workflow status, not
          nested page sections.
        </p>
      </CardContent>
    </Card>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>A longer editorial state title that wraps cleanly</CardTitle>
        <CardDescription>
          The card spacing should hold up with longer copy and repeated archive
          metadata.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          Useful links, durable notes, and web-native things worth carrying
          forward.
        </p>
      </CardContent>
    </Card>
  ),
};
