// Mock API layer. Each function mirrors a future REST endpoint.
// Swap the bodies for fetch/axios calls to your Express backend later.
const read = (k, d) => JSON.parse(localStorage.getItem(k) || JSON.stringify(d));
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const fail = (message) => { throw new Error(message); };
const isClinicTeamRole = (role) => role === "staff" || role === "veterinarian";
const isClinicTeamMember = (user) => user.role === "admin" || isClinicTeamRole(user.role);
const notificationUpdateEvent = () => window.dispatchEvent(new Event("pawbytes-notifications-updated"));
const petSpecies = ["Dog", "Cat", "Bird", "Rabbit", "Other"];

function createNotifications(recipients, { appointmentId, title, message, type }) {
  const notifications = read("notifications", []);
  const additions = recipients.map((recipientId) => ({
    id: crypto.randomUUID(),
    recipientId,
    appointmentId,
    title,
    message,
    type,
    createdAt: new Date().toISOString(),
    read: false
  }));
  if (additions.length) {
    write("notifications", [...notifications, ...additions]);
    notificationUpdateEvent();
  }
}

function getActiveClinicTeam() {
  return read("users", [])
    .filter((user) => isClinicTeamMember(user) && user.active !== false)
    .map((user) => user.id);
}

const appointmentLabel = (appointment) => `${appointment.petName}'s appointment on ${appointment.date} at ${appointment.time}`;

export const DEFAULT_SERVICES = ["Check-up", "Vaccination", "Grooming", "Dental cleaning", "Surgery consult", "Emergency", "Deworming", "Other"];
export const DEFAULT_VETS = ["Dr. Reyes", "Dr. Santos", "Dr. Lim"];
export const DEMO_ADMIN = { name: "PawBytes Admin", email: "admin@pawbytes.local", password: "PawBytesAdmin2026!" };
export const DEMO_STAFF = { name: "PawBytes Staff", email: "staff@pawbytes.local", password: "PawBytesStaff2026!" };

function ensureDemoAccounts() {
  const users = read("users", []);
  const demoAccounts = [
    { ...DEMO_ADMIN, id: "pawbytes-demo-admin", role: "admin" },
    { ...DEMO_STAFF, id: "pawbytes-demo-staff", role: "staff" }
  ];
  const additions = demoAccounts
    .filter((account) => !users.some((user) => user.email === account.email))
    .map((account) => ({
      ...account,
      active: true
    }));
  if (additions.length) write("users", [...users, ...additions]);
}

export function initializeDemoData() {
  ensureDemoAccounts();
}
// POST /api/auth/register
export async function registerUser({ name, email, password, phone, address, city, province }) {
  await wait();
  const users = read("users", []);
  if ([DEMO_ADMIN.email, DEMO_STAFF.email].includes(email.toLowerCase())) fail("This email is reserved for a clinic account.");
  if (users.some((u) => u.email === email.toLowerCase())) fail("An account with this email already exists.");
  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.toLowerCase(),
    password,
    phone: phone.replace(/[\s-]/g, ""),
    address: address.trim(),
    city: city.trim(),
    province: province.trim(),
    role: "customer",
    active: true
  };
  write("users", [...users, user]);
  return { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address, city: user.city, province: user.province };
}

// POST /api/auth/login
export async function loginUser({ email, password }) {
  await wait();
  ensureDemoAccounts();
  const user = read("users", []).find((u) => u.email === email.toLowerCase() && u.password === password);
  if (!user) fail("Incorrect email or password.");
  if (user.active === false) fail("This account is paused. Please contact the clinic.");
  return { id: user.id, name: user.name, email: user.email, role: user.role || "customer" };
}

// GET /api/appointments
export async function getAppointments(userId) {
  await wait(150);
  return read("appointments", [])
    .filter((a) => a.userId === userId)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

export async function getPets(userId) {
  await wait(100);
  return read("pets", [])
    .filter((pet) => pet.ownerId === userId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function validatePetDetails(details) {
  if (!details || typeof details.name !== "string" || typeof details.species !== "string") {
    fail("Enter a pet name and species.");
  }
  const name = details.name.trim();
  const breed = typeof details.breed === "string" ? details.breed.trim() : "";
  const sex = typeof details.sex === "string" ? details.sex : "";
  const birthday = typeof details.birthday === "string" ? details.birthday : "";
  const weightKg = details.weightKg === "" || details.weightKg == null ? "" : Number(details.weightKg);
  const color = typeof details.color === "string" ? details.color.trim() : "";
  const sterilized = typeof details.sterilized === "string" ? details.sterilized : "";
  const vaccinationStatus = typeof details.vaccinationStatus === "string" ? details.vaccinationStatus : "Unknown";
  const allergies = typeof details.allergies === "string" ? details.allergies.trim() : "";
  const medicalNotes = typeof details.medicalNotes === "string"
    ? details.medicalNotes.trim()
    : typeof details.notes === "string" ? details.notes.trim() : "";
  const microchipNumber = typeof details.microchipNumber === "string" ? details.microchipNumber.trim() : "";
  const photoUrl = typeof details.photoUrl === "string" ? details.photoUrl.trim() : "";
  if (name.length < 1 || name.length > 60) fail("Pet name must be 1–60 characters.");
  if (!petSpecies.includes(details.species)) fail("Choose a valid pet species.");
  if (breed.length < 1 || breed.length > 60) fail("Enter a breed of 1–60 characters.");
  if (!["Female", "Male"].includes(sex)) fail("Choose male or female.");
  if (!birthday || Number.isNaN(Date.parse(`${birthday}T00:00:00`)) || birthday > new Date().toISOString().slice(0, 10)) {
    fail("Enter a valid birthdate that is not in the future.");
  }
  if (weightKg !== "" && (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 500)) fail("Weight must be between 0 and 500 kg.");
  if (color.length > 80) fail("Color or markings must be 80 characters or fewer.");
  if (sterilized && !["Yes", "No"].includes(sterilized)) fail("Choose yes or no for spayed/neutered status.");
  if (!["Up to date", "Overdue", "Unknown"].includes(vaccinationStatus)) fail("Choose a valid vaccination status.");
  if (allergies.length > 500) fail("Allergies must be 500 characters or fewer.");
  if (medicalNotes.length > 1000) fail("Medical notes must be 1000 characters or fewer.");
  if (microchipNumber.length > 50) fail("Microchip number must be 50 characters or fewer.");
  if (photoUrl) {
    let parsedPhotoUrl;
    try { parsedPhotoUrl = new URL(photoUrl); } catch { fail("Enter a valid photo URL."); }
    if (!["http:", "https:"].includes(parsedPhotoUrl.protocol)) fail("Photo URL must use HTTP or HTTPS.");
  }
  return {
    name,
    species: details.species,
    breed,
    sex,
    birthday,
    weightKg,
    color,
    sterilized,
    vaccinationStatus,
    allergies,
    medicalNotes,
    notes: medicalNotes,
    microchipNumber,
    photoUrl
  };
}

export async function createPet(userId, details) {
  await wait();
  const users = read("users", []);
  if (!users.some((user) => user.id === userId && (!user.role || user.role === "customer") && user.active !== false)) {
    fail("Only an active customer account can create pet profiles.");
  }
  const pet = { ...validatePetDetails(details), id: crypto.randomUUID(), ownerId: userId, createdAt: new Date().toISOString() };
  write("pets", [...read("pets", []), pet]);
  return pet;
}

export async function updatePet(userId, petId, details) {
  await wait();
  const pets = read("pets", []);
  if (!pets.some((pet) => pet.id === petId && pet.ownerId === userId)) fail("Pet profile not found.");
  const updated = { ...validatePetDetails(details), id: petId, ownerId: userId };
  write("pets", pets.map((pet) => pet.id === petId && pet.ownerId === userId ? { ...pet, ...updated } : pet));
  return updated;
}

export async function deletePet(userId, petId) {
  await wait();
  const pets = read("pets", []);
  if (!pets.some((pet) => pet.id === petId && pet.ownerId === userId)) fail("Pet profile not found.");
  const hasUpcomingAppointment = read("appointments", []).some((appointment) =>
    appointment.petId === petId && ["Pending", "Scheduled"].includes(appointment.status)
  );
  if (hasUpcomingAppointment) fail("This pet has a pending or scheduled appointment. Cancel or complete it before deleting the profile.");
  write("pets", pets.filter((pet) => pet.id !== petId || pet.ownerId !== userId));
}

export async function getAllAppointments() {
  await wait(150);
  return read("appointments", [])
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

export async function getNotifications(userId) {
  await wait(50);
  return read("notifications", [])
    .filter((notification) => notification.recipientId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markNotificationRead(userId, notificationId) {
  await wait(50);
  const notifications = read("notifications", []);
  if (!notifications.some((notification) => notification.id === notificationId && notification.recipientId === userId)) {
    fail("Notification not found.");
  }
  write("notifications", notifications.map((notification) =>
    notification.id === notificationId && notification.recipientId === userId
      ? { ...notification, read: true }
      : notification
  ));
  notificationUpdateEvent();
}

export async function markAllNotificationsRead(userId) {
  await wait(50);
  const notifications = read("notifications", []);
  write("notifications", notifications.map((notification) =>
    notification.recipientId === userId ? { ...notification, read: true } : notification
  ));
  notificationUpdateEvent();
}

export async function getCustomers() {
  await wait(100);
  return read("users", [])
    .filter((user) => user.role !== "admin")
    .map(({ id, name, email, active, role, isAvailable }) => ({
      id,
      name,
      email,
      active: active !== false,
      role: isClinicTeamRole(role) ? role : "customer",
      isAvailable: isAvailable !== false
    }));
}

export async function createTeamAccount(actorId, account) {
  await wait();
  const users = read("users", []);
  const actor = users.find((user) => user.id === actorId);
  if (!actor || actor.role !== "admin") fail("Only an admin can create clinic accounts.");
  if (!account || typeof account.name !== "string" || typeof account.email !== "string" || typeof account.password !== "string" || typeof account.role !== "string") {
    fail("Enter a name, email address, password, and clinic role.");
  }
  if (!isClinicTeamRole(account.role)) fail("Choose Staff or Veterinarian as the clinic role.");

  const normalizedName = account.name.trim();
  const normalizedEmail = account.email.trim().toLowerCase();
  if (normalizedName.length < 2 || normalizedName.length > 100) fail("Enter the team member's full name (2–100 characters).");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) fail("Enter a valid email address.");
  if (normalizedEmail.length > 254) fail("Email address must be 254 characters or fewer.");
  if (account.password.length < 6) fail("Password must be at least 6 characters.");
  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    fail("An account with this email already exists.");
  }

  const staff = {
    id: crypto.randomUUID(),
    name: normalizedName,
    email: normalizedEmail,
    password: account.password,
    role: account.role,
    active: true,
    isAvailable: true
  };

  if (staff.role === "veterinarian") {
    const savedCatalog = read("clinicCatalog", { services: DEFAULT_SERVICES, vets: DEFAULT_VETS });
    const catalog = {
      services: Array.isArray(savedCatalog.services) ? savedCatalog.services : DEFAULT_SERVICES,
      vets: Array.isArray(savedCatalog.vets) ? savedCatalog.vets : DEFAULT_VETS
    };
    if (!catalog.vets.some((vet) => vet.toLowerCase() === staff.name.toLowerCase())) {
      write("clinicCatalog", { ...catalog, vets: [...catalog.vets, staff.name] });
    }
  }
  write("users", [...users, staff]);
  return { id: staff.id, name: staff.name, email: staff.email, role: staff.role };
}

export async function getClinicTeamAvailability() {
  await wait(100);
  return read("users", [])
    .filter(isClinicTeamMember)
    .map((user) => ({
      id: user.id,
      name: user.name,
      role: user.role,
      available: user.active !== false && user.isAvailable !== false
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function setTeamAvailability(actorId, targetId, available) {
  await wait();
  const users = read("users", []);
  const actor = users.find((user) => user.id === actorId);
  const target = users.find((user) => user.id === targetId);
  if (!actor || !isClinicTeamMember(actor)) fail("Only clinic staff can update availability.");
  if (!target || !isClinicTeamMember(target)) fail("Clinic team member not found.");
  const canUpdate = actor.id === target.id || (actor.role === "admin" && isClinicTeamRole(target.role));
  if (!canUpdate) fail("You can only update your own availability.");
  if (typeof available !== "boolean") fail("Availability must be on or off.");
  write("users", users.map((user) => user.id === targetId ? { ...user, isAvailable: available } : user));
}

export async function setCustomerActive(userId, active) {
  await wait();
  const users = read("users", []);
  if (!users.some((user) => user.id === userId && user.role !== "admin")) fail("Customer account not found.");
  write("users", users.map((user) => user.id === userId ? { ...user, active } : user));
}

export async function setCustomerRole(userId, role) {
  await wait();
  if (!["staff", "veterinarian", "customer"].includes(role)) fail("Choose a valid account role.");
  const users = read("users", []);
  if (!users.some((user) => user.id === userId && user.role !== "admin")) fail("Account not found.");
  write("users", users.map((user) => user.id === userId && user.role !== "admin" ? { ...user, role, isAvailable: true } : user));
}

export async function deleteCustomer(userId) {
  await wait();
  const users = read("users", []);
  if (!users.some((user) => user.id === userId && user.role !== "admin")) fail("Customer account not found.");
  write("users", users.filter((user) => user.id !== userId));
  write("appointments", read("appointments", []).filter((appointment) => appointment.userId !== userId));
}

export async function getClinicCatalog() {
  await wait(100);
  const catalog = read("clinicCatalog", { services: DEFAULT_SERVICES, vets: DEFAULT_VETS });
  return {
    services: Array.isArray(catalog.services) ? catalog.services : DEFAULT_SERVICES,
    vets: Array.isArray(catalog.vets) ? catalog.vets : DEFAULT_VETS
  };
}

export async function addClinicCatalogItem(type, value) {
  await wait();
  if (type !== "services" && type !== "vets") fail("Unknown clinic list.");
  const item = value.trim();
  if (!item) fail("Enter a name first.");
  const catalog = await getClinicCatalog();
  if (catalog[type].some((existing) => existing.toLowerCase() === item.toLowerCase())) fail("That entry already exists.");
  write("clinicCatalog", { ...catalog, [type]: [...catalog[type], item] });
}

export async function removeClinicCatalogItem(type, value) {
  await wait();
  if (type !== "services" && type !== "vets") fail("Unknown clinic list.");
  const catalog = await getClinicCatalog();
  if (catalog[type].length <= 1) fail("Keep at least one option available.");
  const hasOpenAppointment = read("appointments", []).some((appointment) =>
    ["Pending", "Scheduled"].includes(appointment.status) &&
    appointment[type === "vets" ? "vet" : "service"] === value
  );
  if (hasOpenAppointment) fail("This option is assigned to a pending or scheduled appointment. Reassign those appointments first.");
  write("clinicCatalog", { ...catalog, [type]: catalog[type].filter((item) => item !== value) });
}

// GET /api/appointments/availability?date=...&vet=...
export async function getUnavailableTimes(date, vet, ignoreId) {
  await wait(100);
  return read("appointments", [])
    .filter((a) =>
      ["Pending", "Scheduled"].includes(a.status) &&
      a.vet === vet &&
      a.date === date &&
      a.id !== ignoreId
    )
    .map((a) => a.time);
}

const isTaken = (list, data, ignoreId) =>
  ["Pending", "Scheduled"].includes(data.status) &&
  list.some((a) =>
    a.id !== ignoreId &&
    ["Pending", "Scheduled"].includes(a.status) &&
    a.vet === data.vet &&
    a.date === data.date &&
    a.time === data.time
  );

// POST /api/appointments
export async function createAppointment(userId, data, { requirePetProfile = false } = {}) {
  await wait();
  const all = read("appointments", []);
  if (requirePetProfile && !data.petId) fail("Choose one of your saved pet profiles before booking.");
  let appointmentData = data;
  if (data.petId) {
    const pet = read("pets", []).find((item) => item.id === data.petId && item.ownerId === userId);
    if (!pet) fail("That pet profile could not be found in your account.");
    const owner = read("users", []).find((user) => user.id === userId);
    appointmentData = { ...data, petName: pet.name, species: pet.species, petPhoto: data.petPhoto || pet.photoUrl || pet.photo || "", ownerName: owner?.name || data.ownerName };
  }
  const request = { ...appointmentData, status: "Pending" };
  if (isTaken(all, request)) fail(`${request.vet} is already booked at that time. Pick another slot.`);
  const item = { ...request, id: crypto.randomUUID(), userId };
  write("appointments", [...all, item]);
  createNotifications(getActiveClinicTeam(), {
    appointmentId: item.id,
    title: "New appointment request",
    message: `${item.ownerName} requested ${appointmentLabel(item)}.`,
    type: "request"
  });
  return item;
}

// PUT /api/appointments/:id
export async function updateAppointment(id, data) {
  await wait();
  const all = read("appointments", []);
  const existing = all.find((appointment) => appointment.id === id);
  if (!existing) fail("Appointment not found.");
  if (isTaken(all, data, id)) fail(`${data.vet} is already booked at that time. Pick another slot.`);
  const updated = { ...existing, ...data };
  write("appointments", all.map((a) => (a.id === id ? updated : a)));
  if (data.status !== existing.status && ["Scheduled", "Completed", "Cancelled"].includes(data.status)) {
    const approved = data.status === "Scheduled";
    const completed = data.status === "Completed";
    const recipients = new Set([existing.userId, ...getActiveClinicTeam()]);
    const title = approved ? "Appointment approved" : completed ? "Visit completed" : "Appointment canceled";
    const message = approved
      ? `${appointmentLabel(updated)} was approved.`
      : completed
        ? `${appointmentLabel(updated)} has been marked as completed.`
        : `${appointmentLabel(updated)} was canceled.`;
    createNotifications([...recipients], {
      appointmentId: id,
      title,
      message,
      type: approved ? "approved" : completed ? "completed" : "cancelled"
    });
  }
}

// DELETE /api/appointments/:id
export async function deleteAppointment(id) {
  await wait();
  write("appointments", read("appointments", []).filter((a) => a.id !== id));
}
