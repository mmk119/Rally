import { useMemo } from "react";
import { useApp } from "../../store";
import { getHeatmap } from "../../data/mockData";

// Demand ramp: dark low-demand surface climbing to the lime accent at the top.
// Interpolating in RGB between two anchors keeps the scale readable on the dark card.
const low = [27, 35, 32]; // #1B2320
const high = [190, 242, 100]; // #BEF264

function cellColor(ratio) {
  if (ratio <= 0) return "#161d18";
  // ease the low end so mid demand is still visible
  const t = Math.pow(Math.min(ratio, 1), 0.75);
  const mix = low.map((c, i) => Math.round(c + (high[i] - c) * t));
  return `rgb(${mix.join(",")})`;
}

function shortHour(hour) {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}${hour < 12 ? "am" : "pm"}`;
}

/** Day parts, used to band the columns so 8am and 8pm are never confused. */
function dayPart(hour) {
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

export default function OccupancyHeatmap({ range }) {
  const { isSlotTaken, demoMode, heatmapFocus } = useApp();

  const { hours, rows } = useMemo(
    () => getHeatmap(range, isSlotTaken),
    // demoMode is folded into isSlotTaken; listed so the grid repaints when it flips
    [range, isSlotTaken, demoMode]
  );

  // column spans for the day-part band above the grid
  const bands = useMemo(() => {
    const out = [];
    for (const h of hours) {
      const name = dayPart(h);
      const last = out[out.length - 1];
      if (last && last.name === name) last.span++;
      else out.push({ name, span: 1 });
    }
    return out;
  }, [hours]);

  return (
    <div className="glassCard rounded-card p-5 shadow-lg shadow-black/20">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold uppercase tracking-wide text-ink">
            Occupancy heatmap
          </h3>
          <p className="text-xs text-faint">
            Share of days booked, by court and start time (8am to 10pm), last {range} days
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-faint">
          <span>Low</span>
          <div className="flex overflow-hidden rounded-full">
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <span key={t} className="h-2.5 w-6" style={{ background: cellColor(t) }} />
            ))}
          </div>
          <span>High</span>
        </div>
      </div>

      {/* narrow screens scroll the grid rather than squeezing or overflowing the page */}
      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `72px repeat(${hours.length}, minmax(0, 1fr))` }}
          >
            {/* day-part band: morning / afternoon / evening across the columns */}
            <span />
            {bands.map((b) => (
              <span
                key={b.name}
                style={{ gridColumn: `span ${b.span}` }}
                className="mb-1 border-b border-hairline pb-1 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-faint"
              >
                {b.name}
              </span>
            ))}

            <span />
            {hours.map((h) => (
              <span
                key={h}
                className={`pb-1.5 text-center text-[10px] font-medium transition-colors duration-150 ${
                  heatmapFocus === h ? "font-bold text-lime-pop" : "text-muted"
                }`}
              >
                {shortHour(h)}
              </span>
            ))}

            {rows.map((row) => (
              <Row key={row.court} row={row} focusHour={heatmapFocus} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ row, focusHour }) {
  return (
    <>
      <span className="flex items-center pr-2 text-xs font-semibold text-muted">{row.court}</span>
      {row.cells.map((cell) => (
        <div
          key={cell.hour}
          title={`${row.court} · ${shortHour(cell.hour)} · ${Math.round(cell.ratio * 100)}% booked`}
          className={`group relative h-8 rounded-md transition-all duration-150 hover:z-10 hover:scale-[1.14] ${
            focusHour === cell.hour ? "ring-2 ring-lime-pop ring-offset-2 ring-offset-card" : ""
          } ${focusHour != null && focusHour !== cell.hour ? "opacity-40" : ""}`}
          style={{
            background: cellColor(cell.ratio),
            // the hottest cells throw a little light, so pressure points are findable at a glance
            boxShadow: cell.ratio > 0.75 ? `0 0 14px rgba(190, 242, 100, ${(cell.ratio - 0.75) * 0.9})` : "none",
          }}
        >
          <span className="pointer-events-none absolute -top-8 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-control border border-hairline bg-raised px-2 py-1 text-[11px] font-semibold text-ink shadow-lg group-hover:block">
            {Math.round(cell.ratio * 100)}%
          </span>
        </div>
      ))}
    </>
  );
}
