const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const today = () => {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};
const currentTime = () => {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(11, 16);
};

export function validateAuth({ name, email, password }, isRegister) {
  const e = {};
  if (isRegister && (!name || name.trim().length < 2)) e.name = "Enter your full name (at least 2 characters).";
  if (!emailRe.test(email || "")) e.email = "Enter a valid email, like name@example.com.";
  if (!password || password.length < 6) e.password = "Password must be at least 6 characters.";
  return e;
}

export function validateAppointment(f) {
  const e = {};
  const needsFutureSlot = f.status === "Pending" || f.status === "Scheduled";
  if (!f.ownerName.trim()) e.ownerName = "Enter the owner's name.";
  if (!f.petName.trim()) e.petName = "Enter the pet's name.";
  if (!f.species) e.species = "Choose a species.";
  if (!f.service) e.service = "Choose a service.";
  if (!f.vet) e.vet = "Choose a veterinarian.";
  if (!f.date) e.date = "Pick a date.";
  else if (needsFutureSlot && f.date < today()) e.date = "Pending and scheduled appointments can't be in the past.";
  if (!f.time) e.time = "Pick a time.";
  else if (f.time < "08:00" || f.time > "17:00") e.time = "Clinic hours are 8:00 AM to 5:00 PM.";
  else if (needsFutureSlot && f.date === today() && f.time <= currentTime()) e.time = "Choose a time later today.";
  if (f.notes.length > 200) e.notes = "Notes must be 200 characters or fewer.";
  return e;
}

export function validateSignUp(f) {
  const e = {};
  const phone = (f.phone || "").replace(/[\s-]/g, "");

  if (!f.name || f.name.trim().length < 2) e.name = "Enter your full name (at least 2 characters).";
  if (!emailRe.test(f.email || "")) e.email = "Enter a valid email, like name@example.com.";
  if (!/^(09|\+639)\d{9}$/.test(phone)) e.phone = "Enter a valid mobile number, like 09123456789.";
  if (!f.address || f.address.trim().length < 5) e.address = "Enter your street address.";
  if (!f.city || f.city.trim().length < 2) e.city = "Enter your city or municipality.";
  if (!f.province || f.province.trim().length < 2) e.province = "Enter your province.";

  if (!f.password || f.password.length < 8) e.password = "Password must be at least 8 characters.";
  else if (!/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) e.password = "Password needs at least one letter and one number.";

  if (!f.confirmPassword) e.confirmPassword = "Re-enter your password.";
  else if (f.confirmPassword !== f.password) e.confirmPassword = "Passwords don't match.";

  if (!f.agree) e.agree = "You need to accept the terms to create an account.";
  return e;
}