import type { Metadata, Viewport } from "next";
import { Figtree, Geist_Mono } from "next/font/google";
import { preconnect, prefetchDNS } from "react-dom";
import { Toaster } from "sonner";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { PlayerProvider } from "@/components/player-provider";
import { Providers } from "@/components/providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "sunao",
  description: "A Spotify-like music player",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f0f0f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  prefetchDNS("https://itunes.apple.com");
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    preconnect(process.env.NEXT_PUBLIC_SUPABASE_URL);
  }

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${figtree.variable} ${geistMono.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-black focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Providers>
          <TooltipProvider>
            <PlayerProvider>
              <KeyboardShortcuts />
              {children}
            </PlayerProvider>
          </TooltipProvider>
          <Toaster
            theme="dark"
            position="bottom-right"
            offset={{ bottom: 120, right: 16 }}
            mobileOffset={{ bottom: 172, right: 16 }}
            toastOptions={{
              classNames: {
                toast: "rounded-lg border border-white/10 bg-[#1f1f1f] text-white shadow-2xl",
                description: "text-white/60",
                actionButton: "bg-red-600 text-white",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
