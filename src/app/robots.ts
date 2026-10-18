import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/auth/"],
      },

      {
        userAgent: ["OAI-SearchBot", "PerplexityBot", "Claude-SearchBot"],
        allow: "/",
        disallow: ["/auth/"],
      },

      {
        userAgent: ["GPTBot", "ClaudeBot"],
        disallow: "/",
      },

      {
        userAgent: "Google-Extended",
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
