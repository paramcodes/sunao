import type { Metadata } from "next";
import LibraryPage from "./library-client";

export const metadata: Metadata = {
  title: "Your Library",
  description: "Your sunao playlists in one place. Create them, open them, play them.",
  alternates: { canonical: "/library" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <LibraryPage />;
}
