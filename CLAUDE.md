# Project notes for Claude

**The Cloaked Oath** — a 2D top-down pixel-art mystery RPG. Pure HTML/CSS/JS ES
modules, no build step, GitHub Pages-ready. All art is generated programmatically
via Canvas (no external assets). See `README.md` for architecture and the
integration guide.

## Git workflow

- **Default: commit straight to `main`** with a short, descriptive subject line
  (imperative, e.g. "Tighten town layout and add props"). No PRs, no feature
  branches for ordinary work.
- **At the start of feature work, say which approach I'll use and why** — a quick
  one-line suggestion before diving in, so it can be overridden. This applies when
  I recognize a **new feature** or an **update to an existing feature**.
- **Suggest a branch only when the work genuinely needs isolation**, e.g.:
  - risky/experimental changes that might be thrown away
  - large multi-step work I want to land as one reviewable unit
  - anything that must pass CI / a deploy gate before reaching `main`
  - work done in parallel with other unfinished changes on `main`
  Otherwise default to a direct commit.
- Commit only when asked. Don't push unless asked (pushing `main` is fine when a
  commit is requested, since that's the working branch).
- Leave the macOS `.DS_Store` out of commits (it's gitignored).
