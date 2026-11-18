import { test, expect } from "@playwright/test";

test("archives hide draft templates and link directly to scholarship information", async ({ page }) => {
  for (const route of ["/blog", "/travellogs"]) {
    await page.goto(route);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("main").getByText("Draft template", { exact: false })).toHaveCount(0);
    for (const slug of ["draft-template", "missing-entry", "__empty__"]) {
      expect((await page.request.get(`${route}/${slug}`)).status()).toBe(404);
    }
  }
  await page.goto("/travellogs");
  await page.getByRole("group", { name: "Section tools", exact: true }).getByRole("link", { name: "Gilman Scholarship", exact: true }).click();
  await expect(page).toHaveURL(/\/travellogs\/gilman$/);
  await page.getByRole("link", { name: "Back to Travel Logs", exact: true }).click();
  await expect(page).toHaveURL(/\/travellogs$/);
});

test("Projects sidebar starts with Projects and preserves its secondary group", async ({ page }) => {
  await page.goto("/projects");
  const sidebar = page.getByRole("complementary", { name: "Explorer navigation" });
  await expect(sidebar.getByRole("heading", { name: "Anthony's Desktop" })).toHaveCount(0);
  await expect(sidebar.getByRole("link").first()).toHaveText("Projects");
  await expect(sidebar.getByRole("heading", { name: "More about Anthony" })).toBeVisible();
});

test.describe("published MDX verification", () => {
  test.skip(process.env.WRITING_FIXTURES !== "1", "Run bun run test:writing to build with temporary synthetic fixtures.");
  for (const route of ["/blog", "/travellogs"]) {
    test(`${route} renders published metadata, MDX, navigation, and mobile content`, async ({ page }, testInfo) => {
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(route);
      await page.getByRole("button", { name: "Start", exact: true }).click();
      const startMenu = page.getByRole("navigation", { name: "Start menu" });
      await startMenu.getByRole("searchbox").fill("Publishing verification fixture");
      await expect(startMenu.locator(`[data-search-results] a[href="${route}/publishing-verification-fixture"]`)).toBeVisible();
      await page.keyboard.press("Escape");
      await page.getByRole("link", { name: "Publishing verification fixture", exact: true }).click();
      await expect(page).toHaveURL(`${route}/publishing-verification-fixture`);
      await expect(page).toHaveTitle("Publishing verification fixture | Anthony's Desktop");
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", "Synthetic test content, never a personal story.");
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://anthonychung.me${route}/publishing-verification-fixture`);
      await expect(page.getByRole("heading", { name: "Verification heading" })).toBeVisible();
      await expect(page.getByRole("complementary", { name: "MDX verification" })).toBeVisible();
      await expect(page.getByRole("img", { name: "Synthetic test cover" })).toBeVisible();
      await expect(page.getByRole("img", { name: "Inline test illustration" })).toHaveAttribute("src", "/artwork/desktop-wallpaper.svg");
      if (route === "/travellogs") await expect(page.getByRole("article").filter({ has: page.getByRole("heading", { level: 1, name: "Publishing verification fixture", exact: true }) }).getByText(/Test destination/)).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Breadcrumb", exact: true }).getByRole("link")).toHaveAttribute("href", route);
      await page.screenshot({ path: testInfo.outputPath("article-desktop.png") });
      await page.reload();
      await expect(page.getByRole("heading", { name: "Publishing verification fixture", exact: true })).toBeVisible();
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.locator("article").first()).toHaveCSS("font-size", "16px");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath("article-mobile.png"), fullPage: true });
      await page.getByRole("link", { name: /Back to (Journal|Travel Logs)/ }).click();
      await expect(page).toHaveURL(route);
      await page.goBack();
      await expect(page.getByRole("heading", { name: "Verification heading" })).toBeVisible();
      expect(errors).toEqual([]);
    });
  }
});
