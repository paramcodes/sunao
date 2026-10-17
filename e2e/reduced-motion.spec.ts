import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test("reduced motion scopes transitions to color/opacity", async ({ page }) => {
  await page.goto("/");
  const prop = await page
    .locator("button")
    .first()
    .evaluate((el) => getComputedStyle(el).transitionProperty);
  expect(prop).not.toContain("transform");
  expect(prop).not.toContain("all");
});
