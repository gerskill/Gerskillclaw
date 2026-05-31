interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  accent?: string;
}

export default function StatCard({ label, value, sub, trend, accent }: StatCardProps) {
  const trendColor =
    trend === "up" ? "text-emerald-400" :
    trend === "down" ? "text-red-400" : "text-slate-400";

  return (
    <div className="rounded-xl border border-[#1e2d45] bg-[#0d1526] p-5 flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-widest text-slate-500">{label}</span>
      <span className={`text-3xl font-bold tabular-nums ${accent ?? "text-slate-100"}`}>{value}</span>
      {sub && <span className={`text-sm ${trendColor}`}>{sub}</span>}
    </div>
  );
}
