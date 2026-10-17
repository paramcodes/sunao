import type { Metadata } from "next";
import SignupPage from "./signup-client";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a sunao account to build playlists and keep your library.",
  alternates: { canonical: "/signup" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <SignupPage />;
}
