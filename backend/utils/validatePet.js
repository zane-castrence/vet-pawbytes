const { fail } = require("./httpError");
const SPECIES = ["Dog", "Cat", "Bird", "Rabbit", "Other"];

module.exports = function validatePet(d) {
  if (!d || typeof d.name !== "string" || typeof d.species !== "string") fail("Enter a pet name and species.");
  const str = (v) => (typeof v === "string" ? v.trim() : "");
  const name = d.name.trim();
  const breed = str(d.breed);
  const sex = typeof d.sex === "string" ? d.sex : "";
  const birthday = typeof d.birthday === "string" ? d.birthday : "";
  const weightKg = d.weightKg === "" || d.weightKg == null ? "" : Number(d.weightKg);
  const color = str(d.color);
  const sterilized = typeof d.sterilized === "string" ? d.sterilized : "";
  const vaccinationStatus = typeof d.vaccinationStatus === "string" ? d.vaccinationStatus : "Unknown";
  const allergies = str(d.allergies);
  const medicalNotes = typeof d.medicalNotes === "string" ? d.medicalNotes.trim() : str(d.notes);
  const microchipNumber = str(d.microchipNumber);
  const photoUrl = str(d.photoUrl);

  if (name.length < 1 || name.length > 60) fail("Pet name must be 1–60 characters.");
  if (!SPECIES.includes(d.species)) fail("Choose a valid pet species.");
  if (breed.length < 1 || breed.length > 60) fail("Enter a breed of 1–60 characters.");
  if (!["Female", "Male"].includes(sex)) fail("Choose male or female.");
  if (!birthday || Number.isNaN(Date.parse(`${birthday}T00:00:00`)) || birthday > new Date().toISOString().slice(0, 10))
    fail("Enter a valid birthdate that is not in the future.");
  if (weightKg !== "" && (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 500)) fail("Weight must be between 0 and 500 kg.");
  if (color.length > 80) fail("Color or markings must be 80 characters or fewer.");
  if (sterilized && !["Yes", "No"].includes(sterilized)) fail("Choose yes or no for spayed/neutered status.");
  if (!["Up to date", "Overdue", "Unknown"].includes(vaccinationStatus)) fail("Choose a valid vaccination status.");
  if (allergies.length > 500) fail("Allergies must be 500 characters or fewer.");
  if (medicalNotes.length > 1000) fail("Medical notes must be 1000 characters or fewer.");
  if (microchipNumber.length > 50) fail("Microchip number must be 50 characters or fewer.");
  if (photoUrl) {
    let u;
    try { u = new URL(photoUrl); } catch { fail("Enter a valid photo URL."); }
    if (!["http:", "https:"].includes(u.protocol)) fail("Photo URL must use HTTP or HTTPS.");
  }
  return { name, species: d.species, breed, sex, birthday, weightKg, color, sterilized, vaccinationStatus, allergies, medicalNotes, notes: medicalNotes, microchipNumber, photoUrl };
};
