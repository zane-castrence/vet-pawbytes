# PawBytes (vet-pawbytes): Project context

Updated 2026-10-11.

## What it is
Veterinary clinic appointment website. School group project (finals for Integrative Programming and Systems Integration and Architecture), possibly the later capstone.

## Team
- **Zane**: design and UI (React, Tailwind, 21st.dev / React Bits components).
- **Arsi**: backend (Express, MongoDB, auth logic). Owns `backend/`, `src/services/api.js` and `src/context/AuthContext.js`.
- **Manuel**: systems analyst. The `manuel` branch on GitHub is his, not backend.
- Everyone commits with their **own GitHub account**.

## Repo
- https://github.com/zane-castrence/vet-pawbytes (public, default branch `main`).
- Work happens on feature branches (`feat/<name>`), merged into `main` through pull requests.
- Zane codes mostly from his iPhone using GitHub Codespaces.

## Stack
- React (Create React App, react-scripts 5), Tailwind 3.4, react-router-dom v7. **JS/JSX only, no TypeScript** (professor's rule).
- Installed: `motion` (import from `motion/react`, not framer-motion), `gsap`, `@studio-freight/lenis`, `three`, `lucide-react` 1.x (no brand icons).
- **Relative imports only** (`@/` alias does not work). UI components live in `src/components/ui/`.
- `src/index.js` imports `./index.css` (has the three `@tailwind` directives).
- Fonts via Google Fonts in `public/index.html`: Caveat 700, Figtree 400-900.
- `tailwind.config.js`: `font-figtree`, `font-caveat`; colors `sky` (50 #EEF2FF, 100 #DCE5FF, 300 #5AB4FF, 500 #2A3BD9, 600 #1F2DB0), `paw` (cobalt, pink, rose, lime, mint, sky, orange, violet, card), `emerald`, `ink`. Most components use arbitrary values like `text-[#1F2937]` and `rounded-[20px]`.

## Structure (src/, synced with the code on 2026-10-11)
```
src/
  App.js                  routes, wrapped in <AppShell>
  components/
    AccountMenu.js        avatar menu: Settings + Log out
    Alert.js, AuthShell.js, DemoAccounts.js, Footer.js, GoogleButton.js, FormField.js
    AppShell.js           layout wrapper (sidebar + rounded main + top bar)
    AppointmentForm.js    admin/staff booking + edit form (unstyled)
    BookingModal.js       3-step: Pet -> Veterinarian -> Details
    Modal.js              shared shell (Esc, scroll lock, blur backdrop, `wide`)
    Navbar.js             glass pill; lg:hidden for logged-in users
    PetCard.js, PetForm.js, PetModal.js
    ProtectedRoute.js, ReviewCard.js, ServiceCard.js, StatusBadge.js
    sections/ SectionHeading.js, Testimonials.js
    ui/ animated-banner.js, appointment-card.js, dashboard-sidebar.js, dot-grid-canvas.js,
        glass-surface.js, hover-footer.js, parallax-scrolling.js/.css, random-letter-swap.js,
        review-arc.js, spotlight-card.js, step-progress.js
  context/AuthContext.js  { user, login, register, logout }, localStorage key "session"
  data/ credits.js, testimonials.js
  pages/ AdminDashboard, BookAppointment, BookingConfirmation, BrowseServices, Credits,
         Home, Login, MyAppointments, MyPets, Settings, SignUp
  services/api.js         localStorage mock of the REST API
  utils/validators.js
```
Repo root also has `backend/` (Express, `server.js` still empty), `PROJECT_PLAN.md`, `README.md`, `tailwind.config.js`, `postcss.config.js`, `.devcontainer/`.

## How things work now
- **Routes:** `/` Home (logged-in redirect: customer -> `/services`, others -> `/admin`), `/login`, `/signup`, `/services`, `/book`, `/confirmation`, `/my-appointments`, `/my-pets` (customer only), `/admin` (admin/staff/veterinarian), `/settings` (any logged-in user), `/credits`.
- **AppShell:** logged-in users (not on `/login` or `/signup`) get, on `lg` (1024px+): sidebar left on a #DCE5FF backdrop, main content in a rounded-[20px] white card with the one shadow, and a sticky top bar (sidebar toggle, page title, avatar `AccountMenu`). Navbar and Footer are hidden on `lg+` for them. Guests and screens below `lg` get Navbar/Footer.
- **Sidebar** (`ui/dashboard-sidebar.js`): wordmark, rose (#D6347F) "Book appointment" button (customers), role-based links (customers: Services, My pets, My appointments; staff/admin: Dashboard), `AccountMenu` row at the bottom. Props: `user`, `onLogout`.
- **AccountMenu:** avatar + name + role; menu has Settings and Log out. No logout confirmation yet.
- **Services page (`BrowseServices`):** customer overview. `AnimatedBanner` greeting (name, next visit text, live countdown), up to 4 `AppointmentCard`s for upcoming Pending/Scheduled visits, then the "Our services" `ServiceCard` grid. It is also rendered blurred behind the booking modal on `/book`.
- **AnimatedBanner** (`ui/animated-banner.js`): cobalt card with lime CTA and flat placeholder art. Props: `title`, `subtitle`, `ctaLabel`, `href`, `imageSrc`, `deadline` (shows countdown), `deadlineLabel`, `className`.
- **AppointmentCard** (`ui/appointment-card.js`): props `appointment`, `index`. Photo from `appointment.petPhoto` or a colored placeholder with the pet's initial, status pill, month/day chip, time and vet footer.
- **Settings:** read-only (name, email, role) plus About section linking to Credits.
- **Pet card:** 380px tall on My pets, 300px in the booking modal. Full photo (`pet.photoUrl`) or gray placeholder with initial, white fade + blur at bottom, letter-by-letter name animation, vaccination pill, selected check, dark Edit button.
- **Delete pet:** only inside the Edit window (red "Delete pet" link, then inline "Yes, delete").
- **Photo URL** must be a direct image link (right-click image, Copy Image Address).
- **Admin dashboard:** plain semantic HTML (no styling yet). Admin tabs: overview, approval requests, appointments, manage accounts, clinic setup. Staff/vet tabs: approval requests, schedule. Appointments auto-refresh every 15 s.
- **api.js** (backend-owned, localStorage mock). Login returns `{id, name, email, role}`; register also returns phone, address, city, province.
  - Auth: `registerUser`, `loginUser`, `initializeDemoData`.
  - Pets: `getPets`, `createPet`, `updatePet`, `deletePet` (validation is an internal `validatePetDetails`).
  - Appointments: `getAppointments`, `getAllAppointments`, `createAppointment`, `updateAppointment`, `deleteAppointment`, `getUnavailableTimes`.
  - Clinic catalog: `getClinicCatalog`, `addClinicCatalogItem`, `removeClinicCatalogItem`.
  - Accounts and team: `getCustomers`, `createTeamAccount`, `getClinicTeamAvailability`, `setTeamAvailability`, `setCustomerActive`, `setCustomerRole`, `deleteCustomer`.
  - Notifications: `getNotifications`, `markNotificationRead`, `markAllNotificationsRead` (no UI uses them yet).
  - Clinic hours 8:00-17:00, 30-min slots.
- **Credits** (`data/credits.js`): Dr. Friend first, then components in the order added (newest last). Entry shape: `{name, author, authorUrl, source, sourceUrl, usedIn}`.
- **Demo accounts:** `DemoAccounts.js` on the Login page (admin, staff, customer). Delete the file and the marked line in `Login.js` before presenting.

## Known gotchas
- Tailwind not applying: check `import './index.css'` in `src/index.js`, restart `npm start`.
- GlassSurface refraction only fully works in Chromium; Safari/Firefox get frosted blur.
- `Navbar.js` reads `document.querySelector("footer")`. Keep a `<footer>` in the DOM.
- Outline-draw SVG text uses dasharray/offset 6000.
- Modals use `fixed inset-0`. Don't add `transform`/`filter` to AppShell ancestors.
- `dot-grid-canvas.js` shader colors are still the old blue #0369A1 (its comment says #2A3BD9). Same old blue in the hero title shadow in `parallax-scrolling.css`. Fix in the palette pass.
- `Credits.js` page still uses plain gray Tailwind classes, not design-system tokens.
- `backend/node_modules` was committed. Fix: `node_modules/` in `.gitignore` and `git rm -r --cached backend/node_modules` (see `04-STATUS-AND-TODO.md`).
