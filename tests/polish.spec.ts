import { test, expect } from "@playwright/test";

const routes = ["/", "/projects", "/about", "/experience", "/blog", "/travellogs", "/travellogs/gilman", "/resume", "/contact"];

test("taskbar toggles, previews dismiss, and Show Desktop preserves reading state", async ({ page }, testInfo) => {
  await page.goto("/about");
  await expect(page.locator("time")).toHaveAttribute("datetime", /.+/);
  const window = page.locator("#primary-window");
  const task = page.locator("#primary-task");
  const main = page.getByRole("main");
  await main.evaluate(element => { element.scrollTop = 150; });
  const scroll = await main.evaluate(element => element.scrollTop);
  const geometry = await window.boundingBox();
  await task.hover();
  await expect(page.getByText("Open — click to switch")).toBeVisible();
  await page.screenshot({ animations: "disabled", path: testInfo.outputPath("taskbar-preview.png") });
  await page.keyboard.press("Escape");
  await expect(page.getByText("Open — click to switch")).toBeHidden();
  await task.focus();
  await page.keyboard.press("Enter");
  await expect(window).toBeHidden();
  await expect(task).toHaveAccessibleName("Restore About");
  await page.keyboard.press("Enter");
  await expect(main).toBeFocused();
  const desktop = page.getByRole("button", { name: "Show desktop", exact: true });
  await desktop.click();
  await expect(window).toBeHidden();
  await expect(page).toHaveURL("/about");
  await expect(desktop).toBeFocused();
  await page.screenshot({ animations: "disabled", path: testInfo.outputPath("desktop-at-rest.png") });
  await desktop.click();
  await expect(main).toBeFocused();
  expect(await window.boundingBox()).toEqual(geometry);
  expect(await main.evaluate(element => element.scrollTop)).toBe(scroll);
  await desktop.click();
  await page.getByRole("navigation", { name: "Desktop shortcuts" }).getByRole("link", { name: "About Me" }).click();
  await expect(main).toBeFocused();
});

test("title-bar double-click restores custom geometry and Start supports keyboard navigation", async ({ page }, testInfo) => {
  await page.goto("/projects");
  await expect(page.locator("time")).toHaveAttribute("datetime", /.+/);
  const window = page.locator("#primary-window");
  const grip = page.getByRole("button", { name: "Resize window" });
  await grip.focus();
  await page.keyboard.press("ArrowLeft");
  const original = await window.boundingBox();
  const title = window.getByRole("group", { name: "Projects window title bar" });
  await title.dblclick();
  await expect(window.getByRole("button", { name: "Restore", exact: true })).toBeVisible();
  await page.screenshot({ animations: "disabled", path: testInfo.outputPath("maximized.png") });
  await title.dblclick();
  expect(await window.boundingBox()).toEqual(original);
  const start = page.getByRole("button", { name: "Start", exact: true });
  await start.click();
  const menu = page.getByRole("navigation", { name: "Start menu" });
  await expect(menu.getByRole("link", { name: /Welcome/ })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(menu.getByRole("link", { name: "Projects", exact: true })).toBeFocused();
  await expect(menu.getByRole("link", { name: "Projects", exact: true })).toHaveAttribute("aria-current", "page");
  await page.keyboard.press("End");
  await expect(menu.getByRole("button", { name: "About This Computer", exact: true })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(menu.getByRole("link", { name: /Welcome/ })).toBeFocused();
  await page.screenshot({ animations: "disabled", path: testInfo.outputPath("start-menu.png") });
  await page.keyboard.press("Escape");
  await expect(start).toBeFocused();
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 800, height: 600 }, { width: 390, height: 844 }, { width: 320, height: 568 }]) {
  test(`visual route sweep at ${viewport.width}×${viewport.height}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("time")).toHaveAttribute("datetime", /.+/);
      await expect(page.getByRole("main")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.getByRole("main").evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
      await page.screenshot({ animations: "disabled", path: testInfo.outputPath(`${route.replaceAll("/", "-") || "home"}.png`), fullPage: true });
    }
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await expect(page.getByRole("navigation", { name: "Start menu" })).toBeInViewport();
    await page.screenshot({ animations: "disabled", path: testInfo.outputPath("start.png") });
    expect(errors).toEqual([]);
  });
}

test("minimum custom window keeps content and navigation usable", async ({ page }, testInfo) => {
  await page.goto("/about");
  await expect(page.locator("time")).toHaveAttribute("datetime", /.+/);
  const grip = page.getByRole("button", { name: "Resize window" });
  const box = (await grip.boundingBox())!;
  await page.mouse.move(box.x + 10, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(0, 0, { steps: 10 });
  await page.mouse.up();
  expect((await page.locator("#primary-window").boundingBox())!.width).toBe(520);
  for (const route of ["Experience", "Journal", "Travel Logs", "Resume", "Contact"]) {
    await page.getByRole("complementary", { name: "Explorer navigation" }).getByRole("link", { name: route, exact: true }).click();
    await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.getByRole("main").evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.screenshot({ animations: "disabled", path: testInfo.outputPath(`narrow-${route}.png`) });
  }
});

test("short desktops and reduced motion retain accessible Start navigation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 720, height: 420 });
  await page.goto("/projects");
  await expect(page.locator("time")).toHaveAttribute("datetime", /.+/);
  const start = page.getByRole("button", { name: "Start", exact: true });
  await start.click();
  const menu = page.getByRole("navigation", { name: "Start menu" });
  await expect(menu).toHaveCSS("animation-name", "none");
  await page.keyboard.press("End");
  await expect(menu.getByRole("button", { name: "About This Computer", exact: true })).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(start).toBeFocused();
  await page.setViewportSize({ width: 320, height: 568 });
  await expect(page.getByRole("button", { name: "Show desktop", exact: true })).toBeHidden();
  await expect(page.getByRole("button", { name: "Resize window", exact: true })).toBeHidden();
  await start.click();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});
