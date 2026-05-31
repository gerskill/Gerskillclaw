# 🚀 Guide Démarrage — Hybrid AI System (TraderMorin × aiedge)

## ✅ Ce qui est installé

| Composant | Statut | Chemin |
|-----------|--------|--------|
| Node.js v25 + npm | ✅ Installé | `/usr/local/bin/node` |
| Git | ✅ Installé | système |
| tradingview-mcp | ✅ Installé | `~/tradingview-mcp` |
| tradingview-mcp-bridge | ✅ Installé | `~/tradingview-mcp-bridge` |
| Claude MCP config | ✅ Configuré | `~/.claude/mcp.json` |
| **HybridAI_TraderMorin.pine** | ✅ Prêt | ce dossier |
| PP_ST_Indicator.pine (existant) | ✅ Présent | ce dossier |
| webhook_config.json | ✅ Prêt | ce dossier |

---

## 🔌 ÉTAPE 1 — Lancer TradingView en mode debug

```bash
# Sur macOS, ouvrir Chrome avec le port debug activé :
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-tv &

# Puis ouvrir TradingView dans ce Chrome :
open -a "Google Chrome" https://www.tradingview.com
```

---

## 🤖 ÉTAPE 2 — Démarrer le serveur MCP TradingView

```bash
cd ~/tradingview-mcp
node src/server.js
```

---

## 📊 ÉTAPE 3 — Importer l'indicateur dans TradingView

1. Ouvrir TradingView → Pine Script Editor (bas de page)
2. Copier le contenu de `HybridAI_TraderMorin.pine`
3. Coller dans l'éditeur → **Add to Chart**
4. Tester sur : **1H** (entrées), **4H** (biais), **1D** (contexte)

---

## ⚡ ÉTAPE 4 — Configurer les Alertes Webhook

1. TradingView → Icône horloge (Alertes)
2. Condition : `Hybrid AI System v1` → `🔥 A★ LONG Setup`
3. Notifications → activer **Webhook URL**
4. Coller ton URL broker (voir `webhook_config.json`)
5. Message : copier le JSON du fichier `webhook_config.json`
6. **Répéter pour A★ SHORT, B LONG, B SHORT**

---

## 🔗 Brokers compatibles

| Broker | Difficulté | Lien |
|--------|-----------|------|
| **3Commas** | ⭐ Facile | https://3commas.io |
| **Alertatron** | ⭐⭐ Moyen | https://alertatron.com |
| CCXT + Python | ⭐⭐⭐ Avancé | local webhook server |

---

## 📁 Indicateurs disponibles

### HybridAI_TraderMorin.pine (NOUVEAU)
- 5 couches : Market Outlook → Confluences → Liquidité → Setup Quality → Alertes
- Setups A★ / B / C avec alertes JSON
- Dashboard overlay en temps réel
- **Timeframes recommandés : 1H + 4H**

### PP_ST_Indicator.pine (EXISTANT)
- Dual SuperTrend rapide + lent
- MTF cascade 1D + 1W
- Pyramidage automatique
- Filtre range avancé
- **Très avancé, production-ready**

---

## 🔄 Cycle d'amélioration continue (J5+)

```
1. Trade déclenché → log dans Google Sheet
2. Chaque semaine → coller CSV des trades à Claude
3. Prompt : "Analyse ces trades. Quels setups sont plus profitables ?"
4. Claude modifie le Pine Script → re-déployer via MCP
```

---

## 🛠 Commandes utiles

```bash
# Mettre à jour le repo MCP
cd ~/tradingview-mcp && git pull && npm install

# Voir les tests
cd ~/tradingview-mcp && npm test

# Journal de trades existant
cd ~/tradingview-mcp && python3 trade_journal.py
```
