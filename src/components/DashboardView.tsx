import React, { useState } from 'react';
import { AnalyticsStats, Booking } from '../types';
import { ANALYTICS_7D, ANALYTICS_30D } from '../data/mockData';

interface DashboardViewProps {
  bookings: Booking[];
  onNavigateToCourts: () => void;
  onOpenCoachInsight?: (prompt: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  bookings,
  onNavigateToCourts,
  onOpenCoachInsight,
}) => {
  const [period, setPeriod] = useState<'7D' | '30D'>('7D');
  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; count: number } | null>(null);
  const [hoveredHeatmapCell, setHoveredHeatmapCell] = useState<{
    court: string;
    time: string;
    value: number;
  } | null>(null);

  const stats: AnalyticsStats = period === '7D' ? ANALYTICS_7D : ANALYTICS_30D;

  // Generate SVG path for the smooth spline chart
  const getSplinePath = () => {
    // 7 points mapped across viewBox width 500, height 180 (with padding)
    const data = stats.bookingsOverTime;
    const maxVal = period === '7D' ? 160 : 1600;
    const width = 500;
    const height = 180;
    const paddingX = 30;
    const paddingY = 20;

    const points = data.map((d, index) => {
      const x = paddingX + (index / (data.length - 1)) * (width - paddingX * 2);
      const y = height - paddingY - (d.count / maxVal) * (height - paddingY * 2);
      return { x, y, ...d };
    });

    if (points.length < 2) return { path: '', area: '', points: [] };

    // Build Catmull-Rom or cubic Bezier spline
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i < points.length - 2 ? points[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }

    const lastP = points[points.length - 1];
    const firstP = points[0];
    const area = `${path} L ${lastP.x},${height} L ${firstP.x},${height} Z`;

    return { path, area, points };
  };

  const chartData = getSplinePath();

  // Helper for heatmap cell color
  const getHeatmapColor = (intensity: number) => {
    if (intensity <= 0.15) return 'bg-[#141A16] border-[#232B27]';
    if (intensity <= 0.45) return 'bg-[#3b4c19] border-[#4a5f20]';
    if (intensity <= 0.75) return 'bg-[#6b8e23] border-[#7da729]';
    return 'bg-[#bef264] border-[#d4f88e] shadow-[0_0_8px_rgba(190,242,100,0.3)]';
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-8 pb-24 md:pb-12 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header with Title and Period Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-condensed text-2xl md:text-3xl font-bold tracking-tight text-white">
            Analytics Overview
          </h2>
          <p className="text-sm text-[#c3c9b2] mt-0.5">
            Track performance and court utilization.
          </p>
        </div>

        <div className="bg-[#141A16] p-1 rounded-lg border border-[#232B27] flex items-center gap-1 self-start sm:self-auto">
          <button
            onClick={() => setPeriod('7D')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wider transition-all cursor-pointer ${
              period === '7D'
                ? 'bg-[#272B29] text-white border border-[#434938] shadow-sm'
                : 'text-[#c3c9b2] hover:text-white'
            }`}
          >
            7D
          </button>
          <button
            onClick={() => setPeriod('30D')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wider transition-all cursor-pointer ${
              period === '30D'
                ? 'bg-[#272B29] text-white border border-[#434938] shadow-sm'
                : 'text-[#c3c9b2] hover:text-white'
            }`}
          >
            30D
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bookings */}
        <div className="bg-[#141A16]/90 border border-[#232B27] rounded-xl p-5 flex flex-col justify-between hover:border-[#bef264]/40 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#c3c9b2] font-medium tracking-wide">Bookings</span>
            <span className="material-symbols-outlined text-[20px] text-[#c3c9b2]">calendar_today</span>
          </div>
          <div className="mt-4">
            <div className="font-condensed text-3xl font-bold text-white tracking-tight">
              {stats.bookingsCount.toLocaleString()}
            </div>
            <div className="text-xs text-[#bef264] flex items-center gap-1 mt-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>{stats.bookingsChange}</span>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-[#141A16]/90 border border-[#232B27] rounded-xl p-5 flex flex-col justify-between hover:border-[#bef264]/40 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#c3c9b2] font-medium tracking-wide">Revenue</span>
            <span className="material-symbols-outlined text-[20px] text-[#c3c9b2]">payments</span>
          </div>
          <div className="mt-4">
            <div className="font-condensed text-3xl font-bold text-white tracking-tight">
              {stats.revenue}
            </div>
            <div className="text-xs text-[#bef264] flex items-center gap-1 mt-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>{stats.revenueChange}</span>
            </div>
          </div>
        </div>

        {/* Occupancy */}
        <div className="bg-[#141A16]/90 border border-[#232B27] rounded-xl p-5 flex flex-col justify-between hover:border-[#bef264]/40 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#c3c9b2] font-medium tracking-wide">Occupancy</span>
            <span className="material-symbols-outlined text-[20px] text-[#c3c9b2]">donut_large</span>
          </div>
          <div className="mt-4">
            <div className="font-condensed text-3xl font-bold text-white tracking-tight">
              {stats.occupancyPercent}%
            </div>
            <div className="text-xs text-[#bef264] flex items-center gap-1 mt-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>{stats.occupancyChange}</span>
            </div>
          </div>
        </div>

        {/* Peak Hour */}
        <div className="bg-[#141A16]/90 border border-[#232B27] rounded-xl p-5 flex flex-col justify-between hover:border-[#bef264]/40 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#c3c9b2] font-medium tracking-wide">Peak Hour</span>
            <span className="material-symbols-outlined text-[20px] text-[#c3c9b2]">schedule</span>
          </div>
          <div className="mt-4">
            <div className="font-condensed text-3xl font-bold text-white tracking-tight">
              {stats.peakHour.split(' ')[0]} <span className="text-xl font-normal text-[#c3c9b2]">PM</span>
            </div>
            <div className="text-xs text-[#c3c9b2] mt-1 font-medium">
              {stats.peakStatus}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Bookings over Time + By Court Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bookings over Time Spline Chart */}
        <div className="lg:col-span-2 bg-[#141A16]/90 border border-[#232B27] rounded-xl p-5 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm tracking-wide">Bookings over Time</h3>
            {hoveredPoint && (
              <span className="text-xs text-[#bef264] font-medium bg-[#bef264]/10 border border-[#bef264]/30 px-2 py-0.5 rounded">
                {hoveredPoint.day}: {hoveredPoint.count} bookings
              </span>
            )}
          </div>

          <div className="relative w-full h-52 mt-2">
            {/* Y-Axis scale marks */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[11px] text-[#5d6562] select-none font-mono">
              <span>150</span>
              <span>100</span>
              <span>50</span>
              <span>0</span>
            </div>

            {/* SVG Wave Line & Gradient Area */}
            <div className="ml-8 h-44 relative">
              <svg
                viewBox="0 0 500 180"
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <linearGradient id="waveGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#bef264" stopOpacity="0.35" />
                    <stop offset="80%" stopColor="#bef264" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#bef264" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Horizontal Guide Lines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#232B27" strokeDasharray="3 3" />
                <line x1="0" y1="73" x2="500" y2="73" stroke="#232B27" strokeDasharray="3 3" />
                <line x1="0" y1="126" x2="500" y2="126" stroke="#232B27" strokeDasharray="3 3" />
                <line x1="0" y1="160" x2="500" y2="160" stroke="#232B27" />

                {/* Area Fill */}
                <path d={chartData.area} fill="url(#waveGlow)" />

                {/* Stroke Line */}
                <path
                  d={chartData.path}
                  fill="none"
                  stroke="#bef264"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#neonGlow)"
                />

                {/* Interactive Points */}
                {chartData.points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPoint?.day === p.day ? 6 : 4}
                    fill="#0B0F0C"
                    stroke="#bef264"
                    strokeWidth="2.5"
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </svg>
            </div>

            {/* X-Axis labels */}
            <div className="ml-8 flex justify-between text-xs text-[#c3c9b2] pt-1">
              {stats.bookingsOverTime.map((item) => (
                <span key={item.day} className="text-center font-medium">
                  {item.day}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* By Court Donut Chart */}
        <div className="bg-[#141A16]/90 border border-[#232B27] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm tracking-wide">By Court</h3>
          </div>

          {/* Donut graphic */}
          <div className="relative flex items-center justify-center my-4">
            <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#1B2320"
                strokeWidth="12"
              />
              {/* Segment 3: Court 3 */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#314413"
                strokeWidth="12"
                strokeDasharray="238.7"
                strokeDashoffset="0"
              />
              {/* Segment 2: Court 2 */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#5e851a"
                strokeWidth="12"
                strokeDasharray="238.7"
                strokeDashoffset="48"
              />
              {/* Segment 1: Court 1 (Top performer) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#bef264"
                strokeWidth="13"
                strokeDasharray="238.7"
                strokeDashoffset="124"
                className="filter drop-shadow-[0_0_8px_rgba(190,242,100,0.4)]"
              />
            </svg>

            {/* Centered text in donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-condensed text-2xl font-bold text-white tracking-tight">
                C1
              </span>
              <span className="text-[11px] text-[#c3c9b2] font-medium tracking-wide">
                Top Performer
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs text-[#c3c9b2]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#bef264]"></span> Court 1
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5e851a]"></span> Court 2
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#314413]"></span> Court 3
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Occupancy Heatmap */}
      <div className="bg-[#141A16]/90 border border-[#232B27] rounded-xl p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white text-sm tracking-wide">Occupancy Heatmap</h3>
          {hoveredHeatmapCell && (
            <span className="text-xs text-[#bef264] font-medium bg-[#bef264]/10 border border-[#bef264]/30 px-2.5 py-0.5 rounded">
              {hoveredHeatmapCell.court} @ {hoveredHeatmapCell.time}:{' '}
              {Math.round(hoveredHeatmapCell.value * 100)}% Booked
            </span>
          )}
        </div>

        {/* Matrix Header */}
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            <div className="grid grid-cols-6 gap-3 text-xs text-[#c3c9b2] font-medium mb-2 px-1">
              <span>Time \ Court</span>
              <span className="text-center">C1</span>
              <span className="text-center">C2</span>
              <span className="text-center">C3</span>
              <span className="text-center">C4</span>
              <span className="text-center">C5</span>
            </div>

            {/* Matrix Rows */}
            <div className="flex flex-col gap-2.5">
              {stats.heatmap.map((row) => (
                <div key={row.time} className="grid grid-cols-6 gap-3 items-center">
                  <span className="text-xs text-[#c3c9b2] font-medium">{row.time}</span>

                  <div
                    onMouseEnter={() =>
                      setHoveredHeatmapCell({ court: 'Center Court (C1)', time: row.time, value: row.c1 })
                    }
                    onMouseLeave={() => setHoveredHeatmapCell(null)}
                    className={`h-7 rounded-md border transition-all cursor-pointer hover:scale-105 ${getHeatmapColor(
                      row.c1
                    )}`}
                  />

                  <div
                    onMouseEnter={() =>
                      setHoveredHeatmapCell({ court: 'Court 2 (C2)', time: row.time, value: row.c2 })
                    }
                    onMouseLeave={() => setHoveredHeatmapCell(null)}
                    className={`h-7 rounded-md border transition-all cursor-pointer hover:scale-105 ${getHeatmapColor(
                      row.c2
                    )}`}
                  />

                  <div
                    onMouseEnter={() =>
                      setHoveredHeatmapCell({ court: 'Court 3 (C3)', time: row.time, value: row.c3 })
                    }
                    onMouseLeave={() => setHoveredHeatmapCell(null)}
                    className={`h-7 rounded-md border transition-all cursor-pointer hover:scale-105 ${getHeatmapColor(
                      row.c3
                    )}`}
                  />

                  <div
                    onMouseEnter={() =>
                      setHoveredHeatmapCell({ court: 'Court 4 (C4)', time: row.time, value: row.c4 })
                    }
                    onMouseLeave={() => setHoveredHeatmapCell(null)}
                    className={`h-7 rounded-md border transition-all cursor-pointer hover:scale-105 ${getHeatmapColor(
                      row.c4
                    )}`}
                  />

                  <div
                    onMouseEnter={() =>
                      setHoveredHeatmapCell({ court: 'Court 5 (C5)', time: row.time, value: row.c5 })
                    }
                    onMouseLeave={() => setHoveredHeatmapCell(null)}
                    className={`h-7 rounded-md border transition-all cursor-pointer hover:scale-105 ${getHeatmapColor(
                      row.c5
                    )}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend Scale */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-[#c3c9b2]">
          <span>Empty</span>
          <div className="w-24 h-2 rounded-full bg-gradient-to-r from-[#141A16] via-[#5e851a] to-[#bef264] border border-[#232B27]" />
          <span>Full</span>
        </div>
      </div>

      {/* Row 4: Recent Bookings Table */}
      <div className="bg-[#141A16]/90 border border-[#232B27] rounded-xl p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white text-sm tracking-wide">Recent Bookings</h3>
          <button
            onClick={onNavigateToCourts}
            className="text-xs text-[#bef264] hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>Reserve New Court</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#232B27] text-xs text-[#c3c9b2]">
                <th className="pb-3 font-medium">Player</th>
                <th className="pb-3 font-medium">Court</th>
                <th className="pb-3 font-medium">Date & Time</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232B27]/60">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-[#1B2320]/40 transition-colors">
                  <td className="py-3.5 font-medium text-white">{b.player}</td>
                  <td className="py-3.5 text-[#c3c9b2]">{b.court}</td>
                  <td className="py-3.5 text-[#c3c9b2]">{b.dateTime}</td>
                  <td className="py-3.5 font-medium text-white">${b.amount.toFixed(2)}</td>
                  <td className="py-3.5">
                    {b.status === 'CONFIRMED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#bef264]/15 text-[#bef264] border border-[#bef264]/30 tracking-wider">
                        CONFIRMED
                      </span>
                    )}
                    {b.status === 'PENDING' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#444b46]/40 text-[#c2c8c1] border border-[#444b46] tracking-wider">
                        PENDING
                      </span>
                    )}
                    {b.status === 'CANCELLED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffb4ab]/15 text-[#ffb4ab] border border-[#ffb4ab]/30 tracking-wider">
                        CANCELLED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
