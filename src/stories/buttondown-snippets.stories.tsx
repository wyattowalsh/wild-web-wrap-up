import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Buffer } from "buffer";
import { Info, Search } from "lucide-react";
import matter from "gray-matter";

import baseTemplate from "../../content/buttondown/templates/base.html?raw";
import retiredManifest from "../../content/buttondown/retired-snippets.json";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  isSnippetCategory,
  snippetCategories,
  snippetTabLabels,
  snippetTabOrder,
  type SnippetCategory,
  type SnippetTab,
} from "@/lib/content-contract";

(
  globalThis as typeof globalThis & {
    Buffer?: typeof Buffer;
  }
).Buffer ??= Buffer;

type SnippetMode = "naked";
type PreviewWidth = "mobile" | "email" | "desktop";
type CssMode = "normal" | "fallback";

type Snippet = {
  category: SnippetCategory;
  html: string;
  identifier: string;
  mode: SnippetMode;
  name: string;
};

type StudioArgs = {
  width: PreviewWidth;
};

const snippetModules = import.meta.glob<string>(
  "../../content/buttondown/snippets/*.md",
  {
    eager: true,
    import: "default",
    query: "?raw",
  },
);
const snippets = Object.entries(snippetModules)
  .map(([filePath, source]) => parseSnippetSource(filePath, source))
  .sort((a, b) => a.identifier.localeCompare(b.identifier));
const snippetsByIdentifier = new Map(
  snippets.map((snippet) => [snippet.identifier, snippet]),
);
const retiredEntries = [...retiredManifest.retired].sort((a, b) =>
  a.identifier.localeCompare(b.identifier),
);
const widthMap = {
  desktop: 760,
  email: 640,
  mobile: 390,
} satisfies Record<PreviewWidth, number>;
const studioTabs = snippetTabOrder;

const meta: Meta<StudioArgs> = {
  title: "Buttondown/Studio",
  args: {
    width: "email",
  },
  argTypes: {
    width: {
      control: "inline-radio",
      options: ["mobile", "email", "desktop"],
    },
  },
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "studio",
    },
  },
};

export default meta;

type Story = StoryObj<StudioArgs>;

export const ButtondownStudio: Story = {
  render: ({ width }) => (
    <TooltipProvider>
      <SnippetStudio initialWidth={width} />
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await expect(
      canvas.getByRole("heading", { name: "Buttondown Studio" }),
    ).toBeInTheDocument();

    await userEvent.type(canvas.getByLabelText("Search snippets"), "web-gem");
    await expect(canvas.getAllByText("Web Gem").length).toBeGreaterThan(0);
    await expect(canvas.getByText("1 snippet visible")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("radio", { name: "Fallback" }));
    await expect(
      canvas.getByRole("radio", { name: "Fallback" }),
    ).toHaveAttribute("aria-checked", "true");

    await userEvent.click(canvas.getByRole("button", { name: "Inspect" }));
    await expect(page.getByRole("dialog")).toBeInTheDocument();
    await expect(
      page.getByRole("heading", { name: "Web Gem" }),
    ).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    await expect(page.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.clear(canvas.getByLabelText("Search snippets"));
    await userEvent.click(canvas.getByRole("tab", { name: "Deprecated" }));
    await expect(canvas.getByText("Retired Snippets")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("tab", { name: "All" }));
    await userEvent.click(canvas.getByRole("radio", { name: "Normal" }));
    await expect(canvas.getByText("36 snippets visible")).toBeInTheDocument();
  },
};

export const CompositeIssue: Story = {
  render: ({ width }) => {
    const html = buildCompositeHtml();

    return (
      <StudioShell>
        <StudioHeader
          eyebrow="Composite"
          title="Representative W4W Email"
          description="A free-plan-safe local preview built from the redesigned snippet system."
        />
        <EmailFrame
          html={renderEmail(html, {
            description:
              "A composite preview built from representative local snippets.",
            title: "Wild Web Wrap-Up Preview",
          })}
          title="Composite Buttondown issue preview"
          width={widthMap[width]}
        />
      </StudioShell>
    );
  },
};

function SnippetStudio({ initialWidth }: { initialWidth: PreviewWidth }) {
  const [activeTab, setActiveTab] = React.useState<SnippetTab>("all");
  const [query, setQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<
    SnippetCategory | "all"
  >("all");
  const [width, setWidth] = React.useState<PreviewWidth>(initialWidth);
  const [cssMode, setCssMode] = React.useState<CssMode>("normal");
  const [selectedSnippet, setSelectedSnippet] = React.useState<Snippet | null>(
    null,
  );
  const normalizedQuery = query.trim().toLowerCase();
  const tabSnippets =
    activeTab === "all" ||
    activeTab === "deprecated" ||
    activeTab === "composite"
      ? snippets
      : snippets.filter((snippet) => snippet.category === activeTab);
  const filteredSnippets = tabSnippets.filter((snippet) => {
    const matchesCategory =
      categoryFilter === "all" || snippet.category === categoryFilter;
    const matchesQuery =
      !normalizedQuery ||
      snippet.identifier.includes(normalizedQuery) ||
      snippet.name.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });

  return (
    <StudioShell>
      <StudioHeader
        eyebrow="Buttondown"
        title="Buttondown Studio"
        description={`${snippets.length} active free-plan-safe snippets rendered through the local preview shell.`}
      />

      <Alert variant="info" className="mb-5">
        <AlertTitle>Local preview only</AlertTitle>
        <AlertDescription>
          This studio reads local source snippets and does not pull, push,
          prune, or verify against Buttondown.
        </AlertDescription>
      </Alert>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as SnippetTab)}
      >
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <ScrollArea className="w-full min-w-0 pb-2 lg:w-auto">
            <TabsList className="h-auto w-full flex-wrap justify-start gap-1 lg:w-max lg:flex-nowrap">
              {studioTabs.map((value) => (
                <TabsTrigger key={value} value={value}>
                  {snippetTabLabels[value]}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          <div className="grid gap-2 sm:grid-cols-[minmax(180px,1fr)_160px] lg:w-[460px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                aria-label="Search snippets"
                className="pl-8"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search snippets"
                value={query}
              />
            </div>
            <Select
              onValueChange={(value) =>
                setCategoryFilter(value as SnippetCategory | "all")
              }
              value={categoryFilter}
            >
              <SelectTrigger aria-label="Filter by category" className="w-full">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {snippetCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {snippetTabLabels[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="deprecated">
          <RetiredTable />
        </TabsContent>

        <TabsContent value="composite">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <PreviewControls
              cssMode={cssMode}
              setCssMode={setCssMode}
              setWidth={setWidth}
              width={width}
            />
          </div>
          <EmailFrame
            html={renderEmail(buildCompositeHtml(), {
              description:
                "A composite preview built from representative local snippets.",
              title: "Wild Web Wrap-Up Preview",
            })}
            stripped={cssMode === "fallback"}
            title="Composite issue preview"
            width={widthMap[width]}
          />
        </TabsContent>

        {(
          ["all", "editorial", "links", "trust", "cta", "structure"] as const
        ).map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {filteredSnippets.length} snippet
                {filteredSnippets.length === 1 ? "" : "s"} visible
              </p>
              <PreviewControls
                cssMode={cssMode}
                setCssMode={setCssMode}
                setWidth={setWidth}
                width={width}
              />
            </div>

            {filteredSnippets.length === 0 ? (
              <Empty>
                <EmptyTitle>No snippets found</EmptyTitle>
                <EmptyDescription>
                  Adjust search or category filters to inspect the catalog.
                </EmptyDescription>
              </Empty>
            ) : (
              <div
                className={
                  width === "mobile"
                    ? "grid gap-6 xl:grid-cols-2"
                    : "grid gap-6"
                }
              >
                {filteredSnippets.map((snippet) => (
                  <SnippetCard
                    key={snippet.identifier}
                    cssMode={cssMode}
                    onInspect={() => setSelectedSnippet(snippet)}
                    snippet={snippet}
                    width={widthMap[width]}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <InventoryTable />

      <SnippetSheet
        onClose={() => setSelectedSnippet(null)}
        snippet={selectedSnippet}
      />
    </StudioShell>
  );
}

function StudioShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}

function StudioHeader({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-sm font-medium text-secondary-foreground">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-normal">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function PreviewControls({
  cssMode,
  setCssMode,
  setWidth,
  width,
}: {
  cssMode: CssMode;
  setCssMode: (mode: CssMode) => void;
  setWidth: (width: PreviewWidth) => void;
  width: PreviewWidth;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToggleGroup
        aria-label="Preview width"
        onValueChange={(value) => {
          if (value) {
            setWidth(value as PreviewWidth);
          }
        }}
        size="sm"
        type="single"
        variant="outline"
        value={width}
      >
        <ToggleGroupItem value="mobile">Mobile</ToggleGroupItem>
        <ToggleGroupItem value="email">Email</ToggleGroupItem>
        <ToggleGroupItem value="desktop">Desktop</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        aria-label="CSS mode"
        onValueChange={(value) => {
          if (value) {
            setCssMode(value as CssMode);
          }
        }}
        size="sm"
        type="single"
        variant="outline"
        value={cssMode}
      >
        <ToggleGroupItem value="normal">Normal</ToggleGroupItem>
        <ToggleGroupItem value="fallback">Fallback</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

function SnippetCard({
  cssMode,
  onInspect,
  snippet,
  width,
}: {
  cssMode: CssMode;
  onInspect: () => void;
  snippet: Snippet;
  width: number;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{snippet.name}</CardTitle>
            <CardDescription>{snippet.identifier}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{snippet.category}</Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  aria-label={`${snippet.identifier} snippet mode metadata`}
                  className="inline-flex rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  type="button"
                >
                  <Badge variant="outline">
                    {snippet.mode}
                    <Info className="ml-1 inline size-3" />
                  </Badge>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Snippet API mode for raw HTML content, not full-email Naked
                Mode.
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <EmailFrame
          html={renderEmailWithSnippet(snippet)}
          stripped={cssMode === "fallback"}
          title={`${snippet.name} email preview`}
          width={width}
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={onInspect} size="sm" variant="outline">
            Inspect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmailFrame({
  html,
  stripped = false,
  title,
  width,
}: {
  html: string;
  stripped?: boolean;
  title: string;
  width: number;
}) {
  return (
    <div className="overflow-auto rounded-md border bg-[#edf3f5] p-3">
      <iframe
        className="mx-auto block rounded-sm bg-white shadow-sm"
        sandbox=""
        srcDoc={wrapEmailDocument(stripped ? stripEnhancements(html) : html)}
        style={{ height: 720, maxWidth: "100%", width }}
        title={title}
      />
    </div>
  );
}

function InventoryTable() {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Catalog Inventory</CardTitle>
        <CardDescription>
          Active identifiers and categories in local source.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Identifier</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Mode</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {snippets.map((snippet) => (
              <TableRow key={snippet.identifier}>
                <TableCell className="font-mono text-xs">
                  {snippet.identifier}
                </TableCell>
                <TableCell>{snippet.name}</TableCell>
                <TableCell>{snippet.category}</TableCell>
                <TableCell>{snippet.mode}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function RetiredTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Retired Snippets</CardTitle>
        <CardDescription>
          Deletions are only prepared locally. Remote pruning is a separate
          explicit command.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Retired</TableHead>
              <TableHead>Replacement</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {retiredEntries.map((entry) => (
              <TableRow key={entry.identifier}>
                <TableCell className="font-mono text-xs">
                  {entry.identifier}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {entry.replacement}
                </TableCell>
                <TableCell>{entry.reason}</TableCell>
                <TableCell>{entry.pruneStatus}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SnippetSheet({
  onClose,
  snippet,
}: {
  onClose: () => void;
  snippet: Snippet | null;
}) {
  return (
    <Sheet open={Boolean(snippet)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-auto sm:max-w-xl">
        {snippet ? (
          <>
            <SheetHeader>
              <SheetTitle>{snippet.name}</SheetTitle>
              <SheetDescription>{snippet.identifier}</SheetDescription>
            </SheetHeader>
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge variant="secondary">{snippet.category}</Badge>
              <Badge variant="outline">{snippet.mode}</Badge>
            </div>
            <Separator className="my-4" />
            <h3 className="mb-2 text-sm font-semibold">Checklist</h3>
            <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Inline styles only.</li>
              <li>Readable without shadows or gradients.</li>
              <li>Free-plan-safe Buttondown variables only.</li>
              <li>Standalone snippet, no remote data dependency.</li>
            </ul>
            <h3 className="mb-2 text-sm font-semibold">HTML</h3>
            <ScrollArea className="max-h-[520px] rounded-md border bg-muted p-3">
              <pre className="whitespace-pre-wrap break-words text-xs">
                {snippet.html}
              </pre>
            </ScrollArea>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function parseSnippetSource(filePath: string, source: string): Snippet {
  const identifier =
    filePath.split("/").pop()?.replace(/\.md$/, "") ?? filePath;
  const parsed = matter(source);

  if (Object.keys(parsed.data).length === 0) {
    throw new Error(`${identifier}: missing snippet frontmatter`);
  }

  const frontmatter = parsed.data as {
    category?: SnippetCategory;
    mode?: SnippetMode;
    name?: string;
  };

  if (!frontmatter.name) {
    throw new Error(`${identifier}: missing snippet name`);
  }

  if (frontmatter.mode !== "naked") {
    throw new Error(`${identifier}: snippet mode must be naked`);
  }

  if (frontmatter.category && !isSnippetCategory(frontmatter.category)) {
    throw new Error(`${identifier}: unsupported snippet category`);
  }

  return {
    category: frontmatter.category ?? "editorial",
    html: parsed.content.trim(),
    identifier,
    mode: frontmatter.mode,
    name: frontmatter.name,
  };
}

function renderEmailWithSnippet(snippet: Snippet) {
  return renderEmail(snippet.html, {
    description: `${snippet.name} rendered inside the W4W local preview shell.`,
    title: snippet.name,
  });
}

function renderEmail(
  body: string,
  issue: { description: string; title: string },
) {
  return replaceTokens(baseTemplate, {
    "%%EMAIL_BODY%%": body,
    "%%ISSUE_DATE%%": "May 27, 2026",
    "%%ISSUE_DESCRIPTION%%": escapeHtml(issue.description),
    "%%ISSUE_TITLE%%": escapeHtml(issue.title),
    "%%PREHEADER%%": escapeHtml(issue.description),
  });
}

function buildCompositeHtml() {
  return [
    getSnippetHtml("brief-lede"),
    getSnippetHtml("web-gem"),
    getSnippetHtml("feature-link"),
    getSnippetHtml("quick-tabs"),
    getSnippetHtml("source-stack"),
    getSnippetHtml("reader-signal"),
    getSnippetHtml("issue-footer"),
  ].join("\n");
}

function getSnippetHtml(identifier: string) {
  const snippet = snippetsByIdentifier.get(identifier);

  if (!snippet) {
    throw new Error(`Missing snippet fixture: ${identifier}`);
  }

  return snippet.html;
}

function replaceTokens(template: string, replacements: Record<string, string>) {
  return Object.entries(replacements).reduce(
    (output, [token, replacement]) => output.replaceAll(token, replacement),
    template,
  );
}

function wrapEmailDocument(html: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#edf3f5;">${html}</body></html>`;
}

function stripEnhancements(html: string) {
  return html
    .replace(/box-shadow:\s*[^;"]+;?/gi, "")
    .replace(/border-radius:\s*[^;"]+;?/gi, "")
    .replace(
      /background(?:-image)?:\s*(?:linear-gradient|radial-gradient)\([^;"]+\);?/gi,
      "",
    );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
