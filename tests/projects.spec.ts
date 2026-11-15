import { test, expect } from "@playwright/test";

test.use({ hasTouch: true });

test("Projects direct load and refresh show one Explorer inside the main window", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/projects");
  await expect(page).toHaveTitle("Projects | Anthony's Desktop");
  await expect(page.locator("#primary-window")).toHaveCount(1);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
  const breadcrumbs = page.getByRole("navigation", { name: "Breadcrumb", exact: true });
  await expect(breadcrumbs.getByText("Projects", { exact: true })).toHaveAttribute("aria-current", "page");
  const sidebar = page.getByRole("complementary", { name: "Explorer navigation" });
  await expect(sidebar.getByRole("link", { name: "Projects", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("0 projects", { exact: true })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link")).toHaveCount(0);
  await page.reload();
  await expect(breadcrumbs).toBeVisible();
  await expect(page.getByRole("heading", { name: /This folder is waiting/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test("Explorer links use real routes and browser history restores Projects", async ({ page }) => {
  await page.goto("/projects");
  const sidebar = page.getByRole("complementary", { name: "Explorer navigation" });
  await sidebar.getByRole("link", { name: "Journal", exact: true }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(page.getByRole("heading", { name: "Journal", exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("navigation", { name: "Breadcrumb", exact: true })).toBeVisible();
  await expect(page.getByRole("main")).toBeFocused();
  await page.goForward();
  await expect(page).toHaveURL(/\/blog$/);
  await page.goBack();
  await page.getByRole("link", { name: "Up to Desktop", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goBack();
  await page.getByRole("navigation", { name: "Breadcrumb", exact: true }).getByRole("link", { name: "Desktop", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("Explorer supports keyboard navigation without a custom interaction model", async ({ page }) => {
  await page.goto("/projects");
  const parent = page.getByRole("link", { name: "Up to Desktop", exact: true });
  await parent.focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("navigation", { name: "Breadcrumb", exact: true }).getByRole("link", { name: "Desktop", exact: true })).toBeFocused();
  const sidebar = page.getByRole("complementary", { name: "Explorer navigation" });
  await sidebar.getByRole("link", { name: "Travel Logs", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/travellogs$/);
  await expect(page.getByRole("heading", { name: "Travel Logs", exact: true })).toBeVisible();
});

test("Explorer reflows at small desktop and mobile widths with touch-friendly links", async ({ page }) => {
  await page.goto("/projects");
  for (const width of [800, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const sidebar = page.getByRole("complementary", { name: "Explorer navigation" });
    for (const link of await sidebar.getByRole("link").all()) {
      if (await link.isVisible()) expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
  }
  await expect(page.locator("#primary-window").getByRole("button", { name: "Close", exact: true })).toBeHidden();
  await page.getByRole("complementary", { name: "Explorer navigation" }).getByRole("link", { name: "About", exact: true }).tap();
  await expect(page).toHaveURL(/\/about$/);
});
