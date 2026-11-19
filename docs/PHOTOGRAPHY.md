# Travel photographs and Photo Viewer

## Files and article

1. Create a folder for your real photographs under `public/images/travel/`:
   `public/images/travel/your-trip/photo-01.jpg`, for example. JPG, PNG, WebP and
   AVIF can be displayed directly. Use web-sized originals rather than RAW files.
2. Create an article by copying `content/travellogs/template.mdx` to
   `content/travellogs/your-trip.mdx`. Follow [WRITING.md](./WRITING.md) for the
   required metadata. Keep `status: "draft"` until your actual text and photographs
   are ready. The metadata slug controls the URL.
3. Put a `PhotoGallery` in the MDX body. It is registered automatically; no import
   is needed. Paths start with `/images/`, not `public/`.

```mdx
<PhotoGallery
  label="Trip photographs"
  photos={[
    {
      src: "/images/travel/your-trip/photo-01.jpg",
      alt: "Replace this with an accurate description of your photograph",
      width: 2400,
      height: 1600,
      caption: "Your actual caption",
    },
    {
      src: "/images/travel/your-trip/photo-02.jpg",
      alt: "Describe what is visible in your second photograph",
      width: 1600,
      height: 2400,
    },
  ]}
/>
```

The filenames, descriptions and dimensions above are examples. Replace them with
real files, descriptive alt text and the files' actual pixel dimensions. Do not
publish the example as a story. A single photograph uses the same component with
one array entry; navigation/slideshow controls are then disabled.

Optional fields on each photograph:

| Field | Meaning |
|---|---|
| `title` | Short window title; otherwise the public filename is used |
| `caption` | Your caption, shown in the article and viewer |
| `location` | A location you explicitly supply |
| `takenAt` | Date/time text you explicitly supply; displayed as written |
| `camera` | Camera information you explicitly supply |

No EXIF extraction, location inference, remote hosting or processing service is
used. Omit metadata you do not know. Alt text is required even when there is a
caption. The gallery rejects empty lists, non-local paths and invalid dimensions.
Ordinary Markdown images, existing covers and their social metadata remain
unchanged; use `PhotoGallery` where you want this viewer. The component also works
in Journal MDX, although Travel Logs is its primary use.

## Viewing

A gallery link opens an independent Photo Viewer with the article's URL and
reading position preserved. With JavaScript unavailable, it is an ordinary link
to the original image. Modified clicks retain normal new-tab behavior.

- Previous/Next and Left/Right navigate within that gallery and wrap at its ends.
- Zoom to fit shows the whole image without upscaling a smaller original.
- Actual size uses the original pixel size; scroll the image pane to pan.
- Slideshow is opt-in and advances within the viewer every five seconds. It pauses while the window is
  inactive/minimized or the browser tab is hidden, and is disabled for reduced
  motion. There are no animated photo transitions.
- Escape pauses a running slideshow from the content/controls, then closes the
  viewer. The title-bar movement controller still consumes Escape to cancel a
  drag. Closing returns focus to the gallery without moving the article.
- Minimize, taskbar restore/thumbnail, movement, resizing, maximize and Show
  Desktop reuse the existing independent-window frame and state. Navigation does
  not change the photograph or create extra browser-history entries.

On mobile the same application is a full-screen modal, with 44px controls, a
Close action, native image-pane scrolling, a focus loop, inert background and
body-scroll restoration. Mobile browser history reveals route content and
minimizes the viewer. Desktop/mobile viewport changes release modal state and
retain the selected photograph.

## References and deliberate adaptations

The visual reference is the Windows Photo Viewer screenshot on printed page 19
of Wiley's [Windows 7 Digital Classroom excerpt](https://catalogimages.wiley.com/images/db/pdf/9780470568026.excerpt.pdf).
The publisher's PDF metadata records creation/modification in November/December
2009. The screenshot was inspected as a reference, not used as an asset. The
pale canvas, compact top command strip, Aero frame, lower glass toolbar, grouped
navigation and blue round slideshow control follow that layout. All controls,
icons and CSS here are original.

The reference's File/Print/E-mail/Burn menus, rotation and deletion controls are
omitted because this is a read-only website gallery. Open original is a real web
action. Captions/metadata are an added narrow strip, as requested. The toolbar
uses explicit fit/actual-size controls rather than an unimplemented zoom menu.
Mobile deliberately uses a dark, full-screen reading surface instead of copying
tiny desktop chrome. Desktop slideshow stays in the utility rather than launching
the native application's separate full-screen slideshow. This is an adaptation,
not an exact native OS replica.

## Test content and release checks

`bun run test:writing` creates temporary synthetic galleries and chart images
from `tests/fixtures/`, builds the site and runs writing/Photo Viewer tests. A
`finally` block removes the articles and copied image directory and rebuilds the
real site. Existing files at the fixture paths are never overwritten. Do not
interrupt this command during cleanup. If interrupted, inspect and remove only
the generated `publishing-verification-fixture.mdx` files and
`public/images/__photo-viewer-fixtures/`, then rebuild.

The chart images are explicitly labeled synthetic; they are not travel
photographs or personal stories. No real travel photography has been supplied or
published by this milestone. You must supply your own photographs, alt text,
actual dimensions and article metadata/body before publishing a travel gallery.
Captions and other photograph metadata are optional.
