"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DATA = [
  { date: "May 1",  equity: 25000 },
  { date: "May 5",  equity: 25320 },
  { date: "May 8",  equity: 25180 },
  { date: "May 12", equity: 25740 },
  { date: "May 15", equity: 25620 },
  { date: "May 19", equity: 26180 },
  { date: "May 22", equity: 26540 },
  { date: "May 26", equity: 26390 },
  { date: "May 30", equity: 27107 },
];

export default function PnLChart() {
  return (
    <div className="rounded-xl border border-[#1e2d45] bg-[#0d1526] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Equity Curve — May 2026</h2>
        <span className="text-emerald-400 text-sm font-semibold">+$2,107 (+8.4%)</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff88" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
          <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            domain={["dataMin - 200", "dataMax + 200"]}
          />
          <Tooltip
            contentStyle={{ background: "#0d1526", border: "1px solid #1e2d45", borderRadius: 8 }}
            labelStyle={{ color: "#94a3b8", fontSize: 12 }}
            itemStyle={{ color: "#00ff88", fontWeight: 600 }}
            formatter={(v) => [`$${Number(v).toLocaleString()}`, "Equity"]}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke="#00ff88"
            strokeWidth={2}
            fill="url(#equityGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
