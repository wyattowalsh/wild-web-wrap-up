import {
  assertFreePlanData,
  assertFreePlanText,
  assertNoUnsupportedPayloadFields,
} from "./free-plan.mjs";
import { cleanObject } from "./objects.mjs";

export function buildEmailPayload(parsed) {
  const data = parsed.data;
  assertNoUnsupportedPayloadFields("Generated email frontmatter", data);
  assertFreePlanData("Generated email frontmatter", data);

  const payload = cleanObject({
    subject: data.subject,
    email_type: data.email_type,
    status: data.status,
    slug: data.slug,
    publish_date: data.publish_date,
    description: data.description,
    image: data.image,
    canonical_url: data.canonical_url,
    secondary_id: data.secondary_id,
    template: data.template,
    body: parsed.content.trim(),
  });

  if (!payload.subject) {
    throw new Error("Generated email is missing required subject");
  }

  if (!payload.body) {
    throw new Error(`Generated email ${payload.subject} has an empty body`);
  }

  if (
    payload.template &&
    !["classic", "modern", "plaintext"].includes(payload.template)
  ) {
    throw new Error(
      `Generated email ${payload.subject} uses unsupported Buttondown template "${payload.template}"`,
    );
  }

  assertFreePlanText(payload.body, `Generated email ${payload.subject}`);

  return payload;
}

export function buildSnippetPayload(identifier, parsed) {
  const mode = parsed.data.mode;
  assertFreePlanData(`snippets/${identifier}.md frontmatter`, parsed.data);
  const payload = {
    identifier,
    name: parsed.data.name,
    content: parsed.content.trim(),
    mode,
  };

  if (!payload.name) {
    throw new Error(
      `snippets/${identifier}.md: snippet frontmatter must include name`,
    );
  }

  if (mode !== "naked") {
    throw new Error(
      `snippets/${identifier}.md: snippet frontmatter must include mode: naked`,
    );
  }

  assertFreePlanText(payload.content, `snippets/${identifier}.md`);

  return payload;
}
