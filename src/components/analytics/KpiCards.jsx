import { useMemo } from "react";
import { courts, openHour, closeHour, isSlotPreBooked, formatHour } from "../../data/mockData";

function Trend({ delta }) {
  const up = delta >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
        up ? "bg-rally-100 text-rally-800" : "bg-red-400/15 text-red-300"
      }`}
    >
      <svg viewBox="0 0 12 12" className={`h-3 w-3 ${up ? "" : "rotate-180"}`} fill="currentColor">
        <path d="M6 2l4 5H2l4-5z" />
      </svg>
      {Math.abs(delta).toFixed(1)}%
    </span>
  );
}

function Card({ label, value, delta, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <span className="font-display text-2xl font-bold tracking-tight">{value}</span>
        {delta !== null && <Trend delta={delta} />}
      </div>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

export default function KpiCards({ visible, previous }) {
  const stats = useMemo(() => {
    const sum = (rows, key) => rows.reduce((a, r) => a + r[key], 0);
    const bookings = sum(visible, "bookings");
    const prevBookings = sum(previous, "bookings") || 1;
    const revenue = sum(visible, "revenue");
    const prevRevenue = sum(previous, "revenue") || 1;

    const totalSlots = visible.length * courts.length * (closeHour - openHour);
    const occupancy = (bookings / totalSlots) * 100;
    const prevOccupancy = (sum(previous, "bookings") / (previous.length * courts.length * (closeHour - openHour) || 1)) * 100 || 1;

    // busiest start hour across the visible window
    const byHour = {};
    for (const day of visible) {
      for (let h = openHour; h < closeHour; h++) {
        for (const c of courts) {
          if (isSlotPreBooked(day.date, h, c.id)) byHour[h] = (byHour[h] || 0) + 1;
        }
      }
    }
    const peak = Object.entries(byHour).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 19;

    // how demand at that same peak hour moved vs the previous period
    let prevPeakCount = 0;
    for (const day of previous) {
      for (const c of courts) {
        if (isSlotPreBooked(day.date, Number(peak), c.id)) prevPeakCount++;
      }
    }
    const peakCount = byHour[peak] || 0;
    const peakDelta = prevPeakCount ? ((peakCount - prevPeakCount) / prevPeakCount) * 100 : 0;

    return {
      peakCount,
      peakDelta,
      bookings,
      bookingsDelta: ((bookings - prevBookings) / prevBookings) * 100,
      revenue,
      revenueDelta: ((revenue - prevRevenue) / prevRevenue) * 100,
      occupancy,
      occupancyDelta: occupancy - prevOccupancy,
      peak: Number(peak),
    };
  }, [visible, previous]);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card label="Bookings" value={stats.bookings.toLocaleString()} delta={stats.bookingsDelta} hint="vs previous period" />
      <Card label="Revenue" value={`$${stats.revenue.toLocaleString()}`} delta={stats.revenueDelta} hint="vs previous period" />
      <Card label="Occupancy" value={`${stats.occupancy.toFixed(0)}%`} delta={stats.occupancyDelta} hint="of all court hours" />
      <Card
        label="Peak hour"
        value={formatHour(stats.peak)}
        delta={stats.peakDelta}
        hint={`${stats.peakCount} bookings at this hour`}
      />
    </div>
  );
}
