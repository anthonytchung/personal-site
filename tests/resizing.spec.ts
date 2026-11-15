import { test, expect, type Page } from "@playwright/test";

const windowFrame = (page: Page) => page.locator("#primary-window");
const handle = (page: Page) => page.getByRole("button", { name: "Resize window", exact: true });
const control = (page: Page, name: string) => windowFrame(page).getByRole("button", { name, exact: true });
const box = async (page: Page) => (await windowFrame(page).boundingBox())!;

async function resize(page: Page, dx: number, dy: number, cancel = false) {
  const grip = (await handle(page).boundingBox())!;
  const x = grip.x + grip.width / 2, y = grip.y + grip.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 8 });
  if (cancel) await page.keyboard.press("Escape");
  await page.mouse.up();
}

async function expectInsideDesktop(page: Page) {
  await expect(async () => {
    const frame = await box(page);
    const taskbar = (await page.locator("footer").boundingBox())!;
    expect(frame.x).toBeGreaterThanOrEqual(8);
    expect(frame.y).toBeGreaterThanOrEqual(8);
    expect(frame.x + frame.width).toBeLessThanOrEqual(page.viewportSize()!.width - 8);
    expect(frame.y + frame.height).toBeLessThanOrEqual(taskbar.y - 8);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight)).toBe(true);
  }).toPass();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator("time")).toHaveAttribute("datetime", /.+/);
});

test("pointer resizing changes each axis independently, anchors position, and enforces bounds", async ({ page }) => {
  const initial = await box(page);
  await resize(page, -100, 0);
  const narrower = await box(page);
  expect(narrower).toEqual({ ...initial, width: initial.width - 100 });
  await resize(page, 0, -100);
  const shorter = await box(page);
  expect(shorter).toEqual({ ...narrower, height: narrower.height - 100 });
  await page.mouse.move(10, 10);
  expect(await box(page)).toEqual(shorter);
  await resize(page, -2000, -2000);
  const smallest = await box(page);
  expect(smallest.width).toBe(520);
  expect(smallest.height).toBe(360);
  await resize(page, 2000, 2000);
  await expectInsideDesktop(page);
  const largest = await box(page);
  expect(largest.x).toBe(initial.x);
  expect(largest.y).toBe(initial.y);
  expect(largest.x + largest.width).toBe(page.viewportSize()!.width - 8);
  expect(largest.y + largest.height).toBe((await page.locator("footer").boundingBox())!.y - 8);
});

test("Escape cancels resizing and pointer release stops further changes", async ({ page }) => {
  const initial = await box(page);
  await resize(page, -120, -80, true);
  expect(await box(page)).toEqual(initial);
  await resize(page, -120, -80);
  const resized = await box(page);
  await page.mouse.move(1200, 700);
  expect(await box(page)).toEqual(resized);
});

test("size and position survive navigation, history, minimize, maximize and restore", async ({ page }) => {
  await resize(page, -120, -120);
  const title = page.getByRole("group", { name: "About window title bar", exact: true });
  await title.focus();
  await page.keyboard.press("ArrowLeft");
  const resized = await box(page);
  await page.getByRole("complementary", { name: "Explorer navigation" }).getByRole("link", { name: "Experience", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Experience", exact: true })).toBeVisible();
  expect(await box(page)).toEqual(resized);
  await control(page, "Minimize").click();
  await page.locator("#primary-task").click();
  expect(await box(page)).toEqual(resized);
  await control(page, "Maximize").focus();
  await page.keyboard.press("Enter");
  await expect(handle(page)).toBeHidden();
  await expectInsideDesktop(page);
  await page.goBack();
  await expect(page.getByRole("heading", { name: "About", exact: true })).toBeVisible();
  await expect(page.getByRole("main")).toBeFocused();
  await control(page, "Restore").focus();
  await page.keyboard.press("Enter");
  await expect(control(page, "Maximize")).toBeVisible();
  expect(await box(page)).toEqual(resized);
  await control(page, "Close").click();
  await expect(page).toHaveURL("/");
  await page.getByRole("navigation", { name: "Desktop shortcuts" }).getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
  expect(await box(page)).toEqual(resized);
});

test("viewport shrink clamps both dimensions and position, including restore from maximized", async ({ page }) => {
  await resize(page, 2000, 2000);
  await page.setViewportSize({ width: 800, height: 600 });
  await expectInsideDesktop(page);
  expect((await box(page)).width).toBeLessThanOrEqual(784);
  expect((await box(page)).height).toBeLessThanOrEqual(538);
  await control(page, "Maximize").click();
  await page.setViewportSize({ width: 720, height: 420 });
  await control(page, "Restore").click();
  await expectInsideDesktop(page);
  expect((await box(page)).height).toBe(358);
  await page.setViewportSize({ width: 1366, height: 768 });
  await expectInsideDesktop(page);
});

test("keyboard resizing has visible focus and leaves the other axis unchanged", async ({ page }) => {
  const initial = await box(page);
  await handle(page).focus();
  await page.keyboard.press("ArrowLeft");
  expect(await box(page)).toEqual({ ...initial, width: initial.width - 10 });
  await page.keyboard.press("Shift+ArrowUp");
  expect(await box(page)).toEqual({ ...initial, width: initial.width - 10, height: initial.height - 1 });
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Shift+ArrowDown");
  expect(await box(page)).toEqual(initial);
  await expect(handle(page)).toHaveCSS("outline-style", "solid");
  await expect(handle(page)).toHaveCSS("outline-width", "2px");
});

test("programmatic reading focus has no border while keyboard controls retain indicators", async ({ page }) => {
  await page.getByRole("complementary", { name: "Explorer navigation" }).getByRole("link", { name: "Experience", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await expect(page.getByRole("main")).toHaveCSS("outline-style", "none");
  await control(page, "Minimize").click();
  await page.locator("#primary-task").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await expect(page.getByRole("main")).toHaveCSS("outline-style", "none");
  const link = page.getByRole("complementary", { name: "Explorer navigation" }).getByRole("link", { name: "About", exact: true });
  await link.focus();
  await page.keyboard.press("Shift");
  await expect(link).toHaveCSS("outline-style", "solid");
});

test("resized reading pane scrolls internally with chrome and resize handle visible", async ({ page }, testInfo) => {
  await resize(page, -150, -250);
  const frame = await box(page);
  const main = page.getByRole("main");
  await main.hover();
  await page.mouse.wheel(0, 600);
  await expect.poll(() => main.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  await expect(control(page, "Close")).toBeVisible();
  await expect(handle(page)).toBeInViewport();
  expect(await box(page)).toEqual(frame);
  await expectInsideDesktop(page);
  await page.screenshot({ path: testInfo.outputPath("resized-window.png") });
});

test("mobile ignores desktop size and hidden state, then restores desktop geometry", async ({ page }) => {
  await resize(page, -150, -100);
  const resized = await box(page);
  await control(page, "Minimize").click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(handle(page)).toBeHidden();
  await expect(control(page, "Maximize")).toBeHidden();
  await expect(page.getByRole("heading", { name: "About", exact: true })).toBeVisible();
  await expect(page.getByRole("main")).toHaveCSS("overflow-y", "visible");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("complementary", { name: "Explorer navigation" }).getByRole("link", { name: "Experience", exact: true }).click();
  await page.setViewportSize({ width: 1366, height: 768 });
  await expect(handle(page)).toBeVisible();
  await expect(async () => expect(await box(page)).toEqual(resized)).toPass();
});
