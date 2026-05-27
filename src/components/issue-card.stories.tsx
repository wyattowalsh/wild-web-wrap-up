import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { IssueCard } from "@/components/issue-card";
import { issueFixtures, primaryIssue } from "@/stories/fixtures";

const meta = {
  title: "Components/IssueCard",
  component: IssueCard,
  args: {
    issue: primaryIssue,
  },
} satisfies Meta<typeof IssueCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DraftIssue: Story = {};

export const ScheduledIssue: Story = {
  args: {
    issue: issueFixtures[2],
  },
};

export const Grid: Story = {
  render: () => (
    <div className="grid max-w-5xl gap-4 md:grid-cols-2">
      {issueFixtures.map((issue) => (
        <IssueCard key={issue.slug} issue={issue} />
      ))}
    </div>
  ),
};
