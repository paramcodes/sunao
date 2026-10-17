import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { PlayerProvider } from "@/components/player-provider";
import { Providers } from "@/components/providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <TooltipProvider>
            <PlayerProvider>
              <KeyboardShortcuts />
              {children}
            </PlayerProvider>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
