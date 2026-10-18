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
- Sign up and log in with email or Google
- Pet profiles with photo upload, age, weight, and vaccination status
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
| Backend | Node.js, Express 5, MongoDB (Mongoose) |
| Auth | JWT, bcrypt, Google sign-in |
| Image storage | Cloudinary |

## Getting started

You need [Node.js](https://nodejs.org/) 20 or newer, a MongoDB connection string (a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works), and the repo cloned:

```bash
git clone https://github.com/zane-castrence/vet-pawbytes.git
cd vet-pawbytes
```

### 1. Set up the environment files

Create `backend/.env`:

```env
PORT=5001
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=any-long-random-string
CLIENT_URL=http://localhost:3000

# Pet photo upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Google sign-in
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Create `.env` in the project root (only needed for Google sign-in):

```env
REACT_APP_GOOGLE_CLIENT_ID=
```

### 2. Run the backend

In a terminal, go to the `backend` folder:

```bash
cd backend
npm install
npm run dev
```

Optional, run once to create the demo admin and staff accounts and the default services, veterinarians, and clinic hours:

```bash
npm run seed
```

### 3. Run the website

Open a **new terminal**, go to the root folder (`vet-pawbytes`), then:

```bash
npm install
npm start
```

The app opens at http://localhost:3000.

## Roles

| Role | Access |
|---|---|
| Customer | Services, My pets, My appointments, booking |
| Staff / Veterinarian | Dashboard, appointment management |
| Admin | Everything above, plus accounts, catalog, and Stats |

Sign up creates a customer account.

## Credits

Some UI components come from 21st.dev and React Bits authors. The full list is on the **Credits** page. You can open it from the footer, or after logging in, from your profile at the bottom of the sidebar (Settings → Credits).