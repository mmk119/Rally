import { useEffect, useMemo, useState } from "react";
import { useApp } from "../../store";
import { formatDate, formatHour } from "../../data/mockData";

const statusStyles = {
  Confirmed: "bg-rally-100 text-rally-800",
  Pending: "bg-amber-400/15 text-amber-300",
  Cancelled: "bg-slate-100 text-slate-500",
};

function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "Confirmed" ? "bg-rally-600" : status === "Pending" ? "bg-amber-500" : "bg-slate-400"}`} />
      {status}
    </span>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 6 }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="skeleton h-4 w-full max-w-28 rounded" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

const columns = [
  { key: "ref", label: "Ref" },
  { key: "customer", label: "Customer" },
  { key: "court", label: "Court" },
  { key: "date", label: "Date & time" },
  { key: "price", label: "Price" },
  { key: "status", label: "Status" },
];

export default function BookingsTable({ rangeKey }) {
  const { allRows, lastBookingRef } = useApp();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "date", dir: "desc" });

  // Simulate a fetch so the loading state is visible; re-runs when the range control changes.
  // Append ?failTable=1 to the URL to exercise the error state; Retry always succeeds.
  useEffect(() => {
    setLoading(true);
    setFailed(false);
    const shouldFail =
      attempt === 0 && new URLSearchParams(window.location.search).has("failTable");
    const t = setTimeout(() => {
      setLoading(false);
      setFailed(shouldFail);
    }, 900);
    return () => clearTimeout(t);
  }, [rangeKey, attempt]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = allRows.filter(
      (r) =>
        !q ||
        r.ref.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.court.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
    out = [...out].sort((a, b) => {
      let va = a[sort.key];
      let vb = b[sort.key];
      if (sort.key === "date") {
        va = a.date + String(a.hour).padStart(2, "0");
        vb = b.date + String(b.hour).padStart(2, "0");
      }
      if (va < vb) return sort.dir === "asc" ? -1 : 1;
      if (va > vb) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return out;
  }, [allRows, query, sort]);

  const toggleSort = (key) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="font-display text-sm font-bold">Recent bookings</h3>
          <p className="text-xs text-slate-400">Click a column to sort</p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customer, court, status…"
          className="w-56 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm outline-none transition focus:border-rally-500 focus:bg-raised"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-semibold">
                  <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 hover:text-slate-600">
                    {c.label}
                    {sort.key === c.key && (
                      <svg viewBox="0 0 12 12" className={`h-3 w-3 ${sort.dir === "asc" ? "rotate-180" : ""}`} fill="currentColor">
                        <path d="M6 9L2 4h8L6 9z" />
                      </svg>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <SkeletonRows />
            ) : failed ? (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-400/15">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-red-300" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 8v5" strokeLinecap="round" />
                      <circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none" />
                      <path d="M10.3 3.9L2.6 17.4A2 2 0 004.3 20.4h15.4a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-700">Couldn't load bookings</p>
                  <p className="mt-0.5 text-xs text-slate-400">Something went wrong fetching recent bookings.</p>
                  <button
                    onClick={() => setAttempt((a) => a + 1)}
                    className="mt-3 rounded-full bg-lime-pop px-5 py-1.5 text-xs font-bold text-night transition hover:bg-lime-glow"
                  >
                    Retry
                  </button>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="7" />
                      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-600">No bookings match "{query}"</p>
                  <button onClick={() => setQuery("")} className="mt-1 text-sm font-semibold text-rally-700 hover:underline">
                    Clear search
                  </button>
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.ref + r.createdAt} className={`transition-colors hover:bg-slate-50/70 ${r.ref === lastBookingRef ? "flashRow" : ""}`}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-500">{r.ref}</td>
                  <td className="px-4 py-3 font-medium">{r.customer}</td>
                  <td className="px-4 py-3">{r.court}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDate(r.date)} · {formatHour(r.hour)}
                  </td>
                  <td className="px-4 py-3 font-medium">${r.price}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={r.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
