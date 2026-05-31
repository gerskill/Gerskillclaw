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
import type { Trade } from "./TradesTable";

interface Props {
  trades: Trade[];
}

const INITIAL = 25_000;

export default function PnLChart({ trades }: Props) {
  // Build equity curve from closed trades (sorted by date)
  const closed = trades.filter((t) => t.pnl !== 0).sort((a, b) => a.date.localeCompare(b.date));

  let equity = INITIAL;
  const points: { date: string; equity: number }[] = [{ date: "Start", equity: INITIAL }];
  for (const t of closed) {
    equity += t.pnl;
    const label = t.date.slice(5); // "MM-DD"
    points.push({ date: label, equity: Math.round(equity) });
  }

  const netPnl = equity - INITIAL;
  const netPct = ((netPnl / INITIAL) * 100).toFixed(1);
  const sign = netPnl >= 0 ? "+" : "";

  if (points.length <= 1) {
    return (
      <div className="rounded-xl border border-[#1e2d45] bg-[#0d1526] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Equity Curve</h2>
        </div>
        <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">
          Pas encore de trades — la courbe s&apos;affichera dès le premier trade fermé
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1e2d45] bg-[#0d1526] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Equity Curve</h2>
        <span className={`text-sm font-semibold ${netPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {sign}${Math.abs(netPnl).toLocaleString()} ({sign}{netPct}%)
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
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
          <Area type="monotone" dataKey="equity" stroke="#00ff88" strokeWidth={2} fill="url(#equityGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
