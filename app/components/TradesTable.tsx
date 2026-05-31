export interface Trade {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  entry: number;
  exit: number;
  pnl: number;
  rr: number;
  date: string;
  setup: string;
}

const TRADES: Trade[] = [
  { id: "1", symbol: "XAUUSD", side: "LONG",  entry: 2312.5, exit: 2341.2, pnl: 287.0, rr: 2.8, date: "2026-05-30", setup: "ORB" },
  { id: "2", symbol: "NQ1!",   side: "SHORT", entry: 19820,  exit: 19750,  pnl: 140.0, rr: 2.1, date: "2026-05-30", setup: "VWAP" },
  { id: "3", symbol: "ES1!",   side: "LONG",  entry: 5283.5, exit: 5301.0, pnl: 175.0, rr: 2.5, date: "2026-05-29", setup: "ORB" },
  { id: "4", symbol: "XAUUSD", side: "SHORT", entry: 2328.0, exit: 2342.5, pnl: -145.0, rr: -1.0, date: "2026-05-29", setup: "Momentum" },
  { id: "5", symbol: "NQ1!",   side: "LONG",  entry: 19640,  exit: 19720,  pnl: 160.0, rr: 2.3, date: "2026-05-28", setup: "ORB" },
  { id: "6", symbol: "XAUUSD", side: "LONG",  entry: 2298.0, exit: 2335.0, pnl: 370.0, rr: 3.2, date: "2026-05-28", setup: "Spring" },
  { id: "7", symbol: "ES1!",   side: "SHORT", entry: 5310.0, exit: 5320.0, pnl: -100.0, rr: -1.0, date: "2026-05-27", setup: "Momentum" },
  { id: "8", symbol: "NQ1!",   side: "LONG",  entry: 19550,  exit: 19660,  pnl: 220.0, rr: 2.8, date: "2026-05-27", setup: "VWAP" },
];

export default function TradesTable() {
  return (
    <div className="rounded-xl border border-[#1e2d45] bg-[#0d1526] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1e2d45]">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Recent Trades</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2d45] text-xs uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3 text-left">Date</th>
              <th className="px-5 py-3 text-left">Symbol</th>
              <th className="px-5 py-3 text-left">Side</th>
              <th className="px-5 py-3 text-left">Setup</th>
              <th className="px-5 py-3 text-right">Entry</th>
              <th className="px-5 py-3 text-right">Exit</th>
              <th className="px-5 py-3 text-right">R:R</th>
              <th className="px-5 py-3 text-right">P&L</th>
            </tr>
          </thead>
          <tbody>
            {TRADES.map((t) => (
              <tr key={t.id} className="border-b border-[#1e2d45]/50 hover:bg-[#131f35] transition-colors">
                <td className="px-5 py-3 text-slate-400 font-mono text-xs">{t.date}</td>
                <td className="px-5 py-3 font-semibold">{t.symbol}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    t.side === "LONG" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                  }`}>
                    {t.side}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-400 text-xs">{t.setup}</td>
                <td className="px-5 py-3 text-right font-mono text-slate-300">{t.entry.toLocaleString()}</td>
                <td className="px-5 py-3 text-right font-mono text-slate-300">{t.exit.toLocaleString()}</td>
                <td className={`px-5 py-3 text-right font-mono font-semibold ${t.rr > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {t.rr > 0 ? `+${t.rr}R` : `${t.rr}R`}
                </td>
                <td className={`px-5 py-3 text-right font-mono font-semibold ${t.pnl > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {t.pnl > 0 ? `+$${t.pnl.toFixed(0)}` : `-$${Math.abs(t.pnl).toFixed(0)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
