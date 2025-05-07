import type React from "react";
import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Blockchain Supply Chain",
  description: "Manage inventory and shipments on the blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </Providers>
  );
}
