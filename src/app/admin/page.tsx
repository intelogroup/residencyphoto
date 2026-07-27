"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const MOCK_USERS = [
  { name: "Jane Chen", email: "jchen@hospital.org", plan: "Resident", joined: "Jul 2, 2026", downloads: 3 },
  { name: "Marcus Lee", email: "mlee@med.edu", plan: "Free", joined: "Jul 5, 2026", downloads: 1 },
  { name: "St. Mary's Program Office", email: "residency@stmarys.org", plan: "Program", joined: "Jun 28, 2026", downloads: 42 },
  { name: "Priya Patel", email: "ppatel@hospital.org", plan: "Resident", joined: "Jul 10, 2026", downloads: 1 },
];

const MOCK_STATS = [
  { label: "Total users", value: "1,204" },
  { label: "Paid conversions", value: "312" },
  { label: "Revenue (30d)", value: "$2,140" },
  { label: "Photos processed", value: "4,988" },
];

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    fetch("/api/admin/verify")
      .then((res) => {
        if (res.ok) setAuthorized(true);
        else router.replace("/dashboard");
      })
      .catch(() => router.replace("/dashboard"));
  }, [router]);

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-bg font-sans p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="tag mb-2">Admin — internal only</span>
            <h1 className="font-serif text-3xl text-heading mt-1">Overview</h1>
          </div>
          <a href="/dashboard" className="btn-ghost text-sm">Back to app</a>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {MOCK_STATS.map((s) => (
            <div key={s.label} className="card bg-white p-5">
              <div className="text-xs text-muted">{s.label}</div>
              <div className="font-serif text-2xl text-heading mt-1">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="card bg-white p-6">
          <h3 className="font-serif text-lg text-heading border-b border-slate-100 pb-3 mb-4">Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-slate-100">
                  <th className="py-2 pr-4 font-semibold">Name</th>
                  <th className="py-2 pr-4 font-semibold">Email</th>
                  <th className="py-2 pr-4 font-semibold">Plan</th>
                  <th className="py-2 pr-4 font-semibold">Joined</th>
                  <th className="py-2 pr-4 font-semibold">Downloads</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map((u) => (
                  <tr key={u.email} className="border-b border-slate-50">
                    <td className="py-3 pr-4 text-heading font-medium">{u.name}</td>
                    <td className="py-3 pr-4 text-muted">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span className={u.plan === "Free" ? "pill-error" : "pill-success"}>{u.plan}</span>
                    </td>
                    <td className="py-3 pr-4 text-muted">{u.joined}</td>
                    <td className="py-3 pr-4 text-muted">{u.downloads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-muted mt-4">Mock data — connects to real user records once the backend ships.</p>
        </div>
      </div>
    </div>
  );
}
