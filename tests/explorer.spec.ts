import { test, expect } from "@playwright/test";

const sections = [
  ["/projects", "Projects", "/projects"], ["/about", "About", "/about"],
  ["/experience", "Experience", "/experience"], ["/resume", "Resume", "/resume"],
  ["/blog", "Journal", "/blog"], ["/travellogs", "Travel Logs", "/travellogs"],
  ["/travellogs/gilman", "Gilman", "/travellogs"], ["/contact", "Contact", "/contact"],
];

test("primary routes share chrome, dimensions, and direct content navigation", async ({ page }) => {
  let initial: { width: number; height: number } | undefined;
  for (const [route, title, sectionHref] of sections) {
    expect((await page.goto(route))!.status()).toBe(200);
    await expect(page.getByRole("heading", { name: route === "/about" ? "Hi, I’m Anthony." : title, exact: true })).toBeVisible();
    const window = page.locator("#primary-window");
    const box = (await window.boundingBox())!;
    initial ??= box;
    expect(box.width).toBe(initial.width);
    expect(box.height).toBe(initial.height);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(window.getByRole("navigation", { name: "Main navigation", exact: true })).toHaveCount(0);
    await expect(window.getByRole("navigation", { name: "Breadcrumb", exact: true })).toHaveCount(1);
    const commands = window.getByRole("group", { name: "Section tools", exact: true });
    await expect(commands).toHaveCount(0);
    const chromeBottom = await window.getByRole("navigation", { name: "Breadcrumb", exact: true }).evaluate(element => element.parentElement!.getBoundingClientRect().bottom);
    expect((await page.getByRole("main").boundingBox())!.y).toBe(chromeBottom);
    await expect(window.getByRole("group", { name: "Section information", exact: true })).toBeVisible();
    const sidebar = window.getByRole("complementary", { name: "Explorer navigation" });
    await expect(sidebar.getByRole("link").first()).toHaveText("Projects");
    await expect(sidebar.locator('[aria-current="page"]')).toHaveAttribute("href", sectionHref);
    await expect(sidebar.getByRole("heading", { name: "Anthony's Desktop", exact: true })).toHaveCount(0);
    await expect(sidebar.locator('a[href="/"]')).toHaveCount(0);
    if (route !== "/projects") await expect(window.getByRole("group", { name: "Section information", exact: true })).not.toContainText("projects");
  }
  await page.getByRole("complementary", { name: "Explorer navigation" }).getByRole("link", { name: "Journal", exact: true }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(page.getByRole("main")).toBeFocused();
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Contact", exact: true })).toBeVisible();
});

test("reading scroll preserves chrome and window geometry", async ({ page }) => {
  await page.goto("/blog");
  const window = page.locator("#primary-window");
  const original = (await window.boundingBox())!;
  const location = page.getByRole("navigation", { name: "Breadcrumb", exact: true });
  const locationBox = (await location.boundingBox())!;
  const status = page.getByRole("group", { name: "Section information", exact: true });
  const statusBox = (await status.boundingBox())!;
  await page.getByRole("main").evaluate(main => {
    const fixture = document.createElement("p");
    fixture.textContent = "Long reading fixture";
    fixture.style.height = "2500px";
    main.append(fixture);
  });
  await page.getByRole("main").hover();
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.getByRole("main").evaluate(main => main.scrollTop)).toBeGreaterThan(0);
  expect((await window.boundingBox())!.height).toBe(original.height);
  expect((await location.boundingBox())!.y).toBe(locationBox.y);
  expect((await status.boundingBox())!.y).toBe(statusBox.y);
  await expect(status).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
});

for (const viewport of [{ width: 1366, height: 768 }, { width: 390, height: 844 }]) {
  test(`shared shell screenshots and flow at ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    for (const [route, title] of sections.filter(([route]) => ["/projects", "/blog", "/travellogs", "/travellogs/gilman"].includes(route))) {
      await page.goto(route);
      await expect(page.getByRole("heading", { name: route === "/about" ? "Hi, I’m Anthony." : title, exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (viewport.width < 700) {
        await expect(page.getByRole("main")).toHaveCSS("overflow-y", "visible");
        await expect(page.locator("#primary-window").getByRole("button", { name: "Close", exact: true })).toBeHidden();
      }
      await page.screenshot({ path: testInfo.outputPath(`${title.replaceAll(" ", "-")}.png`), fullPage: viewport.width < 700 });
    }
  });
}


test("Travel Logs keeps navigation stationary and its content link keyboard accessible", async ({ page }) => {
  for (const width of [1366, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/blog");
    const sidebar = page.getByRole("complementary", { name: "Explorer navigation" });
    const links = sidebar.getByRole("link");
    const before = await links.evaluateAll(elements => elements.map(element => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    }));
    await sidebar.getByRole("link", { name: "Travel Logs", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Travel Logs", exact: true })).toBeVisible();
    expect(await links.evaluateAll(elements => elements.map(element => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    }))).toEqual(before);
    await expect(page.getByRole("group", { name: "Section tools", exact: true })).toHaveCount(0);
    const gilman = page.getByRole("main").getByRole("link", { name: "Gilman Scholarship", exact: true });
    await gilman.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/travellogs\/gilman$/);
    await expect(page.getByRole("heading", { name: "Gilman", exact: true })).toBeVisible();
    await expect(page.getByRole("group", { name: "Section tools", exact: true })).toHaveCount(0);
    await page.goBack();
    await expect(gilman).toBeVisible();
  }
});
