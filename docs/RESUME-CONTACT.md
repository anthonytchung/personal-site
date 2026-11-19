# Resume and Contact

## Published assets

- PDF: `public/documents/anthony-chung-resume.pdf`, served directly at
  `/documents/anthony-chung-resume.pdf` without the desktop shell.
- Preview: `app/resume/resume-preview.png`, rendered from the supplied PDF at
  144 dpi. This is an image of the actual document, not a reconstructed resume.
- Source: Anthony's supplied `Anthony_Chung_Resume_202609.pdf`. The repository
  copy is unchanged, including its contact information, phone number and location.
  The current PDF is tagged, one page, 196669 bytes, and contains no JavaScript.

The Resume page uses the existing Explorer shell and offers View PDF, Download
PDF and Open in New Tab. Desktop shows a paper preview linked to the PDF; mobile
shows the direct actions without a tiny embedded document or extra window UI.
The original PDF remains available for selectable text, native zoom/printing and
assistive technology. No PDF capture/viewer package is required.

Replace the PDF and preview together. To regenerate the current one-page preview
with Poppler:

```sh
pdftoppm -f 1 -l 1 -r 144 -png -singlefile public/documents/anthony-chung-resume.pdf app/resume/resume-preview
```

If a replacement changes the page count, update the page metadata and preview
presentation as well. File size is read from the real asset. The cached server
file check follows the existing repository file-reading pattern; the production
output trace includes the PDF. A missing file produces a short unavailable state
with no broken action links or stale preview. Unexpected filesystem errors are
not silently treated as a missing resume.

## Verified contact configuration

`lib/contact.ts` contains the email, LinkedIn and GitHub from the supplied resume.
Anthony explicitly confirmed these as his preferred public details on November
19, 2026. No additional social handles or telephone contact action were inferred.
The page contains mailto and external profile links, plus a small Clipboard API
button with live success/error feedback and a manual-copy fallback. There is no
contact form, backend, external service or new dependency.

## Publication readiness

No additional personal details or assets are required for these two pages. The
resume is supplied and the three Contact details are confirmed. Future changes
should use Anthony's approved replacement PDF or explicit contact preferences;
this milestone does not populate Experience or other biography sections.

## Validation

Focused Playwright checks cover the real PDF response/bytes, file download,
native current-tab and new-tab viewing, direct route loading, history, desktop
preview, mobile action targets, approved contact links, keyboard copying and a
rejected clipboard operation. These tests use full Chromium for native PDF
viewing; the default headless shell downloads PDFs instead of displaying them.
See [Playwright browser documentation](https://playwright.dev/docs/browsers#chromium-new-headless-mode).

The missing-PDF state was checked separately against a production build with the
asset temporarily removed, then the exact original bytes were restored and the
real site rebuilt. Desktop/maximized and mobile screenshots were inspected.

Final checks: lint and production build passed; 13 unit tests passed. Full
Playwright: 67 passed, two published-content fixture cases skipped by design.
No shell, window-controller, calendar, taskbar, routing or dependency changes
were required. This feature branch builds on the completed PR #5 work.
