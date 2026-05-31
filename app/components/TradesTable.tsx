export interface Trade {
  id: string;
  date: string;
  symbol: string;
  side: "LONG" | "SHORT";
  entry: number;
  exit: number;
  pnl: number;
  rr: number;
  setup: string;
  notes?: string;
}

interface Props {
  trades: Trade[];
}

export default function TradesTable({ trades }: Props) {
  const recent = [...trades].reverse().slice(0, 20);

  return (
    <div className="rounded-xl border border-[#1e2d45] bg-[#0d1526] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1e2d45]">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Recent Trades</h2>
      </div>
      {recent.length === 0 ? (
        <div className="px-5 py-8 text-slate-500 text-sm text-center">
          Aucun trade loggué — démarrer webhook_server.py et configurer les alertes TradingView
        </div>
      ) : (
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
              {recent.map((t) => (
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
                  <td className="px-5 py-3 text-right font-mono text-slate-300">
                    {t.entry ? t.entry.toLocaleString() : "—"}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-slate-300">
                    {t.exit ? t.exit.toLocaleString() : "—"}
                  </td>
                  <td className={`px-5 py-3 text-right font-mono font-semibold ${t.rr > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {t.rr !== 0 ? (t.rr > 0 ? `+${t.rr}R` : `${t.rr}R`) : "—"}
                  </td>
                  <td className={`px-5 py-3 text-right font-mono font-semibold ${t.pnl > 0 ? "text-emerald-400" : t.pnl < 0 ? "text-red-400" : "text-slate-400"}`}>
                    {t.pnl !== 0 ? (t.pnl > 0 ? `+$${t.pnl.toFixed(0)}` : `-$${Math.abs(t.pnl).toFixed(0)}`) : "open"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
