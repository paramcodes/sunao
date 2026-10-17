import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default: allow all crawlers (traditional search + AI discovery)
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/auth/"],
      },
      // AI search-discovery crawlers: explicitly allowed
      {
        userAgent: ["OAI-SearchBot", "PerplexityBot", "Claude-SearchBot"],
        allow: "/",
        disallow: ["/auth/"],
      },
      // Model-training crawlers: opt out of training by default (discovery still allowed via the rules above)
      {
        userAgent: ["GPTBot", "ClaudeBot"],
        disallow: "/",
      },
      // Google product control (Gemini training/grounding); does not affect Google Search inclusion/ranking
      {
        userAgent: "Google-Extended",
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
