# Anthony's Desktop
## Personal Website & Portfolio Design Specification

**Version:** 0.5

**Status:** Design decisions confirmed, ready for wireframing  
**Primary URL:** anthonychung.me  
**Secondary URL:** anthonytchung.com (permanent redirect)

---

## 1. Product vision

Anthony's Desktop is a personal website inspired by Windows 7, the operating system on the family computer that first sparked my interest in technology.

The website combines a professional portfolio, personal journal, travel writing, and interactive experiments in a nostalgic digital environment.

**Core philosophy: Authentic in appearance, intuitive in behavior, playful in discovery.**

The website should be immediately understandable to a first-time visitor, while providing enough creativity and personality to reward exploration.

### Design priorities

1. **Accessibility of content:** Visitors can reach all major sections within one click from the homepage.
2. **Distinctive identity:** The Windows 7 aesthetic should feel genuine, rather than merely decorative.
3. **Personal storytelling:** The environment reflects my interests, background, and experiences.
4. **Reliability:** Navigation, browser history, window controls, and direct links behave predictably.
5. **Maintainability:** Blog posts, travel entries, and projects can be added without changing fundamental website functionality.

---

## 2. Confirmed design decisions

| ID | Decision | Confirmed choice |
|---|---|---|
| D01 | Primary domain | anthonychung.me |
| D02 | Wallpaper | Original Windows 7-inspired custom wallpaper |
| D03 | Landing experience | Desktop with Welcome window already open |
| D04 | Desktop icons | Fixed positions |
| D05 | Window management | One primary content window plus independent utility apps |
| D06 | Icon interaction | Single-click to open |
| D07 | Project presentation | Windows Explorer / modern project card hybrid |
| D08 | Blog naming | Journal, at `/blog` |
| D09 | Travel Logs | Dedicated section of the blog at `/travellogs` |
| D10 | Mobile | Mobile-first website with Windows visual identity; explore Windows Phone / Nokia-era design |
| D11 | Audio | Disabled by default, optional toggle |
| D12 | Playground | No interactive application required at launch |
| D13 | Origin story | Short Welcome reference, full story in About This Computer |
| D14 | Customization | Minimal at launch |
| D15 | Main window movement | Draggable on desktop; no dragging on mobile |

These choices form the baseline for implementation. Further changes should be made intentionally rather than introduced as incidental coding decisions.

---

## 3. Website information architecture

### Primary sections

| Section | Route | Purpose |
|---|---|---|
| Desktop | `/` | Main landing experience |
| Projects | `/projects` | Portfolio and technical case studies |
| Project details | `/projects/[slug]` | Individual project pages |
| About | `/about` | Biography, interests, personal background |
| Experience | `/experience` | Professional history |
| Resume | `/resume` | Resume preview and download |
| Journal | `/blog` | Personal writing and general blog entries |
| Journal entry | `/blog/[slug]` | Individual articles |
| Travel Logs | `/travellogs` | Dedicated travel and study abroad section |
| Travel entry | `/travellogs/[slug]` | Individual travel writing |
| Gilman | `/travellogs/gilman` | Scholarship-related information and resources |
| Contact | `/contact` | Contact details and social links |

The Playground can be introduced as `/playground` when an actual interactive experiment is ready.

### Navigation hierarchy

**Primary navigation:** Projects, About, Journal, Travel Logs, Resume

**Secondary navigation:** Experience, Contact, About This Computer

**Optional experiences:** Media Player, Photo Viewer, Paint, games, and other experimental applications.

Travel Logs shares the Journal's underlying content infrastructure but has its own homepage, navigation, and thematic presentation.

---

## 4. Desktop landing experience

### Initial state

On entering `/`, visitors see:

- Custom Windows 7-inspired wallpaper
- Fixed desktop icons
- Windows 7-style taskbar
- Start button and system clock
- An open Welcome window
- No loading screen, login requirement, or mandatory introduction

The desktop should be visually interesting without becoming crowded.

### Initial desktop icons

Recommended:

1. Projects
2. Journal
3. Travel Logs
4. About Me
5. Resume

Contact and Experience remain accessible from the Start menu and primary window navigation.

No Playground icon should appear until it contains something visitors can actually use.

### Welcome window

**Title:** Welcome to Anthony's Desktop

**Introduction:** Hey, I'm Anthony. I build software, explore ideas, and make things for the fun of it.

**Origin reference:** This desktop is a tribute to the computer that first sparked my interest in technology.

**Navigation actions:** View Projects, About Me, Read My Journal

**Optional discovery:** Why Windows 7?

The welcome window should convey who I am immediately and make navigation obvious.

Confirmed desktop behavior: closing Welcome dismisses it for the current tab
session, including refreshes, using sessionStorage. Start can reopen it, and a
fresh session shows it again. Navigation to another section always shows that
section, regardless of Welcome dismissal.
On mobile, the introduction is normal homepage content without window controls.

It should not require visitors to read a long personal introduction before exploring.

---

## 5. Window management

### Hybrid architecture

The website supports two categories of windows.

**Primary content window**

One main window displays the current route, including Projects, Journal, Travel Logs, About, Resume, and Experience.

Its content is synchronized with the browser URL.

**Utility windows**

Smaller, independent applications such as About This Computer, Media Player, and future experiments.

They may remain open while the visitor navigates between primary website sections.

### Main window behavior

- Opening a desktop shortcut navigates to the corresponding route.
- Opening another primary section replaces the current main content.
- Closing the main window returns the visitor to `/`.
- Minimizing hides the window while preserving its current route.
- Selecting its taskbar entry restores it.
- Navigating to a new route restores the main window automatically.
- The main content window can be dragged within the available desktop area.
- Maximizing expands the main content window to the available desktop area.
- Refreshing a content URL displays that content immediately.
- Direct external links never require navigating through the homepage first.

On direct page loads, the primary content window should be visible even when a previous session left it minimized.

### Utility window behavior

- Multiple different utility windows may be open.
- Opening an already-open utility focuses the existing instance.
- Utility windows can be dragged within the desktop bounds.
- Window stacking and focus are centrally managed.
- Utility windows do not change the primary browser route.
- Utility windows are not restored automatically after a page refresh in the MVP.

### Technical constraint

The desktop shell and utility window state should persist across internal route navigation.

The primary route remains the single source of truth for main content.

Do not build separate page navigation and desktop navigation systems.

---

## 6. Navigation and interaction

### Desktop shortcuts

- Single-click to open
- Clearly visible hover and selection states
- Keyboard accessible
- Fixed positions
- No draggable icons initially

### Start menu

The Start menu provides access to all major sections and the About This Computer application.

It should have authentic Windows 7 styling but only display actions that function.

### Taskbar

Required:
- Start button
- Main window taskbar entry
- Clock

Utility application taskbar entries appear when those applications are open.

Pinned shortcuts may be added when their behavior is clearly distinguished from open applications.

### Main content navigation

Every primary page includes consistent navigation, preferably styled as Windows Explorer breadcrumbs or a navigation sidebar.

The desktop is the environment, not an intermediate destination required for
navigation. Section links directly display their content and never act as window
closing actions. Explorer sidebars link to meaningful content sections, without
a redundant Desktop link.

Top-level breadcrumbs show only the current section, such as Projects or Journal,
with no Desktop ancestor or Up button. Nested content shows real content hierarchy:
Projects > Project Name, Journal > Article Name, or Travel Logs > Gilman. Only
actual parent content pages are links; the current page is labeled as current.

The title-bar controls keep their window behavior: Close reveals the desktop,
Minimize preserves the URL for taskbar restoration, and Maximize/Restore changes
window geometry. Empty project libraries use a subtle message without invented
projects or instructions to navigate elsewhere.

### Browser behavior

- Back and Forward navigate normally.
- Direct links work without prior client-side state.
- Reloading preserves the correct page.
- Blog and project links can be shared independently.
- Main content is readable and indexable without relying on utility windows.

---

## 7. Visual design

### Overall aesthetic

Windows 7 Aero, with original creative elements.

Required visual features:
- Recognizable blue Aero-inspired window frames
- Translucent title bars
- Soft shadows and gradients
- Glossy taskbar
- Familiar system-style icons
- Rounded desktop windows
- Windows Explorer-inspired navigation

### Wallpaper

Create an original wallpaper inspired by Windows 7's blue and green visual language.

It should feel immediately nostalgic without reproducing Microsoft's original artwork.

The wallpaper should support sufficient contrast for desktop icons and opened windows.

### Content styling

The Windows aesthetic should frame the content.

Long articles, travel entries, and case studies should use modern typography, readable line lengths, responsive images, and generous spacing.

### Audio

Interface sounds are off by default.

An optional settings toggle may enable short, appropriately licensed system-style sounds.

Sound preferences can be saved locally.

No automatic music playback.

### Customization

The initial website does not need wallpaper selection, icon dragging, themes, or a desktop settings application.

These remain possible future enhancements.

---

## 8. Projects and professional content

### Projects index

Use the Explorer/card hybrid.

The surrounding interface should resemble Windows File Explorer.

The central content area presents projects as readable cards containing:
- Project name
- Screenshot or thumbnail
- Short description
- Technologies
- Individual project link

A sidebar or breadcrumb navigation provides context.

### Individual projects

Each case study should include:
- Project overview
- Problem and motivation
- My role
- Implementation
- Technical or design decisions
- Screenshots or demonstration
- Results and lessons learned
- Relevant links

### Experience and resume

Keep Experience and Resume straightforward and accessible.

The Windows styling should enhance presentation without turning professional information into a puzzle.

The resume should be available as a downloadable PDF.

---

## 9. Journal and Travel Logs

### Journal

**Display name:** Journal  
**Route:** `/blog`  
**Desktop identity:** Notepad or writing folder

A flexible space for:
- Personal thoughts
- Technical writing
- Music and films
- Design ideas
- Recommendations
- Miscellaneous interests

### Travel Logs

**Display name:** Travel Logs  
**Route:** `/travellogs`

Travel Logs is a dedicated section of the larger writing ecosystem, not an unrelated second website.

It has:
- Its own landing page
- Destination and topic navigation
- Chronological travel entries
- Photographs
- Study abroad reflections
- Gilman Scholarship content
- Resources for prospective students

Visitors arriving from scholarship outreach should be able to navigate Travel Logs without using the desktop.

### Content system

Both Journal and Travel Logs use Markdown or MDX with structured metadata.

Travel entries include destination, travel dates, categories, and optional Gilman-related metadata.

This allows new writing to be published without building new page components.

### Gilman service project

The Gilman portion should include informative, reflective, and practically useful material.

If it serves as an official follow-on project, content and outreach should align with the approved service project.

Avoid treating passive publication alone as evidence of completed outreach.

---

## 10. About This Computer

A separate utility application inspired by Windows 7's system information interface.

### Purpose

Explain the personal motivation behind the website.

### Content

The full story of watching my father work on our family Windows 7 computer, becoming fascinated with technology, and eventually learning to develop software.

### Entry points

- "Why Windows 7?" in the Welcome window
- Start menu
- Optional About page link

### Interaction

The application opens as a smaller independent utility window.

It can be focused, moved, minimized, and closed without leaving the current page.

It should be discoverable but never mandatory.

---

## 11. Mobile design

Mobile is designed first as a website for a phone, with its own layout and
interaction patterns. Explore Windows Phone / Nokia-era typography, spacing,
accent colors, and touch-friendly navigation as references, while retaining
Windows 7-inspired visual elements. The desktop and mobile presentations share
URLs and content, but mobile does not simulate desktop window management.

Required:
- Recognizable wallpaper and visual identity
- Touch-friendly navigation
- Clear access to primary sections
- Full-width reading layouts
- Mobile-native navigation or section launcher
- No window dragging or minimize/maximize controls
- No overlapping application windows

The Journal and Travel Logs should prioritize reading and photography.

Direct links must work as well on mobile as on desktop.

---

## 12. Technical architecture

### Core stack

- Next.js App Router
- React
- TypeScript
- 7.css
- Scoped CSS Modules or equivalent
- Markdown / MDX
- GitHub
- Vercel or equivalent hosting

### Core components

**Desktop**
- DesktopShell
- DesktopShortcut
- Taskbar
- StartMenu
- WelcomeWindow

**Windows**
- ApplicationWindow
- WindowControls
- WindowManager
- UtilityWindowHost

**Content**
- ExplorerLayout
- ProjectCard
- ArticleLayout
- PhotoGallery
- BreadcrumbNavigation

**Utility applications**
- AboutThisComputer
- Future self-contained experimental applications

### State boundaries

**URL state:** Primary content and browser navigation.

**Desktop UI state:** Start menu and window visibility.

**Utility state:** Open applications, focus order, positions.

**Preference state:** Optional sound settings.

Keep these concerns separate to minimize synchronization bugs.

### Content storage

Use repository-based MDX files.

No database, custom CMS, authentication system, or complex backend is required for the MVP.

---

## 13. MVP scope and development phases

### Phase 1: Content and routes

Create a functioning Next.js website with Projects, About, Resume, Journal, and Travel Logs.

### Phase 2: Windows 7 shell

Build wallpaper, fixed desktop icons, taskbar, Start menu, and Welcome window.

### Phase 3: Main window navigation

Implement route-controlled main content window, minimize/maximize/close behavior, direct links, and history handling.

### Phase 4: Utility windows

Implement lightweight utility window management and About This Computer.

### Phase 5: Visual polish

Refine Aero styling, custom icons, animations, responsive behavior, accessibility, and performance.

### Phase 6: Content and release

Publish project case studies, personal writing, and initial Gilman Travel Logs.

Validate mobile, direct navigation, sharing previews, and domain redirects.

### Future phases

Media Player, Paint, games, desktop gadgets, travel maps, enhanced window management, and other experiments.

None are required for the first release.

---

## 14. Acceptance criteria

The MVP should satisfy the following:

- Visitors recognize the Windows 7 inspiration immediately.
- Projects are reachable in one click from the homepage.
- Journal and Travel Logs are reachable directly.
- A visitor can navigate without learning the desktop metaphor.
- The Welcome window is visible on initial entry.
- About This Computer explains the inspiration without blocking navigation.
- Direct links and browser history behave correctly.
- The mobile website is comfortable to use.
- Adding blog and travel entries requires no changes to core interface code.
- Optional utility windows cannot prevent access to core content.
- The website remains usable if animations, sound effects, or experimental applications fail.

**The website succeeds when it feels personal and unusual while remaining easier to navigate than its visual complexity suggests.**