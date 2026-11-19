import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

// Full Chromium exercises its native PDF viewer; the headless shell downloads PDFs.
test.use({ channel: "chromium" });

const pdf = "/documents/anthony-chung-resume.pdf";
const email = "anthonytchung@gmail.com";

test("resume serves the real PDF directly and provides view, download and new-tab actions", async ({ page, request }, testInfo) => {
  const response = await request.get(pdf);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
  const bytes = await response.body();
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  expect(bytes.equals(await readFile("public/documents/anthony-chung-resume.pdf"))).toBe(true);
  await page.goto("/resume");
  await expect(page.locator("time")).toHaveAttribute("datetime", /.+/);
  const actions = page.getByRole("navigation", { name: "Resume actions" });
  const view = actions.getByRole("link", { name: "View PDF", exact: true });
  await expect(view).toHaveAttribute("href", pdf);
  expect(await view.getAttribute("target")).toBeNull();
  await expect(actions.getByRole("link", { name: "Open in new tab", exact: true })).toHaveAttribute("target", "_blank");
  await expect(actions.getByRole("link", { name: "Open in new tab", exact: true })).toHaveAttribute("rel", /noopener/);
  const downloadPromise = page.waitForEvent("download");
  await actions.getByRole("link", { name: "Download PDF", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("Anthony_Chung_Resume.pdf");
  const saved = testInfo.outputPath("downloaded-resume.pdf");
  await download.saveAs(saved);
  expect((await readFile(saved)).equals(bytes)).toBe(true);
  await expect(page).toHaveURL("/resume");
  const image = page.getByRole("img", { name: /Preview of Anthony Chung/ });
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.screenshot({ path: testInfo.outputPath("resume-desktop.png") });
  await page.locator("#primary-window").getByRole("button", { name: "Maximize", exact: true }).click();
  await page.screenshot({ path: testInfo.outputPath("resume-maximized.png") });
  const popupPromise = page.waitForEvent("popup");
  await actions.getByRole("link", { name: "Open in new tab", exact: true }).click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(pdf);
  await popup.close();
  await view.click();
  await expect(page).toHaveURL(pdf);
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Resume", exact: true })).toBeVisible();
});

test("Contact uses approved links and copies the email with keyboard feedback", async ({ page, context }, testInfo) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/contact");
  await expect(page.locator("time")).toHaveAttribute("datetime", /.+/);
  const main = page.getByRole("main");
  const address = main.getByRole("link", { name: email, exact: true });
  await expect(address).toHaveAttribute("href", `mailto:${email}`);
  for (const [name, href] of [["LinkedIn", "https://www.linkedin.com/in/anthonytchung"], ["GitHub", "https://github.com/anthonytchung"]]) {
    const link = main.getByRole("link", { name: new RegExp(`^${name}`) });
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  }
  await address.focus();
  await page.keyboard.press("Tab");
  const copy = main.getByRole("button", { name: "Copy email", exact: true });
  await expect(copy).toBeFocused();
  expect(await copy.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe("none");
  await page.keyboard.press("Enter");
  await expect(main.getByRole("status")).toHaveText("Email address copied.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(email);
  await expect(main.getByRole("textbox")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("contact-desktop.png") });
});

test("clipboard rejection gives an honest, accessible fallback", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new Error("Denied")) } }));
  await page.goto("/contact");
  await page.getByRole("button", { name: "Copy email", exact: true }).click();
  await expect(page.getByRole("main").getByRole("status")).toHaveText("Couldn’t copy. Select the email address to copy it manually.");
  await expect(page.getByRole("link", { name: email, exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy email", exact: true })).toBeEnabled();
});

test("mobile uses direct PDF actions and preserves route/history and window geometry", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/resume");
  await expect(page.locator("time")).toHaveAttribute("datetime", /.+/);
  await expect(page.getByRole("img", { name: /Preview of Anthony Chung/ })).toBeHidden();
  const actions = page.getByRole("navigation", { name: "Resume actions" });
  await expect(actions.getByRole("link")).toHaveCount(3);
  for (const link of await actions.getByRole("link").all()) {
    await expect(link).toBeInViewport();
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  expect(await page.getByRole("main").evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("resume-mobile.png"), fullPage: true });
  await page.getByRole("complementary", { name: "Explorer navigation" }).getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page).toHaveURL("/contact");
  await expect(page.getByRole("link", { name: email, exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("contact-mobile.png"), fullPage: true });
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Resume", exact: true })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole("heading", { name: "Contact", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("link", { name: email, exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1366, height: 768 });
  const frame = page.locator("#primary-window");
  const before = await frame.boundingBox();
  await page.getByRole("complementary", { name: "Explorer navigation" }).getByRole("link", { name: "Resume", exact: true }).click();
  await expect(page).toHaveURL("/resume");
  expect(await frame.boundingBox()).toEqual(before);
  await page.reload();
  await expect(page.getByRole("navigation", { name: "Resume actions" })).toBeVisible();
});
