import { test, expect } from "@playwright/test";

for (const width of [1366, 390]) {
  test(`About and Experience read naturally at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/about#why-windows-7");
    const main = page.getByRole("main");
    const origin = page.getByRole("region", { name: "Why Windows 7?" });
    await expect(origin).toBeInViewport();
    await expect(origin).toContainText("watching my father use our family Windows 7 computer");
    await expect(main.getByText("Development placeholder", { exact: true })).toHaveCount(3);
    await expect(main.getByRole("heading", { name: "Hi, I’m Anthony." })).toHaveCount(1);
    await expect(main.getByRole("img")).toHaveCount(0);
    await page.goto("/about");
    await page.screenshot({ path: testInfo.outputPath("about.png"), fullPage: width < 700 });

    const experienceLink = page.getByRole("complementary", { name: "Explorer navigation" }).getByRole("link", { name: "Experience", exact: true });
    await experienceLink.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/experience$/);
    const timeline = main.getByRole("list", { name: "Experience timeline" });
    await expect(timeline.getByRole("article")).toHaveCount(1);
    await expect(timeline).toContainText("Development placeholder · Not an employment record");
    for (const field of ["Employer to be added", "Role to be added", "Dates to be added", "Location to be added", "Approved, public accomplishments will go here."]) {
      await expect(timeline.getByText(field, { exact: true })).toBeVisible();
    }
    await expect(main).toBeFocused();
    await page.screenshot({ path: testInfo.outputPath("experience.png"), fullPage: width < 700 });
    await page.reload();
    await expect(main.getByRole("heading", { name: "Experience", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width < 700) await expect(main).toHaveCSS("overflow-y", "visible");
    await page.goBack();
    await expect(main.getByRole("heading", { name: "About", exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
}
