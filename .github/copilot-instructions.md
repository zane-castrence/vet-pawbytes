# PawBytes (vet-pawbytes): Copilot instructions

React veterinary clinic appointment site (school capstone). Zane works on UI and design. Arsi works on the backend. Manuel is the systems analyst.

Before any UI task, read `docs/01-PROJECT-CONTEXT.md` and `docs/02-DESIGN-SYSTEM.md`. `docs/04-STATUS-AND-TODO.md` may be outdated, so trust the real code over it. Follow `docs/05-CHANGELOG-RULES.md` for changelog entries.

## Stack rules
- React (Create React App), Tailwind 3.4, react-router-dom v7. **JavaScript only (.js/.jsx), no TypeScript** (professor's rule).
- Relative imports only. The `@/` alias does not work.
- Animation: import from `motion/react` (not framer-motion). Always honor `useReducedMotion`.
- Icons: `lucide-react` 1.x (no brand icons). Icons only on app pages and the sidebar, never on marketing pages.
- UI components live in `src/components/ui/`. Reuse existing ones (`app-controls.js`, `data-table.js`, `Modal.js`, `FormField.js`) before writing new ones.
- Do not add dependencies without saying which and why.
- Never partial snippets: when showing code, show whole files and say which `src` folder each goes in.

## Design system (strict)
- Font: Figtree for all UI. Caveat Bold only for the oversized hero "PawBytes" wordmark.
- Colors: cobalt #2A3BD9 (dark #1F2DB0), green #047857 (hover #059669) for primary app buttons, text #1F2937 / #4B5563, border #D8DEE3, background #F9FAFB, tints #EEF2FF / #DCE5FF, danger #B91C1C / #FEF2F2. Accent colors are in `docs/02-DESIGN-SYSTEM.md`.
- Radius: pill for marketing buttons, 8px for app buttons and inputs, 20px for cards.
- One shadow only: `0 8px 24px rgba(28,51,46,0.12)`.
- Marketing pages: no icons, no gradients (exceptions are listed in the design system doc). Minimal copy.
- Functional UI is never tilted. Photo placeholders may tilt 3 to 8 degrees.
- Do not use shadcn/ui defaults, gray-default Tailwind palettes, or blue #0369A1 (retired).

## Design lock
- **Do not change existing layouts, colors, fonts, spacing, animations or copy.** Only change visuals when the task explicitly asks for it.
- `src/services/api.js`, `src/context/AuthContext.js` and `backend/` belong to Arsi. Only Arsi (backend work) may change them, and only for logic, never for layouts or designs. For anyone else, don't edit them; say what change is needed instead.
- Keep a `<footer>` in the DOM (Navbar reads it). Don't add `transform` or `filter` to AppShell ancestors (modals use `fixed inset-0`).

## Git
- Work on a feature branch (`feat/<name>`) and use PRs. Never force-push (`--force`).
- One commit per file, conventional style: `feat(pets): ...`, `refactor(app): ...`.
- Never commit `.env`, `node_modules/` or uploaded images.

## Components pasted from 21st.dev / React Bits
Convert to `.js`, use relative imports, remap colors, radius, fonts and shadow to the rules above, write own equivalents for missing helpers (`cn`, shadcn pieces), and add an entry at the end of `src/data/credits.js`: `{name, author, authorUrl, source, sourceUrl, usedIn}`. Use `AUTHOR` placeholders if unknown.

## Changelog
End every reply or PR description that changes code with a changelog entry in the format from `docs/05-CHANGELOG-RULES.md`.