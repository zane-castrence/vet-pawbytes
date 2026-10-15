// Clinic hours and the suggested length of each service.
// The server (MongoDB) is the source of truth. localStorage is only a cache so reads stay synchronous.
import { FALLBACK_MINUTES, MAX_MINUTES, STEP, toMinutes } from "../utils/time";
import { request } from "./api";

const KEY = "clinicSettings";
const EVENT = "pawbytes-clinic-settings-updated";

export const DEFAULT_SERVICE_MINUTES = {
  Deworming: 15,
  Vaccination: 30,
  "Check-up": 30,
  Other: 30,
  "Surgery consult": 45,
  "Dental cleaning": 60,
  Emergency: 60,
  Grooming: 90,
};

const isTime = (t) => /^\d{2}:\d{2}$/.test(String(t ?? "")) && Number.isFinite(toMinutes(t));

const readRaw = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") || {};
  } catch {
    return {};
  }
};


// Pulls the clinic settings from the server into the local cache (getClinicSettings stays synchronous).
export async function loadClinicSettings() {
  try {
    localStorage.setItem(KEY, JSON.stringify(await request("/clinic/settings")));
    window.dispatchEvent(new Event(EVENT));
  } catch { /* keep the cached or default value */ }
}

// { open: "08:00", close: "17:00", minutes: { [service]: number } }
export function getClinicSettings() {
  const raw = readRaw();
  const open = isTime(raw.open) ? raw.open : "08:00";
  const close = isTime(raw.close) && toMinutes(raw.close) > toMinutes(open) ? raw.close : "17:00";
  return { open, close, minutes: { ...DEFAULT_SERVICE_MINUTES, ...(raw.minutes || {}) } };
}

// Suggested length for a service. Services the admin added later fall back to 30 minutes.
export function suggestedMinutes(service) {
  const m = Number(getClinicSettings().minutes[service]);
  return m > 0 ? m : FALLBACK_MINUTES;
}

// patch: { open?, close?, minutes? } (minutes is merged per service). Throws a readable Error.
export async function saveClinicSettings(patch) {
  const current = getClinicSettings();
  const next = {
    open: patch.open ?? current.open,
    close: patch.close ?? current.close,
    minutes: { ...current.minutes, ...(patch.minutes || {}) },
  };
  if (!isTime(next.open) || !isTime(next.close)) throw new Error("Enter the opening and closing time.");
  const o = toMinutes(next.open);
  const c = toMinutes(next.close);
  if (o % STEP || c % STEP) throw new Error(`Clinic hours must be on a ${STEP}-minute mark.`);
  if (c - o < 60) throw new Error("The clinic must be open for at least one hour.");
  for (const [service, m] of Object.entries(next.minutes)) {
    const n = Number(m);
    if (!Number.isFinite(n) || n < STEP || n > MAX_MINUTES || n % STEP) {
      throw new Error(`${service}: enter ${STEP} to ${MAX_MINUTES} minutes, in steps of ${STEP}.`);
    }
  }
  await request("/clinic/settings", { method: "PUT", body: patch });
  await loadClinicSettings();
  return getClinicSettings();
}

export const CLINIC_SETTINGS_EVENT = EVENT;