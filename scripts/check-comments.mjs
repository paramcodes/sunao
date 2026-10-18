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

function scanComments(src) {
  const found = [];
  let i = 0;
  let line = 1;
  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];
    if (ch === "\n") {
      line += 1;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      i += 1;
      while (i < src.length) {
        if (src[i] === "\\") {
          i += 2;
          continue;
        }
        if (src[i] === "\n") line += 1;
        if (src[i] === quote) {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }
    if (ch === "/" && next === "/") {
      let end = src.indexOf("\n", i);
      if (end === -1) end = src.length;
      found.push({ line, raw: src.slice(i, end), inline: true });
      i = end;
      continue;
    }
    if (ch === "/" && next === "*") {
      const close = src.indexOf("*/", i + 2);
      const stop = close === -1 ? src.length : close + 2;
      found.push({ line, raw: src.slice(i, stop), inline: false });
      line += src.slice(i, stop).split("\n").length - 1;
      i = stop;
      continue;
    }
    i += 1;
  }
  return found;
}

let failed = false;
for (const file of walk(ROOT)) {
  const src = readFileSync(file, "utf8");
  for (const comment of scanComments(src)) {
    if (comment.inline) {
      const c = comment.raw.replace(/^\/\/\s*/, "").trim();
      if (c && !isAllowed(c)) {
        console.error(`${file}:${comment.line}: disallowed comment: ${c}`);
        failed = true;
      }
      continue;
    }
    const c = comment.raw.replace(/\/\*+|\*+\//g, "").trim();
    if (c && !isAllowed(c) && !c.startsWith("*")) {
      console.error(`${file}:${comment.line}: disallowed block comment`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log("comment check passed");
