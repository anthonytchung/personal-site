import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import { validateMetadata, type WritingKind } from "./metadata";

async function readSources(kind: WritingKind) {
  "use cache";
  const directory = path.join(process.cwd(), "content", kind === "journal" ? "journal" : "travellogs");
  const files = (await readdir(directory)).filter(file => file.endsWith(".mdx")).sort();
  return Promise.all(files.map(async filename => ({ filename, source: await readFile(path.join(directory, filename), "utf8") })));
}

// Repository-authored MDX is executable code. Never evaluate uploads or remote input.
// React cache shares compilation within a render; only serializable sources enter Next's cache.
export const getEntries = cache(async (kind: WritingKind) => {
  const sources = await readSources(kind);
  const entries = await Promise.all(sources.map(async ({ filename, source }) => {
    const compiled = await evaluate(source, { ...runtime, baseUrl: import.meta.url });
    return { ...validateMetadata(compiled.metadata, kind, filename), Content: compiled.default };
  }));
  const slugs = new Set<string>();
  for (const entry of entries) {
    if (slugs.has(entry.slug)) throw new Error(`Duplicate ${kind} slug: ${entry.slug}`);
    slugs.add(entry.slug);
  }
  return entries.filter(entry => entry.status === "published")
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
});

export async function getEntry(kind: WritingKind, slug: string) {
  return (await getEntries(kind)).find(entry => entry.slug === slug);
}

export async function getStaticEntries(kind: WritingKind) {
  const entries = await getEntries(kind);
  // Cache Components requires at least one validation param, even for empty archives.
  // This sentinel cannot be a valid content slug and always renders notFound().
  return entries.length ? entries.map(({ slug }) => ({ slug })) : [{ slug: "__empty__" }];
}
