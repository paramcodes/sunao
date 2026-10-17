import type { Metadata } from "next";
import HomeClient from "./home-client";

export const metadata: Metadata = {
  title: { absolute: "sunao, a Spotify-like music player" },
  description: "Stream albums and tracks from sunao, a Spotify-like music player for the web.",
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomeClient />;
}
