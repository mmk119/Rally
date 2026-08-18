import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { courts } from "../../data/mockData";

// Four steps with a clear lightness progression so slices stay distinguishable
// on the dark card without relying on hue alone.
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

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-card border border-hairline bg-card p-5 shadow-lg shadow-black/20">
      <div className="mb-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink">{title}</h3>
        <p className="text-xs text-faint">{subtitle}</p>
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

  const courtShare = useMemo(() => {
    const totals = {};
    for (const day of visible) {
      for (const [name, count] of Object.entries(day.perCourt)) {
        totals[name] = (totals[name] || 0) + count;
      }
    }
    return courts.map((c) => ({ name: c.name, value: totals[c.name] || 0 }));
  }, [visible]);

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <ChartCard title="Bookings over time" subtitle={`Daily bookings, last ${range} days`}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {/* no negative left margin: it clipped the y axis labels down to their last digit */}
              <AreaChart data={trendData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rallyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bef264" stopOpacity={0.3} />
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
                  cursor={{ stroke: "#2e3833", strokeWidth: 1 }}
                  formatter={(v, name) => (name === "revenue" ? [`$${v}`, "Revenue"] : [v, "Bookings"])}
                />
                <Area type="monotone" dataKey="bookings" stroke="#bef264" strokeWidth={2.5} fill="url(#rallyFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="lg:col-span-2">
        <ChartCard title="Bookings by court" subtitle={`Share of bookings, last ${range} days`}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courtShare}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="80%"
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
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12 }}
                  // label text keeps one readable color; the dot carries the series color
                  formatter={(value) => <span style={{ color: "#9ba8a0" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
