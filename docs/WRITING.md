# Publishing Journal and Travel Logs

Both archives use local, trusted MDX files. There is no database, CMS, or separate
window system. Journal lives at `/blog`; Travel Logs lives at `/travellogs`.
`/travellogs/gilman` is a dedicated page and its slug is reserved.

## Create an entry

1. Copy `content/journal/template.mdx` to `content/journal/my-first-entry.mdx`,
   or `content/travellogs/template.mdx` to `content/travellogs/my-first-trip.mdx`.
2. Edit the `export const metadata` object at the top. Use a unique lowercase,
   hyphenated slug, a real title, summary, publication date (`YYYY-MM-DD`), and
   categories (an array of strings; `[]` is fine). Keep `status: "draft"` while
   writing. Filename and slug can differ; the metadata slug controls the URL.
3. For travel, also set `destination` and `travelDates: { start, end }` using
   `YYYY-MM-DD`. The end date must not precede the start date.
4. Replace the template body with your own Markdown or MDX. The page supplies
   the title and summary, so start body headings with `##`. Paragraphs, lists,
   quotes, code fences, links, images, and JSX are supported.

For example, the metadata structure for a Journal entry is:

```js
export const metadata = {
  title: "Your actual title",
  slug: "your-actual-slug",
  date: "2026-11-15", // replace with your publication date
  summary: "Your short description.",
  categories: ["Your category"],
  status: "draft",
}
```

For Travel Logs add these fields to the same object:

```js
  destination: "Your destination",
  travelDates: { start: "2026-11-01", end: "2026-11-03" },
```

Replace all example dates and labels. Metadata is JavaScript exported from MDX,
not YAML frontmatter. Validation fails the build with the filename and invalid
field when required metadata is missing or malformed. Slugs must be unique
within each archive, including drafts. Journal and Travel Logs may share a slug
because their URLs differ. Publication order is newest date first, then slug.

## Photography

Put photographs in `public/images/` (create the folder if needed). Reference them
with `/images/...`, without `public`. An optional cover belongs in metadata:

```js
  cover: {
    src: "/images/your-photo.jpg",
    alt: "Describe the photograph for someone who cannot see it",
    width: 2400,
    height: 1600,
  },
```

Use the photograph's actual pixel dimensions. Covers appear in the archive,
article, and social preview. Inline Markdown images work too:

```md
![A meaningful description](/images/your-photo.jpg)
```

For precise inline image dimensions, MDX also accepts
`<img src="/images/your-photo.jpg" alt="Description" width={2400} height={1600} />`.
Local cover images are required; no remote image hosting configuration is needed.

For an independent Windows 7-inspired viewer with multiple images, captions and
fit/actual-size controls, use the registered `<PhotoGallery photos={[...]}/>`
component in MDX. See [PHOTOGRAPHY.md](./PHOTOGRAPHY.md) for exact file locations,
the typed fields, and a complete authoring example. Plain Markdown images and
covers keep their existing behavior.

## Preview and publish

Drafts are excluded from archives, metadata, static params, and direct article
URLs (which return 404). There is no public draft-preview endpoint.

To preview, temporarily set the entry to `status: "published"` locally and run
`bun run dev`. Restart the dev server after changing the content files so the
server content cache is fresh. Visit `/blog/your-actual-slug` or
`/travellogs/your-actual-slug`. Check the desktop and narrow mobile layouts.
Restore `status: "draft"` if the entry is not ready to ship.

When ready, set `status: "published"`, then run:

```sh
bun run test:content
bun run lint
bun run build
bun run test:e2e
```

The publication date is display/sort metadata, not a scheduled publishing switch:
`status: "published"` makes an entry public on the next deployed build even if
its date is in the future. Check that all linked images exist under `public/`.
Commit the MDX and images together. Deployment remains a separate approved action.

## Infrastructure verification

`bun run test:writing` temporarily copies synthetic fixtures into both content
directories, builds, and tests published MDX, images, metadata, drafts, 404s,
parent navigation, history, and mobile layouts. It removes those fixtures in a
`finally` block and rebuilds the real content, even when a test fails. It refuses
to overwrite existing fixture filenames. Do not interrupt it during cleanup; if
interrupted, remove only `content/*/publishing-verification-fixture.mdx` created
by the test and rerun `bun run build` before using production output.

MDX is executable trusted repository code. Do not evaluate visitor uploads or
untrusted remote MDX. Keep article loading and compilation on the server.
