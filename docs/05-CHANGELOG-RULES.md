# Changelog rule (works on any AI)

Every time you give code, changes or updates, end the reply with a **changelog entry** in a fenced markdown block, so it can be copied into `CHANGELOG.md` (kept in Obsidian or the Project, newest entry at the top).

Skip the entry if the reply has no code or file changes.

## Entry format

````markdown
## 2026-10-11 | feat/logout-confirm
**Files**
- `src/components/LogoutConfirm.js` (new)
- `src/components/AccountMenu.js` (replaced)

**What changed**
- Added logout confirmation dialog.
- AccountMenu now opens it before logging out.

**Commits (one per file)**
- `feat(auth): add logout confirmation`
- `refactor(account): confirm before logout`

**Credits to add**
- Logout Dialog, <author>, 21st.dev (or "none")

**Needs from others**
- (e.g. "Arsi: add updateProfile() to api.js") or "none"

**Not done / next**
- Test on iPhone; restyle MyAppointments next.
````

## Rules
- One entry per reply that changes code. Don't repeat old entries.
- List every file touched with `(new)` or `(replaced)`, using full `src/...` paths.
- Match the commit lines to the real files, one per file.
- Put anything that changes `STATUS-AND-TODO.md` (done items, new open items) under "Not done / next".
- When asked for a **handoff**, combine the recent entries and the current `04-STATUS-AND-TODO.md` into one file.

## Continuing in another account or AI
Paste into the new chat, in this order: `01-PROJECT-CONTEXT.md`, `02-DESIGN-SYSTEM.md`, `03-AI-RULES.md` (works for any AI, just paste it as the first message's rules), `04-STATUS-AND-TODO.md`, then the latest entries from `CHANGELOG.md`.
