import { useMemo } from "react";
import { generateHistory } from "../../data/mockData";
import { useApp } from "../../store";
import KpiCards from "./KpiCards";
import ChartsPanel from "./ChartsPanel";
import OccupancyHeatmap from "./OccupancyHeatmap";
import BookingsTable from "./BookingsTable";

export default function AnalyticsTab() {
  // range comes from the store so Coach can align it with a figure it quoted
  const { isSlotTaken, range, setRange } = useApp();
  // same predicate the heatmap and slot picker use, so bookings and
  // cancellations move the KPIs and charts too
  const history = useMemo(() => generateHistory(60, isSlotTaken), [isSlotTaken]);
  const visible = useMemo(() => history.slice(-range), [history, range]);
  const previous = useMemo(() => history.slice(-range * 2, -range), [history, range]);

  return (
    <div className="space-y-5">
      {/* Header sits on the page rather than in a card: an editorial masthead
          with the live marker, so the dashboard opens with a bit of presence. */}
      <div className="riseIn flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-lime-pop">
            <span className="relative flex h-1.5 w-1.5">
              <span className="pulseRing absolute inline-flex h-full w-full rounded-full bg-lime-pop opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime-pop" />
            </span>
            Live club data
          </div>
          <h1 className="mt-1.5 font-display text-4xl font-bold uppercase leading-none tracking-tight text-ink sm:text-5xl">
            Club analytics
          </h1>
          <p className="mt-2 text-sm text-muted">
            How Rally is performing across {range} days of court time.
          </p>
        </div>

        <div
          role="group"
          aria-label="Date range"
          className="flex rounded-full border border-hairline bg-card/80 p-1 text-sm font-semibold backdrop-blur"
        >
          {[7, 30].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={`rounded-full px-4 py-1.5 transition-colors duration-150 ${
                range === r ? "bg-lime-pop text-night" : "text-faint hover:text-muted"
              }`}
            >
              {r}D
            </button>
          ))}
        </div>
      </div>

      {/* stagger: each block rises in just behind the one above it */}
      <div className="riseIn" style={{ "--d": "60ms" }}>
        <KpiCards visible={visible} previous={previous} />
      </div>
      <div className="riseIn" style={{ "--d": "120ms" }}>
        <ChartsPanel visible={visible} range={range} />
      </div>
      <div className="riseIn" style={{ "--d": "180ms" }}>
        <OccupancyHeatmap range={range} />
      </div>
      <div className="riseIn" style={{ "--d": "240ms" }}>
        <BookingsTable rangeKey={range} />
      </div>
    </div>
  );
}
