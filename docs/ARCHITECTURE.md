# Anthony's Desktop architecture

Status: route foundation, visual desktop shell, and primary content window implemented; independent utility windows remain proposed.
The confirmed choices in DESIGN.md remain authoritative.

## Configuration review

The starter uses Next.js 16.4.6 App Router, React/React DOM 19.3.0,
strict TypeScript, ESLint 9 with Next core-web-vitals/TypeScript rules,
and Bun 1.3.14 with a committed bun.lock. Tailwind 4.3.3 is integrated
through the Turbopack loader, restricted to globals.css. The previous *.css
rule rewrote CSS Module extensions and lost class-name exports; native Next.js
CSS Module handling now applies to component styles. 7.css 0.21.1 is installed
with its scoped build imported once in the root layout. The server-only `@mdx-js/mdx` compiler renders local writing. No state library,
database, CMS, or drag library is installed.

The existing cacheComponents and partialPrefetching settings are retained.
The installed Next documentation explicitly supports their combination.
Cache Components also uses React Activity to preserve route state: do not
assume a page unmounts whenever navigation occurs. Partial prefetching may
resolve URL-dependent content after navigation; later detail pages need
appropriate loading boundaries and verified metadata behavior.

System fonts replace starter Google font downloads: Segoe UI where available,
with Tahoma/Arial fallbacks. CSS Modules own component styles; global CSS
contains only the existing Tailwind import and shared base rules. The scoped
7.css build styles window chrome under .win7; CSS Modules provide desktop,
Start, taskbar, and readable content styling.

## Implemented structure

```
app/
  layout.tsx                 HTML, metadata, persistent DesktopShell
  page.tsx                   Welcome content at /
  not-found.tsx              Unrecognized URLs
  globals.css                Global base styles
  projects/page.tsx
  about/page.tsx
  experience/page.tsx
  resume/page.tsx
  blog/page.tsx
  travellogs/page.tsx
  travellogs/gilman/page.tsx
  contact/page.tsx
components/
  desktop/
    desktop-shell.tsx         Persistent interactive desktop shell
    desktop-shell.module.css
    desktop-icon.tsx         Original vector icon illustrations
    start-menu.tsx           Accessible navigation disclosure
    system-clock.tsx         Client-local time after hydration
    welcome-session.ts       Session-backed Welcome dismissal
    welcome.module.css       Welcome content presentation
  content/
    explorer-layout.tsx      Shared navigation and single main landmark
    content-page.tsx         Heading and readable content width
    content.module.css
lib/
  navigation.ts              Shared section labels and hrefs
```

Route pages remain Server Components and pass rendered content into the client
DesktopShell. Every section has an ordinary URL, metadata, and readable HTML.
The homepage now has original SVG wallpaper and icons, scoped 7.css Aero chrome,
a default-open Welcome, pinned shortcuts, clock, and Start navigation. The primary window
has route-aware minimize/maximize/close controls and bounded dragging. Welcome
retains session-backed close/reopen behavior.
Mobile uses a flowing reading layout and tile navigation; desktop dismissal
never hides its introduction. No independent utility window manager is present.

The Why Windows 7 link goes to /about#why-windows-7 until the utility phase.
Projects has an Explorer navigation foundation and an explicit empty library;
Journal and Travel Logs share a working local MDX publishing foundation.
Resume and contact still have explicit content placeholders.

### Shared Explorer application shell

All primary content routes use one `components/content/explorer-layout.tsx`
Server Component and one `explorer-layout.module.css`. Projects previously had
its own complete Explorer wrapper while the remaining routes used the original
horizontal navigation and articles supplied a third breadcrumb treatment. These
presentation forks have been removed.

Routes now supply title, actual parent breadcrumbs, active section href, toolbar
content, and status information to the same layout. `ContentPage` wraps static
information pages; WritingArchive and WritingArticle wrap their existing content;
Projects supplies its browsing presentation. The layout owns the location bar,
section sidebar, toolbar, one main reading pane, and 7.css status bar. It does not
load MDX or infer article titles from URL segments. Article metadata and content
loaders are unchanged. There is no second navigation state or window manager.

DesktopShell passes server-rendered route children into the existing persistent
PrimaryWindow. Moving route chrome out of the client shell keeps content metadata
on the server. React Activity may retain hidden route trees, so window restoration
and route-change focus select the visible main pane rather than the first cached
main element. PrimaryWindow retains its existing movement and visibility state.

Non-home primary windows share a 900px by 680px default envelope, constrained to
the available desktop. The reading pane scrolls independently while location,
sidebar, toolbar, status, and title-bar controls stay available. The sidebar can
scroll separately on short desktops. Maximize/restore retains the same geometry
contract, and Welcome keeps its intentionally smaller introductory presentation.

Toolbars display relevant section context or real links such as the Gilman page
and article archive return. Status information contains real archive counts,
article publication dates, or page purpose; static information pages do not show
project counters. No filesystem commands, search boxes, or inactive actions are
simulated. On mobile the shell flows naturally, navigation wraps above content,
and the reading pane has no fixed height or internal scrolling.

`tests/explorer.spec.ts` checks all primary routes for common chrome, dimensions,
active sidebar links, and stable chrome during long reading. It captures desktop
and mobile screenshots of Projects, Journal, Travel Logs, and Gilman. Existing
window tests continue to cover movement, minimize/maximize, history, and refresh.

### Content navigation contract

The desktop is the environment, not an intermediate navigation destination.
Explorer navigation contains content links only; top-level breadcrumbs show the
current section without an Up control or Desktop ancestor. The existing nested
Gilman page links to its real Travel Logs parent. Future project and article
pages must supply their actual titles and link only to existing parent content
pages; do not infer titles or create parent links from arbitrary URL segments.
Unknown routes do not receive a fabricated breadcrumb hierarchy.

The shared ExplorerLayout renders the same breadcrumb location bar on every
primary route. Pages supply validated titles and real parents. All navigation
uses Next Links with current-page semantics and no additional navigation state.
Window controls retain their existing behavior independently of content links.
The Projects empty state is a quiet message with no fictional items.

## Proposed component boundaries

Keep app/layout.tsx as the persistent server layout. DesktopShell composes
wallpaper, DesktopShortcut links, a client WindowManager provider,
PrimaryContentWindow, UtilityWindowHost, Taskbar, and StartMenu. Place the
provider above both primary and utility windows, without a pathname key or
route template that remounts it. Pass server-rendered route children through
the client wrapper; never import article loaders into the client graph.

ApplicationWindow provides common visual chrome and accessible controls.
PrimaryContentWindow binds that chrome to route content; utility instances
use the same chrome with separate state. ExplorerLayout remains inside the
primary window. WelcomeWindow supplies the homepage presentation.

Use a small reducer/context for window actions, with typed utility IDs and
one instance per ID. Keep state ownership explicit:

| State | Owner | Persistence |
| --- | --- | --- |
| Primary content | Next.js URL/router | Direct links, reload, browser history |
| Main minimize/maximize; launcher visibility | Desktop UI | Internal navigation only |
| Utility instances, focus order, positions, minimize | WindowManager | Internal navigation only |
| Optional sound preference | Separate preference layer | Local storage, off by default |

Navigation uses Next Link and a shared navigation registry; utility actions
use buttons. Avoid parallel/intercepting routes: the design has one primary
content window and utilities that do not belong in the URL. Do not keep a
second current-page value in context or replace routing with conditional
rendering. Adding sections should not require editing a window reducer.

## Content structure

Journal and Travel Logs are implemented. Project content and utility apps remain
future work:

```
content/projects/*.mdx
content/journal/*.mdx         Local Journal entries
content/travellogs/*.mdx      Local travel entries; gilman is reserved
lib/content/                 Server-only loading and metadata validation
components/content/         ArticleLayout, ProjectCard, PhotoGallery, breadcrumbs
components/windows/         Manager, window chrome, controls, utility host
components/apps/            AboutThisComputer and later utilities
app/projects/[slug]/page.tsx
app/blog/[slug]/page.tsx
app/travellogs/[slug]/page.tsx
```

Journal and Travel Logs share one writing model and loader. Use a discriminated
kind (journal/travel) and structured title, slug, summary, publication date,
and categories; travel adds destination, travel dates, and optional Gilman
metadata. Give each entry one canonical detail URL based on kind, even if
Journal later includes travel entries in its listing. Validate duplicate
slugs and reserve `gilman` for the static resources page.

Generate static params from published content, await params as required by
this Next version, and call notFound for missing/unpublished entries. Use
shared loaders for page rendering and metadata. Repository MDX is trusted
author content; arbitrary user MDX must not be executed. Published writing slugs are generated statically. With Cache Components enabled,
empty archives return the internal `__empty__` validation param, which always
renders notFound; it is not published content. Article routes set
`ensureStatic = "navigation"` so unknown and draft URLs return an actual HTTP 404
instead of streaming a 200 fallback shell. No project detail route is included.

### Writing implementation

`lib/content/metadata.ts` defines and validates a discriminated Journal/travel
model. Entries export a plain `metadata` object from MDX: title, slug, date,
summary, categories, status, optional local cover with alt/dimensions, and travel
specific destination/start/end dates. Dates and slug syntax are validated;
duplicate slugs fail the build, including collisions with drafts. Only published
entries reach listings, static params, and detail lookup.

`lib/content/writing.ts` is guarded by `server-only`. Filesystem source reads use
Next's `use cache` (required for prerendering async filesystem I/O); React cache
shares MDX compilation during rendering. Compiled functions never enter Next's
serializable source cache or the client graph. Only trusted repository MDX is
evaluated. Content directories are explicitly included in server file tracing.

Shared WritingArchive/WritingArticle server components render both sections.
Journal uses document-like archive entries; Travel Logs adds destinations, date
ranges, photography, and editorial article headings. Nested article breadcrumbs
use validated titles and real archive parents in the shared location bar.
Article metadata includes canonical URLs, Open Graph, Twitter, and cover images.
MDX links use Next Link; standard images and Markdown elements have responsive
reading styles. The root metadata base is the confirmed primary domain.

Draft templates are intentionally unpublished. See [WRITING.md](./WRITING.md)
for exact authoring, photography, preview, and publication steps. The fixture
verification command builds synthetic entries temporarily, tests both routes,
removes fixtures, and rebuilds the real site. Metadata unit tests are separate
from Playwright. No CMS, search, comments, or additional windows are introduced.

## Risks and behavior contracts for window implementation

- Mounting providers inside pages or keyed layouts loses utilities on navigation.
  Keep the provider in the shared root shell. Avoid multiple root layouts.
- Initial HTML must show route content. Never initialize minimized state from
  storage; refreshing any content URL must reveal its primary window.
- Minimize changes visibility only, not the URL. Navigation (including history)
  restores content; clicking the current section must also restore it even if
  the pathname does not change. Explicitly handle that activation as well as
  route changes. Do not rely only on mount effects under React Activity.
- Closing primary content navigates to `/` explicitly, not router.back(), which
  could leave the site. Browser Back should still restore the preceding route.
- Keep maximization separate from route content. Utilities persist through
  primary navigation but reset on reload, as the specification requires.
- Define focus transfer on minimize/close and restoration. Hidden windows must
  leave the tab order; utilities must not trap access to main content. Dragging
  needs keyboard alternatives and viewport bounds; don't use dialog semantics
  for the ordinary primary reading surface.
- Mobile uses the same routes and content tree, flowing full-width with normal
  document scrolling. Do not render a second mobile app with independent state.
  Avoid fixed desktop heights clipping articles, stacked windows, or mandatory
  dragging. CSS handles layout; interactive viewport changes need state rules.
- A clock and saved preferences must hydrate without server/client locale or
  time mismatches. Add them only with the shell phase.
- Before release: add real content, resume PDF, canonical/share metadata,
  sitemap, final assets, and host-aware permanent secondary-domain redirect.
  Do not install a blanket redirect that loops on the primary domain or local dev.

## Design direction after review

### Welcome dismissal — confirmed and implemented

Closing Welcome at `/` sets a sessionStorage dismissal flag, so it stays closed
through refreshes in that tab. Start's Welcome link clears the flag and restores
it. A fresh session starts with Welcome open. If storage is unavailable, an
in-memory fallback keeps controls usable for the current page lifecycle.

Dismissal does not change the URL or add browser history; Back does not undo
it. Route content remains visible on all other URLs. Mobile always shows the
introduction as homepage content, with no window controls. The server renders
Welcome initially and the session snapshot is read after hydration, so a dismissed
Welcome may briefly appear during a reload before hydration completes. No
localStorage or cross-session preference is used. Browsers can copy sessionStorage
when duplicating a tab; such a duplicate may inherit dismissal.

### Mobile — confirmed independent presentation

Design mobile first as a website for a phone, with Windows visual references.
Desktop retains Windows 7 Aero. Explore Windows Phone / Nokia-era Metro for
mobile: expressive typography, generous spacing, accent color, and large
labeled navigation tiles. Preserve Windows 7 identity through restrained blue
and green accents rather than squeezing window chrome onto a phone.

Microsoft's historical design guidance emphasizes content and typography,
with Panorama/Pivot navigation patterns. Borrow the visual principles; use
ordinary visible web links and vertical reading flow. Do not require horizontal
swiping, clipped headings, animated Live Tiles, or simulated phone hardware.
These are design references, not a dependency on obsolete platform APIs:

- [Windows Phone design team introduction](https://blogs.windows.com/windowsdeveloper/2010/11/03/windows-phone-design-team-joining-the-conversation/)
- [Translating design principles to Windows Phone](https://learn.microsoft.com/en-us/archive/msdn-magazine/2011/december/windows-phone-how-to-translate-common-design-principles-to-the-windows-phone)

Shared URLs, content loaders, and navigation definitions support distinct
mobile and desktop chrome. Use one rendered route-content subtree; different
presentation does not require duplicate page implementations or separate
routing. Mobile has no minimize/maximize controls, dragging, or overlapping
windows. Desktop minimization must never hide mobile route content.
About This Computer can be a full-width disclosure/panel with an explicit
return action; its final mobile presentation remains a wireframing choice.
On return to desktop, retain in-memory geometry but clamp it to current bounds.
Use available space and input capability, not user-agent sniffing, to adapt.

### Main window — draggable on desktop

Anthony wants both primary and utility windows draggable. Start the primary
window centered; preserve its position through internal route navigation and
reset on reload. Keep maximize/restore geometry separate. No resizing,
snapping, or dragging out of maximized mode is required for the first version.

Treat 7.css as a visual skin. A separate outer positioning element owns window
coordinates, bounds, and stacking; the inner element owns library classes and
Aero decoration. This reduces CSS coupling but does not guarantee freedom from
conflicts. Inspect the actual library styles before integrating them; no cause
for the previously reported dragging bugs has been established.

Use a small Pointer Events drag controller with pointer capture on a dedicated
title-bar handle. Exclude buttons and links from drag initiation; handle pointer
cancellation and lost capture. Restrict selection/touch-action changes to the
handle. Keep the title bar reachable above the taskbar and reclamp on viewport
resize, zoom, and maximize restoration. Provide a keyboard movement mechanism
and a reset-position action. Mobile uses ordinary document scrolling.

Before accepting dragging, verify controls do not initiate drags, pointer
release outside the handle ends dragging, long content still scrolls, windows
cannot become unreachable, maximize/restore preserves geometry, and desktop
positions never affect mobile layout. Model capability alone is not evidence
that these interactions work; targeted browser tests are required.

Primary controls and dragging are implemented in `components/windows/`.
`PrimaryWindow` owns chrome and reading-container focus; `useWindowPosition`
owns coordinates, pointer capture, cancellation, keyboard movement, and bounds.
The persistent DesktopShell resets minimization when the pathname changes and
uses Link's onNavigate to restore same-section activations. Content close pushes
`/`, preserving any existing Welcome dismissal. Reload resets geometry and
minimization, while Welcome dismissal continues to follow sessionStorage.

Arrow keys move the focused title bar (Shift uses one-pixel steps), Home centers
it, and Escape cancels a drag. The icon at the left of the title bar also centers
the window. Maximized windows must be restored before dragging. Mobile ignores
desktop geometry and hidden state. ResizeObserver reclamps stored positions after
viewport/content-size changes. Long desktop content scrolls inside the main reading pane;
mobile uses normal document scrolling. Independent utility apps remain deferred.

## Verification

Run `bun run lint` and `bun run build` (including Next's TypeScript check).
Smoke-check all landing URLs and unknown detail URLs against the production
server. Before the window phase is accepted, add interaction coverage for
navigate while minimized, same-route restore, Back/Forward, close-to-home,
refresh while minimized, utility persistence, keyboard focus, and mobile resize.

## Visual milestone validation

Production browser checks passed at 1920×1080, 1440×900, 1366×768, 1024×768,
and 800×600: no desktop document overflow; shortcuts and Welcome fit above the
taskbar. At 390×844 the mobile layout has no horizontal overflow and its content
remains visible after desktop dismissal. All nine landing routes and an unknown
URL returned the expected 200/404 statuses. Browser checks covered Start focus,
Escape and outside-click dismissal, keyboard activation, Welcome session
persistence and reopening, minimize/restore, maximize/restore, and browser Back.
The production browser reported no runtime errors. Lint and build passed.

## Primary-window milestone validation

`bun run test:e2e` runs the committed Playwright suite against a production build.
It covers same-route and new-route restoration, close-to-desktop, Back/Forward,
direct loads and refresh, Welcome persistence, pointer and keyboard movement,
maximize/restore geometry, viewport bounds, mobile transitions, and long content.
Assertions wait for committed route content and asynchronous resize reconciliation.
