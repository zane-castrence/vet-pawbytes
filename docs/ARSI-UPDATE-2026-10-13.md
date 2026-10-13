# PawBytes: Update for Arsi (changes since the first backend handoff)

Written 2026-10-13 by Zane's Claude thread. Read this **after** `BACKEND-HANDOFF-ARSI.md`. That file is still the main guide (design lock, env vars, Cloudinary, Google sign-in, git workflow). This one is only what changed since, so you don't have to dig through the commits.

Everything marked **[done]** is already in the frontend. Everything marked **[you]** is backend work these changes need, with code you can paste and adjust.

Design lock still applies: do not change classNames, layouts, colors, fonts or copy. Wire logic only. If a screen is needed, ask Zane.

## 1. What changed in the frontend [done]

| Area | What | Files |
|---|---|---|
| Palette and pages | Old blue leftovers replaced. My Appointments, Booking Confirmation and Admin dashboard restyled with a shared data table and shared controls. | `ui/data-table.js`, `ui/app-controls.js`, the three pages |
| Admin Stats page | New admin-only page (`/admin/stats`): a year heatmap of completed visits that folds into a 3D skyline. It only reads `getAllAppointments()`. | `pages/AdminStats.js`, `ui/contribution-skyline.js` |
| Booking: date | The date is picked with a calendar (Apple style). | `ui/apple-calendar-picker.js` |
| Booking: time range | Customers now pick a **start and end time** with a range slider (typed Start/End inputs too). Not a single fixed slot anymore. | `ui/time-range-slider.js`, `ScheduleFields.js` |
| Suggested time per service | Choosing a service suggests a length (Grooming 90 min, Check-up 30 min, ...). The customer can change it. Admin will be able to edit the suggestions (screen coming). | `services/clinicSettings.js` |
| Time ranges everywhere | Appointment cards, tables and the confirmation show "9:30 AM - 11:00 AM". | `utils/time.js` + 4 pages |
| `api.js` | Overlap check and `getBusyRanges` added (section 3). Copilot also added `completedAt` and a `pawbytes-appointments-updated` event earlier. | `services/api.js` |

## 2. Appointment data: two new fields [you]

Every appointment now has:

| Field | Example | Meaning |
|---|---|---|
| `time` | `"09:30"` | start (as before) |
| `endTime` | `"11:00"` | **new**, `HH:mm`, always after `time`, never after clinic closing time |
| `duration` | `90` | **new**, minutes, equals `endTime - time`, multiple of 15, 15 to 240 |

Old appointments (saved before this) have neither. Treat a missing `endTime` as `time + 30 minutes`. Best: write a one-time migration that sets `endTime = time + 30` and `duration = 30` on old documents so queries stay simple.

Mongoose, add to the Appointment schema:

```js
time:     { type: String, required: true, match: /^\d{2}:\d{2}$/ },
endTime:  { type: String, required: true, match: /^\d{2}:\d{2}$/ },
duration: { type: Number, required: true, min: 15, max: 240 },
```

`HH:mm` strings compare correctly with `<` and `>` as long as they are zero padded, so you can query with them directly.

## 3. The overlap rule replaces "same exact time" [you]

Before: two bookings clashed only if `vet`, `date` and `time` were identical.
Now: two bookings for the **same vet on the same date** clash if their ranges overlap, and only `Pending` and `Scheduled` appointments block time (Completed and Cancelled do not).

The mock in `api.js` does this:

```js
const toMin = (t) => { const [h, m] = String(t || "").split(":").map(Number); return h * 60 + m; };
const endMin = (a) => (a.endTime ? toMin(a.endTime) : toMin(a.time) + (Number(a.duration) || 30));
const overlaps = (a, b) => toMin(a.time) < endMin(b) && toMin(b.time) < endMin(a);
```

MongoDB version (put in `backend/utils/appointments.js`):

```js
const Appointment = require("../models/Appointment");

// Returns the clashing appointment, or null. Pass ignoreId when editing.
async function findConflict({ vet, date, time, endTime }, ignoreId) {
  return Appointment.findOne({
    ...(ignoreId ? { _id: { $ne: ignoreId } } : {}),
    vet,
    date,
    status: { $in: ["Pending", "Scheduled"] },
    time: { $lt: endTime },    // existing starts before the new one ends
    endTime: { $gt: time },    // existing ends after the new one starts
  }).lean();
}

module.exports = { findConflict };
```

## 4. Appointment endpoints [you]

Keep the function names and return shapes in `api.js`. Only these behaviors change.

**`createAppointment` (`POST /api/appointments`) and `updateAppointment` (`PUT /api/appointments/:id`)**

Validate the time fields (skip the time checks on partial updates that only change `status`, like Approve or Complete):

```js
const { getSettings } = require("./settings"); // section 5

async function validateTimes({ time, endTime, duration }) {
  const { open, close } = await getSettings();
  if (!time || time < open || time >= close) return `Clinic hours are ${open} to ${close}.`;
  if (!endTime || endTime <= time || endTime > close) return "Pick an end time after the start, within clinic hours.";
  const mins = toMin(endTime) - toMin(time);
  if (mins < 15 || mins > 240 || mins % 15) return "An appointment must be 15 minutes to 4 hours, in 15-minute steps.";
  if (Number(duration) !== mins) return "Duration does not match the start and end time.";
  return null;
}
```

On a clash, respond with status 409 and `{ message: "<vet> is already booked at that time. Pick another slot." }`. The frontend throws `new Error(message)` and shows it as is.

Also set `completedAt = new Date()` on the server when status becomes `Completed` (the mock already does).

**New: `getBusyRanges` (`GET /api/appointments/busy?date=YYYY-MM-DD&vet=Dr.%20Reyes&ignoreId=...`)**

Used by the booking form to draw the booked strip and warn about overlaps. Any logged-in user can call it (customers need it), so return **only times, never names or pet details**:

```js
router.get("/busy", requireAuth, async (req, res) => {
  const { date, vet, ignoreId } = req.query;
  const rows = await Appointment.find({
    ...(ignoreId ? { _id: { $ne: ignoreId } } : {}),
    vet, date, status: { $in: ["Pending", "Scheduled"] },
  }).sort({ time: 1 }).lean();
  res.json(rows.map((a) => ({ start: a.time, end: a.endTime })));
});
```

The old `getUnavailableTimes` (`/availability`) is not used by the UI anymore. Keep or drop it.

## 5. Clinic settings (new) [you]

One document that holds clinic hours and the suggested minutes per service. Admin edits it (screen coming from Zane). Everyone reads it.

Model (a single document, create it on first read with these defaults):

```js
const settingsSchema = new mongoose.Schema({
  open:  { type: String, default: "08:00" },
  close: { type: String, default: "17:00" },
  minutes: { type: Map, of: Number, default: {
    "Deworming": 15, "Vaccination": 30, "Check-up": 30, "Other": 30,
    "Surgery consult": 45, "Dental cleaning": 60, "Emergency": 60, "Grooming": 90,
  } },
});
```

Routes:

| Route | Who | Does |
|---|---|---|
| `GET /api/clinic/settings` | any logged-in user | returns `{ open, close, minutes: { [service]: number } }` |
| `PUT /api/clinic/settings` | admin only | accepts `{ open?, close?, minutes? }` (minutes is merged per service), validates, saves |

Validation (same as the frontend mock in `saveClinicSettings`; throw readable messages):
- `open` and `close` are `HH:mm`, on a 15-minute mark, and `close - open` is at least 60 minutes.
- Every value in `minutes` is a multiple of 15 from 15 to 240.
- A service with no entry falls back to 30 minutes (services the admin adds later).
- If hours are shortened, existing appointments are not touched. Only new bookings are checked.

### Swapping the frontend module

`src/services/clinicSettings.js` is a **localStorage mock** and is read **synchronously** (`validators.js` and `ScheduleFields.js` call `getClinicSettings()` while rendering). Keep it synchronous by turning localStorage into a cache of the server value:

```js
// add to clinicSettings.js, keep every existing export
export async function loadClinicSettings() {
  const res = await fetch("/api/clinic/settings", { headers: authHeader() });
  if (!res.ok) return;
  localStorage.setItem(KEY, JSON.stringify(await res.json()));
  window.dispatchEvent(new Event(EVENT));
}
```

- Call `loadClinicSettings()` once after login and on app start (in `AuthContext` or `index.js`, logic only).
- In `saveClinicSettings(patch)`, do the existing validation, then `PUT` the patch, then call `loadClinicSettings()`.
- `getClinicSettings`, `suggestedMinutes`, `DEFAULT_SERVICE_MINUTES` and `CLINIC_SETTINGS_EVENT` stay exactly as they are, so no page changes.

## 6. Stats page [done] and what is next

- `AdminStats.js` reads `getAllAppointments()`, keeps `status === "Completed"` and uses `date`. No new endpoint needed.
- Next (Zane is building it): the heat shades will be relative to capacity: number of vets times open minutes, using each completed visit's `duration`. That uses data you already serve: the `vets` list from `getClinicCatalog()` and the settings above. Nothing extra for you except keeping `duration` correct on every appointment.
- `completedAt` and the `pawbytes-appointments-updated` event (added by Copilot) are not used by the Stats page now. Keep or remove, your call.

## 7. Add these to the checklist (section 12 of the first handoff)

1. Add `endTime` and `duration` to the Appointment model and migrate old documents (`endTime = time + 30`, `duration = 30`).
2. Implement the overlap check (section 3) in create and update.
3. Add `GET /api/appointments/busy` and `getBusyRanges` in `api.js`.
4. Add the settings model and `GET`/`PUT /api/clinic/settings`, then add `loadClinicSettings()` to the frontend module.
5. In tests, try: two bookings for one vet that overlap by 15 minutes (must be rejected), back-to-back bookings (`09:00-10:00` then `10:00-11:00`, must be allowed), editing an appointment without it clashing with itself, and a status-only update (Approve) on an old appointment with no `endTime`.

## 8. Housekeeping

- `package-lock.json` is out of sync (`yaml@2.9.1` missing): `npm ci` fails, `npm install` works. Whoever has a working install, run `npm install` once and commit the lock file.
- The calendar and slider are converted from 21st.dev components. Zane will add the credits entries.
