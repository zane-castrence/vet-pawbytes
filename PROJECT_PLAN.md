# Capstone Project — Vet/Pet Appointment Scheduling System

## Overview
NU-MOA IT capstone project. Website for booking veterinary/pet grooming appointments, with a customer-facing side and an admin/staff side. React JS is required (plain `.js`/`.jsx` only — no TypeScript, per professor's rule, to avoid over-reliance on AI-generated boilerplate).

## Tech Stack
- **React JS** — Create React App (not Vite)
- **React Router** — page navigation
- **Tailwind CSS** (v3) — utility-class styling
- AI feature (still being finalized by the team) and backend to be added later

## How to run the project
```bash
git clone <repo-url>
cd vet-pawbytes
npm install
npm start
```

## Folder structure
```
vet-pawbytes/
├── public/
├── src/
│   ├── components/        # reusable UI pieces (Navbar, Footer, Button, Card, etc.)
│   ├── pages/              # one file per page/route
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── SignUp.js
│   │   ├── BrowseServices.js
│   │   ├── BookAppointment.js
│   │   ├── BookingConfirmation.js
│   │   ├── MyAppointments.js
│   │   └── AdminDashboard.js
│   ├── App.js               # all routes defined here
│   └── index.js
├── tailwind.config.js
└── package.json
```

## Page flow (customer side)
1. **Home** — landing page (already designed in Figma)
2. **Login / Sign Up**
3. **Browse Services** — shown first after login; also should indicate if the user has an ongoing/upcoming appointment
4. **Book Appointment**
5. **Booking Confirmation**
6. **My Appointments** — returning users land here to see booking history/status

## Admin side
- **Admin Dashboard** — appointments table is the priority view (staff need to see bookings at a glance first)

## Design status
- Figma landing page: **done** (teal/coral palette, Poppins headings + Inter body)
- Figma pages after login (Browse Services, Book Appointment, etc.): **not started yet**
- A wireframe (placeholder version) exists covering all pages listed above, so the page list and flow above are final — the visual design will change, the page structure will not

## Division of work (for now)
- **Groupmate:** build functional logic first — routing between pages, form handling, booking flow state, mock/placeholder data where needed. Use semantic HTML (`header`, `nav`, `main`, `section`, `form`) and basic Tailwind layout classes (`flex`, `grid`, spacing) only. Skip colors, fonts, and branding — those aren't final yet.
- **Zane:** finishing the Figma design for the remaining pages. Once ready, styling gets applied on top of the existing components — no rebuilding expected, since layout structure is already in place.

## Notes for whoever builds each page
- Keep each page as a separate file in `src/pages` — don't merge pages into one file
- Reusable pieces (nav bar, footer, buttons, cards) go in `src/components`, not repeated per page
- Don't hardcode final colors/fonts — Tailwind classes will be swapped in once the design system is ready
- If a page needs data (e.g. list of services, list of appointments), use a mock array for now — no backend yet
