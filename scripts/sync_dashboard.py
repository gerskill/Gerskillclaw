#!/usr/bin/env python3
"""
sync_dashboard.py — Sync trades.csv → Gerskillclaw/public/trades.json + git push
Déclenché automatiquement par webhook_server.py après chaque trade loggué.
"""

import json
import csv
import subprocess
from datetime import datetime, date
from pathlib import Path

TRADES_CSV   = Path(__file__).parent.parent / "trades.csv"
DASHBOARD_DIR = Path(__file__).parent.parent.parent / "Gerskillclaw"
OUTPUT_JSON  = DASHBOARD_DIR / "public" / "trades.json"

INITIAL_BALANCE = 25_000.0
RISK_PER_TRADE  = 0.01  # 1%


def read_trades() -> list[dict]:
    if not TRADES_CSV.exists():
        return []
    trades = []
    with open(TRADES_CSV, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            pnl = float(row.get("pnl_usd") or 0)
            entry = float(row.get("entry_price") or 0)
            exit_p = float(row.get("exit_price") or 0)
            rr = 0.0
            if entry and exit_p:
                sl_est = entry * RISK_PER_TRADE
                rr = abs(exit_p - entry) / sl_est if sl_est else 0
                if row.get("side", "").lower() == "short" and exit_p > entry:
                    rr = -rr
                elif row.get("side", "").lower() == "long" and exit_p < entry:
                    rr = -rr
            trades.append({
                "id":     row.get("date", "") + row.get("time", "") + row.get("symbol", ""),
                "date":   row.get("date", ""),
                "symbol": row.get("symbol", ""),
                "side":   row.get("side", "").upper(),
                "entry":  entry,
                "exit":   exit_p,
                "pnl":    pnl,
                "rr":     round(rr, 2),
                "setup":  row.get("setup_type", ""),
                "notes":  row.get("notes", ""),
            })
    return trades


def compute_stats(trades: list[dict]) -> dict:
    if not trades:
        return {
            "net_pnl": 0, "win_rate": 0, "profit_factor": 0,
            "total_trades": 0, "winning_trades": 0, "losing_trades": 0,
            "max_drawdown": 0, "account_balance": INITIAL_BALANCE,
            "expectancy": 0,
        }
    closed = [t for t in trades if t["pnl"] != 0]
    wins = [t for t in closed if t["pnl"] > 0]
    losses = [t for t in closed if t["pnl"] < 0]
    net_pnl = sum(t["pnl"] for t in closed)
    gross_profit = sum(t["pnl"] for t in wins) if wins else 0
    gross_loss = abs(sum(t["pnl"] for t in losses)) if losses else 1
    pf = round(gross_profit / gross_loss, 2) if gross_loss else 0

    # Drawdown (peak-to-trough sur equity curve)
    balance = INITIAL_BALANCE
    peak = balance
    max_dd = 0.0
    for t in closed:
        balance += t["pnl"]
        peak = max(peak, balance)
        dd = (peak - balance) / peak * 100 if peak else 0
        max_dd = max(max_dd, dd)

    wr = round(len(wins) / len(closed) * 100, 1) if closed else 0
    expectancy = round(net_pnl / len(closed), 2) if closed else 0

    return {
        "net_pnl":       round(net_pnl, 2),
        "win_rate":      wr,
        "profit_factor": pf,
        "total_trades":  len(closed),
        "winning_trades": len(wins),
        "losing_trades": len(losses),
        "max_drawdown":  round(max_dd, 2),
        "account_balance": round(INITIAL_BALANCE + net_pnl, 2),
        "expectancy":    expectancy,
    }


def write_json(trades: list[dict], stats: dict):
    payload = {
        "updated_at": datetime.utcnow().isoformat() + "Z",
        **stats,
        "trades": trades[-50:],  # 50 derniers trades
    }
    OUTPUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False))
    print(f"[SYNC]   trades.json mis à jour → {len(trades)} trades | PnL ${stats['net_pnl']}")


def git_push():
    if not DASHBOARD_DIR.exists():
        print(f"[SYNC]   Dashboard dir introuvable : {DASHBOARD_DIR}")
        return
    try:
        subprocess.run(["git", "add", "public/trades.json"], cwd=DASHBOARD_DIR, check=True)
        result = subprocess.run(
            ["git", "diff", "--cached", "--quiet"],
            cwd=DASHBOARD_DIR
        )
        if result.returncode == 0:
            print("[SYNC]   Aucun changement à pousser")
            return
        subprocess.run(
            ["git", "commit", "-m", f"data: sync trades {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}"],
            cwd=DASHBOARD_DIR, check=True
        )
        subprocess.run(["git", "push"], cwd=DASHBOARD_DIR, check=True)
        print("[SYNC]   Push GitHub OK → Vercel rebuild déclenché")
    except subprocess.CalledProcessError as e:
        print(f"[SYNC]   Git error : {e}")


def main():
    trades = read_trades()
    stats = compute_stats(trades)
    write_json(trades, stats)
    git_push()


if __name__ == "__main__":
    main()
