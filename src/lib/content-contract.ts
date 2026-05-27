import contract from "../../content/buttondown/content-contract.json";

export type IssueStatus = "draft" | "scheduled" | "about_to_send" | "sent";
export type IssueTemplate = "classic" | "modern" | "plaintext";
export type SnippetCategory =
  | "editorial"
  | "links"
  | "trust"
  | "cta"
  | "structure";
export type SnippetTab = "all" | SnippetCategory | "deprecated" | "composite";

export const issueStatuses = contract.issueStatuses as IssueStatus[];
export const issueTemplates = contract.issueTemplates as IssueTemplate[];
export const snippetCategories =
  contract.snippetCategories as SnippetCategory[];
export const snippetTabLabels = contract.snippetTabLabels as Record<
  SnippetTab,
  string
>;
export const snippetTabOrder = contract.snippetTabOrder as SnippetTab[];
export const unsupportedIssueFrontmatterFields =
  contract.unsupportedIssueFrontmatterFields;

export function isIssueStatus(value: string): value is IssueStatus {
  return issueStatuses.includes(value as IssueStatus);
}

export function isIssueTemplate(value: string): value is IssueTemplate {
  return issueTemplates.includes(value as IssueTemplate);
}

export function isSnippetCategory(value: string): value is SnippetCategory {
  return snippetCategories.includes(value as SnippetCategory);
}
