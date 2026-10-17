import { expect, test } from "@playwright/test";

test("queue panel toggles between the rail and the full queue", async ({ page }) => {
  await page.goto("/");

  const rail = page.locator('[data-slot="queue-panel"]');
  const queue = page.locator("#queue-panel-content");
  const nowPlaying = page.getByRole("heading", { name: "Now playing" });
  const hide = page.getByRole("button", { name: "Hide queue" });

  await expect(hide).toBeVisible();
  await expect(nowPlaying).toBeVisible();

  await hide.click();

  const show = page.getByRole("button", { name: "Show queue" });
  await expect(show).toBeVisible();
  await expect(queue).toHaveAttribute("inert", "");
  await expect(queue).toHaveCSS("opacity", "0");
  const [toggleRight, railRight] = await Promise.all([
    show.evaluate((el) => el.getBoundingClientRect().right),
    rail.evaluate((el) => el.getBoundingClientRect().right),
  ]);
  expect(toggleRight).toBeLessThanOrEqual(railRight);

  await show.click();

  await expect(page.getByRole("button", { name: "Hide queue" })).toBeVisible();
  await expect(queue).not.toHaveAttribute("inert", "");
  await expect(nowPlaying).toBeVisible();
  await expect(queue.locator("button[data-index]").first()).toBeVisible();
});
