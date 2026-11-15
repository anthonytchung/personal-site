import { test, expect, type Page, type Locator } from "@playwright/test";

const errors = new Map<Page, string[]>();
test.beforeEach(async ({ page }) => {
  errors.set(page, []);
  page.on("pageerror", error => errors.get(page)!.push(error.message));
  await page.goto("/");
  await expect(page.locator("time")).toHaveAttribute("datetime", /.+/);
});
test.afterEach(async ({ page }) => {
  expect(errors.get(page)).toEqual([]);
  errors.delete(page);
});

const primary = (page: Page) => page.locator("#primary-window");
const control = (page: Page, name: string) => primary(page).getByRole("button", { name, exact: true });
const shortcut = (page: Page, name: string) => page.getByRole("navigation", { name: "Desktop shortcuts" }).getByRole("link", { name, exact: true });
const titleBar = (page: Page) => primary(page).getByRole("group");
async function bounds(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box!;
}
async function drag(page: Page, dx: number, dy: number) {
  const handle = await bounds(titleBar(page));
  const x = handle.x + handle.width / 2, y = handle.y + handle.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 8 });
  await page.mouse.up();
}
async function expectInsideDesktop(page: Page) {
  // ResizeObserver reconciles stored coordinates on the next browser frame.
  await expect(async () => {
    const box = await bounds(primary(page));
    const taskbar = await bounds(page.locator("footer"));
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    expect(box.y + box.height).toBeLessThanOrEqual(taskbar.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight)).toBe(true);
  }).toPass();
}

test("minimize retains URL; taskbar, current-section shortcuts, and Start restore content", async ({ page }) => {
  await shortcut(page, "Projects").click();
  await expect(page).toHaveURL(/\/projects$/);
  await control(page, "Minimize").click();
  await expect(primary(page)).toBeHidden();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator("#primary-task")).toBeFocused();
  await page.locator("#primary-task").click();
  await expect(page.locator("main")).toBeFocused();
  await control(page, "Minimize").click();
  await shortcut(page, "Projects").click();
  await expect(primary(page)).toBeVisible();
  await control(page, "Minimize").click();
  await page.getByRole("navigation", { name: "Pinned shortcuts" }).getByRole("link", { name: "Projects" }).click();
  await expect(primary(page)).toBeVisible();
  await control(page, "Minimize").click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByRole("navigation", { name: "Start menu" }).getByRole("link", { name: "Projects", exact: true }).click();
  await expect(primary(page)).toBeVisible();
});

test("new routes and browser history restore a minimized window", async ({ page }) => {
  await shortcut(page, "Projects").click();
  await control(page, "Minimize").click();
  await shortcut(page, "Journal").click();
  await expect(primary(page)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Journal", exact: true })).toBeVisible();
  await control(page, "Minimize").click();
  await page.goBack();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(primary(page)).toBeVisible();
  await control(page, "Minimize").click();
  await page.goForward();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(primary(page)).toBeVisible();
});

test("close returns home without leaving the site and preserves Welcome dismissal", async ({ page }) => {
  await control(page, "Close").click();
  await shortcut(page, "Projects").click();
  await control(page, "Close").click();
  await expect(page).toHaveURL(/\/$/);
  await expect(primary(page)).toBeHidden();
  await expect(page.getByRole("button", { name: "Start", exact: true })).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(primary(page)).toBeVisible();
  await page.reload();
  await expect(primary(page)).toBeVisible();
});

test("direct routes, reload, and not-found pages remain readable", async ({ page }) => {
  for (const route of ["/projects", "/about", "/experience", "/resume", "/blog", "/travellogs", "/travellogs/gilman", "/contact"]) {
    expect((await page.goto(route))!.status()).toBe(200);
    await expect(page.locator("main h1")).toBeVisible();
    await control(page, "Minimize").click();
    await page.reload();
    await expect(primary(page)).toBeVisible();
  }
  expect((await page.goto("/missing"))!.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("Welcome persists for the tab and Start supports keyboard reopening", async ({ page, browser }) => {
  await control(page, "Close").click();
  await page.reload();
  await expect(primary(page)).toBeHidden();
  await page.getByRole("button", { name: "Start", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("navigation", { name: "Start menu" }).getByRole("link", { name: /Welcome/ })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Start", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(primary(page)).toBeVisible();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.mouse.click(1200, 100);
  await expect(page.getByRole("navigation", { name: "Start menu" })).toBeHidden();
  const fresh = await browser.newContext();
  const freshPage = await fresh.newPage();
  await freshPage.goto("/");
  await expect(primary(freshPage)).toBeVisible();
  await fresh.close();
});

test("drag bounds, pointer release, and maximize/restore preserve geometry", async ({ page }) => {
  const initial = await bounds(primary(page));
  await drag(page, 75, 20);
  const moved = await bounds(primary(page));
  expect(moved.x).toBeCloseTo(initial.x + 75, 0);
  expect(moved.y).toBeCloseTo(initial.y + 20, 0);
  await page.mouse.move(10, 10);
  expect((await bounds(primary(page))).x).toBeCloseTo(moved.x, 0);
  await control(page, "Maximize").click();
  const large = await bounds(primary(page));
  expect(large.width).toBeGreaterThan(moved.width);
  await expectInsideDesktop(page);
  await drag(page, -100, 100);
  expect((await bounds(primary(page))).x).toBeCloseTo(large.x, 0);
  await control(page, "Restore").click();
  expect((await bounds(primary(page))).x).toBeCloseTo(moved.x, 0);
  expect((await bounds(primary(page))).y).toBeCloseTo(moved.y, 0);
  await drag(page, 1500, 1000);
  await expectInsideDesktop(page);
  await drag(page, -2000, -1500);
  await expectInsideDesktop(page);
  // The close/minimize/maximize controls are outside the drag handle.
  await control(page, "Minimize").click();
  await page.locator("#primary-task").click();
  await expectInsideDesktop(page);
});

test("keyboard movement, centering, and Escape cancellation work", async ({ page }) => {
  const original = await bounds(primary(page));
  await titleBar(page).focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(async () => (await bounds(primary(page))).x).toBeCloseTo(original.x + 10, 0);
  await page.keyboard.press("Shift+ArrowDown");
  expect((await bounds(primary(page))).y).toBeCloseTo(original.y + 1, 0);
  await page.keyboard.press("Home");
  expect((await bounds(primary(page))).x).toBeCloseTo(original.x, 0);
  const handle = await bounds(titleBar(page));
  await page.mouse.move(handle.x + 80, handle.y + 12);
  await page.mouse.down();
  await page.mouse.move(handle.x + 140, handle.y + 32, { steps: 5 });
  await page.keyboard.press("Escape");
  await page.mouse.up();
  expect((await bounds(primary(page))).x).toBeCloseTo(original.x, 0);
  await drag(page, 50, 10);
  await control(page, "Center window").click();
  expect((await bounds(primary(page))).x).toBeCloseTo(original.x, 0);
});

test("position persists across routes and clamps after viewport and content-size changes", async ({ page }) => {
  await shortcut(page, "Projects").click();
  await drag(page, -80, -20);
  const position = await bounds(primary(page));
  await primary(page).getByRole("link", { name: "Journal", exact: true }).click();
  expect((await bounds(primary(page))).x).toBeCloseTo(position.x, 0);
  expect((await bounds(primary(page))).y).toBeCloseTo(position.y, 0);
  await page.setViewportSize({ width: 1024, height: 768 });
  await expectInsideDesktop(page);
  await page.setViewportSize({ width: 800, height: 600 });
  await expectInsideDesktop(page);
});

test("mobile content ignores desktop hidden state and geometry", async ({ page }) => {
  await shortcut(page, "Projects").click();
  await drag(page, 100, 20);
  await control(page, "Maximize").click();
  await control(page, "Minimize").click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("main h1")).toBeVisible();
  await expect(control(page, "Close")).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await shortcut(page, "About Me").click();
  await expect(page.getByRole("heading", { name: "About", exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1366, height: 768 });
  await expect(primary(page)).toBeVisible();
  await expectInsideDesktop(page);
  await control(page, "Restore").click();
  await expectInsideDesktop(page);
});

test("long window content scrolls without moving the desktop or hiding controls", async ({ page }) => {
  await shortcut(page, "About Me").click();
  await expect(page.getByRole("heading", { name: "About", exact: true })).toBeVisible();
  await expect(page.locator("main")).toBeFocused();
  // A long article fixture exercises the same content slot as future MDX.
  await page.locator("main").evaluate(main => {
    const article = document.createElement("div");
    article.style.height = "2500px";
    main.append(article);
  });
  const body = await bounds(page.locator(".window-body"));
  await page.mouse.move(body.x + body.width / 2, body.y + 100);
  await page.mouse.wheel(0, 700);
  await expect.poll(() => page.locator(".window-body").evaluate(body => body.scrollTop)).toBeGreaterThan(0);
  await expect(control(page, "Close")).toBeVisible();
  await expectInsideDesktop(page);
  await control(page, "Minimize").click();
  await page.locator("#primary-task").click();
  expect(await page.locator(".window-body").evaluate(body => body.scrollTop)).toBeGreaterThan(0);
  await shortcut(page, "Journal").click();
  await expect.poll(() => page.locator(".window-body").evaluate(body => body.scrollTop)).toBe(0);
});

for (const size of [{ width: 1920, height: 1080 }, { width: 1440, height: 900 }, { width: 800, height: 600 }]) {
  test(`window fits ${size.width}×${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await expectInsideDesktop(page);
    await control(page, "Maximize").click();
    await expectInsideDesktop(page);
  });
}
