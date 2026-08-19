import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { courts } from "../../data/mockData";

// Lime leads as the primary series; the rest step down in lightness so slices
// stay distinguishable on the dark card without introducing new hues.
const pieColors = ["#bef264", "#a3e635", "#6b9e4a", "#3f6135"];
const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #232b27",
  background: "#1b2320",
  color: "#f5f7f4",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
};
// Recharts defaults tooltip rows to black, which is unreadable on the dark card,
// so item and label colors are set explicitly.
const tooltipItemStyle = { color: "#f5f7f4" };
const tooltipLabelStyle = { color: "#9ba8a0", marginBottom: 2 };
// secondary rather than tertiary: axis labels are text and need to stay readable
const axisTick = { fontSize: 11, fill: "#9ba8a0" };

function ChartCard({ title, subtitle, aside, children }) {
  return (
    <div className="glassCard flex h-full flex-col rounded-card p-5 shadow-lg shadow-black/20">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold uppercase tracking-wide text-ink">{title}</h3>
          <p className="text-xs text-faint">{subtitle}</p>
        </div>
        {aside}
      </div>
      {children}
    </div>
  );
}

export default function ChartsPanel({ visible, range }) {
  const trendData = useMemo(
    () => visible.map((d) => ({ label: d.label, bookings: d.bookings, revenue: d.revenue })),
    [visible]
  );

  // The dashed reference line gives every point something to be read against,
  // so the trend answers "is today good?" and not just "what happened?".
  const average = useMemo(
    () => (trendData.length ? trendData.reduce((a, d) => a + d.bookings, 0) / trendData.length : 0),
    [trendData]
  );

  const courtShare = useMemo(() => {
    const totals = {};
    for (const day of visible) {
      for (const [name, count] of Object.entries(day.perCourt)) {
        totals[name] = (totals[name] || 0) + count;
      }
    }
    return courts.map((c) => ({ name: c.name, value: totals[c.name] || 0 }));
  }, [visible]);

  const shareTotal = courtShare.reduce((a, c) => a + c.value, 0) || 1;
  // the donut's hole carries the answer, rather than leaving it to the legend
  const topCourt = [...courtShare].sort((a, b) => b.value - a.value)[0];

  return (
    <div className="grid gap-3 sm:gap-4 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <ChartCard
          title="Bookings over time"
          subtitle={`Daily bookings, last ${range} days`}
          aside={
            <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-hairline px-2.5 py-1 text-[11px] font-semibold text-muted">
              <span className="h-px w-3 border-t border-dashed border-slate-400" />
              Avg {average.toFixed(0)}
            </span>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {/* no negative left margin: it clipped the y axis labels down to their last digit */}
              <AreaChart data={trendData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rallyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bef264" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#bef264" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#232b27" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis tick={axisTick} tickLine={false} axisLine={false} width={40} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={tooltipItemStyle}
                  labelStyle={tooltipLabelStyle}
                  cursor={{ stroke: "#bef264", strokeWidth: 1, strokeDasharray: "4 4" }}
                  formatter={(v, name) => (name === "revenue" ? [`$${v}`, "Revenue"] : [v, "Bookings"])}
                />
                <ReferenceLine y={average} stroke="#5f6b64" strokeDasharray="5 5" strokeWidth={1} />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#bef264"
                  strokeWidth={2.5}
                  fill="url(#rallyFill)"
                  activeDot={{ r: 4, fill: "#bef264", stroke: "#0b0f0c", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="lg:col-span-2">
        <ChartCard title="Bookings by court" subtitle={`Share of bookings, last ${range} days`}>
          {/* donut with the headline in the hole, then a value legend beneath */}
          <div className="relative h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courtShare}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="66%"
                  outerRadius="92%"
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {courtShare.map((entry, i) => (
                    <Cell key={entry.name} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={tooltipItemStyle}
                  labelStyle={tooltipLabelStyle}
                  formatter={(v, name) => [`${v} bookings`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-bold leading-none text-ink">
                {topCourt?.name.replace("Court ", "C") ?? "—"}
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
                Top court
              </span>
            </div>
          </div>

          <ul className="mt-4 space-y-1.5">
            {courtShare.map((c, i) => (
              <li key={c.name} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: pieColors[i % pieColors.length] }}
                />
                <span className="flex-1 text-muted">{c.name}</span>
                <span className="tabularNums font-semibold text-ink">{c.value}</span>
                <span className="tabularNums w-9 text-right text-faint">
                  {Math.round((c.value / shareTotal) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </ChartCard>
      </div>
    </div>
  );
}
