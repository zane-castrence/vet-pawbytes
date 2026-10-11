# PawBytes: Status and to-do

Updated 2026-10-11. Update this at the end of each thread.

## Done
- Parallax hero, Home, Footer, Credits page, Services (spotlight cards), Auth redesign (dot grid), glass Navbar, Testimonials.
- AppShell with sidebar, rounded main card and top bar for logged-in users on `lg+`.
- AccountMenu (Settings + Log out), Settings page (read-only), pet cards with photo, booking wizard, pet add/edit/delete.
- Services overview page: AnimatedBanner (greeting + next-visit countdown), AppointmentCards for upcoming visits, ServiceCard grid.
- `.devcontainer/devcontainer.json` for Codespaces (Node 20, `npm install`, port 3000).
- `credits.js` entries added for Animated Banner and Appointment Card (author and link placeholders).
- Design system doc (`02`) synced with the real palette.
- Repo hygiene, committed on `main`: `.gitignore` has `node_modules/` and `.env`, and `backend/node_modules` is untracked.

## Team note
After pulling or merging `main`, everyone runs `npm install` in the root folder and in `backend/`. Arsi: after merging `main` into `arsi`, your `backend/node_modules` gets deleted by git, so reinstall. Don't re-add it or any `.env`.

## Open items (in priority order)
1. **Colors:** refine the app palette (sidebar, main card, overall) while respecting the design system. Leftover old blue #0369A1 in `ui/dot-grid-canvas.js` and `ui/parallax-scrolling.css`.
2. **Logout confirmation:** Zane pastes a 21st.dev or React Bits component. Wire it into `AccountMenu`'s `onLogout`.
3. **Restyle unstyled screens:** MyAppointments, AdminDashboard, BookingConfirmation (plain semantic HTML). The Credits page also still uses plain gray classes.
4. **Staff/admin sidebar:** only "Dashboard" exists. Add links when admin pages are planned.
5. **Settings editing and password change:** needs new functions in `api.js` / backend. Coordinate with Arsi.
6. **Pet photo upload from device:** needs a backend upload endpoint from Arsi. For now it's the Photo URL field.
7. **Mobile:** below `lg` the sidebar is hidden and the Navbar has no mobile menu. Option: iPhone-style slide-over where the main screen shifts right with rounded corners.
8. **Backend merge:** when Arsi's backend replaces the `api.js` localStorage mock, watch for conflicts in `api.js` and `AuthContext.js`. Check what the `manuel` branch holds before assuming. `backend/server.js` is still empty.
9. **Placeholders to swap later:** logo, contact info, real photos (testimonial frame, avatars).
10. **Notifications UI:** `api.js` already has `getNotifications`, `markNotificationRead` and `markAllNotificationsRead`, but no screen uses them yet.
11. Optional: Pet detail view; convert old pages' green (#2F7A57) to design-system tokens.
12. Before presenting: delete `DemoAccounts.js` and the marked line in `Login.js`.

## Credits to fill in
Zane fills the 21st.dev author/link placeholders himself in `src/data/credits.js` (Animated Banner, Appointment Card).
