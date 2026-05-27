import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Info } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";
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

const meta = {
  title: "UI/Studio Primitives",
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Overview: Story = {
  render: () => (
    <TooltipProvider>
      <div className="grid max-w-4xl gap-6 p-6">
        <Alert variant="info">
          <AlertTitle>Buttondown Studio primitives</AlertTitle>
          <AlertDescription>
            Local shadcn-compatible controls used by the snippet studio.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>
              Filters, tabs, toggles, and metadata affordances.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="Search snippets" />
              <Select defaultValue="all">
                <SelectTrigger
                  aria-label="Filter by category"
                  className="w-full"
                >
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="editorial">Editorial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="links">Links</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <p className="text-sm text-muted-foreground">
                  All snippets are visible.
                </p>
              </TabsContent>
              <TabsContent value="links">
                <p className="text-sm text-muted-foreground">
                  Link snippets are visible.
                </p>
              </TabsContent>
            </Tabs>
            <div className="flex flex-wrap items-center gap-2">
              <ToggleGroup
                type="single"
                value="email"
                variant="outline"
                onValueChange={() => undefined}
              >
                <ToggleGroupItem value="mobile">Mobile</ToggleGroupItem>
                <ToggleGroupItem value="email">Email</ToggleGroupItem>
              </ToggleGroup>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    aria-label="Snippet metadata hint"
                    className="inline-flex rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    type="button"
                  >
                    <Badge variant="outline">
                      naked
                      <Info className="ml-1 inline size-3" />
                    </Badge>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Snippet metadata hint</TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>Table, empty, and loading states.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <ScrollArea className="max-h-44 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Identifier</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>web-gem</TableCell>
                    <TableCell>active</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>upgrade</TableCell>
                    <TableCell>retired</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </ScrollArea>
            <Separator />
            <div className="grid gap-3 sm:grid-cols-2">
              <Empty>
                <EmptyTitle>No matches</EmptyTitle>
                <EmptyDescription>Adjust the studio filters.</EmptyDescription>
              </Empty>
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
                <Button size="sm">Primary action</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  ),
};
