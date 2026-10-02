import { useEffect } from "react";
import { registerUser } from "../services/api";

// DEMO ONLY: delete this whole file before presenting.
const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@pawbytes.local", password: "PawBytesAdmin2026!" },
  { label: "Staff", email: "staff@pawbytes.local", password: "PawBytesStaff2026!" },
  { label: "User", email: "customer@pawbytes.local", password: "Customer123" }
];

export default function DemoAccounts({ onPick }) {
  // Admin and staff are created by the app. This makes sure the demo customer exists too.
  useEffect(() => {
    registerUser({
      name: "Demo Customer",
      email: "customer@pawbytes.local",
      password: "Customer123",
      phone: "09123456789",
      address: "123 Sample Street",
      city: "General Trias",
      province: "Cavite"
    }).catch(() => {}); // already exists, nothing to do
  }, []);

  return (
    <div>
      <p>Demo accounts (click to fill the form):</p>
      <div className="flex gap-2">
        {DEMO_ACCOUNTS.map((a) => (
          <button key={a.label} type="button" onClick={() => onPick(a.email, a.password)}>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}