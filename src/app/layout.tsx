import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Wild Web Wrap-Up",
    template: "%s | Wild Web Wrap-Up",
  },
  description: "A newsletter archive and Buttondown publishing workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TooltipProvider>
          <SiteHeader />
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
