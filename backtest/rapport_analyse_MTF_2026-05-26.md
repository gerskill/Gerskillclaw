# 📊 RAPPORT ANALYSE MULTI-TIMEFRAME — KILLINGBOT
**Date :** 26 Mai 2026 — 07:10 UTC  
**Généré par :** Claude Trading Architect (tâche automatisée)  
**Stratégies analysées :** KB_LOOSE_RR2.5_RR3.0 · KB_1h · KB_15m · KB_LOOSE_RSI  
**Marchés couverts :** Crypto · Forex · Actions/Indices

---

## 🗂️ RÉSUMÉ EXÉCUTIF

| Marché | Paires | Biais Dominant | Signal KB actif ? |
|--------|--------|----------------|-------------------|
| 🔶 Crypto | BTC, ETH, SOL, BNB, XRP | **BEARISH** (4/5 paires) | ❌ Pas de long — attente |
| 💱 Forex | EURUSD, GBPUSD, USDJPY, AUDUSD, USDCHF | **Mixte** (USD fort) | ⚠️ Données techniques indisponibles |
| 📈 Actions | AAPL, NVDA, TSLA, SPY, QQQ | **BULLISH** (3/5 haussiers) | ✅ AAPL + TSLA en setup long |

**Macro global :** VIX à 16.59 (faible peur) · Indices US positifs +0.37%/+0.58% · Crypto en correction

---

## 🏆 STRATÉGIES KILLINGBOT — ANALYSE PAR TIMEFRAME

### Architecture des stratégies backtestées

Toutes les variantes partagent le même noyau :
- **Signal :** Croisement EMA 7/21 + filtre Kijun-sen (26)
- **Qualité :** Séparation EMA ≥ 0.15%, ATR ≥ 0.3% du prix, Cooldown N bars
- **Risk :** ATR×1.5 pour le SL, RR variable (2.0 à 5.0)

### Classement par timeframe optimal

| Rang | Stratégie | TF Optimal | Perf/mois | WR | Drawdown | Sharpe | Nb Trades |
|------|-----------|-----------|-----------|-----|----------|--------|-----------|
| 🥇 1 | KB_LOOSE_RR2.5_RR3.0 | **4H+** | 8.02% | 66.2% | -12.2% | 7.06 | 231 |
| 🥈 2 | KB_1h | **1H** | 7.94% | 66.7% | -6.1% | 7.51 | 420 |
| 🥉 3 | KB_RR4 | 4H+ | 7.93% | 65.0% | -12.2% | 6.43 | 214 |
| 4 | KB_15m | **15M** | 7.91% | 66.6% | -5.7% | 7.57 | 414 |
| 5 | KB_RR5 | 4H+ | 7.84% | 62.0% | -14.6% | 5.51 | 208 |
| 6 | KB_LOOSE_RR2.5_RR3.0_RSI | 4H+ | 7.83% | 67.5% | -11.5% | 7.45 | 215 |
| 7 | KB_LOOSE_RR2.5_RSI | 4H+ | 7.50% | 67.6% | -10.4% | 7.65 | 225 |
| 8 | KB_LOOSE_RR2.5 | 4H+ | 7.49% | 66.0% | -11.8% | 7.04 | 241 |
| 9 | KB_LOOSE | 4H+ | 7.19% | 69.1% | -11.5% | 7.80 | 246 |
| 10 | KB_LOOSE_RSI | 4H+ | 7.0% | **70.0%** | -10.4% | **8.16** | 230 |

### Recommandations par profil de risque

**Profil conservateur (drawdown minimal) :**
→ `KB_15m` sur 15M (-5.7% DD) ou `KB_1h` sur 1H (-6.1% DD)  
→ Plus de trades, exposition plus courte, récupération rapide

**Profil rendement maximal :**
→ `KB_LOOSE_RR2.5_RR3.0` sur 4H+ (8.02%/mois, RR 3.0)  
→ Attention : drawdown -12.2% à supporter psychologiquement

**Profil Sharpe optimal (risque ajusté) :**
→ `KB_LOOSE_RSI` sur 4H+ (Sharpe 8.16, WR 70%)  
→ Filtre RSI réduit les faux signaux, meilleur WR de tout le ranking

**Paramètres communs optimaux :**
```
EMA fast=7 | EMA slow=21 | Kijun=26 | ATR=14 | ATR×SL=1.5
Séparation EMA min=0.15% | ATR min=0.3% | Cooldown=3-6 bars
```

---

## 🔶 CRYPTO — Analyse Multi-Timeframe

### BTC/USDT — Prix : $76,815 (-0.66%)

| TF | Biais | RSI | MACD | Structure | KB Signal |
|----|-------|-----|------|-----------|-----------|
| 1W | 🟡 Neutre/Haussier | 45.6 ↘ | Bullish | Ranging | Biais long long terme |
| 1D | 🔴 Bearish | 46.1 ↘ | Bearish | Death Cross | ❌ No entry |
| 4H | 🔴 Bearish | 48.5 ↗ | Bullish | Bearish | ⚠️ Divergence MACD |
| 1H | 🔴 Bearish | 42.9 ↘ | Bearish | Bearish | ❌ Short momentum |
| 15M | 🟡 Neutre | 45.8 ↘ | Bullish | Bearish | ⚠️ Pas de signal clair |

**Alignement MTF :** LEAN BEARISH (-2) — Confiance Medium  
**Contexte KB :** Sur 4H, le prix est sous EMA20/50 → Kijun baissier → signal LONG bloqué  
**Action recommandée :** Attendre retour au-dessus du Kijun 4H (~$77,200) pour envisager long

---

### ETH/USDT — Prix : $2,099 (-0.66%)

| TF | Biais | RSI | MACD | Structure | KB Signal |
|----|-------|-----|------|-----------|-----------|
| 1W | 🔴 Bearish | 39.3 ↘ | Bullish | Bearish | Prix sous EMA200 ($2,532) |
| 1D | 🔴 Bearish | 38.0 ↘ | Bearish | Death Cross | ❌ Short dominant |
| 4H | 🔴 Bearish | 46.7 ↗ | Bullish | Bearish | ⚠️ Divergence MACD |
| 1H | 🔴 Bearish | 44.8 ↘ | Bearish | Bearish | ❌ Momentum baissier |
| 15M | 🟡 Neutre | 49.6 ↘ | Bullish | Ranging | ⚠️ Consolidation |

**Alignement MTF :** MOSTLY BEARISH (-4) — Confiance High  
**Contexte KB :** Death Cross sur Daily + sous EMA200 Weekly → pas de condition long  
**Action recommandée :** ❌ Éviter — pas de setup KB valide. Zone de support à surveiller : $2,050

---

### SOL/USDT — Prix : $84.47 (-0.94%)

| TF | Biais | RSI | MACD | Structure | KB Signal |
|----|-------|-----|------|-----------|-----------|
| 1W | 🔴 Bearish | 38.0 ↘ | Bullish | Bearish | Prix sous EMA200 ($116) |
| 1D | 🔴 Bearish | 43.6 ↘ | Bearish | Death Cross | ❌ Tendance baissière |
| 4H | 🔴 Bearish | 43.8 ↗ | Bearish | Bearish | ❌ Alignement complet bearish |
| 1H | 🔴 Bearish | 39.7 ↘ | Bearish | Bearish | ❌ RSI sous 40 |
| 15M | 🟡 Neutre | 47.0 ↘ | Bullish | Bearish | ⚠️ Micro rebond possible |

**Alignement MTF :** MOSTLY BEARISH (-4) — Confiance High  
**Contexte KB :** Structure la plus dégradée des 5 cryptos. MACD 4H bearish = pas de divergence haussière  
**Action recommandée :** ❌ Pas de trade — attendre structure haussière sur 4H minimum

---

### BNB/USDT — Prix : $657.20 (+0.09%)

| TF | Biais | RSI | MACD | Structure | KB Signal |
|----|-------|-----|------|-----------|-----------|
| 1W | 🟢 Bullish | 44.0 ↗ | Bullish | Ranging | Prix au-dessus EMA200 ($567) |
| 1D | 🔴 Bearish | 54.4 ↘ | Bearish | Death Cross | ❌ EMA50 < EMA200 |
| 4H | 🟡 Neutre | 50.6 ↘ | Bullish | Ranging | ⚠️ Zone pivot |
| 1H | 🔴 Bearish | 42.4 ↘ | Bearish | Ranging | ❌ Sous EMA20 |
| 15M | 🟡 Neutre | 40.2 ↘ | Bullish | Bearish | ⚠️ RSI bas |

**Alignement MTF :** LEAN BEARISH (-1) — Confiance Medium  
**Contexte KB :** BNB le plus solide des 5 cryptos (Weekly bullish, EMA200 au-dessus). Zone de range 4H  
**Action recommandée :** ⚠️ Surveiller — attendre cassure claire au-dessus de $660 avec volume pour signal long

---

### XRP/USDT — Prix : $1.3466 (-0.33%)

| TF | Biais | RSI | MACD | Structure | KB Signal |
|----|-------|-----|------|-----------|-----------|
| 1W | 🔴 Bearish | 36.5 ↘ | Bullish | Bearish | Prix sous EMA200 ($1.40) |
| 1D | 🔴 Bearish | 41.3 ↘ | Bearish | Death Cross | ❌ |
| 4H | 🔴 Bearish | 45.3 ↗ | Bullish | Bearish | ⚠️ MACD divergence |
| 1H | 🔴 Bearish | 44.7 ↘ | Bearish | Bearish | ❌ |
| 15M | 🟡 Neutre | 51.8 ↘ | Bullish | Ranging | ⚠️ |

**Alignement MTF :** MOSTLY BEARISH (-4) — Confiance High  
**Contexte KB :** RSI Weekly à 36.5 → territoire de survente mais sans signal de retournement  
**Action recommandée :** ❌ Pas de trade. Support clé : $1.30

### Synthèse Crypto

| Paire | Prix | Alignement KB | Urgence |
|-------|------|---------------|---------|
| BTC | $76,815 | 🟠 Lean Bearish | Attendre $77,200 Kijun |
| ETH | $2,099 | 🔴 Mostly Bearish | ❌ Éviter |
| SOL | $84.47 | 🔴 Mostly Bearish | ❌ Éviter |
| BNB | $657 | 🟠 Lean Bearish | ⚠️ Surveiller $660 |
| XRP | $1.35 | 🔴 Mostly Bearish | ❌ Éviter |

> **⚠️ Conclusion Crypto :** Marché globalement en phase corrective. Le MACD 4H diverge positivement sur BTC et XRP (signal de retournement potentiel), mais les structures daily/weekly restent baissières. **Ne pas forcer de long — attendre retournement confirmé 4H.**

---

## 💱 FOREX — Snapshot de Marché

*Note : Les outils d'analyse technique TradingView-MCP ne supportent pas les paires Forex (limité crypto + marchés actions régionaux). Données issues du market snapshot et sentiment Reddit.*

| Paire | Prix | Var 1J | Sentiment Reddit | Biais |
|-------|------|--------|-----------------|-------|
| EUR/USD | 1.1633 | -0.08% | 🔴 Strongly Bearish (0/10 bulls) | USD force |
| GBP/USD | 1.3474 | -0.06% | 🟡 Neutral (5B/5S) | Mixte |
| USD/JPY | 158.73* | +0.14% | 🟢 Strongly Bullish (10/0) | USD/JPY hausse |
| AUD/USD | ~0.644* | — | — | — |
| USD/CHF | ~0.900* | — | — | — |

*\*Prix USD/JPY calculé : 1/0.0063 ≈ 158.73 USD par JPY inversé*

### Contexte Macro Forex

- **Dollar Index (DXY) :** Regain de force evident — EUR/USD et GBP/USD en légère baisse
- **USD/JPY :** Le sentiment Reddit fortement haussier ($USD vs ¥JPY) suggère une poursuite de la montée du yen faible
- **EURUSD :** Sentiment "Strongly Bearish" → traders attendent une cassure sous 1.15 selon les posts analysés

### Applicabilité KB au Forex

La stratégie KB (EMA 7/21 + Kijun 26) est conçue pour les marchés à fort volume directionnel. Sur Forex :
- **Recommandé :** EUR/USD et GBP/USD sur 4H/1D (volumes élevés, tendances claires)
- **Cooldown conseillé :** 4-6 bars (marché 24H, éviter le whipsaw nocturne)
- **ATR min :** Adapter à 0.1% pour les paires majeures (ATR naturellement plus faible)

---

## 📈 ACTIONS / INDICES — Analyse 1M (données Daily)

### Contexte Global

| Indice | Prix | Variation |
|--------|------|-----------|
| S&P 500 | 7,473.47 | +0.37% |
| Dow Jones | 50,579.70 | +0.58% |
| NASDAQ | 26,343.97 | +0.19% |
| SPY ETF | 745.64 | +0.39% |
| QQQ ETF | 717.54 | +0.42% |
| VIX | 16.59 | ~0% |

**Environnement :** VIX < 20 = faible volatilité implicite, favorable aux stratégies momentum

---

### AAPL — Prix : $308.82 (+4 sem : +15.4%)

| Indicateur KB | Valeur | Status |
|---------------|--------|--------|
| EMA 7 (Daily) | $301.91 | — |
| EMA 21 (Daily) | $291.27 | — |
| Séparation EMA | **3.45%** | ✅ >> 0.15% |
| ATR(14) approx | $2.82 → **0.91%** | ✅ >> 0.3% |
| Kijun (26 bars) | $288.22 | — |
| Biais Kijun | Prix $308.82 > Kijun $288.22 | 🟢 **Bull** |
| EMA Cross | EMA7 > EMA21 | 🟢 **Bullish** |

**KB Signal Daily : ✅ LONG CANDIDATE**

**Analyse :** AAPL en tendance haussière forte depuis fin avril (+15.4% en 4 semaines). EMA 7/21 bien écartées (3.45%) — séparation ample. Prix confortablement au-dessus du Kijun. ATR à 0.91% indique volatilité suffisante pour les filtres KB.

**Paramètres trade (KB_LOOSE_RR2.5_RR3.0) :**
- Entrée : ~$309
- SL : $309 - ($2.82 × 1.5) = **$304.77**
- TP : $309 + ($2.82 × 1.5 × 3.0) = **$321.69**
- RR : 3:1 | Risque ~1.57%

---

### NVDA — Prix : $215.33 (+4 sem : -0.6%)

| Indicateur KB | Valeur | Status |
|---------------|--------|--------|
| EMA 7 (Daily) | $220.04 | — |
| EMA 21 (Daily) | $217.71 | — |
| Séparation EMA | **1.08%** | ✅ > 0.15% |
| ATR(14) approx | $4.81 → **2.23%** | ✅ >> 0.3% |
| Kijun (26 bars) | $216.12 | — |
| Biais Kijun | Prix $215.33 < Kijun $216.12 | 🔴 **Bear** |
| EMA Cross | EMA7 > EMA21 | 🟢 Bullish |

**KB Signal Daily : ⚠️ MIXTE — BLOQUÉ**

**Analyse :** NVDA présente une situation contradictoire : la structure EMA est haussière (EMA7 > EMA21) mais le prix vient de passer légèrement sous le Kijun. Signal bloqué par le filtre directionnel. Volatilité élevée (ATR 2.23%) — risque de faux signal. Le prix a fait un peak à $235 (14 mai) et redescend.

**Action :** Surveiller une clôture daily ferme au-dessus du Kijun $216 pour validation d'entrée long.

---

### TSLA — Prix : $426.01 (+4 sem : +12.5%)

| Indicateur KB | Valeur | Status |
|---------------|--------|--------|
| EMA 7 (Daily) | $420.10 | — |
| EMA 21 (Daily) | $410.72 | — |
| Séparation EMA | **2.20%** | ✅ >> 0.15% |
| ATR(14) approx | $10.37 → **2.43%** | ✅ >> 0.3% |
| Kijun (26 bars) | $409.03 | — |
| Biais Kijun | Prix $426 > Kijun $409 | 🟢 **Bull** |
| EMA Cross | EMA7 > EMA21 | 🟢 **Bullish** |

**KB Signal Daily : ✅ LONG CANDIDATE**

**Analyse :** TSLA en forte tendance haussière (+12.5% sur 4 sem, peak à $445 le 11 mai). Pullback sain jusqu'à $404 puis reprise. Structure KB entière validée : EMA haussières, prix au-dessus du Kijun, volatilité élevée (2.43% ATR).

**Paramètres trade (KB_LOOSE_RR2.5_RR3.0) :**
- Entrée : ~$426
- SL : $426 - ($10.37 × 1.5) = **$410.45**
- TP : $426 + ($10.37 × 1.5 × 3.0) = **$472.67**
- RR : 3:1 | Risque ~3.65%

---

### SPY & QQQ — Indices ETF

| ETF | Prix | Variation | Contexte KB |
|-----|------|-----------|-------------|
| SPY | $745.64 | +0.39% | Indices en hausse — environnement risk-on |
| QQQ | $717.54 | +0.42% | NASDAQ tech mènent la reprise |

**Interprétation KB :** Indices positifs = biais macro favorable aux longs sur actions individuelles. Pas de signal short à envisager tant que SPY > zone EMA.

### Synthèse Actions

| Ticker | Prix | Biais KB Daily | Setup | Priorité |
|--------|------|----------------|-------|----------|
| AAPL | $308.82 | 🟢 LONG | ✅ Actif | 🔥 Haute |
| TSLA | $426.01 | 🟢 LONG | ✅ Actif | 🔥 Haute |
| NVDA | $215.33 | 🟡 MIXTE | ⚠️ Bloqué | Surveiller |
| SPY | $745.64 | 🟢 Bull macro | — | Contexte |
| QQQ | $717.54 | 🟢 Bull macro | — | Contexte |

---

## 🎯 MATRICE DE DÉCISION KILLINGBOT

### Par marché et par timeframe

```
╔══════════════╦══════════╦══════════╦══════════╦══════════╗
║  ACTIF       ║   15M    ║    1H    ║    4H    ║    1D    ║
╠══════════════╬══════════╬══════════╬══════════╬══════════╣
║ BTC/USDT     ║ Neutre   ║ 🔴 Bear  ║ 🔴 Bear  ║ 🔴 Bear  ║
║ ETH/USDT     ║ Neutre   ║ 🔴 Bear  ║ 🔴 Bear  ║ 🔴 Bear  ║
║ SOL/USDT     ║ Neutre   ║ 🔴 Bear  ║ 🔴 Bear  ║ 🔴 Bear  ║
║ BNB/USDT     ║ Neutre   ║ 🔴 Bear  ║ 🟡 Range ║ 🔴 Bear  ║
║ XRP/USDT     ║ 🟡 Range ║ 🔴 Bear  ║ 🔴 Bear  ║ 🔴 Bear  ║
╠══════════════╬══════════╬══════════╬══════════╬══════════╣
║ EURUSD       ║ N/A*     ║ N/A*     ║ 🔴 Bear  ║ —        ║
║ GBPUSD       ║ N/A*     ║ N/A*     ║ 🟡 Mixed ║ —        ║
║ USDJPY       ║ N/A*     ║ N/A*     ║ 🟢 Bull  ║ —        ║
╠══════════════╬══════════╬══════════╬══════════╬══════════╣
║ AAPL         ║ —        ║ —        ║ —        ║ 🟢 LONG  ║
║ NVDA         ║ —        ║ —        ║ —        ║ 🟡 Mixed ║
║ TSLA         ║ —        ║ —        ║ —        ║ 🟢 LONG  ║
╚══════════════╩══════════╩══════════╩══════════╩══════════╝
* Données techniques Forex indisponibles via MCP actuel
```

---

## ⚡ RECOMMANDATIONS OPÉRATIONNELLES

### 🔥 Signaux actifs aujourd'hui

**1. AAPL — Long Daily (KB_LOOSE_RR2.5_RR3.0)**
- Entrée : Break au-dessus de $310 ou pullback sur EMA7 ($302)
- SL : $304.77 · TP : $321.69 · RR : 3:1
- Filtre : EMA sep 3.45% ✅ · ATR 0.91% ✅ · Kijun bullish ✅

**2. TSLA — Long Daily (KB_LOOSE_RR2.5_RR3.0)**
- Entrée : Rebond sur EMA7 ($420) ou pullback Kijun ($409)
- SL : $410.45 · TP : $472.67 · RR : 3:1
- Filtre : EMA sep 2.20% ✅ · ATR 2.43% ✅ · Kijun bullish ✅

### ⚠️ En surveillance (trigger non déclenché)

**3. NVDA — Attendre clôture > Kijun $216**
- Prix actuel sous Kijun → signal bloqué par le filtre directionnel
- Retest du Kijun avec clôture ferme = déclencheur potentiel

**4. BTC — Attendre retour au-dessus $77,200 (Kijun 4H)**
- MACD 4H bullish diverge positivement → watch list prioritaire
- Confirmation : clôture 4H au-dessus du Kijun + EMA7 > EMA21

**5. BNB — Surveiller cassure $660**
- Structure la moins bearish des 5 cryptos (Weekly bullish)
- Signal long potentiel si $660 cassé avec volume

### ❌ À éviter absolument

- ETH, SOL, XRP : structures toutes baissières (4/4 TFs bearish)
- Toute crypto en short sans confirmation structure 4H

---

## 📋 PARAMÈTRES KB RECOMMANDÉS PAR ACTIF

| Actif | Stratégie | TF | EMA Sep min | ATR min | Cooldown | RR |
|-------|-----------|-----|-------------|---------|----------|----|
| BTC/ETH/SOL (4H) | KB_LOOSE_RR2.5_RR3.0 | 4H | 0.15% | 0.5% | 3 bars | 3.0 |
| BNB (4H) | KB_LOOSE_RSI | 4H | 0.15% | 0.3% | 3 bars | 2.0 |
| AAPL/NVDA/TSLA (1D) | KB_LOOSE_RR2.5_RR3.0 | 1D | 0.15% | 0.3% | 3 bars | 3.0 |
| Forex majeur (4H) | KB_1h adapté | 4H | 0.10% | 0.1% | 4 bars | 2.5 |
| Crypto scalp | KB_15m | 15M | 0.15% | 0.5% | 6 bars | 3.0 |

---

## 📝 NOTES TECHNIQUES

**Limitations de cette analyse :**
1. Les données Forex techniques sont indisponibles via le tradingview-mcp actuel (supporté : crypto + EGX/BIST/SSE/etc.). Seul le sentiment Reddit et le snapshot de prix ont été utilisés.
2. Les actions US (NASDAQ) sont également non supportées par l'outil MTF — analyse basée sur financial-datasets (OHLCV daily 30 jours) avec calcul EMA/Kijun custom.
3. Les indicateurs KB (EMA, Kijun, ATR) sont calculés sur données daily en approximation — valeurs exactes disponibles dans TradingView.

**Prochaines étapes suggérées :**
- Déployer le `killingbot_v2.1.pine` sur AAPL et TSLA (1D) pour signal automatique
- Configurer des alertes TradingView sur BTC 4H Kijun $77,200
- Implémenter un support Forex dans le scanner (ex: via `scanner/killingbot_scanner.py`)

---

*Rapport généré automatiquement par Claude Trading Architect | Killingbot v2.1*  
*Prochaine mise à jour : tâche planifiée suivante*
