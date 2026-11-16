import { test, expect } from "@playwright/test";

test("calendar uses local today, handles month boundaries, and dismisses with focus", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-01-01T00:30:00Z") });
  await page.goto("/about");
  await expect(page.locator("time")).toHaveAttribute("datetime", /.+/);
  const clock = page.getByRole("button", { name: "Date and time", exact: true });
  await clock.click();
  const calendar = page.getByRole("dialog", { name: "Date and time calendar" });
  await expect(calendar.getByRole("button", { name: "Close calendar" })).toBeFocused();
  const local = await page.evaluate(() => ({ day: new Date().getDate(), month: new Date().toLocaleDateString([], { month: "long", year: "numeric" }) }));
  await expect(calendar.getByRole("table")).toHaveAccessibleName(local.month);
  await expect(calendar.locator('[aria-current="date"]')).toHaveText(String(local.day));
  await calendar.getByRole("button", { name: "Previous month" }).click();
  await expect(calendar.getByRole("table")).toHaveAccessibleName("December 2025");
  await calendar.getByRole("button", { name: "Next month" }).click();
  await expect(calendar.getByRole("table")).toHaveAccessibleName("January 2026");
  await calendar.getByRole("button", { name: "Next month" }).click();
  await expect(calendar.getByRole("cell").filter({ hasText: /^\d+$/ })).toHaveCount(28);
  await calendar.getByRole("button", { name: /^Today:/ }).click();
  await expect(calendar.getByRole("table")).toHaveAccessibleName(local.month);
  await page.keyboard.press("Escape");
  await expect(calendar).toBeHidden();
  await expect(clock).toBeFocused();
  await clock.click();
  await calendar.getByRole("button", { name: "Close calendar" }).click();
  await expect(clock).toBeFocused();
  await clock.click();
  await page.mouse.click(1200, 100);
  await expect(calendar).toBeHidden();
});

test("calendar is usable with touch and shows the browser's local date", async ({ browser }) => {
  const context = await browser.newContext({ timezoneId: "America/Los_Angeles", hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.clock.install({ time: new Date("2026-01-01T00:30:00Z") });
  await page.goto("/");
  await expect(page.locator("time")).toHaveAttribute("datetime", /.+/);
  await page.getByRole("button", { name: "Date and time", exact: true }).tap();
  const calendar = page.getByRole("dialog");
  await expect(calendar).toBeInViewport();
  await expect(calendar.getByRole("table")).toHaveAccessibleName("December 2025");
  await expect(calendar.locator('[aria-current="date"]')).toHaveText("31");
  await calendar.getByRole("button", { name: "Next month" }).tap();
  await expect(calendar.getByRole("table")).toHaveAccessibleName("January 2026");
  await calendar.getByRole("button", { name: "Close calendar" }).tap();
  await expect(calendar).toBeHidden();
  await context.close();
});

test("Peek is temporary and click still toggles Show Desktop without losing state", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator("time")).toHaveAttribute("datetime", /.+/);
  const window = page.locator("#primary-window");
  const workspace = window.locator("../..");
  const geometry = await window.boundingBox();
  await page.getByRole("main").evaluate(m => { m.scrollTop = 100; });
  const peek = page.getByRole("button", { name: "Show desktop", exact: true });
  await peek.hover();
  await expect(workspace).toHaveCSS("opacity", "0.08");
  await expect(window).toBeVisible();
  await expect(page).toHaveURL("/about");
  await page.mouse.move(1200, 100);
  await expect(workspace).toHaveCSS("opacity", "1");
  expect(await window.boundingBox()).toEqual(geometry);
  await peek.click();
  await expect(window).toBeHidden();
  await peek.click();
  await page.mouse.move(1200, 100);
  await expect(window).toBeVisible();
  expect(await window.boundingBox()).toEqual(geometry);
  await expect.poll(() => page.getByRole("main").evaluate(m => m.scrollTop)).toBe(100);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await peek.hover();
  await expect(workspace).toHaveCSS("opacity", "0.08");
  await page.mouse.move(1200, 100);
  await expect(workspace).toHaveCSS("opacity", "1");
});

test("calendar handles leap February and updates today across local midnight", async ({ page }) => {
  await page.clock.install({ time: new Date("2028-02-29T23:59:59") });
  await page.goto("/");
  await expect(page.locator("time")).toHaveAttribute("datetime", /.+/);
  await page.getByRole("button", { name: "Date and time", exact: true }).click();
  const calendar = page.getByRole("dialog");
  await expect(calendar.getByRole("cell").filter({ hasText: /^\d+$/ })).toHaveCount(29);
  await expect(calendar.locator('[aria-current="date"]')).toHaveText("29");
  await page.clock.fastForward(2000);
  await expect(calendar.getByRole("table")).toHaveAccessibleName("March 2028");
  await expect(calendar.locator('[aria-current="date"]')).toHaveText("1");
});

test("touch-only desktop pointers do not activate Peek", async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();
  await page.goto("/about");
  await expect(page.locator("time")).toHaveAttribute("datetime", /.+/);
  await page.getByRole("button", { name: "Show desktop", exact: true }).hover();
  await expect(page.locator("#primary-window").locator("../..")).toHaveCSS("opacity", "1");
  await context.close();
});
