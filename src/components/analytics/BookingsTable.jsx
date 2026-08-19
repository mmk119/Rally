import { useEffect, useMemo, useState } from "react";
import { useApp } from "../../store";
import { formatDate, formatHour } from "../../data/mockData";

// Muted status colors so nothing competes with the lime accent. The thin
// matching border gives each pill an edge, the way the design explorations
// outline their status chips rather than relying on fill alone.
const statusStyles = {
  Confirmed: { pill: "border-ok/25 bg-ok/12 text-ok", dot: "bg-ok" },
  Pending: { pill: "border-warn/25 bg-warn/12 text-warn", dot: "bg-warn" },
  Cancelled: { pill: "border-hairline bg-slate-100 text-faint", dot: "bg-faint" },
};

function StatusPill({ status }) {
  const s = statusStyles[status] || statusStyles.Cancelled;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${s.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
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
  const { allRows, lastBookingRef, cancelBooking } = useApp();
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
    <div className="glassCard overflow-hidden rounded-card shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-4">
        <div>
          <h3 className="font-display text-base font-bold uppercase tracking-wide text-ink">
            Recent bookings
          </h3>
          <p className="text-xs text-faint">Click a column to sort · hover a row to cancel</p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customer, court, status…"
          aria-label="Search bookings"
          className="w-56 rounded-full border border-hairline bg-night/60 px-4 py-2 text-sm text-ink placeholder:text-faint outline-none transition-colors duration-150 focus:border-lime-pop"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline bg-raised/40 text-[11px] uppercase tracking-[0.14em] text-faint">
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-bold">
                  <button
                    onClick={() => toggleSort(c.key)}
                    aria-sort={sort.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                    className="inline-flex items-center gap-1 rounded transition-colors duration-150 hover:text-muted"
                  >
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
          <tbody className="divide-y divide-hairline">
            {loading ? (
              <SkeletonRows />
            ) : failed ? (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-bad/12">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-bad" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 8v5" strokeLinecap="round" />
                      <circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none" />
                      <path d="M10.3 3.9L2.6 17.4A2 2 0 004.3 20.4h15.4a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-700">Couldn't load bookings</p>
                  <p className="mt-0.5 text-xs text-muted">Something went wrong fetching recent bookings.</p>
                  <button
                    onClick={() => setAttempt((a) => a + 1)}
                    className="mt-3 rounded-full bg-lime-pop px-5 py-1.5 text-xs font-bold text-night transition-colors duration-150 hover:bg-lime-glow active:scale-[0.98]"
                  >
                    Retry
                  </button>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    {query ? (
                      <svg viewBox="0 0 24 24" className="h-6 w-6 text-faint" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="7" />
                        <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                      </svg>
                    ) : (
                      // an empty court: the net, waiting for players
                      <svg viewBox="0 0 24 24" className="h-6 w-6 text-faint" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="6" width="18" height="12" rx="1.5" />
                        <path d="M12 6v12M3 12h18" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  {query ? (
                    <>
                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        Nothing matches "{query}"
                      </p>
                      <p className="mt-0.5 text-xs text-muted">Try a name, a court, or a status.</p>
                      <button
                        onClick={() => setQuery("")}
                        className="mt-2 rounded-full px-3 py-1 text-sm font-semibold text-rally-700 transition-colors duration-150 hover:bg-rally-50"
                      >
                        Clear search
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        No bookings yet, your courts are wide open
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        The first reservation will land here the moment it is made.
                      </p>
                    </>
                  )}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.ref + r.createdAt}
                  className={`group transition-colors duration-150 hover:bg-raised ${
                    r.ref === lastBookingRef ? "flashRow" : ""
                  } ${r.status === "Cancelled" ? "opacity-60" : ""}`}
                >
                  <td className="px-4 py-3">
                    <span className="tabularNums rounded-md border border-hairline bg-raised/60 px-2 py-1 font-mono text-[11px] font-semibold text-muted">
                      {r.ref}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink">{r.customer}</td>
                  <td className="px-4 py-3 text-slate-600">{r.court}</td>
                  <td className={`px-4 py-3 text-muted ${r.status === "Cancelled" ? "line-through" : ""}`}>
                    {formatDate(r.date)} · {formatHour(r.hour)}
                  </td>
                  <td className="tabularNums px-4 py-3 font-display text-base font-bold text-ink">${r.price}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <StatusPill status={r.status} />
                      {r.status !== "Cancelled" && (
                        // revealed on row hover or keyboard focus, so the table stays calm
                        <button
                          onClick={() => cancelBooking(r)}
                          aria-label={`Cancel booking ${r.ref}`}
                          className="rounded-full px-2 py-0.5 text-xs font-semibold text-faint opacity-0 transition duration-150 hover:bg-bad/12 hover:text-bad focus-visible:opacity-100 group-hover:opacity-100"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
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
