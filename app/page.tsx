import StatCard from "./components/StatCard";
import TradesTable from "./components/TradesTable";
import PnLChart from "./components/PnLChart";
import SetupBreakdown from "./components/SetupBreakdown";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#060b14]">
      {/* Header */}
      <header className="border-b border-[#1e2d45] bg-[#0a1020]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-100 tracking-tight">Killingbot</span>
            <span className="text-slate-500 text-sm">Dashboard</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-500">Account</span>
            <span className="font-mono font-semibold text-slate-100">$27,107</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold">LIVE</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Week indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest">
          <span>Week of May 26–30, 2026</span>
          <span className="text-slate-600">·</span>
          <span>Risk 1%/trade · $25,000 base</span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Net P&L"
            value="+$2,107"
            sub="↑ +8.4% this month"
            trend="up"
            accent="text-emerald-400"
          />
          <StatCard
            label="Win Rate"
            value="63%"
            sub="17W / 10L — 27 trades"
            trend="up"
          />
          <StatCard
            label="Profit Factor"
            value="3.01"
            sub="Target: 2.0+"
            trend="up"
          />
          <StatCard
            label="Max Drawdown"
            value="-5.7%"
            sub="KB_15m benchmark"
            trend="neutral"
          />
        </div>

        {/* Equity curve */}
        <PnLChart />

        {/* Setup breakdown + secondary stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <SetupBreakdown />
          </div>
          <div className="flex flex-col gap-4">
            <StatCard label="Sharpe Ratio" value="7.51" sub="KB_1h benchmark" trend="up" />
            <StatCard label="Expectancy" value="+$18.39" sub="per trade" trend="up" accent="text-blue-400" />
            <StatCard label="Best Session" value="09:30" sub="Open — 71% WR" trend="up" />
          </div>
        </div>

        {/* Trades table */}
        <TradesTable />

        {/* Strategy badge */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-slate-600">Active strategy:</span>
          {["KB_LOOSE_RR2.5_RR3.0", "EMA 7/21", "Kijun 26", "ATR 1.5x", "Cooldown 3"].map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded border border-[#1e2d45] text-slate-400">{tag}</span>
          ))}
        </div>
      </main>
    </div>
  );
}
