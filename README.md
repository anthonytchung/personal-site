# Anthony's Desktop

A Windows 7-inspired personal portfolio built with Next.js App Router,
React, TypeScript, and CSS Modules. The current implementation is the route
foundation, visual desktop shell, and primary-window milestone, with explicit placeholders for
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
utility-window management, MDX ingestion, and final content remain future phases.
The primary window supports route-aware controls, bounded dragging, keyboard
movement, and mobile reading layouts.

## Browser tests

Install Chromium once with `bunx playwright install chromium`, then run:

```sh
bun run build
bun run test:e2e
```

Playwright starts a production server on port 3108. Tests cover window controls,
dragging, keyboard movement, history, session persistence, route loading, long
content scrolling, and desktop/mobile layout. Generated traces and reports are
ignored by Git.
