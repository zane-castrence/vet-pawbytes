const Appointment = require("../models/Appointment");
const { fail } = require("./httpError");
const { toMin, label12, nowInClinic } = require("./clinicTime");

const OPEN = ["Pending", "Scheduled"];
const STEP = 15;
const MAX_MINUTES = 240;

// Returns the clashing appointment or null. Pass ignoreId when editing.
async function findConflict({ vet, date, time, endTime }, ignoreId) {
  return Appointment.findOne({
    ...(ignoreId ? { _id: { $ne: ignoreId } } : {}),
    vet, date,
    status: { $in: OPEN },
    time: { $lt: endTime },    // existing starts before the new one ends
    endTime: { $gt: time }     // existing ends after the new one starts
  }).lean();
}

// Same wording as src/utils/validators.js. Throws a 400 with a readable message.
function validateTimes({ date, time, endTime, status }, { open, close }) {
  const needsFutureSlot = OPEN.includes(status);
  if (!date || Number.isNaN(Date.parse(`${date}T00:00:00`))) fail("Pick a date.");
  if (!time) fail("Pick a time.");
  const start = toMin(time);
  const end = toMin(endTime);
  const clinicHours = `Clinic hours are ${label12(open)} to ${label12(close)}.`;
  if (!Number.isFinite(start) || time < open || time >= close) fail(clinicHours);
  if (!Number.isFinite(end) || !(endTime > time && endTime <= close)) fail(`Pick an end time after the start, no later than ${label12(close)}.`);
  if (end - start > MAX_MINUTES) fail("An appointment can be 4 hours at most.");
  if ((end - start) % STEP) fail(`Appointments run in ${STEP}-minute steps.`);
  const now = nowInClinic();
  if (needsFutureSlot && date < now.date) fail("Pending and scheduled appointments can't be in the past.");
  if (needsFutureSlot && date === now.date && time <= now.time) fail("Choose a time later today.");
  return end - start; // duration in minutes
}

const conflictMessage = (vet) => `${vet} is already booked at that time. Pick another slot.`;

module.exports = { OPEN, findConflict, validateTimes, conflictMessage };
