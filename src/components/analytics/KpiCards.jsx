import { useEffect, useMemo, useRef } from "react";
import { courts, openHour, closeHour, formatHour, peakHourFor, countAtHour } from "../../data/mockData";
import { useApp } from "../../store";
import { useCountUp } from "../../lib/useCountUp";

/* Metric glyphs, one per card, so the row scans as icons before it scans as text. */
const icons = {
  bookings: <path d="M3 5.5A2.5 2.5 0 015.5 3h13A2.5 2.5 0 0121 5.5v13a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 18.5v-13zM3 9h18M8 3v4M16 3v4" strokeLinecap="round" />,
  revenue: <><path d="M12 2v20" strokeLinecap="round" /><path d="M17 6.5c0-1.9-2.2-3-5-3s-5 1.1-5 3 2.2 2.7 5 3.2 5 1.3 5 3.3-2.2 3.2-5 3.2-5-1.3-5-3.2" strokeLinecap="round" /></>,
  occupancy: <><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 019 9h-9V3z" fill="currentColor" stroke="none" opacity="0.35" /></>,
  peak: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5.2l3.4 2" strokeLinecap="round" /></>,
};

/**
 * `unit` distinguishes a relative change from an absolute one: occupancy moves
 * by percentage POINTS, so rendering it with a % suffix beside the true
 * percentage changes on the other cards was quietly misreporting it.
 */
function Trend({ delta, unit = "%" }) {
  const up = delta >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
        up ? "bg-ok/12 text-ok" : "bg-bad/12 text-bad"
      }`}
      title={unit === "pp" ? "change in percentage points vs the previous period" : "percentage change vs the previous period"}
    >
      <svg viewBox="0 0 12 12" className={`h-2.5 w-2.5 ${up ? "" : "rotate-180"}`} fill="currentColor">
        <path d="M6 2l4 5H2l4-5z" />
      </svg>
      {Math.abs(delta).toFixed(1)}
      {unit === "pp" ? " pp" : "%"}
    </span>
  );
}

/**
 * A KPI tile. The lime hairline across the top only lights up on hover, so the
 * row stays calm at rest and still rewards a pass of the cursor.
 * `meter` (0..1) draws the fill bar used by occupancy.
 */
function Card({ label, value, delta, hint, icon, meter, unit, focused }) {
  const ref = useRef(null);
  useEffect(() => {
    if (focused) ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focused]);

  return (
    <div
      ref={ref}
      className={`glassCard group relative overflow-hidden rounded-card p-5 shadow-lg shadow-black/20 transition-colors duration-200 hover:border-rally-300 ${
        focused ? "border-lime-pop ring-2 ring-lime-pop ring-offset-2 ring-offset-night" : ""
      }`}
    >
      <span
        className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-lime-pop to-transparent opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-70"
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">{label}</p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-raised/70 text-faint transition-colors duration-200 group-hover:text-lime-pop">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            {icon}
          </svg>
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-2.5">
        <span className="tabularNums font-display text-4xl font-bold leading-none tracking-tight text-ink">
          {value}
        </span>
        {delta !== null && <Trend delta={delta} unit={unit} />}
      </div>

      {meter !== undefined && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-raised">
          <div
            className="h-full rounded-full bg-lime-pop transition-[width] duration-700 ease-out"
            style={{ width: `${Math.min(Math.max(meter, 0), 1) * 100}%` }}
          />
        </div>
      )}

      <p className={`text-xs text-muted ${meter !== undefined ? "mt-2" : "mt-3"}`}>{hint}</p>
    </div>
  );
}

export default function KpiCards({ visible, previous }) {
  const { isSlotTaken, metricFocus } = useApp();

  const stats = useMemo(() => {
    const sum = (rows, key) => rows.reduce((a, r) => a + r[key], 0);
    const bookings = sum(visible, "bookings");
    const prevBookings = sum(previous, "bookings") || 1;
    const revenue = sum(visible, "revenue");
    const prevRevenue = sum(previous, "revenue") || 1;

    const totalSlots = visible.length * courts.length * (closeHour - openHour);
    const occupancy = (bookings / totalSlots) * 100;
    const prevOccupancy = (sum(previous, "bookings") / (previous.length * courts.length * (closeHour - openHour) || 1)) * 100 || 1;

    // shared helper, so Coach's chat snippet reports the same peak hour
    const { hour: peak, count: peakCount } = peakHourFor(visible, isSlotTaken);
    // how demand at that same peak hour moved vs the previous period
    const prevPeakCount = countAtHour(previous, peak, isSlotTaken);
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
      peak,
    };
  }, [visible, previous, isSlotTaken]);

  // numbers tick up on mount and whenever the range control changes
  const bookingsUp = useCountUp(stats.bookings);
  const revenueUp = useCountUp(stats.revenue);
  const occupancyUp = useCountUp(stats.occupancy);
  const peakCountUp = useCountUp(stats.peakCount);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <Card
        label="Bookings"
        value={Math.round(bookingsUp).toLocaleString()}
        delta={stats.bookingsDelta}
        hint="vs previous period"
        icon={icons.bookings}
        focused={metricFocus === "bookings"}
      />
      <Card
        label="Revenue"
        value={`$${Math.round(revenueUp).toLocaleString()}`}
        delta={stats.revenueDelta}
        hint="vs previous period"
        icon={icons.revenue}
        focused={metricFocus === "revenue"}
      />
      <Card
        label="Occupancy"
        value={`${occupancyUp.toFixed(0)}%`}
        delta={stats.occupancyDelta}
        hint="of all court hours"
        icon={icons.occupancy}
        focused={metricFocus === "occupancy"}
        unit="pp"
        meter={stats.occupancy / 100}
      />
      <Card
        label="Peak hour"
        value={formatHour(stats.peak)}
        delta={stats.peakDelta}
        hint={`${Math.round(peakCountUp)} bookings at this hour`}
        icon={icons.peak}
        focused={metricFocus === "peak"}
      />
    </div>
  );
}
