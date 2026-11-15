# Updating About and Experience

About lives in `app/about/page.tsx`, with scoped styles alongside it. Its current
personal facts come from DESIGN.md sections 1, 4, and 10 and the supplied milestone
brief: Anthony builds software, and watching his father use the family Windows 7
computer sparked his interest in technology. Background, interests, and photos
remain explicitly labeled development placeholders. Replace these only with
Anthony's supplied details. Use meaningful alt text and a caption when replacing
the photo space with a real image; do not present a stock photo as a personal one.

Experience content lives in `content/experience.ts`. Add entries in most-recent-first
order with a stable unique `id`, `status: "verified"`, employer, role, dates (a
readable range, including “Present” where applicable), location, a short description,
and an array of key accomplishments. An empty accomplishments array omits that
section. No page or shell changes are needed to add roles. Remove the placeholder
entry once approved public roles are ready. An empty array displays an honest empty
state instead of a timeline.

The current card is explicitly a development placeholder, not a work record.
Never infer employers, dates, credentials, metrics, or outcomes. Include only
verified information approved for public sharing, excluding confidential project,
customer, and internal company details.
