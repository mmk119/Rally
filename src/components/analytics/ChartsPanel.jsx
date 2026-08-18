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

const pieColors = ["#bef264", "#86efac", "#4ade80", "#22c55e"];
const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #2b3a2e",
  background: "#141b15",
  color: "#f0f6ec",
  fontSize: 12,
};

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide">{title}</h3>
        <p className="text-xs text-slate-400">{subtitle}</p>
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
              <AreaChart data={trendData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="rallyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bef264" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#bef264" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2a21" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
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
                <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [`${v} bookings`, name]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#a9bcab" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
