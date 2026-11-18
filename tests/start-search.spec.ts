import { test, expect } from "@playwright/test";

for (const width of [1366, 390]) {
  test(`Start search navigates real routes and resets on reopening at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/about");
    await expect(page.locator("time")).toHaveAttribute("datetime", /.+/);
    const start = page.getByRole("button", { name: "Start", exact: true });
    await start.click();
    const menu = page.getByRole("navigation", { name: "Start menu" });
    const input = menu.getByRole("searchbox", { name: "Search pages and articles" });
    await input.fill("gilman");
    await expect(menu.locator("[data-search-results]").getByRole("link")).toHaveCount(1);
    await page.keyboard.press("ArrowDown");
    await expect(menu.locator("[data-search-results]").getByRole("link")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/travellogs/gilman");
    await expect(menu).toBeHidden();
    await start.click();
    await expect(input).toHaveValue("");
    await input.fill("no-such-result-xyz");
    await expect(menu.getByRole("status")).toHaveText("No matching pages or articles");
    await input.fill("Draft template");
    await expect(menu.locator("[data-search-results]").getByRole("link")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(start).toBeFocused();
    await start.click();
    await page.keyboard.type("projects");
    await expect(input).toHaveValue("projects");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/projects");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
