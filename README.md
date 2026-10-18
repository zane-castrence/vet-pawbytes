<div align="center">

<img src="https://res.cloudinary.com/y029hvzd/image/upload/pawbytes-pet-schedule.png" alt="PawBytes services page with the next appointment and pet schedule" width="900" />

<br />

<img src="https://res.cloudinary.com/y029hvzd/image/upload/pawbytes-pet-profile.png" alt="PawBytes My pets page with pet profile cards" width="900" />

# PawBytes

**A veterinary clinic appointment website.**
Pet owners book visits online. The clinic team manages the schedule.

</div>

---

## About

PawBytes lets pet owners save pet profiles and book appointments by picking a date and a start-to-end time. Clinic staff approve, complete, and manage visits from a dashboard. Booking checks the clinic's opening hours and blocks overlapping times for the same veterinarian.

Built as a school group project for **Integrative Programming** and **Systems Integration and Architecture** (NU-MOA).

## Features

**Pet owners**
- Sign up and log in
- Pet profiles with photo, age, weight, and vaccination status
- Book by service, veterinarian, date, and time range
- View, cancel, and delete appointments

**Clinic team (admin, staff, veterinarian)**
- Dashboard to approve, complete, edit, cancel, and delete appointments
- Book on behalf of a customer
- Manage services, veterinarians, and accounts
- Stats page with a yearly visit heatmap that folds into a 3D skyline

**Landing page**
- Parallax hero, services carousel, testimonials, and FAQ

## Tech stack

| Area | Tools |
|---|---|
| Frontend | React 19 (Create React App), Tailwind CSS 3.4, React Router 7 |
| Motion and 3D | Motion, GSAP, Lenis, Three.js |
| Icons | lucide-react |
| Backend | Node.js, Express, MongoDB (in progress, in `backend/`) |

> The frontend currently runs on a **localStorage mock** (`src/services/api.js`). Data is saved in your browser only, until the backend is connected.

## Getting started

```bash
git clone https://github.com/zane-castrence/vet-pawbytes.git
cd vet-pawbytes
npm install
npm start
```

The app opens at http://localhost:3000.

Production build:

```bash
npm run build
```

## Roles

| Role | Access |
|---|---|
| Customer | Services, My pets, My appointments, booking |
| Staff / Veterinarian | Dashboard, appointment management |
| Admin | Everything above, plus accounts, catalog, and Stats |

Sign up creates a customer account.

## Project structure

```text
src/
  components/    shared UI, landing sections, booking modal
  pages/         Home, Login, SignUp, MyPets, MyAppointments, AdminDashboard, ...
  services/      api.js (data layer), clinicSettings.js
  context/       AuthContext (session)
  data/          services, testimonials, FAQs, credits
  utils/         validators, time helpers
backend/         Express API (in progress)
docs/            backend handoff notes
```

## Team

| Name | Role |
|---|---|
| Zane Castrence | UI/UX design and frontend |
| Arsi | Backend |
| Manuel | Systems analyst |

## Credits

Some UI components come from 21st.dev and React Bits authors. The full list is on the in-app **Credits** page (`/credits`, also under Settings → About).