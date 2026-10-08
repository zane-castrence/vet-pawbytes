import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_LABEL = {
  customer: "Pet owner",
  admin: "Admin",
  staff: "Staff",
  veterinarian: "Veterinarian",
};

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#D8DEE3] py-3 last:border-0">
      <span className="text-[14px] text-[#4B5563]">{label}</span>
      <span className="truncate text-[14px] font-medium text-[#1F2937]">{children}</span>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 pt-28 font-figtree text-[#1F2937] lg:pt-10">
      <h1 className="text-[28px] font-extrabold tracking-tight">Settings</h1>

      <section className="mt-8">
        <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-[#4B5563]">
          Account
        </h2>
        <div className="rounded-[20px] border border-[#D8DEE3] px-6 py-2">
          <Row label="Name">{user?.name}</Row>
          <Row label="Email">{user?.email}</Row>
          <Row label="Role">{ROLE_LABEL[user?.role] || user?.role}</Row>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-[#4B5563]">
          About
        </h2>
        <div className="rounded-[20px] border border-[#D8DEE3] px-6 py-2">
          <Row label="Credits">
            <Link
              to="/credits"
              className="text-[#0369A1] underline-offset-2 hover:underline"
            >
              View
            </Link>
          </Row>
        </div>
      </section>
    </div>
  );
}