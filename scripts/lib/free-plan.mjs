import {
  unsupportedButtondownPayloadFields,
  unsupportedIssueFrontmatterFields,
} from "./content-contract.mjs";

export {
  unsupportedButtondownPayloadFields,
  unsupportedIssueFrontmatterFields,
};

const paidFeaturePatterns = [
  {
    name: "Buttondown sponsorship variable",
    pattern: /\{\{\s*ad\s*\}\}/i,
  },
  {
    name: "paid upgrade URL",
    pattern: /\bupgrade_url\b/i,
  },
  {
    name: "premium subscription URL",
    pattern: /\bpremium_subscribe_url\b/i,
  },
  {
    name: "paid subscriber upsell condition",
    pattern: /\bsubscriber\.can_be_upsold\b/i,
  },
  {
    name: "subscriber tag targeting",
    pattern: /\bsubscriber\.tags?\b|\btag_ids?\b/i,
  },
  {
    name: "filter payload",
    pattern: /\bfilters?\b\s*:/i,
  },
  {
    name: "attachment payload",
    pattern: /\battachments?\b\s*:/i,
  },
  {
    name: "survey surface",
    pattern:
      /\bsurveys?\s*:|\bsurvey_url\b|\bsurvey\.|\{\{\s*surveys?\b|\{%\s*surveys?\b/i,
  },
  {
    name: "comment surface",
    pattern:
      /\bcomments?\s*:|\bcomments?_url\b|\bcomments?\.|\{\{\s*comments?\b|\{%\s*comments?\b/i,
  },
  {
    name: "form surface",
    pattern:
      /<form\b|\bforms?\s*:|\bsubscribe_form\b|\{\{\s*forms?\b|\{%\s*forms?\b/i,
  },
];

export function assertFreePlanText(source, label) {
  for (const { name, pattern } of paidFeaturePatterns) {
    if (pattern.test(source)) {
      throw new Error(
        `${label}: contains unsupported free-plan content: ${name}`,
      );
    }
  }
}

export function assertFreePlanData(label, value) {
  if (typeof value === "string") {
    assertFreePlanText(value, label);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      assertFreePlanData(`${label}[${index}]`, item),
    );
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  for (const [key, childValue] of Object.entries(value)) {
    assertFreePlanData(`${label}.${key}`, childValue);
  }
}

export function assertNoUnsupportedPayloadFields(label, data) {
  for (const key of unsupportedButtondownPayloadFields) {
    if (Object.hasOwn(data, key)) {
      throw new Error(
        `${label}: field "${key}" is not supported by the current Buttondown free-plan sync path`,
      );
    }
  }
}

export function assertNoUnsupportedIssueFrontmatter(label, data) {
  for (const key of unsupportedIssueFrontmatterFields) {
    if (Object.hasOwn(data, key)) {
      throw new Error(
        `${label}: field "${key}" is not supported by the current Buttondown free-plan sync path`,
      );
    }
  }
}
