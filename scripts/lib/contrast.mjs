import { contentContract } from "./content-contract.mjs";

const hexPattern = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const gradientPattern = /\b(?:linear-gradient|radial-gradient)\s*\(/i;
const styleAttributePattern = /<\s*(\/?)([a-z][a-z0-9-]*)([^>]*)>/gi;
const stylePattern = /\sstyle=(["'])([\s\S]*?)\1/i;
const voidElements = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

export function assertConfiguredContrastPairs() {
  for (const pair of contentContract.contrastPairs) {
    assertContrastPair(
      pair.label,
      pair.foreground,
      pair.background,
      pair.minimum,
    );
  }

  for (const pair of contentContract.appTokenPairs) {
    assertContrastPair(
      pair.label,
      pair.foreground,
      pair.background,
      pair.minimum,
    );
  }
}

export function assertInlineHtmlContrast(source, label) {
  const stack = [{ backgrounds: ["#ffffff"] }];
  const failures = [];
  let match;

  while ((match = styleAttributePattern.exec(source))) {
    const [, closingSlash, tagNameRaw, attributes] = match;
    const tagName = tagNameRaw.toLowerCase();

    if (closingSlash) {
      if (!voidElements.has(tagName) && stack.length > 1) {
        stack.pop();
      }
      continue;
    }

    const currentBackgrounds = stack.at(-1)?.backgrounds ?? ["#ffffff"];
    const styleMatch = attributes.match(stylePattern);
    const declarations = styleMatch ? parseStyle(styleMatch[2]) : {};
    const nextBackgrounds = getBackgroundCandidates(
      declarations,
      currentBackgrounds,
      tagName,
      failures,
    );
    const foreground = normalizeHexColor(declarations.color);

    if (foreground) {
      const minimum = getMinimumContrast(declarations);

      for (const background of nextBackgrounds) {
        const ratio = getContrastRatio(foreground, background);

        if (ratio < minimum) {
          failures.push(
            `${tagName} color ${foreground} on background candidate ${background} is ${ratio.toFixed(2)}:1; expected at least ${minimum}:1`,
          );
        }
      }
    }

    const selfClosing = attributes.trim().endsWith("/");

    if (!voidElements.has(tagName) && !selfClosing) {
      stack.push({ backgrounds: nextBackgrounds });
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `${label}: contrast check failed\n${failures
        .map((failure) => `- ${failure}`)
        .join("\n")}`,
    );
  }
}

export function assertCssTokenContrast(source, label) {
  const variables = parseCssVariables(source);
  const primary = normalizeHexColor(variables["--primary"]);
  const primaryForeground = normalizeHexColor(
    variables["--primary-foreground"],
  );

  if (primary !== contentContract.brand.primary) {
    throw new Error(
      `${label}: --primary must match ${contentContract.brand.primary}`,
    );
  }

  if (primaryForeground !== contentContract.brand.primaryForeground) {
    throw new Error(
      `${label}: --primary-foreground must match ${contentContract.brand.primaryForeground}`,
    );
  }

  for (const pair of contentContract.appTokenPairs) {
    const foreground = normalizeHexColor(variables[pair.foregroundVariable]);
    const background = normalizeHexColor(variables[pair.backgroundVariable]);

    if (foreground !== normalizeHexColor(pair.foreground)) {
      throw new Error(
        `${label}: ${pair.foregroundVariable} must match ${pair.foreground}`,
      );
    }

    if (background !== normalizeHexColor(pair.background)) {
      throw new Error(
        `${label}: ${pair.backgroundVariable} must match ${pair.background}`,
      );
    }

    assertContrastPair(
      `${label} ${pair.label}`,
      foreground,
      background,
      pair.minimum,
    );
  }
}

function assertContrastPair(label, foreground, background, minimum) {
  const normalizedForeground = normalizeHexColor(foreground);
  const normalizedBackground = normalizeHexColor(background);

  if (!normalizedForeground || !normalizedBackground) {
    throw new Error(`${label}: expected hex foreground and background colors`);
  }

  const ratio = getContrastRatio(normalizedForeground, normalizedBackground);

  if (ratio < minimum) {
    throw new Error(
      `${label}: contrast ${ratio.toFixed(2)}:1 is below ${minimum}:1 for ${normalizedForeground} on ${normalizedBackground}`,
    );
  }
}

function parseStyle(style) {
  return Object.fromEntries(
    style
      .split(";")
      .map((declaration) => declaration.trim())
      .filter(Boolean)
      .map((declaration) => {
        const separatorIndex = declaration.indexOf(":");
        if (separatorIndex === -1) {
          return null;
        }

        return [
          declaration.slice(0, separatorIndex).trim().toLowerCase(),
          declaration.slice(separatorIndex + 1).trim(),
        ];
      })
      .filter(Boolean),
  );
}

function getBackgroundCandidates(
  declarations,
  inheritedBackgrounds,
  tagName,
  failures,
) {
  const background = declarations.background;
  const backgroundImage = declarations["background-image"];
  const gradientValues = [background, backgroundImage].filter((value) =>
    gradientPattern.test(value ?? ""),
  );

  if (gradientValues.length > 0) {
    const fallback = normalizeHexColor(declarations["background-color"]);
    const gradientStops = uniqueHexColors(
      gradientValues.flatMap((value) => extractHexColors(value)),
    );

    for (const value of gradientValues) {
      if (!fallback) {
        failures.push(
          `${tagName} gradient background "${value}" must include a hex background-color fallback in the same style attribute`,
        );
      }

      if (gradientStops.length === 0) {
        failures.push(
          `${tagName} gradient background "${value}" must include at least one parseable hex stop color`,
        );
      }
    }

    return uniqueHexColors([fallback, ...gradientStops]);
  }

  const solidBackground =
    normalizeHexColor(background) ??
    normalizeHexColor(declarations["background-color"]);

  return solidBackground ? [solidBackground] : inheritedBackgrounds;
}

function parseCssVariables(source) {
  return Object.fromEntries(
    Array.from(source.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)).map(
      ([, name, value]) => [name, value.trim()],
    ),
  );
}

function extractHexColors(value) {
  return Array.from(
    value.matchAll(/#(?:[0-9a-f]{6}|[0-9a-f]{3})\b/gi),
    ([match]) => normalizeHexColor(match),
  ).filter(Boolean);
}

function uniqueHexColors(colors) {
  return [...new Set(colors.filter(Boolean))];
}

function normalizeHexColor(value) {
  if (!value) {
    return null;
  }

  const match = value.match(/#(?:[0-9a-f]{3}|[0-9a-f]{6})\b/i);

  if (!match || !hexPattern.test(match[0])) {
    return null;
  }

  const hex = match[0].toLowerCase();

  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }

  return hex;
}

function getMinimumContrast(declarations) {
  const fontSize = Number.parseFloat(declarations["font-size"] ?? "0");
  const fontWeight = Number.parseInt(declarations["font-weight"] ?? "400", 10);

  if (fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700)) {
    return 3;
  }

  return 4.5;
}

function getContrastRatio(foreground, background) {
  const foregroundLuminance = getRelativeLuminance(foreground);
  const backgroundLuminance = getRelativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(hex) {
  const [red, green, blue] = hex
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
