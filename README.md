# Anthony's Desktop

A Windows 7-inspired personal portfolio built with Next.js App Router,
React, TypeScript, and CSS Modules. The current implementation is the route
foundation and first visual desktop milestone, with explicit placeholders for
future portfolio content.

Read [the design specification](docs/DESIGN.md) and
[architecture proposal](docs/ARCHITECTURE.md) before extending the site.
Read the installed Next.js guides as required by AGENTS.md.

## Development

Use Bun 1.3.14 and the committed lockfile:

```sh
bun install --frozen-lockfile
bun run dev
```

## Checks

```sh
bun run lint
bun run build
bun run start
```

The build includes TypeScript validation. The homepage uses scoped 7.css, original
wallpaper and icons, an accessible Start menu, and a session-aware Welcome. Full
window management, dragging, MDX ingestion, and final content remain future phases.
