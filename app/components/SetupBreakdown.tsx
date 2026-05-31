const SETUPS = [
  { name: "ORB",      wr: 83, trades: 6,  pnl: 632 },
  { name: "VWAP",     wr: 100, trades: 2, pnl: 300 },
  { name: "Spring",   wr: 100, trades: 1, pnl: 370 },
  { name: "Momentum", wr: 43,  trades: 7, pnl: -245 },
];

export default function SetupBreakdown() {
  return (
    <div className="rounded-xl border border-[#1e2d45] bg-[#0d1526] p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">Performance by Setup</h2>
      <div className="flex flex-col gap-3">
        {SETUPS.map((s) => (
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
    </div>
  );
}
