#!/usr/bin/env python3
"""
webhook_server.py — Serveur webhook local pour alertes TradingView
===================================================================
Reçoit les alertes JSON de TradingView directement (sans 3Commas).
Loggue les signaux A*/B, appelle les agents Claude Code.

Démarrage :
    pip install flask --break-system-packages
    python webhook_server.py

Exposer via ngrok (port 5001) :
    ngrok http 5001
    → Coller l'URL https://xxxx.ngrok.io/webhook dans TradingView Alerts

Format attendu depuis HybridAI_TraderMorin.pine :
    {"setup":"A*","dir":"LONG","ticker":"BTCUSD","tf":"60","price":"68500.00","exchange":"BINANCE"}
"""

import json
import csv
import os
import subprocess
from datetime import datetime
from pathlib import Path
from flask import Flask, request, jsonify

# ─────────────────────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────────────────────
PORT          = 5001
TRADES_CSV    = Path(__file__).parent / "trades.csv"
SIGNALS_LOG   = Path(__file__).parent / "signals_log.jsonl"
PINE_FILE     = Path(__file__).parent / "HybridAI_TraderMorin.pine"
CURRENT_PINE  = Path(__file__).parent / "scripts" / "current.pine"

# Seuil d'action : seulement les A* déclenchent un log actif (B = log passif)
ACTION_SETUPS = {"A*"}
LOG_SETUPS    = {"A*", "B"}

app = Flask(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# UTILITAIRES
# ─────────────────────────────────────────────────────────────────────────────
def log_signal(payload: dict):
    """Ajoute le signal au fichier JSONL de log."""
    entry = {**payload, "received_at": datetime.utcnow().isoformat() + "Z"}
    with open(SIGNALS_LOG, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")
    print(f"[SIGNAL] {entry['received_at']} | {entry.get('setup')} {entry.get('dir')} {entry.get('ticker')} @ {entry.get('price')}")


def append_trade_csv(payload: dict):
    """Ajoute une ligne dans trades.csv pour le journal de performance."""
    fieldnames = ["date", "time", "symbol", "side", "entry_price",
                  "exit_price", "shares", "pnl_usd", "pnl_pct",
                  "setup_type", "notes"]
    now = datetime.utcnow()
    row = {
        "date":        now.strftime("%Y-%m-%d"),
        "time":        now.strftime("%H:%M"),
        "symbol":      payload.get("ticker", ""),
        "side":        payload.get("dir", "").lower(),
        "entry_price": payload.get("price", ""),
        "exit_price":  "",
        "shares":      "",
        "pnl_usd":     "",
        "pnl_pct":     "",
        "setup_type":  payload.get("setup", ""),
        "notes":       f"tf:{payload.get('tf','')} ex:{payload.get('exchange','')} auto-webhook",
    }
    write_header = not TRADES_CSV.exists()
    with open(TRADES_CSV, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if write_header:
            writer.writeheader()
        writer.writerow(row)
    print(f"[CSV]    Trade loggué → {TRADES_CSV.name}")


def call_claude_agent(agent_name: str, context: str):
    """Appelle un sous-agent Claude Code en CLI."""
    cmd = ["claude", "--agent", agent_name, "--print", context]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        print(f"[AGENT]  {agent_name} → {result.stdout[:120]}")
        return result.stdout
    except FileNotFoundError:
        print(f"[AGENT]  claude CLI non trouvé — agent {agent_name} ignoré")
    except subprocess.TimeoutExpired:
        print(f"[AGENT]  {agent_name} timeout")
    return None

# ─────────────────────────────────────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/webhook", methods=["POST"])
def webhook():
    """Point d'entrée principal — reçoit les alertes TradingView."""
    try:
        payload = request.get_json(force=True)
    except Exception:
        payload = {"raw": request.data.decode("utf-8", errors="replace")}

    if not payload:
        return jsonify({"status": "error", "msg": "empty payload"}), 400

    setup = payload.get("setup", "").upper()

    # Ignorer les setups C et inconnus
    if setup not in LOG_SETUPS:
        return jsonify({"status": "ignored", "setup": setup}), 200

    # Log dans JSONL
    log_signal(payload)

    # Log dans CSV de trades
    append_trade_csv(payload)

    # Sync dashboard Vercel
    try:
        sync_script = Path(__file__).parent / "scripts" / "sync_dashboard.py"
        subprocess.Popen(["python3", str(sync_script)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception as e:
        print(f"[SYNC]   Erreur sync dashboard : {e}")

    # Déclencher l'agent signal si A*
    if setup in ACTION_SETUPS:
        context = (
            f"Nouveau signal A* reçu :\n"
            f"  Ticker    : {payload.get('ticker')}\n"
            f"  Direction : {payload.get('dir')}\n"
            f"  Timeframe : {payload.get('tf')}\n"
            f"  Prix      : {payload.get('price')}\n"
            f"  Exchange  : {payload.get('exchange')}\n"
            f"Valide le signal selon le processus TraderMorin 5 étapes."
        )
        call_claude_agent("signal_agent", context)

    return jsonify({"status": "ok", "setup": setup, "action": "logged"}), 200


@app.route("/health", methods=["GET"])
def health():
    """Vérification que le serveur tourne."""
    return jsonify({
        "status": "running",
        "port": PORT,
        "signals_logged": sum(1 for _ in open(SIGNALS_LOG)) if SIGNALS_LOG.exists() else 0,
        "trades_csv": str(TRADES_CSV),
    }), 200


@app.route("/signals", methods=["GET"])
def signals():
    """Liste les 20 derniers signaux reçus."""
    if not SIGNALS_LOG.exists():
        return jsonify([]), 200
    lines = SIGNALS_LOG.read_text().strip().split("\n")
    last20 = [json.loads(l) for l in lines[-20:] if l]
    return jsonify(last20[::-1]), 200


@app.route("/push-pine", methods=["POST"])
def push_pine():
    """Copie HybridAI_TraderMorin.pine → scripts/current.pine et push via MCP."""
    if not PINE_FILE.exists():
        return jsonify({"status": "error", "msg": "HybridAI_TraderMorin.pine introuvable"}), 404
    CURRENT_PINE.write_text(PINE_FILE.read_text())
    try:
        result = subprocess.run(
            ["node", "scripts/pine_push.js"],
            cwd=str(PINE_FILE.parent),
            capture_output=True, text=True, timeout=30
        )
        return jsonify({"status": "ok", "output": result.stdout, "errors": result.stderr}), 200
    except Exception as e:
        return jsonify({"status": "error", "msg": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(f"""
╔══════════════════════════════════════════════════════╗
║   WEBHOOK SERVER — Hybrid AI System (sans 3Commas)  ║
╠══════════════════════════════════════════════════════╣
║  POST  http://localhost:{PORT}/webhook               ║
║  GET   http://localhost:{PORT}/health                ║
║  GET   http://localhost:{PORT}/signals               ║
║  POST  http://localhost:{PORT}/push-pine             ║
╠══════════════════════════════════════════════════════╣
║  Pour exposer : ngrok http {PORT}                    ║
║  → Coller l'URL ngrok dans TradingView Alerts        ║
╚══════════════════════════════════════════════════════╝
""")
    app.run(host="0.0.0.0", port=PORT, debug=False)
