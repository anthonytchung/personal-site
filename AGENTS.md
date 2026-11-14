<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# Anthony's Desktop - Codex Instructions

## Project
Build a personal portfolio at anthonychung.me inspired by Windows 7.

Read `docs/DESIGN.md` before making architectural or design decisions. Treat it as the product source of truth.

## Stack
- Next.js App Router
- React and TypeScript
- 7.css with scoped custom CSS
- MDX for Journal, Travel Logs, and project content
- Vercel deployment through GitHub

## Design
- Preserve a recognizable Windows 7 Aero aesthetic.
- Prioritize intuitive navigation and reliability.
- Desktop icons use single-click activation.
- Welcome window is open on the homepage.
- Main content follows Next.js routing.
- Utility windows have independent client-side state.
- Use a simplified interface on mobile.
- Keep Journal at /blog and Travel Logs at /travellogs.

## Engineering
- Build features incrementally.
- Avoid unnecessary dependencies.
- Keep the desktop shell separate from route content.
- Use reusable, strongly typed components.
- Support keyboard and touch navigation.
- Ensure direct URLs, refresh, and browser history work.
- Do not introduce paid services or a database without approval.
- Avoid rewriting unrelated working code.

## Quality
- Run lint and production build checks after significant changes.
- Fix errors rather than suppressing them.
- Summarize what changed and what was tested.
- Do not deploy or modify production settings without approval.

## Package Manager: Bun

- Use Bun exclusively for dependency management.
- Use `bun install` to install dependencies.
- Use `bun add` and `bun remove` for package changes.
- Use `bun run dev` for local development.
- Use `bun run build` for production builds.
- Use `bun run lint` for linting.
- Use `bunx` instead of `npx`.
- Commit `bun.lock` to Git.
- Do not generate npm, Yarn, or pnpm lockfiles.
- Maintain compatibility with Vercel deployments.


## Git and Development Workflow

### General Principles
- Follow established TypeScript, React, and Next.js best practices.
- Prefer simple, maintainable solutions over unnecessary abstractions.
- Preserve existing working behavior.
- Avoid unrelated changes or broad refactoring.
- Do not use `any` or suppress lint errors without justification.
- Maintain accessible, responsive interfaces.

### Before Completing a Task
1. Review `git status` and `git diff`.
2. Remove debugging statements and temporary code.
3. Check for security issues and accidentally included secrets.
4. Run `bun run lint`.
5. Run `bun run build`.
6. Run relevant automated tests.
7. Verify the requested feature works.
8. Summarize modifications and remaining limitations.

### Git Commits
- Create focused, meaningful commits after successful validation.
- Follow Conventional Commits:
  - `feat:` New functionality
  - `fix:` Bug fixes
  - `refactor:` Internal improvements
  - `style:` Visual/CSS changes
  - `docs:` Documentation changes
  - `test:` Testing changes
  - `chore:` Maintenance
- Use clear, descriptive commit messages.
- Never commit `.env` files, secrets, `node_modules`, or `.next`.
- Never use force-push or destructive Git commands without approval.
- Do not amend previous commits unless explicitly instructed.

### Branching and Deployment
- Use feature branches for significant changes.
- Keep `main` stable and deployable.
- Do not merge into `main` without approval.
- Do not automatically push or deploy unless requested.
- Prefer pull requests for reviewing significant changes.
- Report the commit hash and validation results.

### Package Manager
- Use Bun exclusively.
- Keep `bun.lock` committed.
- Do not introduce npm, Yarn, or pnpm lockfiles.
