"""
MemoryAgent — Retient les meilleures stratégies, guide l'Explorateur.
Rôle : assistant de contexte. Reçoit résultats → classe → suggère suivant.
"""
import json
import os
from datetime import datetime
from pathlib import Path

VAULT = Path(__file__).parent.parent / "vault"
MEMORY_FILE = VAULT / "memory.json"
LOG_FILE = VAULT / "AGENT_LOG.md"


class MemoryAgent:
    def __init__(self):
        self.name = "MemoryAgent"
        VAULT.mkdir(exist_ok=True)
        (VAULT / "strategies").mkdir(exist_ok=True)
        (VAULT / "sessions").mkdir(exist_ok=True)
        self.memory = self._load()
        self._log(f"## Session {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
        self._log(f"**{self.name}** — démarrage. {len(self.memory['results'])} stratégies en mémoire.\n")

    # ── Persistance ────────────────────────────────────────────────────────────

    def _load(self):
        if MEMORY_FILE.exists():
            with open(MEMORY_FILE) as f:
                return json.load(f)
        return {"results": [], "best": None, "explored": [], "session": 0}

    def _save(self):
        with open(MEMORY_FILE, "w") as f:
            json.dump(self.memory, f, indent=2)

    def _log(self, msg: str):
        with open(LOG_FILE, "a") as f:
            f.write(msg + "\n")

    # ── API publique ───────────────────────────────────────────────────────────

    def receive_result(self, strategy_name: str, params: dict, metrics: dict):
        """Reçoit un résultat de l'Explorateur, met à jour la mémoire."""
        entry = {
            "name": strategy_name,
            "params": params,
            "metrics": metrics,
            "ts": datetime.now().isoformat(),
        }
        self.memory["results"].append(entry)
        self.memory["explored"].append(strategy_name)

        monthly = metrics.get("monthly_return_pct", 0)
        wr = metrics.get("win_rate_pct", 0)
        trades = metrics.get("total_trades", 0)

        status = "🎯 TARGET" if monthly >= 10 else ("✅" if monthly >= 5 else ("⚠️" if monthly >= 0 else "❌"))
        self._log(
            f"**{self.name}** → reçu `{strategy_name}` "
            f"| {status} {monthly:.1f}%/mois | WR {wr:.0f}% | {trades} trades"
        )

        # Mise à jour du best
        best = self.memory.get("best")
        if best is None or monthly > best.get("metrics", {}).get("monthly_return_pct", -999):
            self.memory["best"] = entry
            self._log(f"**{self.name}** → 🏆 nouveau meilleur : `{strategy_name}` ({monthly:.1f}%/mois)")

        self._save()
        self._write_strategy_note(entry)
        return status

    def get_best(self, n: int = 5) -> list:
        """Retourne les N meilleures stratégies."""
        sorted_r = sorted(
            self.memory["results"],
            key=lambda x: x["metrics"].get("monthly_return_pct", -999),
            reverse=True,
        )
        return sorted_r[:n]

    def suggest_next(self, current_params: dict) -> list[dict]:
        """
        Analyse les résultats précédents et suggère des variations prometteuses.
        L'Explorateur appelle ça pour décider quoi tester ensuite.
        """
        best = self.get_best(3)
        suggestions = []

        if not best:
            return []

        top = best[0]
        top_params = top["params"]
        top_monthly = top["metrics"].get("monthly_return_pct", 0)

        self._log(
            f"**{self.name}** → analyse top 3 pour suggestions. "
            f"Meilleur actuel : `{top['name']}` ({top_monthly:.1f}%/mois)"
        )

        # Si le meilleur a un bon WR mais mauvais RR → augmenter RR
        if top["metrics"].get("win_rate_pct", 0) > 50 and top_params.get("rr", 2.0) < 3.0:
            v = dict(top_params)
            v["rr"] = round(v["rr"] + 0.5, 1)
            v["_name_hint"] = f"{top['name']}_RR{v['rr']}"
            v["_reason"] = f"WR élevé ({top['metrics']['win_rate_pct']:.0f}%) → hausser RR"
            suggestions.append(v)

        # Si le meilleur a peu de trades → assouplir filtres
        if top["metrics"].get("total_trades", 0) < 15:
            v = dict(top_params)
            v["ema_sep_pct"] = max(0.1, v.get("ema_sep_pct", 0.3) - 0.1)
            v["cooldown_bars"] = max(2, v.get("cooldown_bars", 5) - 2)
            v["_name_hint"] = f"{top['name']}_LOOSE"
            v["_reason"] = "Peu de trades → assouplir filtres"
            suggestions.append(v)

        # Si le meilleur a trop de trades (whipsaw) → renforcer filtres
        if top["metrics"].get("total_trades", 0) > 60:
            v = dict(top_params)
            v["ema_sep_pct"] = min(1.0, v.get("ema_sep_pct", 0.3) + 0.15)
            v["cooldown_bars"] = v.get("cooldown_bars", 5) + 3
            v["_name_hint"] = f"{top['name']}_TIGHT"
            v["_reason"] = "Trop de trades → renforcer filtres"
            suggestions.append(v)

        # Si aucun filtre RSI/ADX actif sur le top → essayer
        if not top_params.get("use_rsi") and not top_params.get("use_adx"):
            v = dict(top_params)
            v["use_rsi"] = True
            v["_name_hint"] = f"{top['name']}_RSI"
            v["_reason"] = "Ajouter filtre RSI"
            suggestions.append(v)

        for s in suggestions:
            self._log(f"**{self.name}** → 💡 suggestion `{s.get('_name_hint', '?')}` — {s.get('_reason', '')}")

        return suggestions

    def already_explored(self, name: str) -> bool:
        return name in self.memory["explored"]

    def write_best_report(self):
        """Génère vault/BEST_STRATEGIES.md"""
        best = self.get_best(10)
        lines = [
            "# 🏆 Meilleures Stratégies KB\n",
            f"_Mise à jour : {datetime.now().strftime('%Y-%m-%d %H:%M')}_\n",
            "| Rang | Stratégie | %/mois | WR | Trades | Drawdown | Sharpe |",
            "|------|-----------|--------|-----|--------|----------|--------|",
        ]
        for i, r in enumerate(best, 1):
            m = r["metrics"]
            target = " 🎯" if m.get("monthly_return_pct", 0) >= 10 else ""
            lines.append(
                f"| {i} | [[{r['name']}]]{target} "
                f"| {m.get('monthly_return_pct', 0):.1f}% "
                f"| {m.get('win_rate_pct', 0):.0f}% "
                f"| {m.get('total_trades', 0)} "
                f"| {m.get('max_drawdown_pct', 0):.1f}% "
                f"| {m.get('sharpe_ratio', 0):.2f} |"
            )
        lines.append("\n## Détail")
        for r in best:
            m = r["metrics"]
            lines.append(
                f"\n### [[{r['name']}]]\n"
                f"- **Retour mensuel** : {m.get('monthly_return_pct', 0):.2f}%\n"
                f"- **Win Rate** : {m.get('win_rate_pct', 0):.1f}%\n"
                f"- **Trades** : {m.get('total_trades', 0)}\n"
                f"- **Drawdown max** : {m.get('max_drawdown_pct', 0):.1f}%\n"
                f"- **Sharpe** : {m.get('sharpe_ratio', 0):.2f}\n"
                f"- **Paramètres** : `{json.dumps({k: v for k, v in r['params'].items() if not k.startswith('_')})}`\n"
            )
        with open(VAULT / "BEST_STRATEGIES.md", "w") as f:
            f.write("\n".join(lines))
        self._log(f"**{self.name}** → 📄 BEST_STRATEGIES.md mis à jour")

    def _write_strategy_note(self, entry: dict):
        """Crée une note Obsidian pour chaque stratégie."""
        name = entry["name"]
        m = entry["metrics"]
        p = entry["params"]
        target = "🎯 OBJECTIF ATTEINT" if m.get("monthly_return_pct", 0) >= 10 else ""
        parent = p.get("_parent", "KB-v2.1")
        note = (
            f"# {name} {target}\n\n"
            f"**Parent** : [[{parent}]]\n"
            f"**Date** : {entry['ts'][:10]}\n\n"
            f"## Performance\n"
            f"- Retour mensuel : **{m.get('monthly_return_pct', 0):.2f}%**\n"
            f"- Win Rate : {m.get('win_rate_pct', 0):.1f}%\n"
            f"- Trades : {m.get('total_trades', 0)}\n"
            f"- Drawdown max : {m.get('max_drawdown_pct', 0):.1f}%\n"
            f"- Profit Factor : {m.get('profit_factor', 0):.2f}\n"
            f"- Sharpe : {m.get('sharpe_ratio', 0):.2f}\n\n"
            f"## Paramètres\n"
            f"```json\n{json.dumps({k: v for k, v in p.items() if not k.startswith('_')}, indent=2)}\n```\n\n"
            f"## Liens\n"
            f"- [[BEST_STRATEGIES]]\n"
            f"- [[AGENT_LOG]]\n"
        )
        with open(VAULT / "strategies" / f"{name}.md", "w") as f:
            f.write(note)
