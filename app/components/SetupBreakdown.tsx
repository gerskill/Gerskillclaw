import type { Trade } from "./TradesTable";

interface Props {
  trades: Trade[];
}

export default function SetupBreakdown({ trades }: Props) {
  const closed = trades.filter((t) => t.pnl !== 0);

  // Group by setup
  const setups = closed.reduce<Record<string, { wins: number; total: number; pnl: number }>>((acc, t) => {
    const s = t.setup || "Unknown";
    if (!acc[s]) acc[s] = { wins: 0, total: 0, pnl: 0 };
    acc[s].total++;
    acc[s].pnl += t.pnl;
    if (t.pnl > 0) acc[s].wins++;
    return acc;
  }, {});

  const rows = Object.entries(setups)
    .map(([name, s]) => ({ name, wr: Math.round((s.wins / s.total) * 100), trades: s.total, pnl: Math.round(s.pnl) }))
    .sort((a, b) => b.pnl - a.pnl);

  return (
    <div className="rounded-xl border border-[#1e2d45] bg-[#0d1526] p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">Performance by Setup</h2>
      {rows.length === 0 ? (
        <div className="text-slate-500 text-sm">Aucun trade fermé</div>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((s) => (
            <div key={s.name} className="flex items-center gap-4">
              <span className="w-20 text-sm font-medium text-slate-300">{s.name}</span>
              <div className="flex-1 h-2 rounded-full bg-[#1e2d45] overflow-hidden">
                <div
                  className={`h-full rounded-full ${s.wr >= 70 ? "bg-emerald-500" : s.wr >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${s.wr}%` }}
                />
              </div>
              <span className={`w-12 text-right text-sm font-bold tabular-nums ${s.wr >= 70 ? "text-emerald-400" : s.wr >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                {s.wr}%
              </span>
              <span className={`w-16 text-right text-xs font-mono tabular-nums ${s.pnl > 0 ? "text-emerald-400" : "text-red-400"}`}>
                {s.pnl > 0 ? `+$${s.pnl}` : `-$${Math.abs(s.pnl)}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
