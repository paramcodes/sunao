import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src";
const ALLOW = [
  /^SPDX-License-Identifier:/,
  /^\(c\)/i,
  /^License:/i,
  /^eslint-disable/,
  /^biome-ignore/,
  /^@ts-ignore/,
  /^@ts-expect-error/,
  /^@ts-nocheck/,
  /^TODO\b.*#\d+/,
  /^FIXME\b.*#\d+/,
];

function isAllowed(comment) {
  const trimmed = comment
    .trim()
    .replace(/^\/\*+|\*+\/$|^\/\/\/?\s*/g, "")
    .trim();
  if (trimmed.replace(/^\//, "").trim().startsWith("<reference")) return true;
  // JSDoc on exports is allowed; handled separately below
  return ALLOW.some((r) => r.test(trimmed));
}

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|mjs)$/.test(f)) out.push(p);
  }
  return out;
}

let failed = false;
for (const file of walk(ROOT)) {
  const src = readFileSync(file, "utf8");
  // strip strings roughly
  const lines = src.split("\n");
  lines.forEach((line, i) => {
    const m = line.match(/\/\/\s*(.*)$/);
    if (m) {
      const c = m[1].trim();
      if (c && !isAllowed(c)) {
        // allow JSDoc-ish inline? no; flag
        console.error(`${file}:${i + 1}: disallowed comment: ${c}`);
        failed = true;
      }
    }
  });
  // block comments
  const blockRe = /\/\*[\s\S]*?\*\//g;
  let bm = blockRe.exec(src);
  while (bm) {
    const c = bm[0].replace(/\/\*+|\*+\//g, "").trim();
    if (c && !isAllowed(c) && !c.startsWith("*")) {
      // compute line
      const upTo = src.slice(0, bm.index);
      const ln = upTo.split("\n").length;
      console.error(`${file}:${ln}: disallowed block comment`);
      failed = true;
    }
    bm = blockRe.exec(src);
  }
}

if (failed) process.exit(1);
console.log("comment check passed");
