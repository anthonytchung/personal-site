export type WritingKind = "journal" | "travel";
export type CoverImage = { src: string; alt: string; width: number; height: number };
type BaseEntry = {
  title: string;
  slug: string;
  date: string;
  summary: string;
  categories: string[];
  status: "draft" | "published";
  cover?: CoverImage;
};
export type Entry = BaseEntry & (
  | { kind: "journal" }
  | { kind: "travel"; destination: string; travelDates: { start: string; end: string } }
);

export const writingSections = {
  journal: { title: "Journal", href: "/blog", summary: "Personal thoughts, technical writing, and things worth sharing." },
  travel: { title: "Travel Logs", href: "/travellogs", summary: "Travel writing, study abroad reflections, and photographs." },
} as const;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function text(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0; }
function date(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export function validateMetadata(value: unknown, kind: WritingKind, filename: string): Entry {
  function invalid(field: string): never { throw new Error(`${filename}: invalid ${field}`); }
  if (!record(value)) invalid("metadata export");
  if (!text(value.title)) invalid("title");
  if (!text(value.slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug)) invalid("slug");
  if (kind === "travel" && value.slug === "gilman") invalid("slug (gilman is reserved)");
  if (!date(value.date)) invalid("date (use YYYY-MM-DD)");
  if (!text(value.summary)) invalid("summary");
  if (!Array.isArray(value.categories) || !value.categories.every(text)) invalid("categories");
  if (value.status !== "draft" && value.status !== "published") invalid("status");
  let cover: CoverImage | undefined;
  if (value.cover !== undefined) {
    const image = value.cover;
    if (!record(image) || !text(image.src) || !/^\/(?!\/)/.test(image.src) || !text(image.alt)
      || typeof image.width !== "number" || !Number.isInteger(image.width) || image.width <= 0
      || typeof image.height !== "number" || !Number.isInteger(image.height) || image.height <= 0) invalid("cover (local src, alt, width, height)");
    cover = { src: image.src, alt: image.alt, width: image.width, height: image.height };
  }
  const base: BaseEntry = {
    title: value.title, slug: value.slug, date: value.date, summary: value.summary,
    categories: value.categories, status: value.status, cover,
  };
  if (kind === "journal") return { ...base, kind };
  if (!text(value.destination)) invalid("destination");
  const dates = value.travelDates;
  if (!record(dates) || !date(dates.start) || !date(dates.end) || dates.end < dates.start) invalid("travelDates");
  return { ...base, kind, destination: value.destination, travelDates: { start: dates.start, end: dates.end } };
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
