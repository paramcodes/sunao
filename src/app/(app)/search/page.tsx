import type { Metadata } from "next";
import SearchPage from "./search-client";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the sunao catalog by song or artist and start playing instantly.",
  alternates: { canonical: "/search" },
};

export default function Page() {
  return <SearchPage />;
}
