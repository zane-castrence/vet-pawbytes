// REST client for the Express + MongoDB Atlas backend (backend/server.js).
// Every export keeps the name, arguments and return shape the old localStorage mock had,
// so pages and components do not change. CRA's "proxy" in package.json forwards /api to port 5000.
// Who is calling comes from the JWT on the server. userId/actorId args are kept only so callers don't change.
const API = "/api";

const token = () => {
  try { return JSON.parse(localStorage.getItem("session"))?.token || ""; } catch { return ""; }
};

export async function request(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...(token() ? { Authorization: `Bearer ${token()}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("Cannot reach the server. Make sure the backend is running.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong. Please try again.");
  return data;
}

const query = (params) =>
  new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== "")).toString();

export const DEFAULT_SERVICES = ["Check-up", "Vaccination", "Grooming", "Dental cleaning", "Surgery consult", "Emergency", "Deworming", "Other"];
export const DEFAULT_VETS = ["Dr. Reyes", "Dr. Santos", "Dr. Lim"];
export const DEMO_ADMIN = { name: "PawBytes Admin", email: "admin@pawbytes.local", password: "PawBytesAdmin2026!" };
export const DEMO_STAFF = { name: "PawBytes Staff", email: "staff@pawbytes.local", password: "PawBytesStaff2026!" };

// Demo admin and staff are created on the server with `npm run seed` (backend/seed.js).
export function initializeDemoData() {}

// ---- Auth ----
export const registerUser = (data) => request("/auth/register", { method: "POST", body: data });
export const loginUser = ({ email, password }) => request("/auth/login", { method: "POST", body: { email, password } });
// code comes from Google's popup (auth-code flow); the server verifies it and returns the same object as login.
export const googleLogin = (code) => request("/auth/google", { method: "POST", body: { code } });

// ---- Pets ----
export const getPets = () => request("/pets");
export const createPet = (userId, details) => request("/pets", { method: "POST", body: details });
export const updatePet = (userId, petId, details) => request(`/pets/${petId}`, { method: "PUT", body: details });
export const deletePet = async (userId, petId) => { await request(`/pets/${petId}`, { method: "DELETE" }); };

// ---- Appointments ----
export const getAppointments = () => request("/appointments/mine");
export const getAllAppointments = () => request("/appointments");
// [{ start: "09:00", end: "10:30" }] (times only)
export const getBusyRanges = (date, vet, ignoreId) => request(`/appointments/busy?${query({ date, vet, ignoreId })}`);
// Not used by any screen; kept so the export exists.
export const getUnavailableTimes = async (date, vet, ignoreId) => (await getBusyRanges(date, vet, ignoreId)).map((r) => r.start);

// userId is the customer who owns the booking. A customer is always forced to themself on the server;
// clinic team (admin/staff/vet) booking from the dashboard send the customer's id here.
export const createAppointment = (userId, data, { requirePetProfile = false } = {}) =>
  request("/appointments", { method: "POST", body: { ...data, userId, requirePetProfile } });
export const updateAppointment = (id, data) => request(`/appointments/${id}`, { method: "PUT", body: data });
export const deleteAppointment = async (id) => { await request(`/appointments/${id}`, { method: "DELETE" }); };

// ---- Clinic catalog (services + vets) ----
export const getClinicCatalog = () => request("/clinic/catalog");
export const addClinicCatalogItem = async (type, value) => { await request("/clinic/catalog", { method: "POST", body: { type, value } }); };
export const removeClinicCatalogItem = async (type, value) => {
  await request(`/clinic/catalog?type=${encodeURIComponent(type)}&value=${encodeURIComponent(value)}`, { method: "DELETE" });
};

// ---- Accounts and team ----
export const getCustomers = () => request("/accounts");
export const createTeamAccount = (actorId, account) => request("/accounts/team", { method: "POST", body: account });
export const getClinicTeamAvailability = () => request("/accounts/team/availability");
export const setTeamAvailability = async (actorId, targetId, available) => {
  await request(`/accounts/team/${targetId}/availability`, { method: "PUT", body: { available } });
};
export const setCustomerActive = async (userId, active) => { await request(`/accounts/${userId}/active`, { method: "PUT", body: { active } }); };
export const setCustomerRole = async (userId, role) => { await request(`/accounts/${userId}/role`, { method: "PUT", body: { role } }); };
export const deleteCustomer = async (userId) => { await request(`/accounts/${userId}`, { method: "DELETE" }); };

// ---- Notifications (no screen uses them yet) ----
export const getNotifications = () => request("/notifications");
export const markNotificationRead = async (userId, notificationId) => { await request(`/notifications/${notificationId}/read`, { method: "PUT" }); };
export const markAllNotificationsRead = async () => { await request("/notifications/read-all", { method: "PUT" }); };
