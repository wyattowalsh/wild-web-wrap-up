import { getButtondownConfig } from "./env.mjs";

export function createButtondownClient(options = {}) {
  const { apiBaseUrl, apiKey } = getButtondownConfig(options);

  if (!apiKey) {
    throw new Error("BUTTONDOWN_API_KEY is required for Buttondown API access");
  }

  async function listAll(resourcePath, requestOptions = {}) {
    const results = [];
    let next = resourcePath;

    while (next) {
      const page = await request(next, {
        method: "GET",
        optional: requestOptions.optional,
      });

      if (!page) {
        return [];
      }

      if (Array.isArray(page.results)) {
        results.push(...page.results);
        next = page.next ? normalizeNextPagePath(page.next) : null;
      } else if (Array.isArray(page)) {
        results.push(...page);
        next = null;
      } else {
        next = null;
      }
    }

    return results;
  }

  async function request(resourcePath, options = {}) {
    const method = options.method ?? "GET";
    const response = await fetch(`${apiBaseUrl}${resourcePath}`, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (response.status === 404 && options.optional) {
      return null;
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Buttondown API ${method} ${resourcePath} failed with ${response.status}: ${text}`,
      );
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  return {
    listAll,
    request,
  };
}

function normalizeNextPagePath(nextUrl) {
  const parsed = new URL(nextUrl);
  return `${parsed.pathname.replace(/^\/v1/, "")}${parsed.search}`;
}
