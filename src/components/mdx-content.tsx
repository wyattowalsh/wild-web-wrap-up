import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1
      className="mt-10 scroll-m-20 text-4xl font-semibold tracking-normal first:mt-0"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="mt-10 scroll-m-20 border-t pt-8 text-2xl font-semibold tracking-normal"
      {...props}
    />
  ),
  p: (props) => (
    <p className="mt-5 text-base leading-7 text-foreground/90" {...props} />
  ),
  ul: (props) => (
    <ul
      className="mt-5 list-disc space-y-2 pl-5 text-foreground/90"
      {...props}
    />
  ),
  li: (props) => <li className="leading-7" {...props} />,
  a: (props) => (
    <a
      className="font-medium text-secondary-foreground underline underline-offset-4"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="mt-6 border-l-4 border-primary/50 pl-5 text-muted-foreground"
      {...props}
    />
  ),
};
