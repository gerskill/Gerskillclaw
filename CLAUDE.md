# Killingbot — Hybrid AI Trading System
## TraderMorin × aiedge | Claude Trading Architect

---

## 🗺️ CARTE DES FICHIERS CLÉS

| Fichier / Dossier | Rôle |
|-------------------|------|
| `killingbot_v2.1.pine` | ⭐ **Version active** — indicateur Pine Script v6 |
| `killingbot_v2.pine` | Version précédente (backup) |
| `killingbot_v1.1.pine` | Version initiale (backup) |
| `HybridAI_TraderMorin.pine` | Indicateur hybride (TraderMorin × aiedge) |
| `PP_ST_Indicator.pine` | SuperTrend dual avancé (production-ready) |
| `PINE_ERRORS.md` | ⚠️ **OBLIGATOIRE** — Checklist erreurs Pine v6 |
| `vault/BEST_STRATEGIES.md` | 🏆 Top 10 stratégies backtestées |
| `vault/AGENT_LOG.md` | Log complet des sessions d'exploration |
| `vault/memory.json` | Mémoire persistante des agents |
| `vault/strategies/` | Fiches détaillées de chaque variante KB_* |
| `backtest/rapport_claude.txt` | Rapport hebdo performance (semaine en cours) |
| `backtest/ray_magenta_report.md` | Rapport backtest Ray Magenta |
| `docs/guides/SPRING_INDICATOR_GUIDE.md` | Guide indicateur Spring (Wyckoff) |
| `docs/guides/RESEARCH.md` | Notes de recherche — design agent trading |
| `docs/guides/performance-analyst.md` | Agent analyste performance |
| `docs/strategies/` | Exemples de setups (XAUUSD, etc.) |
| `pine_scripts/` | Bibliothèque d'indicateurs et stratégies |
| `agents/` | Orchestrateur multi-agents Python |
| `scanner/killingbot_scanner.py` | Scanner multi-assets |
| `webhook_server.py` | Serveur Flask — alertes TradingView |
| `webhook_config.json` | Config JSON webhooks |
| `GUIDE_DEMARRAGE.md` | Guide de démarrage complet |
| `watchlist.json` | Liste des assets surveillés |

---

## ⚠️ PINE SCRIPT v6 — ERREURS CONNUES (OBLIGATOIRE)

> **RÈGLE** : Avant toute livraison de code Pine Script, scanner contre cette liste.

### ❌ ERREUR #1 — Multi-ligne ternaire avec déclaration typée (CE10156)

**Symptôme :** `Syntax error at input "end of line without line continuation" (CE10156)`

**Pattern INTERDIT :**
```pine
// ❌ INTERDIT
float pnl_pct = condition1 ? valeur1 :
                condition2 ? valeur2 : na

// ❌ INTERDIT
string sig_txt = cond_a ? "A" :
                 cond_b ? "B" : "C"

// ❌ INTERDIT
color sig_col = cond ? color.lime :
                color.red
```

**Règle :** Toute déclaration typée avec ternaire → **une seule ligne**.

```pine
// ✅ CORRECT
float pnl_pct = condition1 ? valeur1 : condition2 ? valeur2 : na
string sig_txt = cond_a ? "A" : cond_b ? "B" : "C"
color sig_col = cond ? color.lime : color.red
```

**Exception :** Variables sans annotation de type peuvent casser sur plusieurs lignes si chaque ligne se termine par `:`.

```pine
// ✅ ACCEPTÉ (pas de type explicite)
fill_col = range_hard ? color.red :
           is_range   ? color.purple :
           color.gray
```

### ✅ Patterns SÛRS — Pine Script v6

| Pattern | OK ? | Notes |
|---------|------|-------|
| `bool x = cond and\n  cond2` | ✅ | `and` en fin de ligne = continuation valide |
| `bool x = cond or\n  cond2` | ✅ | `or` en fin de ligne = continuation valide |
| `x = ternaire\n  : suite` | ✅ si non typé | Variable sans annotation de type |
| `float x = ternaire\n  : suite` | ❌ | Doit tenir sur une ligne |
| `ta.atr()`, `ta.ema()`, etc. | ✅ | Appels standard |
| `request.security()` avec tuple | ✅ | `[a, b] = request.security(...)` |
| Multi-ligne dans `if/else` | ✅ | Pas de restriction sur les blocs |

### 📋 Checklist avant livraison Pine Script

```
[ ] Aucune déclaration typée (float/int/bool/string/color) ne se termine par ":" en fin de ligne
[ ] Aucun ternaire avec type explicite ne s'étend sur plusieurs lignes
[ ] Toutes les fonctions sont appelées avec les bons types d'arguments
[ ] Les strategy.exit() référencent des strategy.entry() existants
[ ] Pas de variable réutilisée avec "=" au lieu de ":=" après déclaration
[ ] Les plots non-affichés utilisent color=na (pas de couleur visible)
```

---

## 🏆 TOP 10 STRATÉGIES BACKTESTÉES (màj 2026-05-14)

| Rang | Stratégie | %/mois | WR | Trades | Drawdown | Sharpe |
|------|-----------|--------|-----|--------|----------|--------|
| 1 | KB_LOOSE_RR2.5_RR3.0 | 8.0% | 66% | 231 | -12.2% | 7.06 |
| 2 | KB_1h | 7.9% | 67% | 420 | -6.1% | 7.51 |
| 3 | KB_RR4 | 7.9% | 65% | 214 | -12.2% | 6.43 |
| 4 | KB_15m | 7.9% | 67% | 414 | -5.7% | 7.57 |
| 5 | KB_RR5 | 7.8% | 62% | 208 | -14.6% | 5.51 |
| 6 | KB_LOOSE_RR2.5_RR3.0_RSI | 7.8% | 68% | 215 | -11.5% | 7.45 |
| 7 | KB_LOOSE_RR2.5_RSI | 7.5% | 68% | 225 | -10.4% | 7.65 |
| 8 | KB_LOOSE_RR2.5 | 7.5% | 66% | 241 | -11.8% | 7.04 |
| 9 | KB_LOOSE | 7.2% | 69% | 246 | -11.5% | 7.80 |
| 10 | KB_LOOSE_RSI | 7.0% | 70% | 230 | -10.4% | 8.16 |

**Paramètres communs top stratégies :**
- EMA fast/slow : 7/21
- Kijun : 26
- ATR : 14, mult 1.5
- Séparation EMA min : 0.15%
- Cooldown : 3 bars
- ATR min : 0.3%

**⭐ Meilleure stratégie globale :** `KB_LOOSE_RR2.5_RR3.0` — 8.02%/mois, WR 66%, Sharpe 7.06
**⭐ Meilleur Sharpe :** `KB_LOOSE_RSI` — Sharpe 8.16
**⭐ Drawdown le plus faible :** `KB_15m` — -5.7%

---

## 📊 RAPPORT PERFORMANCE HEBDO (07–11 Avril 2026)

Compte : $25,000 | Risk : 1.0%/trade

| Métrique | Valeur |
|----------|--------|
| Trades | 27 |
| Win Rate | 63% (17W / 10L) |
| Profit Factor | 3.01 |
| Net P&L | +$496.50 |
| Expectancy/trade | +$18.39 |
| Max consec. losses | 2 |

**Par setup :** ORB = 83% WR (meilleur), VWAP rejection = 100%, momentum = 43% (à éviter)
**Par session :** Open 09:30-10:00 = 71% WR (meilleur créneau)

---

## 🌀 SPRING CONFLUENCE INDICATOR

Indicateur basé sur la **méthode Wyckoff** — détecte les spring (stop hunts institutionnels) sur 5 TFs simultanés.

**Score de confluence :**
- `+5` = Tous TFs bullish 🟢🟢🟢🟢🟢
- `+3/+4` = Forte tendance haussière
- `0` = Neutre — éviter
- `-3/-4` = Forte tendance baissière
- `-5` = Tous TFs bearish 🔴🔴🔴🔴🔴

**Setups :**
- **Setup A (High Prob)** : 1D🟢 + 4H🟢 + 1H Spring UP → entrée 5m
- **Setup B (Scalp)** : contre-tendance, positions réduites, TP rapide
- **Setup C** : Confluence -5 → vente ou attente uniquement

**Fichier :** `pine_scripts/indicators/spring_confluence_indicator.pine`
**Guide :** `docs/guides/SPRING_INDICATOR_GUIDE.md`

---

## 🤖 ARCHITECTURE AGENTS

```
webhook_server.py (port 5001)
  └── signal_agent → validation 5 étapes TraderMorin
        ├── REJETÉ → log + raison
        └── ACCEPTÉ
              ├── journal_agent → trades.csv + rapport
              └── [hebdo] performance_agent → pine_updater
```

**Agents Python (`agents/`) :**
- `orchestrator.py` — Coordinateur sessions d'exploration
- `memory_agent.py` — Mémoire persistante + suggestions
- `strategy_explorer.py` — Test automatisé variations KB_*

**Sessions complétées :** 35 variantes testées | Meilleure : KB_LOOSE_RR2.5_RR3.0 = 8.0%/mois

---

## 🔧 ORDRE DU FLUX OBLIGATOIRE (Pine Script)

1. **COUCHE 1** — Market Outlook : biais global, structure MTF
2. **COUCHE 2** — Confluences : momentum, volume, sentiment
3. **COUCHE 3** — Structure & Liquidité : zones institutionnelles, pivots
4. **COUCHE 4** — Filtre Range & Robustesse : détection consolidation
5. **COUCHE 5** — Qualité du Setup : scoring, hiérarchisation signaux
6. **COUCHE 6** — Risk Management : SL/TP dynamique, RR, trailing
7. **COUCHE 7** — Exécution, Visualisation & Alertes : dashboard + webhooks

---

## 🚀 DÉMARRAGE RAPIDE

```bash
# 1. TradingView en mode debug
bash scripts/launch_tv_debug_mac.sh

# 2. Serveur MCP TradingView
cd ~/tradingview-mcp && node src/server.js

# 3. Serveur webhook
python3 webhook_server.py

# 4. Exposer webhook
ngrok http 5001
```

---

## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.**

| Tool | Use when |
| ------ | ---------- |
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
