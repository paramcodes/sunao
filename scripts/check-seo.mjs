#!/usr/bin/env node
import { argv, exit } from "node:process";

const base = (argv[2] ?? "http://localhost:3000").replace(/\/$/, "");

const ROUTES = [
  { path: "/", label: "home", indexable: true },
  { path: "/search", label: "search", indexable: true },
  { path: "/library", label: "library", indexable: false },
  { path: "/login", label: "login", indexable: false },
  { path: "/signup", label: "signup", indexable: false },
  { path: "/playlist/p1", label: "playlist", indexable: true },
];

const INDEXABLE = ROUTES.filter((r) => r.indexable).map((r) => r.path);
const NOINDEX = ROUTES.filter((r) => !r.indexable).map((r) => r.path);

const results = [];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function check(name, ok, detail) {
  results.push({ name, ok, detail });
}

async function get(path) {
  const url = base + path;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      const body = await res.text();
      return { body, status: res.status, type: res.headers.get("content-type") ?? "" };
    } catch (error) {
      if (attempt === 2) return { body: "", status: 0, type: "", error: String(error) };
      await wait(250 * (attempt + 1));
    }
  }
  return { body: "", status: 0, type: "", error: "unreachable" };
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i"));
  return match ? match[1] : null;
}

function tags(html, element) {
  return [...html.matchAll(new RegExp(`<${element}\\s[^>]*>`, "gi"))].map((m) => m[0]);
}

function metaContent(html, key) {
  const hit = tags(html, "meta").find(
    (tag) => attribute(tag, "property") === key || attribute(tag, "name") === key,
  );
  return hit ? attribute(hit, "content") : null;
}

function linkHref(html, rel) {
  const hit = tags(html, "link").find((tag) => attribute(tag, "rel") === rel);
  return hit ? attribute(hit, "href") : null;
}

function pageTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : null;
}

function short(value) {
  if (!value) return "none";
  return value.length > 60 ? `${value.slice(0, 57)}...` : value;
}

const pages = [];
for (const route of ROUTES) {
  const page = await get(route.path);
  pages.push({ ...route, ...page });
  await wait(120);
}

for (const page of pages) {
  check(
    `GET ${page.path} returns 200`,
    page.status === 200,
    page.error ? `error ${page.error}` : `status ${page.status}`,
  );
}

const titles = pages.map((p) => pageTitle(p.body));
const missingTitles = pages.filter((_, i) => !titles[i]).map((p) => p.path);
check(
  "every route has a <title>",
  missingTitles.length === 0,
  `missing on ${missingTitles.join(", ") || "none"}`,
);

const duplicateTitles = titles.filter((t, i) => t && titles.indexOf(t) !== i);
check(
  "titles are unique per route",
  duplicateTitles.length === 0,
  `duplicates: ${[...new Set(duplicateTitles)].join(" | ") || "none"}`,
);

const descriptions = pages.map((p) => metaContent(p.body, "description"));
const missingDescriptions = pages.filter((_, i) => !descriptions[i]).map((p) => p.path);
check(
  "every route has a meta description",
  missingDescriptions.length === 0,
  `missing on ${missingDescriptions.join(", ") || "none"}`,
);

const duplicateDescriptions = descriptions.filter((d, i) => d && descriptions.indexOf(d) !== i);
check(
  "descriptions are unique per route",
  duplicateDescriptions.length === 0,
  `duplicates: ${[...new Set(duplicateDescriptions)].map(short).join(" | ") || "none"}`,
);

const shortDescriptions = pages
  .filter((_, i) => descriptions[i] && descriptions[i].length < 50)
  .map((p) => p.path);
check(
  "descriptions are at least 50 chars",
  shortDescriptions.length === 0,
  `too short on ${shortDescriptions.join(", ") || "none"}`,
);

const canonicals = pages.map((p) => linkHref(p.body, "canonical"));
const missingCanonicals = pages.filter((_, i) => !canonicals[i]).map((p) => p.path);
check(
  "every route has a canonical link",
  missingCanonicals.length === 0,
  `missing on ${missingCanonicals.join(", ") || "none"}`,
);

const badCanonicals = pages
  .map((page, i) => ({ path: page.path, href: canonicals[i] }))
  .filter((canonical) => canonical.href && !canonical.href.startsWith(base))
  .map((canonical) => `${canonical.path} -> ${canonical.href}`);
check(
  "canonicals are absolute and match the served base",
  badCanonicals.length === 0,
  badCanonicals.length ? badCanonicals.join(", ") : `all ${canonicals.length} start with ${base}`,
);

for (const key of ["og:title", "og:description", "og:image"]) {
  const missing = pages.filter((p) => !metaContent(p.body, key)).map((p) => p.path);
  check(
    `every route has ${key}`,
    missing.length === 0,
    `missing on ${missing.join(", ") || "none"}`,
  );
}

const missingTwitter = pages.filter((p) => !metaContent(p.body, "twitter:card")).map((p) => p.path);
check(
  "every route has twitter:card",
  missingTwitter.length === 0,
  `missing on ${missingTwitter.join(", ") || "none"}`,
);

const socialKeys = ["og:type", "og:site_name", "og:url", "og:locale"];
const strippedSocial = pages
  .filter((p) => socialKeys.some((key) => !metaContent(p.body, key)))
  .map(
    (p) => `${p.path} missing ${socialKeys.filter((key) => !metaContent(p.body, key)).join("+")}`,
  );
check(
  "openGraph keeps type, site_name, url, and locale",
  strippedSocial.length === 0,
  strippedSocial.length ? strippedSocial.join("; ") : "present on all routes",
);

const firstImage = pages.map((p) => metaContent(p.body, "og:image")).find(Boolean);
if (firstImage) {
  const parsed = new URL(firstImage, base);
  const image = await get(parsed.pathname + parsed.search);
  check(
    "og:image resolves with 200",
    image.status === 200,
    `${parsed.pathname} -> ${image.status}`,
  );
  check(
    "og:image is served as an image",
    image.type.startsWith("image/"),
    `content-type ${image.type || "none"}`,
  );
} else {
  check("og:image resolves with 200", false, "no og:image found to resolve");
  check("og:image is served as an image", false, "no og:image found to resolve");
}

const robots = await get("/robots.txt");
check(
  "robots.txt returns 200",
  robots.status === 200,
  robots.error ? `error ${robots.error}` : `status ${robots.status}`,
);
check(
  "robots.txt allows crawling",
  /user-agent:\s*\*/i.test(robots.body) && /allow:\s*\//i.test(robots.body),
  /user-agent:\s*\*/i.test(robots.body)
    ? "wildcard user-agent with allow /"
    : "no wildcard allow rule",
);
const sitemapLine = robots.body.split("\n").find((line) => /^\s*sitemap:/i.test(line));
check(
  "robots.txt points at a sitemap",
  Boolean(sitemapLine),
  sitemapLine ? sitemapLine.trim() : "no Sitemap line",
);

const sitemap = await get("/sitemap.xml");
check(
  "sitemap.xml returns 200",
  sitemap.status === 200,
  sitemap.error ? `error ${sitemap.error}` : `status ${sitemap.status}`,
);
check(
  "sitemap.xml is xml",
  /<\?xml|<urlset/i.test(sitemap.body),
  /<urlset/i.test(sitemap.body) ? "urlset present" : "no urlset element",
);

const absolute = (path) => (path === "/" ? base : base + path);
const missingFromSitemap = INDEXABLE.filter((path) => !sitemap.body.includes(absolute(path)));
check(
  "sitemap lists every indexable route",
  missingFromSitemap.length === 0,
  missingFromSitemap.length
    ? `missing ${missingFromSitemap.join(", ")}`
    : `all ${INDEXABLE.length} indexable routes listed`,
);

const leakedInto = NOINDEX.filter((path) => sitemap.body.includes(absolute(path)));
check(
  "sitemap excludes noindex routes",
  leakedInto.length === 0,
  leakedInto.length
    ? `lists noindex ${leakedInto.join(", ")}`
    : `none of ${NOINDEX.length} noindex routes listed`,
);

const notNoindexed = pages
  .filter((p) => !p.indexable && !/noindex/i.test(metaContent(p.body, "robots") ?? ""))
  .map((p) => p.path);
check(
  "noindex routes emit a noindex robots meta",
  notNoindexed.length === 0,
  notNoindexed.length
    ? `not marked noindex ${notNoindexed.join(", ")}`
    : `all ${NOINDEX.length} marked noindex`,
);

const disallowRules = robots.body
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => /^disallow:/i.test(line))
  .map((line) => line.replace(/^disallow:\s*/i, "").trim())
  .filter(Boolean);

const conflicted = NOINDEX.filter((path) => disallowRules.some((rule) => path.startsWith(rule)));
check(
  "robots.txt does not disallow noindex routes",
  conflicted.length === 0,
  conflicted.length
    ? `disallowed so noindex is unreadable: ${conflicted.join(", ")}`
    : `no conflict across ${disallowRules.length} disallow rule(s)`,
);

const playlist = pages.find((p) => p.label === "playlist");
const blocks = [
  ...(playlist?.body.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi) ??
    []),
];
check("playlist page has JSON-LD", blocks.length > 0, `${blocks.length} block(s)`);

let parsedType = null;
let parseError = "no JSON-LD block";
for (const block of blocks) {
  try {
    const value = JSON.parse(block[1]);
    if (value?.["@context"] && value?.["@type"]) {
      parsedType = value["@type"];
      parseError = null;
      break;
    }
    parseError = "block lacks @context or @type";
  } catch (error) {
    parseError = `invalid JSON: ${error}`;
  }
}
check(
  "JSON-LD parses with @context and @type",
  Boolean(parsedType),
  parsedType ? `@type ${parsedType}` : parseError,
);

const width = Math.max(...results.map((r) => r.name.length));
let failures = 0;
for (const result of results) {
  if (!result.ok) failures += 1;
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name.padEnd(width)}  ${result.detail}`);
}

console.log(`\n${results.length - failures}/${results.length} checks passed against ${base}`);
exit(failures === 0 ? 0 : 1);
