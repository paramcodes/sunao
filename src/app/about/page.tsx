import type { Metadata } from "next";
import AboutClient from "./about-client";

export const metadata: Metadata = {
  title: "About sunao",
  description:
    "What sunao is, how it works, and answers to common questions. A Spotify-like music player for the web built with Next.js 16 and React 19.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About sunao",
    description: "A Spotify-like music player for the web.",
    url: "/about",
    type: "article",
  },
};

export default function Page() {
  return <AboutClient />;
}
