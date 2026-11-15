import { describe, test, expect } from "bun:test";
import { validateMetadata } from "../../lib/content/metadata";

const base = { title: "Test", slug: "test", date: "2026-11-15", summary: "Test summary", categories: [], status: "draft" };

describe("writing metadata", () => {
  test("validates journal and travel metadata", () => {
    expect(validateMetadata(base, "journal", "test.mdx").kind).toBe("journal");
    expect(validateMetadata({ ...base, destination: "Test", travelDates: { start: "2026-11-01", end: "2026-11-03" } }, "travel", "test.mdx").kind).toBe("travel");
  });
  for (const [field, value] of [["title", ""], ["summary", ""], ["slug", "../secret"], ["date", "2026-02-30"], ["status", "public"], ["categories", "travel"], ["cover", { src: "https://example.com/image.jpg" }]]) {
    test(`rejects invalid ${field}`, () => {
      expect(() => validateMetadata({ ...base, [String(field)]: value }, "journal", "test.mdx")).toThrow(`test.mdx: invalid ${field}`);
    });
  }
  test("rejects missing travel metadata and reversed dates", () => {
    expect(() => validateMetadata(base, "travel", "test.mdx")).toThrow("destination");
    expect(() => validateMetadata({ ...base, destination: "Test", travelDates: { start: "2026-11-03", end: "2026-11-01" } }, "travel", "test.mdx")).toThrow("travelDates");
  });
  test("reserves the dedicated scholarship route", () => {
    expect(() => validateMetadata({ ...base, slug: "gilman" }, "travel", "test.mdx")).toThrow("gilman is reserved");
  });
});
