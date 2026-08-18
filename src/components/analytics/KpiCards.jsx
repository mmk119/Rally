import { useMemo } from "react";
import { courts, openHour, closeHour, formatHour } from "../../data/mockData";
import { useApp } from "../../store";
import { useCountUp } from "../../lib/useCountUp";

function Trend({ delta }) {
  const up = delta >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
        up ? "bg-ok/12 text-ok" : "bg-bad/12 text-bad"
      }`}
    >
      <svg viewBox="0 0 12 12" className={`h-2.5 w-2.5 ${up ? "" : "rotate-180"}`} fill="currentColor">
        <path d="M6 2l4 5H2l4-5z" />
      </svg>
      {Math.abs(delta).toFixed(1)}%
    </span>
  );
}

function Card({ label, value, delta, hint }) {
  return (
    <div className="group rounded-card border border-hairline bg-card p-5 shadow-lg shadow-black/20 transition-colors duration-150 hover:border-slate-300">
      <p className="text-xs font-semibold uppercase tracking-wide text-faint">{label}</p>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <span className="tabularNums font-display text-3xl font-bold leading-none text-ink">{value}</span>
        {delta !== null && <Trend delta={delta} />}
      </div>
      <p className="mt-2 text-xs text-muted">{hint}</p>
    </div>
  );
}

export default function KpiCards({ visible, previous }) {
  const { isSlotTaken } = useApp();

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
          if (isSlotTaken(day.date, h, c.id)) byHour[h] = (byHour[h] || 0) + 1;
        }
      }
    }
    const peak = Object.entries(byHour).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 19;

    // how demand at that same peak hour moved vs the previous period
    let prevPeakCount = 0;
    for (const day of previous) {
      for (const c of courts) {
        if (isSlotTaken(day.date, Number(peak), c.id)) prevPeakCount++;
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
  }, [visible, previous, isSlotTaken]);

  // numbers tick up on mount and whenever the range control changes
  const bookingsUp = useCountUp(stats.bookings);
  const revenueUp = useCountUp(stats.revenue);
  const occupancyUp = useCountUp(stats.occupancy);
  const peakCountUp = useCountUp(stats.peakCount);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card
        label="Bookings"
        value={Math.round(bookingsUp).toLocaleString()}
        delta={stats.bookingsDelta}
        hint="vs previous period"
      />
      <Card
        label="Revenue"
        value={`$${Math.round(revenueUp).toLocaleString()}`}
        delta={stats.revenueDelta}
        hint="vs previous period"
      />
      <Card
        label="Occupancy"
        value={`${occupancyUp.toFixed(0)}%`}
        delta={stats.occupancyDelta}
        hint="of all court hours"
      />
      <Card
        label="Peak hour"
        value={formatHour(stats.peak)}
        delta={stats.peakDelta}
        hint={`${Math.round(peakCountUp)} bookings at this hour`}
      />
    </div>
  );
}
