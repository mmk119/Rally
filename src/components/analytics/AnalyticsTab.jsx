import { useMemo, useState } from "react";
import { generateHistory } from "../../data/mockData";
import KpiCards from "./KpiCards";
import ChartsPanel from "./ChartsPanel";
import BookingsTable from "./BookingsTable";

export default function AnalyticsTab() {
  const [range, setRange] = useState(7);
  const history = useMemo(() => generateHistory(60), []);
  const visible = useMemo(() => history.slice(-range), [history, range]);
  const previous = useMemo(() => history.slice(-range * 2, -range), [history, range]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Club analytics</h1>
          <p className="text-sm text-slate-500">How Rally is performing, at a glance.</p>
        </div>
        <div className="flex rounded-full bg-slate-100 p-1 text-sm font-semibold">
          {[7, 30].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-full px-4 py-1.5 transition-colors ${
                range === r ? "bg-card text-rally-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Last {r} days
            </button>
          ))}
        </div>
      </div>

      <KpiCards visible={visible} previous={previous} />
      <ChartsPanel visible={visible} range={range} />
      <BookingsTable rangeKey={range} />
    </div>
  );
}
