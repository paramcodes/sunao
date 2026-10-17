import { test } from "@playwright/test";

test("capture phase4", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "artifacts/verify-phase4/home.png", fullPage: true });
  await page.goto("/login");
  await page.waitForTimeout(500);
  await page.screenshot({ path: "artifacts/verify-phase4/login.png", fullPage: true });
});
