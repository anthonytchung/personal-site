import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ExperienceTimeline } from "../../components/content/experience-timeline";
import { experienceEntries, type ExperienceEntry } from "../../content/experience";

// Synthetic rendering fixture, not Anthony's work history.
const fixture: ExperienceEntry = {
  id: "synthetic-role",
  status: "verified",
  employer: "Synthetic & Co",
  role: "Test role",
  dates: "Jan 2020 – Feb 2021",
  location: "Test location",
  description: "Synthetic responsibilities.",
  accomplishments: ["Synthetic outcome one.", "Synthetic outcome two."],
};

describe("experience rendering", () => {
  test("renders all supplied fields in data order, with escaped text", () => {
    const html = renderToStaticMarkup(<ExperienceTimeline entries={[fixture, { ...fixture, id: "second", role: "Second role" }]} />);
    for (const value of ["Synthetic &amp; Co", fixture.role, fixture.dates, fixture.location, fixture.description, ...fixture.accomplishments]) {
      expect(html).toContain(value);
    }
    expect(html.indexOf("Test role")).toBeLessThan(html.indexOf("Second role"));
    expect(html).not.toContain("Development placeholder");
  });

  test("omits empty accomplishments and handles an empty history", () => {
    expect(renderToStaticMarkup(<ExperienceTimeline entries={[{ ...fixture, accomplishments: [] }]} />)).not.toContain("Key accomplishments");
    const empty = renderToStaticMarkup(<ExperienceTimeline entries={[]} />);
    expect(empty).toContain("still being prepared");
    expect(empty).not.toContain("<ol");
  });

  test("all initial records remain unmistakable placeholders", () => {
    expect(experienceEntries.every(entry => entry.status === "placeholder")).toBe(true);
    const html = renderToStaticMarkup(<ExperienceTimeline entries={experienceEntries} />);
    expect(html).toContain("Not an employment record");
    expect(html).toContain("Key accomplishments to be added");
  });
});
