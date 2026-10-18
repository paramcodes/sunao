import { expect, type Page, test } from "@playwright/test";

test.use({
  baseURL: "http://localhost:3000",
  viewport: { width: 1280, height: 800 },
  video: { mode: "on", size: { width: 1280, height: 800 } },
});

declare global {
  interface Window {
    __iconLog?: Array<{ t: number; icon: string; label: string | null }>;
    __longTasks?: number[];
  }
}

async function recordLongTasks(page: Page) {
  await page.evaluate(() => {
    window.__longTasks = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__longTasks?.push(Math.round(entry.duration));
      }
    }).observe({ entryTypes: ["longtask"] });
  });
}

/** Watch the player-bar play/pause button and log every icon/label change. */
async function installIconRecorder(page: Page) {
  await page.evaluate(() => {
    const bar = document.querySelector('[data-slot="player-bar"]');
    if (!bar) return;
    window.__iconLog = [];
    const read = () => {
      const button = bar.querySelector(
        'button[aria-label="Play"], button[aria-label="Pause"]',
      ) as HTMLElement | null;
      const svg = button?.querySelector("svg") ?? null;
      const icon = svg
        ? ([...svg.classList].find((c) => c.startsWith("lucide-")) ?? "unknown")
        : "none";
      window.__iconLog?.push({
        t: Math.round(performance.now()),
        icon,
        label: button?.getAttribute("aria-label") ?? null,
      });
    };
    read();
    new MutationObserver(read).observe(bar, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class", "aria-label"],
    });
  });
}

function dedupe(log: Array<{ t: number; icon: string; label: string | null }>) {
  const out: Array<{ t: number; icon: string; label: string | null }> = [];
  for (const entry of log) {
    const last = out.at(-1);
    if (!last || last.icon !== entry.icon || last.label !== entry.label) out.push(entry);
  }
  return out;
}

test("desktop journey with recording", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Good (morning|afternoon|evening)/ }),
  ).toBeVisible();
  await page.screenshot({ path: "artifacts/full-journey/01-home.png" });

  // Album card plays the whole album.
  await page.getByRole("button", { name: /Abbey Road/ }).click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  await page.screenshot({ path: "artifacts/full-journey/02-playing-album.png" });

  // Song row switches tracks.
  await page.getByRole("button", { name: /Billie Jean/ }).click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();

  // Transport controls.
  await page.getByRole("button", { name: "Next track" }).click();
  await page.getByRole("button", { name: "Previous track" }).click();

  // Speed control.
  const speedTrigger = page.getByRole("button", { name: "Playback speed" });
  await speedTrigger.click();
  await page.getByRole("menuitem", { name: "1.5×", exact: true }).click();
  await expect(speedTrigger).toHaveText("1.5×");
  await speedTrigger.click();
  await page.getByRole("menuitem", { name: "1×", exact: true }).click();
  await expect(speedTrigger).toHaveText("1×");

  // Like toggles and fires a toast. Some seeded "Liked Songs" members are already
  // liked, so this row may start liked or unliked.
  const heart = page.locator(
    '[data-slot="player-bar"] button[aria-label="Like"], [data-slot="player-bar"] button[aria-label="Unlike"]',
  );
  const wasLiked = (await heart.getAttribute("aria-label")) === "Unlike";
  await heart.click();
  await expect(
    page.getByText(wasLiked ? "Removed from Liked Songs" : "Saved to Liked Songs"),
  ).toBeVisible();
  await page.screenshot({ path: "artifacts/full-journey/03-like-toast.png" });

  // Search.
  await page.getByRole("link", { name: "Search" }).click();
  await page.getByPlaceholder("What do you want to listen to?").fill("beatles");
  await expect(page.getByRole("heading", { name: "Search" })).toBeVisible();
  const searchRows = page.locator("main button").filter({ hasText: "The Beatles" });
  expect(await searchRows.count()).toBeGreaterThan(0);
  await page.screenshot({ path: "artifacts/full-journey/04-search.png" });

  // Search with no matches shows the empty state.
  await page.getByPlaceholder("What do you want to listen to?").fill("zzzznope");
  await expect(page.getByText("No results")).toBeVisible();

  // Library + create playlist.
  await page.getByRole("link", { name: "Your Library" }).click();
  await expect(page.getByRole("heading", { name: "Your Library" })).toBeVisible();
  await page.getByRole("button", { name: "+ New playlist" }).click();
  await page.getByLabel("Playlist name").fill("E2E Mix");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByText('Created "E2E Mix"')).toBeVisible();
  await page.screenshot({ path: "artifacts/full-journey/05-library.png" });

  // Open a playlist and interact.
  await page.getByRole("button", { name: /Liked Songs/ }).click();
  await expect(page.getByRole("heading", { name: "Liked Songs" })).toBeVisible();
  await page.getByRole("button", { name: "Play all" }).click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  await page.screenshot({ path: "artifacts/full-journey/06-playlist.png" });

  // Queue panel toggle.
  await page.getByRole("button", { name: "Hide queue" }).click();
  await expect(page.getByRole("button", { name: "Show queue" })).toBeVisible();
  await page.getByRole("button", { name: "Show queue" }).click();
  await expect(page.getByRole("heading", { name: "Now playing" })).toBeVisible();

  // Auth pages render.
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "Sign up" })).toBeVisible();
  await page.screenshot({ path: "artifacts/full-journey/07-signup.png" });
});

test("play/pause icon timeline (flicker probe)", async ({ page }) => {
  page.on("console", (message) => console.log("CONSOLE", message.type(), message.text()));
  page.on("requestfailed", (request) =>
    console.log("REQFAIL", request.url().slice(0, 90), request.failure()?.errorText),
  );
  page.on("response", (response) => {
    const url = response.url();
    if (url.includes("itunes") || url.includes("/audio/") || url.endsWith(".mp3")) {
      console.log("RESP", response.status(), url.slice(0, 90));
    }
  });
  await page.goto("/");
  await recordLongTasks(page);
  await installIconRecorder(page);

  // 1. Start playback by picking a track (the bar is idle until then).
  await page.locator("main button").filter({ hasText: "Come Together" }).first().click();
  await page.waitForTimeout(1500);

  // 2. Pause, then resume.
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.waitForTimeout(1500);

  // 3. Switch tracks via a different song row.
  await page.locator("main button").filter({ hasText: "Something" }).first().click();
  await page.waitForTimeout(4000);

  const log = dedupe((await page.evaluate(() => window.__iconLog)) ?? []);
  const longTasks = (await page.evaluate(() => window.__longTasks)) ?? [];
  const firstIcon = log[0]?.t ?? 0;
  const timeline = log.map((entry) => ({ ...entry, dt: entry.t - firstIcon }));
  console.log("ICON TIMELINE", JSON.stringify(timeline, null, 2));
  console.log("LONG TASKS", JSON.stringify(longTasks));

  await page.screenshot({ path: "artifacts/full-journey/08-flicker-end.png" });

  expect(log.at(-1)?.label).toBe("Pause");
});

test("mobile journey", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Good (morning|afternoon|evening)/ }),
  ).toBeVisible();

  const mobileNav = page.locator('[data-slot="mobile-nav"]');
  await expect(mobileNav).toBeVisible();

  await mobileNav.getByRole("link", { name: "Search" }).click();
  await expect(page.getByRole("heading", { name: "Search" })).toBeVisible();
  await mobileNav.getByRole("link", { name: "Library" }).click();
  await expect(page.getByRole("heading", { name: "Your Library" })).toBeVisible();

  await mobileNav.getByRole("button", { name: "Queue" }).click();
  await expect(page.locator('[data-slot="sheet-content"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "Now playing" })).toBeVisible();
  await page.screenshot({ path: "artifacts/full-journey/09-mobile-queue.png" });
});

test("liked-songs wiring and playlist persistence", async ({ page }) => {
  await page.goto("/");

  // Play a song that is not in the default liked set, then like it.
  await page.locator("main button").filter({ hasText: "Something" }).first().click();
  await page.getByRole("button", { name: "Like", exact: true }).click();
  await expect(page.getByText("Saved to Liked Songs")).toBeVisible();

  // Open the system "Liked Songs" playlist from the sidebar.
  await page.getByRole("link", { name: "Liked Songs" }).click();
  await expect(page.getByRole("heading", { name: "Liked Songs" })).toBeVisible();

  // Still the P9 gap: the playlist is not yet derived from likes.
  const likedContainsNewlyLiked =
    (await page.locator("main button").filter({ hasText: "Something" }).count()) > 0;
  console.log("LIKED_SONGS_CONTAINS_NEWLY_LIKED", likedContainsNewlyLiked);

  // Removing a row persists across a reload.
  const removeButtons = page.getByRole("button", { name: "Remove" });
  const before = await removeButtons.count();
  await removeButtons.first().click();
  await expect(removeButtons).toHaveCount(before - 1);

  await page.reload();
  await expect(page.getByRole("heading", { name: "Liked Songs" })).toBeVisible();
  await expect(removeButtons).toHaveCount(before - 1);
});

test("created playlist persistence", async ({ page }) => {
  await page.goto("/library");
  await page.getByRole("button", { name: "+ New playlist" }).click();
  await page.getByLabel("Playlist name").fill("Persist Check");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByText('Created "Persist Check"')).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: /Persist Check/ })).toBeVisible();
});

test("perf: navigation and interaction budget", async ({ page }) => {
  await recordLongTasks(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Good (morning|afternoon|evening)/ }),
  ).toBeVisible();

  const nav = await page.evaluate(() => {
    const entry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    return {
      ttfb: Math.round(entry.responseStart),
      domContentLoaded: Math.round(entry.domContentLoadedEventEnd),
      load: Math.round(entry.loadEventEnd),
    };
  });

  const started = Date.now();
  await page.locator("main button").filter({ hasText: "Come Together" }).first().click();
  await page.getByRole("button", { name: "Pause", exact: true }).waitFor();
  const clickToPauseMs = Date.now() - started;

  await page.waitForTimeout(1200);

  const longTasks = (await page.evaluate(() => window.__longTasks)) ?? [];
  console.log("NAV", JSON.stringify(nav));
  console.log("CLICK_TO_PAUSE_MS", clickToPauseMs);
  console.log("LONG_TASKS", JSON.stringify(longTasks));

  expect(nav.domContentLoaded).toBeLessThan(4000);
});

test("idle player bar before any playback", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Nothing playing").first()).toBeVisible();
  const playButton = page.getByRole("button", { name: "Play", exact: true });
  await expect(playButton).toBeDisabled();

  // Space while idle must not fake a playing state.
  await page.keyboard.press("Space");
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();

  // Picking a track wakes the bar up.
  await page.locator("main button").filter({ hasText: "Come Together" }).first().click();
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeEnabled();
});

test("mobile seek scrubs playback", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator("main button").filter({ hasText: "Come Together" }).first().click();
  await page.getByRole("button", { name: "Pause", exact: true }).waitFor();
  await page.waitForTimeout(3000);

  const control = page.locator('[data-slot="mobile-seek"] [data-slot="slider-control"]');
  const rangeInput = page.locator('[data-slot="mobile-seek"] input[type="range"]');
  await expect(control).toBeVisible();

  const before = Number(await rangeInput.inputValue());
  const box = await control.boundingBox();
  if (!box) throw new Error("mobile seek has no box");

  await page.mouse.move(box.x + 4, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(300);

  const after = Number(await rangeInput.inputValue());
  console.log("MOBILE_SEEK", JSON.stringify({ before, after }));
  expect(after).toBeGreaterThan(before);
});
