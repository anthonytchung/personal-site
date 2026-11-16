import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator("time")).toHaveAttribute("datetime", /.+/);
});

test("preview switches to the window by pointer and keyboard and Escape returns focus", async ({ page }) => {
  const window = page.locator("#primary-window");
  const task = page.locator("#primary-task");
  const preview = page.getByRole("button", { name: "Switch to About", exact: true });
  await window.getByRole("button", { name: "Minimize", exact: true }).click();
  await task.hover();
  await preview.click();
  await expect(window).toBeVisible();
  await expect(page.getByRole("main")).toBeFocused();
  await expect(preview).toBeHidden();
  await window.getByRole("button", { name: "Minimize", exact: true }).click();
  await task.focus();
  await expect(preview).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(preview).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(task).toBeFocused();
  await expect(preview).toBeHidden();
  await expect(window).toBeHidden();
  await task.blur();
  await task.focus();
  await expect(preview).toBeVisible();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(window).toBeVisible();
  await expect(page.getByRole("main")).toBeFocused();
  // Activating the preview of a visible window must not minimize it.
  await task.focus();
  await expect(preview).toBeVisible();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(window).toBeVisible();
});

test("Start identifies Welcome and Gilman and uses a contrasting program focus outline", async ({ page }) => {
  for (const [route, label] of [["/", "Welcome"], ["/travellogs/gilman", "Gilman"]]) {
    await page.goto(route);
    await page.getByRole("button", { name: "Start", exact: true }).click();
    const menu = page.getByRole("navigation", { name: "Start menu" });
    await expect(menu.getByRole("link", { name: new RegExp(`^${label}`) })).toHaveAttribute("aria-current", "page");
    await page.keyboard.press("Home");
    await expect(menu.getByRole("link", { name: /^Welcome/ })).toHaveCSS("outline-color", "rgb(23, 78, 120)");
    await page.keyboard.press("Escape");
  }
});

test("About starts at its heading after navigation and preserves only intentional reading scroll on restore", async ({ page }) => {
  const main = page.getByRole("main");
  async function headingIsUnclipped() {
    await expect(main.getByRole("heading", { name: "About", exact: true })).toBeVisible();
    await expect.poll(() => main.evaluate(m => m.scrollTop)).toBe(0);
    const pane = (await main.boundingBox())!;
    for (const name of ["About", "Hi, I’m Anthony."]) {
      const heading = (await main.getByRole("heading", { name, exact: true }).boundingBox())!;
      expect(heading.y).toBeGreaterThanOrEqual(pane.y);
      expect(heading.y + heading.height).toBeLessThanOrEqual(pane.y + pane.height);
    }
  }
  await headingIsUnclipped();
  await page.getByRole("button", { name: "Minimize", exact: true }).click();
  await page.locator("#primary-task").click();
  await headingIsUnclipped();
  await main.evaluate(m => { m.scrollTop = 180; });
  await page.getByRole("button", { name: "Minimize", exact: true }).click();
  await page.locator("#primary-task").click();
  await expect.poll(() => main.evaluate(m => m.scrollTop)).toBe(180);
  await page.getByRole("complementary", { name: "Explorer navigation" }).getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL("/projects");
  await page.goBack();
  await headingIsUnclipped();
  await page.goForward();
  await expect(page).toHaveURL("/projects");
  await page.getByRole("complementary", { name: "Explorer navigation" }).getByRole("link", { name: "About", exact: true }).click();
  await headingIsUnclipped();
});
