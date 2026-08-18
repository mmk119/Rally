import { useMemo, useState } from "react";
import { generateHistory } from "../../data/mockData";
import KpiCards from "./KpiCards";
import ChartsPanel from "./ChartsPanel";
import OccupancyHeatmap from "./OccupancyHeatmap";
import BookingsTable from "./BookingsTable";

export default function AnalyticsTab() {
  const [range, setRange] = useState(7);
  const history = useMemo(() => generateHistory(60), []);
  const visible = useMemo(() => history.slice(-range), [history, range]);
  const previous = useMemo(() => history.slice(-range * 2, -range), [history, range]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">
            Club analytics
          </h1>
          <p className="mt-0.5 text-sm text-muted">How Rally is performing, at a glance.</p>
        </div>
        <div
          role="group"
          aria-label="Date range"
          className="flex rounded-full border border-hairline bg-card p-1 text-sm font-semibold"
        >
          {[7, 30].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={`rounded-full px-4 py-1.5 transition-colors duration-150 ${
                range === r
                  ? "bg-raised text-ink"
                  : "text-faint hover:text-muted"
              }`}
            >
              Last {r} days
            </button>
          ))}
        </div>
      </div>

      <KpiCards visible={visible} previous={previous} />
      <ChartsPanel visible={visible} range={range} />
      <OccupancyHeatmap range={range} />
      <BookingsTable rangeKey={range} />
    </div>
  );
}
