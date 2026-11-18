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

The optional command bar contains functioning actions only, such as the Gilman
Scholarship link or article archive return. Routes without useful actions omit
the bar entirely, without reserved height. Descriptive section subtitles do not
belong in the command bar. Status information contains real archive counts,
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
reset on reload. Keep maximize/restore geometry separate. Primary resizing is
implemented below; snapping and dragging out of maximized mode remain deferred.

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

### Bounded primary resizing

`useWindowPosition` owns restored size and position together, extending the
existing pointer controller with move/resize gestures. The bottom-right button
captures the pointer and resizes each axis independently, anchored at the
top-left corner. Limits are 520 × 360 pixels or the available desktop space,
whichever is smaller, with an 8-pixel inset above the taskbar. Arrow keys on the
grip resize by 10 pixels; Shift uses 1 pixel. Escape/pointer cancellation restores
the geometry from before the gesture. Lost capture or pointer release ends it.

CSS variables apply dimensions to the existing frame and window skin. Maximizing
temporarily overrides those dimensions; it never writes over the restored size.
ResizeObserver reconciles both size and position when desktop bounds change or
when restoring a hidden/maximized window. Frame-size observation must not end an
active resize gesture. Mobile ignores these variables and hides the grip, while
keeping desktop geometry in memory. Reload resets geometry as before.

The main reading pane remains a programmatic focus destination on navigation and
taskbar restoration. Its outline is suppressed specifically because it is a
noninteractive reading container; focus is still transferred for assistive
technology. Links, the resize grip, title bar, and other controls retain keyboard
focus indicators. `tests/resizing.spec.ts` covers these contracts together with
navigation persistence, viewport constraints, and internal reading scroll.

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

## Aero quality pass

The persistent shell still owns one route-driven window. Its taskbar button now
minimizes the visible window and restores a minimized one. Pinned links omit the
current section so it has only one taskbar representation; other pinned links
remain plain navigation. Experience and Contact use the existing original icons,
and Gilman's taskbar/title-bar label reflects the nested route.

Show Desktop is a button, not navigation. It toggles the existing minimized state
without changing URL, history, scroll position, or geometry. It is disabled when
Welcome is dismissed and hidden on mobile. With only one primary window, no
second visibility store or window manager is needed. Future utility windows will
need a snapshot of all previously visible windows before extending this action.

The taskbar preview uses navigation summaries and existing icons, not screenshots
or duplicated route content. It appears on keyboard focus or fine-pointer hover;
Escape dismisses it even when keyboard focus is elsewhere. It is supplementary
visual information; the taskbar button announces its current action. Preview and
Start motion obey the existing reduced-motion rule. Start retains ordinary link
semantics and Tab navigation, with Arrow Up/Down and Home/End shortcuts, a profile
link, current-page feedback, and the existing Escape/outside dismissal.

Double-clicking the title-bar drag handle invokes the same maximize/restore
callback as its button. Pointer resizing, keyboard geometry controls, and the
position controller are unchanged. Restoration schedules reading-pane focus but
checks that the user has not already selected another control. The workspace now
forms an explicit stacking context above the wallpaper signature, while empty
workspace areas pass pointer events through to desktop shortcuts.

The window body is an inline-size container on desktop. Explorer spacing,
sidebar width, About cards, Experience padding, and heading sizes respond to
custom window dimensions. The desktop sidebar remains independently scrollable
at minimum height; mobile retains natural document scrolling and touch targets.

The Welcome session snapshot remains hydration-safe and server-rendered. Its
known dismissed-on-reload flash is not masked by hiding the introduction or by
adding an early DOM mutation script. Snap, hover Peek, launcher search, calendar
flyouts, and animated closing remain deferred; none is needed for access to the
existing content. No dependencies, assets, route structure, or MDX loaders changed.

### Quality-pass validation

`bun run lint`, `bun run build`, and all 13 unit tests passed. The full production
Playwright run passed 44 tests; its two fixture-only article tests were skipped
as designed, then both passed in `bun run test:writing` (four tests total). That
command removed its temporary MDX files and rebuilt the real production output.
All eight existing resizing tests remain unchanged and pass.

New browser coverage includes taskbar toggling, hover-preview Escape dismissal,
Show Desktop preserving reading scroll and geometry, same-section focus,
title-bar double-click, Start arrow/Home/End navigation, reduced motion, and
minimum-size windows. Screenshot/overflow sweeps cover all nine landing routes
at 1440×900, 800×600, 390×844, and 320×568, plus Start at 720×420 and resized
520×360 windows. Existing tests also cover 1920×1080, 1366×768, history, direct
URLs, refresh, pointer cancellation, and mobile/desktop transitions. Desktop and
mobile route contact sheets, Start, and taskbar preview screenshots were visually
reviewed. Browser automation used the configured Chromium runner, not Safari or
Firefox; cross-browser verification remains a release check.

Remaining issues by impact: existing unfinished portfolio/resume/contact/Gilman
content is the primary launch limitation; the Welcome dismissal flash is a minor
cosmetic limitation. No failing behavior was identified in this pass's browser
coverage. The Aero frame, original icons/wallpaper, title controls, and existing
bounded movement/resizing were retained rather than replaced.

## Calendar and desktop Peek

SystemClock now owns a transient date/time flyout. The trigger remains
hydration-safe; dates and clock hands use the browser's local time. The default
month follows today, while explicit month navigation remains fixed until Today
or reopening resets it. Month arithmetic starts at day one to avoid month-end
rollover. The nonmodal dialog has ordinary Tab navigation, labeled month controls,
a semantic calendar table, today's date marker, and Close/Escape focus return.
Outside pointer activation or focus leaving dismisses it. Mobile uses larger
controls and a single calendar pane; the analog clock is desktop-only.

Show Desktop hover uses a CSS visual treatment gated by desktop width, hover
capability and a fine primary pointer. Leaving restores opacity immediately;
there is no animation, including under reduced motion. Click keeps the existing
minimize/restore contract. No URL, focus, scroll or geometry state changes during
Peek, and touch-only pointers do not enable it.

Top-edge Snap remains deferred after controller inspection. The existing
`useWindowPosition` effect tears down active capture when its disabled state
changes (including maximize). Reliable drag-away restoration would need a gesture
transition that retains capture, restores clamped geometry, and defines Escape,
pointer cancellation and viewport-change rollback across that transition. Adding
only top-edge maximize would leave the paired drag-away behavior incomplete.
This milestone therefore preserves the validated controller rather than adding
half of Snap. No second window manager or new dependencies were introduced.

### Calendar and Peek reference refinement

The fidelity pass used the actual flyout screenshot in Hitesh Sarda's
[21 February 2010 Windows 7 post](https://hitesh.in/2010/windows-7-hidden-features/)
(`images/image_thumb14.png`, showing additional clocks) and the Peek screenshot
in [DevCurry's December 2009 post](https://www.devcurry.com/2009/12/show-desktop-and-aero-peek-feature-in.html).
These were inspected as references only; no Microsoft bitmap or SVG is bundled.

The calendar now has a narrow six-pixel glass frame around a white interior,
centered blue full date, compact calendar at left, and an original beveled SVG
clock at right. Its minute ticks, tapered hands, seconds hand and weekday text
replace the previous flat clock. A pale footer retains the functioning Today
command in place of the native settings link. The native screenshot's additional
clocks and date-zoom views are outside this component's scope; the existing local
timezone label, explicit close control, and larger mobile controls are retained.
Day cells remain read-only: the blue/dotted current-day treatment does not imply
an unsupported date selection or setting action.

Peek now hides the window's direct contents visually and removes the normal
frame surfaces. An empty, pointer-transparent pseudo-element on the positioning frame follows
the actual window bounds and corner radius. During Peek only, 7.css's glass
pseudo-elements are hidden, including their backdrop blur, so wallpaper remains
clear rather than blurred or covered by ghost text. Normal window glass is
unchanged. Geometry, routing and focus state do not change; leaving
restores the window immediately. Existing hover/pointer and mobile gates remain.
No animation was introduced, so reduced motion also remains immediate.

### Taskbar reference refinement

Taskbar styling was compared directly with the January 2009 large/small-icon
[measurement screenshot](https://istartedsomething.com/20090105/measuring-up-windows-7s-new-super-taskbar/)
and Microsoft's historical [Windows 7 taskbar illustration and guidance](https://learn.microsoft.com/en-us/windows/win32/uxguide/winenv-taskbar).
The former documents a 60-pixel large-icon slot and a smaller Start orb;
the latter illustrates running-button borders and Aero preview chrome. References
were inspected only; no Microsoft artwork is included.

The previous mix of 32-pixel pinned icons and a 24-pixel labeled running button
now uses 32-pixel icons throughout desktop taskbar applications. The running
button is a compact icon slot; its route label remains in the accessible name,
native tooltip, and preview. Pinned links retain navigation behavior, and the
running button retains minimize/restore. State distinctions use inset light/dark
borders, a stronger active reflection, bottom-centered hover illumination, and
pressed shading. The taskbar strip has more restrained reflections and glass;
the original CSS orb has a smaller silhouette and a separate upper reflection.
Clock line spacing/type size and Show Desktop shading were also refined.

The existing 46-pixel desktop taskbar height is retained to avoid changing the
window-bounds contract (the native screenshot documents a 40-pixel large-icon
bar). Mobile keeps the labeled Start control and 56-pixel bar. Preview content is
still a useful summary rather than a real thumbnail; its glass frame and spacing
are tighter. Stable native pinned/program grouping, Jump Lists and fabricated
volume/network indicators were not introduced. Existing pinned destinations
still omit the current section, so their positions may shift during navigation.
The original vector icons and four-color CSS Start artwork are interpretations,
not reproductions of Microsoft's assets.

## Start and Explorer fidelity milestone

Reference review used the actual Start menu screenshot on page 20 of Microsoft
Press's April 2009 [Explore Windows 7 chapter](https://download.microsoft.com/download/9/a/3/9a36304d-cb64-427e-a184-4ed1bb556712/win7_sbs_earlycontent_ch1.pdf),
and the [October 2009 Explorer screenshot](https://www.matthewb.id.au/computer/Windows_7_Review.html)
(`Windows7_Libraries.jpg`). The screenshots were inspected as references only;
all rendered icons, shortcut arrows and CSS remain original. The supplied chat
screenshots were supporting context, not additional feature requirements.

The ranked audit prioritized Explorer icon rows/selection (impact 5, usefulness
4, complexity 2), Start layout/search (5/5/3), compact breadcrumbs (4/3/2),
shortcut feedback (3/3/1), title glow/inactive cues (3/2/2), then the development
indicator (3/3/1), on five-point scales. Browser-history controls ranked 3/3/4
and remain deferred: correct availability across direct loads/external history
requires tracking beyond a pair of decorative buttons. Ordinary browser history
remains unchanged. No fake filesystem ancestors, redundant Desktop links,
Shutdown command, expansion arrows, or Explorer search field were added.

Start retains its ordinary navigation disclosure, two columns and first-link
focus. Its darker system column, inset selection treatments, compact program
rows and bottom search field borrow the historical visual organization. The
existing user removal of the footer tagline is preserved by replacing the empty
footer with useful search. Typing while a navigation link is focused moves into
search; Arrow Down enters results, Enter follows the first result, and Escape
retains dismissal/focus return. Text-input Home/End remain editing operations.
Results are ordinary Next links; the right column remains accessible. Reopening
clears the query. Mobile retains large input/link targets instead of copying
native desktop metrics.

The root server layout supplies a cached, serializable list of published article
titles, summaries and canonical local paths. It reuses the existing MDX loader's
published-only filtering; article bodies, compiled components and draft metadata
never enter the search props. Static route labels/summaries come from the shared
navigation registry. Search is a small client substring filter over title and
summary words, not full-text article indexing. No API endpoint, dependency or
external service is required. The shared icon registry was moved out of the
Start client entry point so server Explorer navigation can use the same artwork.

Explorer now has compact icon/label rows on desktop, distinct pale hover and
blue current-section treatments, indentation, a subtle secondary-group separator,
and smaller breadcrumb segments with functioning parent links. It keeps the
existing independent sidebar/reading scrolling, command-bar omission and mobile
flow. Shortcut arrows are original small bent-arrow SVGs; keyboard focus uses an
inset dotted highlight and shaded label. Single-click activation is unchanged.
Window title text has a softer multilevel glow, reduced while Start is open,
with a more neutral frame tint. No movement/resizing or visibility controller
changed; this is not a new general window-activation manager.

The pre-existing `devIndicators: false` edit is retained and committed as part of
the explicitly requested cleanup. The installed Next.js docs confirm this is the
supported option and does not suppress compile/runtime errors. Actual localhost
development inspection confirmed the badge has no visible bounds and Start is
uncovered; no allowed-origin or production configuration changes were added.

Validation: production build, lint and 13 unit tests passed. Full Playwright:
55 passed, with the two fixture-only cases skipped by design. The separate
writing-fixture run passed all four cases, including published article search in
both Journal and Travel Logs, then removed fixtures and rebuilt the real site.
New desktop/mobile search checks cover routes, keyboard activation, reset, no
results and draft exclusion. Existing resizing, history, taskbar, calendar and
Peek regressions pass. Before/after screenshots cover Explorer, Start, a 520px
manually resized window and mobile; a separate development screenshot shows a
live search result and no development indicator over Start.
