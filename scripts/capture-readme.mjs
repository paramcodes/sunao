import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { mkdir, rename, rm } from "node:fs/promises";
import { chromium } from "@playwright/test";

const BASE = process.env.CAPTURE_BASE ?? "http://localhost:3000";
const OUT = process.env.CAPTURE_OUT ?? "artifacts/readme";
const DESKTOP = { width: 1280, height: 720 };
const MOBILE = { width: 390, height: 844 };
const SHOTS = process.env.CAPTURE_SHOTS !== "0";

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

const goto = (page, path) => page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });

async function waitForPlayback(page) {
  await page.getByRole("button", { name: "Pause" }).first().waitFor();
  await page.waitForFunction(() => !document.querySelector(".animate-spin"));
}

async function shot(name, { viewport = DESKTOP, scale = 1, path = "/", before } = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: scale });
  const page = await context.newPage();
  await goto(page, path);
  await page.waitForTimeout(350);
  if (before) await before(page);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  await context.close();
}

async function recordDemo() {
  const context = await browser.newContext({
    viewport: DESKTOP,
    recordVideo: { dir: `${OUT}/.video`, size: DESKTOP },
  });
  const page = await context.newPage();
  const pause = (ms) => page.waitForTimeout(ms);

  await goto(page, "/");
  await pause(1000);

  // Play an album from Home
  await page.getByRole("button", { name: /Abbey Road/ }).click();
  await waitForPlayback(page);
  await pause(1000);

  // Toggle shuffle and repeat player controls
  await page.getByRole("button", { name: /Enable shuffle/i }).click();
  await pause(600);
  await page.getByRole("button", { name: /Repeat: off/i }).click();
  await pause(600);

  // Open expanded Now Playing view
  await page.getByRole("button", { name: /Open now playing/i }).click();
  await pause(1200);

  // Switch to synchronized Lyrics
  await page.getByRole("button", { name: "Lyrics", exact: true }).click();
  await pause(1400);

  // Switch back to Cover view and close Now Playing
  await page.getByRole("button", { name: "Cover" }).click();
  await pause(800);
  await page.getByRole("button", { name: "Close now playing" }).click();
  await pause(800);

  // Search with tabs and live catalog query
  await page.getByRole("link", { name: "Search" }).first().click();
  await pause(600);
  await page.getByPlaceholder("What do you want to listen to?").pressSequentially("fleetwood", {
    delay: 60,
  });
  await pause(1200);

  // Open an Artist detail route
  await goto(page, "/artist/the-beatles");
  await pause(1200);

  // Open Library and play a playlist
  await page.getByRole("link", { name: "Your Library" }).first().click();
  await pause(700);
  await page.getByRole("button", { name: /Late Night Drives/ }).click();
  await pause(900);

  await page.getByRole("button", { name: "Play all" }).click();
  await waitForPlayback(page);
  await pause(900);

  // Toggle queue rail
  await page.getByRole("button", { name: "Hide queue" }).click();
  await pause(800);
  await page.getByRole("button", { name: "Show queue" }).click();
  await pause(700);

  // Like track with toast
  await page.getByRole("button", { name: /^(Like|Unlike)$/ }).click();
  await pause(1500);

  await context.close();

  const video = readdirSync(`${OUT}/.video`).find((f) => f.endsWith(".webm"));
  if (!video) return;
  await rename(`${OUT}/.video/${video}`, `${OUT}/demo.webm`);
  await rm(`${OUT}/.video`, { recursive: true, force: true });

  const ffmpeg = (args) => execFileSync("ffmpeg", args, { stdio: "inherit" });
  ffmpeg([
    "-y",
    "-loglevel",
    "error",
    "-i",
    `${OUT}/demo.webm`,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    "23",
    "-movflags",
    "+faststart",
    "-an",
    `${OUT}/demo.mp4`,
  ]);

  const palette = `${OUT}/.palette.png`;
  ffmpeg([
    "-y",
    "-loglevel",
    "error",
    "-i",
    `${OUT}/demo.webm`,
    "-vf",
    "fps=12,scale=960:-1:flags=lanczos,palettegen=stats_mode=diff",
    palette,
  ]);
  ffmpeg([
    "-y",
    "-loglevel",
    "error",
    "-i",
    `${OUT}/demo.webm`,
    "-i",
    palette,
    "-lavfi",
    "fps=12,scale=960:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle",
    `${OUT}/demo.gif`,
  ]);
  await rm(palette, { force: true });
}

if (SHOTS) {
  await shot("home");
  await shot("search", {
    path: "/search",
    before: (page) => page.getByPlaceholder("What do you want to listen to?").fill("fleetwood"),
  });
  await shot("library", { path: "/library" });
  await shot("playlist", { path: "/playlist/p2" });
  await shot("artist", { path: "/artist/the-beatles" });
  await shot("album", { path: "/album/a1" });
  await shot("login", { path: "/login" });
  await shot("signup", { path: "/signup" });
  await shot("playing", {
    before: async (page) => {
      await page
        .getByRole("button", { name: /Come Together/ })
        .first()
        .click();
      await waitForPlayback(page);
      await page.waitForTimeout(600);
    },
  });
  await shot("now-playing", {
    before: async (page) => {
      await page
        .getByRole("button", { name: /Come Together/ })
        .first()
        .click();
      await waitForPlayback(page);
      await page.getByRole("button", { name: /Open now playing/i }).click();
      await page.waitForTimeout(600);
    },
  });
  await shot("lyrics", {
    before: async (page) => {
      await page
        .getByRole("button", { name: /Come Together/ })
        .first()
        .click();
      await waitForPlayback(page);
      await page.getByRole("button", { name: /Open now playing/i }).click();
      await page.getByRole("button", { name: "Lyrics", exact: true }).click();
      await page.waitForTimeout(600);
    },
  });
  await shot("queue-collapsed", {
    before: async (page) => {
      await page.getByRole("button", { name: "Hide queue" }).click();
      await page.waitForTimeout(600);
    },
  });
  await shot("mobile-home", { viewport: MOBILE, scale: 2 });
  await shot("mobile-queue", {
    viewport: MOBILE,
    scale: 2,
    before: async (page) => {
      await page.getByRole("button", { name: "Queue" }).click();
      await page.waitForTimeout(600);
    },
  });
  await shot("mobile-now-playing", {
    viewport: MOBILE,
    scale: 2,
    before: async (page) => {
      await page
        .getByRole("button", { name: /Come Together/ })
        .first()
        .click();
      await waitForPlayback(page);
      // Tap track info on mobile to open mobile sheet player
      await page.locator('[data-slot="player-bar"]').locator("img").first().click();
      await page.waitForTimeout(600);
    },
  });
}

await recordDemo();
await browser.close();
console.log(`captured into ${OUT}`);
