import { test, expect } from "@playwright/test";

async function launch(page: import("@playwright/test").Page) {
  await page.goto("/about");
  await expect(page.locator("time")).toHaveAttribute("datetime", /.+/);
  await page.getByRole("button", { name: "Open About This Computer" }).click();
}

test("one biography heading and a self-contained utility preserve focus, stacking and readable bounds", async ({ page }) => {
  await launch(page);
  const primary = page.locator("#primary-window");
  const utility = page.locator("#about-computer-window");
  await expect(primary.getByRole("heading", { level: 1 })).toHaveText("Hi, I’m Anthony.");
  await expect(utility.getByRole("navigation")).toHaveCount(0);
  await expect(utility.getByRole("link")).toHaveCount(0);
  await expect(utility).toContainText("Power source:CuriosityNostalgia:Enabled");
  await expect(utility).not.toContainText("just for fun");
  await expect(primary).not.toContainText("THE PERSON BEHIND THE DESKTOP");
  await expect(utility).toBeFocused();
  await expect(utility).toHaveCSS("outline-style", "none");
  await expect(utility.locator("..")).toHaveCSS("z-index", "4");
  await expect(primary).not.toHaveClass(/active/);
  const title = primary.getByRole("group", { name: "About window title bar", exact: true });
  await title.click({ position: { x: 12, y: 15 } });
  await expect(primary).toHaveClass(/active/);
  await expect(primary.locator("..")).toHaveCSS("z-index", "4");
  await expect(utility).not.toHaveClass(/active/);
  await page.keyboard.press("Tab");
  await expect(primary.getByRole("button", { name: "Minimize", exact: true })).toBeFocused();
  expect(await primary.getByRole("button", { name: "Minimize", exact: true }).evaluate(e => getComputedStyle(e).outlineStyle)).not.toBe("none");
  for (const element of [primary, primary.getByRole("main"), utility]) {
    expect(await element.evaluate(e => e.scrollWidth <= e.clientWidth)).toBe(true);
  }
  await page.locator("#utility-task").click();
  await expect(utility).toBeFocused();
  await expect(utility).toHaveClass(/active/);
  await expect(page.locator("#utility-task")).toHaveAccessibleName("Minimize About This Computer");
  await utility.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page).toHaveURL("/about");
  await expect(page.getByRole("button", { name: "Open About This Computer" })).toBeFocused();
});

test("each thumbnail supports pointer travel, Escape and keyboard restore without native tooltip cards", async ({ page }) => {
  await launch(page);
  await page.locator("#primary-task").hover();
  await expect(page.locator("#primary-preview")).toBeVisible();
  await page.locator("#utility-task").hover();
  await expect(page.locator("#utility-preview")).toBeVisible();
  await expect(page.locator("#primary-preview")).toBeHidden();
  for (const [id, windowId] of [["primary", "primary-window"], ["utility", "about-computer-window"]]) {
    const task = page.locator(`#${id}-task`);
    const preview = page.locator(`#${id}-preview`);
    const window = page.locator(`#${windowId}`);
    await task.hover();
    await expect(preview).toBeVisible();
    expect(await task.getAttribute("title")).toBeNull();
    expect((await preview.boundingBox())!.width).toBe(220);
    const buttonBox = (await task.boundingBox())!;
    const previewBox = (await preview.boundingBox())!;
    await page.mouse.move(buttonBox.x + buttonBox.width / 2, previewBox.y + previewBox.height + 2);
    await page.waitForTimeout(300);
    await expect(preview).toBeVisible();
    await preview.hover();
    await page.waitForTimeout(300);
    await expect(preview).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(preview).toBeHidden();
    await task.focus();
    await expect(preview).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(preview).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(window).toBeVisible();
    await expect(window).toHaveClass(/active/);
    await expect(preview).toBeHidden();
    await window.getByRole("button", { name: "Minimize", exact: true }).click();
    await task.hover();
    // A focus-preserving minimize may leave the pointer inside the same group.
    await page.mouse.move(1200, 100);
    await task.hover();
    await preview.click();
    await expect(window).toBeVisible();
    await expect(page).toHaveURL("/about");
  }
});

test("preview clamps to either viewport edge and updates to the navigated window", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator("time")).toHaveAttribute("datetime", /.+/);
  const task = page.locator("#primary-task");
  const preview = page.locator("#primary-preview");
  for (const edge of [0, 1306]) {
    // Exercise placement independently of today's short taskbar application list.
    await task.evaluate((element, left) => { element.style.position = "fixed"; element.style.left = `${left}px`; element.style.bottom = "2px"; element.style.zIndex = "31"; }, edge);
    await page.mouse.move(700, 100);
    await task.hover();
    await expect(preview).toBeVisible();
    const bounds = (await preview.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(6);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(1360);
  }
  await page.getByRole("complementary", { name: "Explorer navigation" }).getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL("/projects");
  await task.hover();
  await expect(preview).toHaveAccessibleName("Switch to Projects");
  await expect(preview).toContainText("Projects");
});
