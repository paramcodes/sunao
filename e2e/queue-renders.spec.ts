import { expect, test } from "@playwright/test";

test("queue panel renders items", async ({ page }) => {
  await page.goto("/");
  // Queue panel is visible on desktop viewport
  await expect(page.getByText(/songs$/)).toBeVisible();
});
