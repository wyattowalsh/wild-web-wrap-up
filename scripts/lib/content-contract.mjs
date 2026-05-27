import path from "node:path";
import { fileURLToPath } from "node:url";

import contract from "../../content/buttondown/content-contract.json" with { type: "json" };

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

export const contentContract = contract;
export const appTokenPairs = contract.appTokenPairs;
export const contentContractPath = path.join(
  repoRoot,
  "content",
  "buttondown",
  "content-contract.json",
);
export const issueStatuses = contract.issueStatuses;
export const issueTemplates = contract.issueTemplates;
export const snippetCategories = contract.snippetCategories;
export const snippetTabLabels = contract.snippetTabLabels;
export const snippetTabOrder = contract.snippetTabOrder;
export const unsupportedButtondownPayloadFields =
  contract.unsupportedButtondownPayloadFields;
export const unsupportedIssueFrontmatterFields =
  contract.unsupportedIssueFrontmatterFields;
