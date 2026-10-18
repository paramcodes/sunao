import { expect, type Page, test } from "@playwright/test";

const LIBRARY_KEY = "sunao.library.v1";

async function playSong(page: Page, title: string) {
  await page.locator("main button").filter({ hasText: title }).first().click();
}

test("seeded likes drive the heart", async ({ page }) => {
  await page.goto("/");

  // Songs 5 and 8 are members of the seeded "Liked Songs" playlist.
  await playSong(page, "Billie Jean");
  await expect(page.getByRole("button", { name: "Unlike", exact: true })).toBeVisible();
  await playSong(page, "Dreams");
  await expect(page.getByRole("button", { name: "Unlike", exact: true })).toBeVisible();
});

test("liked state survives a reload", async ({ page }) => {
  await page.goto("/");

  await playSong(page, "Something");
  await page.getByRole("button", { name: "Like", exact: true }).click();
  await expect(page.getByText("Saved to Liked Songs")).toBeVisible();
  await expect(page.getByRole("button", { name: "Unlike", exact: true })).toBeVisible();

  console.log(
    "LIBRARY_DOC_AFTER_LIKE",
    await page.evaluate((key) => localStorage.getItem(key), LIBRARY_KEY),
  );

  await page.reload();
  await playSong(page, "Something");
  await expect(page.getByRole("button", { name: "Unlike", exact: true })).toBeVisible();
  await page.screenshot({ path: "artifacts/persistence/01-liked-after-reload.png" });

  await page.getByRole("button", { name: "Unlike", exact: true }).click();
  await expect(page.getByText("Removed from Liked Songs")).toBeVisible();

  await page.reload();
  await playSong(page, "Something");
  await expect(page.getByRole("button", { name: "Like", exact: true })).toBeVisible();
  await page.screenshot({ path: "artifacts/persistence/02-unliked-after-reload.png" });
});

test("playlist song removal survives a reload", async ({ page }) => {
  await page.goto("/playlist/p2");
  await expect(page.getByRole("heading", { name: "Late Night Drives" })).toBeVisible();
  await expect(page.locator("main button").filter({ hasText: "Something" })).toHaveCount(1);

  await page.getByRole("button", { name: "Remove" }).first().click();
  await expect(page.locator("main button").filter({ hasText: "Something" })).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("heading", { name: "Late Night Drives" })).toBeVisible();
  await expect(page.locator("main button").filter({ hasText: "Something" })).toHaveCount(0);
  await page.screenshot({ path: "artifacts/persistence/03-playlist-edit-after-reload.png" });
});

test("created playlist survives a reload", async ({ page }) => {
  await page.goto("/library");
  await page.getByRole("button", { name: "+ New playlist" }).click();
  await page.getByLabel("Playlist name").fill("Persist Check");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByText('Created "Persist Check"')).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: /Persist Check/ })).toBeVisible();
});
