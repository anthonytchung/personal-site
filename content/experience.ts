export type ExperienceEntry = {
  id: string;
  status: "verified" | "placeholder";
  employer: string;
  role: string;
  dates: string;
  location: string;
  description: string;
  accomplishments: readonly string[];
};

// Most recent first. Replace this explicitly labeled preview with approved,
// public information only. See docs/EXPERIENCE.md before adding a real role.
export const experienceEntries: readonly ExperienceEntry[] = [
  {
    id: "role-placeholder",
    status: "placeholder",
    employer: "Employer to be added",
    role: "Role to be added",
    dates: "Dates to be added",
    location: "Location to be added",
    description: "Development placeholder — a public overview of the role and responsibilities will go here.",
    accomplishments: ["Approved, public accomplishments will go here."],
  },
];
